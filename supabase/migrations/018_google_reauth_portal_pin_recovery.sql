-- Google-reauthenticated Parent Zone PIN recovery and parent-approved child PIN resets.
-- Raw recovery challenges are returned only to the authenticated browser and kept
-- in sessionStorage during OAuth; this database stores SHA-256 hashes only.

begin;

create table if not exists public.portal_pin_reset_challenges (
  id uuid primary key default extensions.gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  parent_profile_id uuid not null references public.profiles(id) on delete cascade,
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz,
  check (expires_at > created_at)
);
create index if not exists portal_pin_reset_challenges_parent_active_idx
  on public.portal_pin_reset_challenges (parent_profile_id, expires_at desc)
  where used_at is null;

create table if not exists public.portal_pin_reset_requests (
  id uuid primary key default extensions.gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_profile_id uuid not null references public.profiles(id) on delete cascade,
  requested_by_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'cancelled')),
  requested_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by_user_id uuid references auth.users(id) on delete set null,
  check ((status = 'pending' and resolved_at is null and resolved_by_user_id is null) or status <> 'pending')
);
create unique index if not exists portal_pin_reset_requests_one_pending_child_idx
  on public.portal_pin_reset_requests (child_profile_id) where status = 'pending';
create index if not exists portal_pin_reset_requests_family_pending_idx
  on public.portal_pin_reset_requests (family_id, requested_at desc) where status = 'pending';

alter table public.portal_pin_reset_challenges enable row level security;
alter table public.portal_pin_reset_requests enable row level security;
revoke all on table public.portal_pin_reset_challenges from anon, authenticated;
revoke all on table public.portal_pin_reset_requests from anon, authenticated;

-- Parent Zone writes remain parent-only. Child profile credentials are changed
-- exclusively by the approval RPC below; both parent and child may verify their
-- own credential where the app needs a personal lock check.
create or replace function public.set_portal_pin(p_pin text)
returns boolean language plpgsql security definer set search_path = public
as $$
declare v_profile uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_pin is null or p_pin !~ '^[0-9]{4,12}$' then raise exception 'PIN must contain 4 to 12 digits'; end if;
  select p.id into v_profile
  from public.family_members fm
  join public.profiles p on p.user_id = fm.user_id and p.family_id = fm.family_id
  where fm.user_id = auth.uid() and fm.role = 'parent'
  limit 1;
  if v_profile is null then raise exception 'Parent access required to set the Parent Zone PIN'; end if;
  insert into public.portal_pin_credentials(profile_id, pin_hash, failed_attempts, locked_until, updated_at)
    values (v_profile, extensions.crypt(p_pin, extensions.gen_salt('bf', 10)), 0, null, now())
  on conflict (profile_id) do update set pin_hash = excluded.pin_hash, failed_attempts = 0, locked_until = null, updated_at = now();
  return true;
end;
$$;

create or replace function public.verify_portal_pin(p_pin text)
returns table (verified boolean, configured boolean, locked_until timestamptz)
language plpgsql security definer set search_path = public
as $$
declare
  v_profile uuid;
  v_hash text;
  v_attempts integer;
  v_locked timestamptz;
  v_now timestamptz := now();
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select p.id into v_profile
  from public.family_members fm
  join public.profiles p on p.user_id = fm.user_id and p.family_id = fm.family_id
  where fm.user_id = auth.uid() and fm.role in ('parent', 'child')
  limit 1;
  if v_profile is null then raise exception 'Approved family membership required'; end if;
  select pin_hash, failed_attempts, portal_pin_credentials.locked_until
    into v_hash, v_attempts, v_locked
    from public.portal_pin_credentials where profile_id = v_profile;
  if v_hash is null then return query select false, false, null::timestamptz; return; end if;
  if v_locked is not null and v_locked > v_now then return query select false, true, v_locked; return; end if;
  if extensions.crypt(coalesce(p_pin, ''), v_hash) = v_hash then
    update public.portal_pin_credentials set failed_attempts = 0, locked_until = null, updated_at = v_now where profile_id = v_profile;
    return query select true, true, null::timestamptz;
  end if;
  v_attempts := coalesce(v_attempts, 0) + 1;
  v_locked := case when v_attempts >= 5 then v_now + interval '15 minutes' else null end;
  update public.portal_pin_credentials set failed_attempts = v_attempts, locked_until = v_locked, updated_at = v_now where profile_id = v_profile;
  return query select false, true, v_locked;
end;
$$;

create or replace function public.begin_my_parent_portal_pin_reset()
returns text language plpgsql security definer set search_path = public
as $$
declare
  v_family uuid;
  v_profile uuid;
  v_provider text;
  v_token text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select coalesce(raw_app_meta_data ->> 'provider', '') into v_provider from auth.users where id = auth.uid();
  if v_provider <> 'google' then raise exception 'Google sign-in is required for PIN recovery'; end if;
  select fm.family_id, p.id into v_family, v_profile
  from public.family_members fm
  join public.profiles p on p.user_id = fm.user_id and p.family_id = fm.family_id
  where fm.user_id = auth.uid() and fm.role = 'parent'
  limit 1;
  if v_profile is null then raise exception 'Parent access required for PIN recovery'; end if;
  update public.portal_pin_reset_challenges set used_at = now()
    where parent_profile_id = v_profile and used_at is null;
  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.portal_pin_reset_challenges (family_id, parent_profile_id, token_hash, expires_at)
    values (v_family, v_profile, encode(extensions.digest(v_token, 'sha256'), 'hex'), now() + interval '15 minutes');
  return v_token;
end;
$$;

create or replace function public.reset_my_parent_portal_pin_after_google_reauth(
  p_token text,
  p_pin text
)
returns boolean language plpgsql security definer set search_path = public
as $$
declare
  v_family uuid;
  v_profile uuid;
  v_provider text;
  v_last_sign_in timestamptz;
  v_challenge public.portal_pin_reset_challenges%rowtype;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_pin is null or p_pin !~ '^[0-9]{4,12}$' then raise exception 'PIN must contain 4 to 12 digits'; end if;
  if coalesce(p_token, '') !~ '^[0-9a-f]{64}$' then raise exception 'Invalid recovery challenge'; end if;
  select coalesce(raw_app_meta_data ->> 'provider', ''), last_sign_in_at into v_provider, v_last_sign_in from auth.users where id = auth.uid();
  if v_provider <> 'google' then raise exception 'Google sign-in is required for PIN recovery'; end if;
  select fm.family_id, p.id into v_family, v_profile
  from public.family_members fm join public.profiles p on p.user_id = fm.user_id and p.family_id = fm.family_id
  where fm.user_id = auth.uid() and fm.role = 'parent' limit 1;
  if v_profile is null then raise exception 'Parent access required for PIN recovery'; end if;
  select * into v_challenge from public.portal_pin_reset_challenges
    where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex') for update;
  if not found or v_challenge.parent_profile_id <> v_profile or v_challenge.family_id <> v_family then raise exception 'Invalid recovery challenge'; end if;
  if v_challenge.used_at is not null or v_challenge.expires_at <= now() then raise exception 'Recovery challenge has expired or was already used'; end if;
  if v_last_sign_in is null or v_last_sign_in <= v_challenge.created_at then raise exception 'A fresh Google sign-in is required'; end if;
  insert into public.portal_pin_credentials(profile_id, pin_hash, failed_attempts, locked_until, updated_at)
    values (v_profile, extensions.crypt(p_pin, extensions.gen_salt('bf', 10)), 0, null, now())
  on conflict (profile_id) do update set pin_hash = excluded.pin_hash, failed_attempts = 0, locked_until = null, updated_at = now();
  update public.portal_pin_reset_challenges set used_at = now() where id = v_challenge.id;
  return true;
end;
$$;

create or replace function public.request_my_child_pin_reset()
returns uuid language plpgsql security definer set search_path = public
as $$
declare v_family uuid; v_profile uuid; v_request uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select fm.family_id, p.id into v_family, v_profile
  from public.family_members fm join public.profiles p on p.user_id = fm.user_id and p.family_id = fm.family_id
  where fm.user_id = auth.uid() and fm.role = 'child' limit 1;
  if v_profile is null then raise exception 'Child access required to request a PIN reset'; end if;
  insert into public.portal_pin_reset_requests (family_id, child_profile_id, requested_by_user_id)
    values (v_family, v_profile, auth.uid())
  on conflict (child_profile_id) where status = 'pending' do update set requested_at = excluded.requested_at
  returning id into v_request;
  return v_request;
end;
$$;

create or replace function public.list_child_pin_reset_requests()
returns table (request_id uuid, child_display_name text, requested_at timestamptz)
language plpgsql security definer set search_path = public
as $$
declare v_family uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select family_id into v_family from public.family_members where user_id = auth.uid() and role = 'parent' limit 1;
  if v_family is null then raise exception 'Parent access required'; end if;
  return query
    select r.id, p.display_name, r.requested_at
    from public.portal_pin_reset_requests r
    join public.profiles p on p.id = r.child_profile_id
    where r.family_id = v_family and r.status = 'pending'
    order by r.requested_at asc;
end;
$$;

create or replace function public.cancel_child_pin_reset_request(p_request_id uuid)
returns boolean language plpgsql security definer set search_path = public
as $$
declare v_family uuid; v_request public.portal_pin_reset_requests%rowtype;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select family_id into v_family from public.family_members where user_id = auth.uid() and role = 'parent' limit 1;
  if v_family is null then raise exception 'Parent access required'; end if;
  select * into v_request from public.portal_pin_reset_requests where id = p_request_id for update;
  if not found or v_request.family_id <> v_family then raise exception 'PIN reset request was not found'; end if;
  if v_request.status <> 'pending' then raise exception 'PIN reset request is no longer pending'; end if;
  update public.portal_pin_reset_requests set status = 'cancelled', resolved_at = now(), resolved_by_user_id = auth.uid() where id = v_request.id;
  return true;
end;
$$;

create or replace function public.approve_child_pin_reset_after_google_reauth(
  p_request_id uuid,
  p_token text,
  p_pin text
)
returns boolean language plpgsql security definer set search_path = public
as $$
declare
  v_family uuid;
  v_profile uuid;
  v_provider text;
  v_last_sign_in timestamptz;
  v_challenge public.portal_pin_reset_challenges%rowtype;
  v_request public.portal_pin_reset_requests%rowtype;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_pin is null or p_pin !~ '^[0-9]{4,12}$' then raise exception 'PIN must contain 4 to 12 digits'; end if;
  if coalesce(p_token, '') !~ '^[0-9a-f]{64}$' then raise exception 'Invalid recovery challenge'; end if;
  select coalesce(raw_app_meta_data ->> 'provider', ''), last_sign_in_at into v_provider, v_last_sign_in from auth.users where id = auth.uid();
  if v_provider <> 'google' then raise exception 'Google sign-in is required to approve a child PIN reset'; end if;
  select fm.family_id, p.id into v_family, v_profile
  from public.family_members fm join public.profiles p on p.user_id = fm.user_id and p.family_id = fm.family_id
  where fm.user_id = auth.uid() and fm.role = 'parent' limit 1;
  if v_profile is null then raise exception 'Parent access required'; end if;
  select * into v_challenge from public.portal_pin_reset_challenges
    where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex') for update;
  if not found or v_challenge.parent_profile_id <> v_profile or v_challenge.family_id <> v_family then raise exception 'Invalid recovery challenge'; end if;
  if v_challenge.used_at is not null or v_challenge.expires_at <= now() then raise exception 'Recovery challenge has expired or was already used'; end if;
  if v_last_sign_in is null or v_last_sign_in <= v_challenge.created_at then raise exception 'A fresh Google sign-in is required'; end if;
  select * into v_request from public.portal_pin_reset_requests where id = p_request_id for update;
  if not found or v_request.family_id <> v_family or v_request.status <> 'pending' then raise exception 'PIN reset request is no longer available'; end if;
  if not exists (select 1 from public.profiles where id = v_request.child_profile_id and family_id = v_family and role = 'child') then raise exception 'Child profile is invalid'; end if;
  insert into public.portal_pin_credentials(profile_id, pin_hash, failed_attempts, locked_until, updated_at)
    values (v_request.child_profile_id, extensions.crypt(p_pin, extensions.gen_salt('bf', 10)), 0, null, now())
  on conflict (profile_id) do update set pin_hash = excluded.pin_hash, failed_attempts = 0, locked_until = null, updated_at = now();
  update public.portal_pin_reset_challenges set used_at = now() where id = v_challenge.id;
  update public.portal_pin_reset_requests set status = 'approved', resolved_at = now(), resolved_by_user_id = auth.uid() where id = v_request.id;
  return true;
end;
$$;

revoke all on function public.set_portal_pin(text) from public;
revoke all on function public.verify_portal_pin(text) from public;
revoke all on function public.begin_my_parent_portal_pin_reset() from public;
revoke all on function public.reset_my_parent_portal_pin_after_google_reauth(text, text) from public;
revoke all on function public.request_my_child_pin_reset() from public;
revoke all on function public.list_child_pin_reset_requests() from public;
revoke all on function public.cancel_child_pin_reset_request(uuid) from public;
revoke all on function public.approve_child_pin_reset_after_google_reauth(uuid, text, text) from public;
grant execute on function public.set_portal_pin(text) to authenticated;
grant execute on function public.verify_portal_pin(text) to authenticated;
grant execute on function public.begin_my_parent_portal_pin_reset() to authenticated;
grant execute on function public.reset_my_parent_portal_pin_after_google_reauth(text, text) to authenticated;
grant execute on function public.request_my_child_pin_reset() to authenticated;
grant execute on function public.list_child_pin_reset_requests() to authenticated;
grant execute on function public.cancel_child_pin_reset_request(uuid) to authenticated;
grant execute on function public.approve_child_pin_reset_after_google_reauth(uuid, text, text) to authenticated;

commit;
