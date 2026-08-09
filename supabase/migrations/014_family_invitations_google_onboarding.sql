-- Invitation-only Google onboarding. Contact email settings never grant access.
-- Invitations are created by a family administrator, delivered server-side, and
-- redeemed atomically only by the matching Google-authenticated Supabase user.

begin;

create table if not exists public.family_administrators (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  granted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

create table if not exists public.family_invitations (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  invited_email text not null,
  display_name text not null,
  role text not null check (role in ('parent', 'child')),
  token_hash text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  accepted_user_id uuid references auth.users(id) on delete set null,
  revoked_at timestamptz,
  sent_at timestamptz,
  delivery_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint family_invitations_normalized_email check (invited_email = lower(trim(invited_email))),
  unique (family_id, invited_email)
);

create index if not exists family_invitations_pending_token_hash_idx
  on public.family_invitations (token_hash)
  where status = 'pending';

alter table public.family_administrators enable row level security;
alter table public.family_invitations enable row level security;

-- Backfill the creator as administrator for an already bootstrapped family.
insert into public.family_administrators (family_id, user_id, granted_by)
select f.id, f.created_by, f.created_by
from public.families f
join public.family_members fm on fm.family_id = f.id and fm.user_id = f.created_by and fm.role = 'parent'
where f.created_by is not null
on conflict (family_id, user_id) do nothing;

create or replace function public.is_family_administrator(p_family_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.family_administrators
    where family_id = p_family_id and user_id = auth.uid()
  )
$$;

revoke all on function public.is_family_administrator(uuid) from public;
grant execute on function public.is_family_administrator(uuid) to authenticated;

create or replace function public.create_family_invitation(
  p_email text,
  p_display_name text,
  p_role text
)
returns table (invitation_id uuid, invitation_token text, invitation_expires_at timestamptz)
language plpgsql security definer set search_path = public
as $$
declare
  v_family uuid;
  v_email text := lower(trim(coalesce(p_email, '')));
  v_name text := left(trim(coalesce(p_display_name, '')), 80);
  v_token text;
  v_id uuid;
  v_expires_at timestamptz := now() + interval '7 days';
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select family_id into v_family from public.family_administrators where user_id = auth.uid() limit 1;
  if v_family is null then raise exception 'Family administrator access required'; end if;
  if v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'A valid invitation email is required'; end if;
  if v_name = '' then raise exception 'An invitee name is required'; end if;
  if p_role not in ('parent', 'child') then raise exception 'Invitation role must be parent or child'; end if;
  if exists (select 1 from public.family_invitations where family_id = v_family and invited_email = v_email and status = 'accepted') then
    raise exception 'This email has already accepted a family invitation';
  end if;
  if p_role = 'child' and exists (
    select 1 from public.profiles where family_id = v_family and role = 'child' and user_id is not null
  ) then
    raise exception 'This family already has a linked child profile';
  end if;
  if p_role = 'child' and exists (
    select 1 from public.family_invitations
    where family_id = v_family and role = 'child' and status = 'pending' and expires_at > now() and invited_email <> v_email
  ) then
    raise exception 'A child invitation is already pending for this family';
  end if;

  v_token := encode(gen_random_bytes(32), 'hex');
  insert into public.family_invitations (
    family_id, invited_email, display_name, role, token_hash, status, expires_at,
    accepted_at, accepted_user_id, revoked_at, sent_at, delivery_error, updated_at
  ) values (
    v_family, v_email, v_name, p_role, encode(digest(v_token, 'sha256'), 'hex'), 'pending', v_expires_at,
    null, null, null, null, null, now()
  )
  on conflict (family_id, invited_email) do update set
    display_name = excluded.display_name,
    role = excluded.role,
    token_hash = excluded.token_hash,
    status = 'pending',
    expires_at = excluded.expires_at,
    accepted_at = null,
    accepted_user_id = null,
    revoked_at = null,
    sent_at = null,
    delivery_error = null,
    updated_at = now()
  where public.family_invitations.status <> 'accepted'
  returning id into v_id;

  if v_id is null then raise exception 'This invitation cannot be replaced'; end if;
  return query select v_id, v_token, v_expires_at;
end;
$$;

revoke all on function public.create_family_invitation(text, text, text) from public;
grant execute on function public.create_family_invitation(text, text, text) to authenticated;

create or replace function public.redeem_family_invitation(p_token text)
returns uuid language plpgsql security definer set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_email text := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  v_provider text := coalesce(auth.jwt() -> 'app_metadata' ->> 'provider', '');
  v_invitation public.family_invitations%rowtype;
  v_child uuid;
  v_existing_family uuid;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if v_provider <> 'google' then raise exception 'Google sign-in is required to accept a family invitation'; end if;
  if v_email = '' then raise exception 'Google account email is unavailable'; end if;
  if coalesce(length(p_token), 0) < 32 then raise exception 'The invitation link is invalid'; end if;

  select * into v_invitation
  from public.family_invitations
  where token_hash = encode(digest(p_token, 'sha256'), 'hex')
  for update;
  if not found then raise exception 'The invitation link is invalid or has already been replaced'; end if;
  if v_invitation.status = 'revoked' then raise exception 'This invitation has been revoked'; end if;
  if v_invitation.status = 'accepted' then
    if v_invitation.accepted_user_id = v_user then return v_invitation.family_id; end if;
    raise exception 'This invitation has already been accepted';
  end if;
  if v_invitation.expires_at <= now() then raise exception 'This invitation has expired'; end if;
  if v_invitation.invited_email <> v_email then raise exception 'Sign in with the Google account that received this invitation'; end if;

  select family_id into v_existing_family from public.family_members where user_id = v_user limit 1;
  if v_existing_family is not null then
    if v_existing_family = v_invitation.family_id then return v_existing_family; end if;
    raise exception 'This Google account already belongs to another family';
  end if;

  if v_invitation.role = 'child' then
    select id into v_child from public.profiles where family_id = v_invitation.family_id and role = 'child' limit 1;
    if v_child is not null and exists (select 1 from public.profiles where id = v_child and user_id is not null and user_id <> v_user) then
      raise exception 'This family already has a linked child profile';
    end if;
  end if;

  insert into public.family_members (family_id, user_id, role)
    values (v_invitation.family_id, v_user, v_invitation.role);

  if v_invitation.role = 'child' then
    if v_child is null then
      insert into public.profiles (user_id, family_id, role, display_name)
        values (v_user, v_invitation.family_id, 'child', v_invitation.display_name);
    else
      update public.profiles
        set user_id = v_user, display_name = v_invitation.display_name, updated_at = now()
        where id = v_child and user_id is null;
    end if;
  else
    insert into public.profiles (user_id, family_id, role, display_name)
      values (v_user, v_invitation.family_id, 'parent', v_invitation.display_name)
      on conflict (user_id) do update set family_id = excluded.family_id, role = excluded.role, display_name = excluded.display_name, updated_at = now();
  end if;

  update public.family_invitations
    set status = 'accepted', accepted_at = now(), accepted_user_id = v_user, updated_at = now()
    where id = v_invitation.id;
  return v_invitation.family_id;
end;
$$;

revoke all on function public.redeem_family_invitation(text) from public;
grant execute on function public.redeem_family_invitation(text) to authenticated;

create or replace function public.revoke_family_invitation(p_invitation_id uuid)
returns boolean language plpgsql security definer set search_path = public
as $$
declare v_family uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select family_id into v_family from public.family_invitations where id = p_invitation_id;
  if v_family is null then raise exception 'Invitation not found'; end if;
  if not public.is_family_administrator(v_family) then raise exception 'Family administrator access required'; end if;
  update public.family_invitations
    set status = 'revoked', revoked_at = now(), updated_at = now()
    where id = p_invitation_id and status = 'pending';
  return found;
end;
$$;

create or replace function public.list_family_invitations()
returns table (
  id uuid, invited_email text, display_name text, role text, status text,
  expires_at timestamptz, created_at timestamptz, sent_at timestamptz
) language sql stable security definer set search_path = public
as $$
  select i.id, i.invited_email, i.display_name, i.role,
    case when i.status = 'pending' and i.expires_at <= now() then 'expired' else i.status end,
    i.expires_at, i.created_at, i.sent_at
  from public.family_invitations i
  where public.is_family_administrator(i.family_id)
  order by i.created_at desc
$$;

-- Only the original family creator can grant/revoke administrator authority.
create or replace function public.set_family_administrator(p_user_id uuid, p_enabled boolean)
returns boolean language plpgsql security definer set search_path = public
as $$
declare v_family uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select id into v_family from public.families where created_by = auth.uid() limit 1;
  if v_family is null then raise exception 'Initial family administrator access required'; end if;
  if not exists (select 1 from public.family_members where family_id = v_family and user_id = p_user_id and role = 'parent') then
    raise exception 'Only an existing parent member can become a family administrator';
  end if;
  if p_enabled then
    insert into public.family_administrators (family_id, user_id, granted_by)
      values (v_family, p_user_id, auth.uid()) on conflict (family_id, user_id) do nothing;
  elsif p_user_id <> auth.uid() then
    delete from public.family_administrators where family_id = v_family and user_id = p_user_id;
  end if;
  return true;
end;
$$;

revoke all on function public.revoke_family_invitation(uuid) from public;
revoke all on function public.list_family_invitations() from public;
revoke all on function public.set_family_administrator(uuid, boolean) from public;
grant execute on function public.revoke_family_invitation(uuid) to authenticated;
grant execute on function public.list_family_invitations() to authenticated;
grant execute on function public.set_family_administrator(uuid, boolean) to authenticated;

create policy "Family administrators view family invitations"
  on public.family_invitations for select
  using (public.is_family_administrator(family_id));

create policy "Family administrators view administrator records"
  on public.family_administrators for select
  using (public.is_family_administrator(family_id));

-- Google is the only allowed hosted sign-in route. Existing membership remains
-- valid; uninvited accounts fail closed. Invitation redemption happens before
-- this function is called by the authenticated browser session.
create or replace function public.ensure_family_setup(
  p_display_name text default 'Explorer',
  p_avatar text default '🌟',
  p_nomi_name text default 'Nomi'
)
returns uuid language plpgsql security definer set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_email text := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  v_provider text := coalesce(auth.jwt() -> 'app_metadata' ->> 'provider', '');
  v_family uuid;
  v_role text;
  v_child uuid;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if v_provider <> 'google' then raise exception 'Google sign-in is required'; end if;
  if v_email = '' then raise exception 'Google account email is unavailable'; end if;

  select family_id, role into v_family, v_role
  from public.family_members
  where user_id = v_user
  order by case when role = 'parent' then 0 else 1 end
  limit 1;

  if v_family is null then
    if v_email <> 'thedfamily0@gmail.com' then
      raise exception 'This Google account is not approved. Open the welcome invitation link sent by your family administrator.';
    end if;
    insert into public.families (created_by) values (v_user) returning id into v_family;
    insert into public.family_members (family_id, user_id, role) values (v_family, v_user, 'parent');
    insert into public.family_administrators (family_id, user_id, granted_by) values (v_family, v_user, v_user);
    v_role := 'parent';
  end if;

  if v_role = 'child' then
    update public.profiles set user_id = v_user, updated_at = now()
      where family_id = v_family and role = 'child' and user_id is null;
    select id into v_child from public.profiles
      where family_id = v_family and role = 'child' and user_id = v_user limit 1;
    if v_child is null then raise exception 'The approved child profile could not be linked.'; end if;
    return v_family;
  end if;

  insert into public.profiles (user_id, family_id, role, display_name)
    values (v_user, v_family, 'parent', 'Parent')
    on conflict (user_id) do update set family_id = excluded.family_id, role = excluded.role;
  select id into v_child from public.profiles where family_id = v_family and role = 'child' limit 1;
  if v_child is null then
    insert into public.profiles (user_id, family_id, role, display_name, avatar, nomi_name)
      values (null, v_family, 'child', coalesce(nullif(trim(p_display_name), ''), 'Explorer'), p_avatar, coalesce(nullif(trim(p_nomi_name), ''), 'Nomi'));
  end if;
  insert into public.family_contact_settings (family_id) values (v_family) on conflict (family_id) do nothing;
  insert into public.guardrail_settings (family_id) values (v_family) on conflict (family_id) do nothing;
  return v_family;
end;
$$;

revoke all on function public.ensure_family_setup(text, text, text) from public;
grant execute on function public.ensure_family_setup(text, text, text) to authenticated;

commit;
