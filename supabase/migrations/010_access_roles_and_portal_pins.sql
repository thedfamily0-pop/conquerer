-- Role-aware family access and per-profile portal PINs.
-- PINs are never stored in plaintext; pgcrypto crypt() uses bcrypt.

create extension if not exists pgcrypto;

alter table public.profiles drop constraint if exists profiles_family_role_unique;
create unique index if not exists profiles_one_child_per_family
  on public.profiles (family_id) where role = 'child';

create table if not exists public.portal_pin_credentials (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  pin_hash text not null,
  failed_attempts integer not null default 0 check (failed_attempts >= 0),
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.portal_pin_credentials enable row level security;

create or replace function public.get_my_access_context()
returns table (family_id uuid, profile_id uuid, role text, child_profile_id uuid)
language sql stable security definer set search_path = public
as $$
  select p.family_id, p.id, fm.role, public.current_child_profile_id()
  from public.family_members fm
  join public.profiles p on p.user_id = fm.user_id and p.family_id = fm.family_id
  where fm.user_id = auth.uid()
  order by case when fm.role = 'parent' then 0 else 1 end
  limit 1
$$;

grant execute on function public.get_my_access_context() to authenticated;

create or replace function public.set_portal_pin(p_pin text)
returns boolean language plpgsql security definer set search_path = public
as $$
declare
  v_profile uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_pin is null or p_pin !~ '^[0-9]{4,12}$' then raise exception 'PIN must contain 4 to 12 digits'; end if;
  select id into v_profile from public.profiles where user_id = auth.uid() limit 1;
  if v_profile is null then raise exception 'Profile not found'; end if;
  insert into public.portal_pin_credentials(profile_id, pin_hash, failed_attempts, locked_until, updated_at)
    values (v_profile, extensions.crypt(p_pin, extensions.gen_salt('bf', 10)), 0, null, now())
  on conflict (profile_id) do update set pin_hash = excluded.pin_hash, failed_attempts = 0, locked_until = null, updated_at = now();
  return true;
end;
$$;

grant execute on function public.set_portal_pin(text) to authenticated;
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
  select id into v_profile from public.profiles where user_id = auth.uid() limit 1;
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

grant execute on function public.verify_portal_pin(text) to authenticated;
revoke all on table public.portal_pin_credentials from anon, authenticated;

-- Parent access is granted only by an existing family_members row or the
-- bootstrap account below. Contact email arrays are notification recipients,
-- not an authorization grant; User #1 must approve another account by its
-- authenticated user id before that account can join.
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
  v_family uuid;
  v_role text;
  v_child uuid;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if v_email = '' then select lower(trim(email)) into v_email from auth.users where id = v_user; end if;
  select family_id, role into v_family, v_role from public.family_members where user_id = v_user order by case when role = 'parent' then 0 else 1 end limit 1;
  if v_family is null then
    if v_email = 'thedfamily0@gmail.com' then
      insert into public.families (created_by) values (v_user) returning id into v_family;
      insert into public.family_members (family_id, user_id, role) values (v_family, v_user, 'parent'); v_role := 'parent';
    else
      raise exception 'This account is not approved for the Conquerer family. A family administrator must approve its authenticated user ID.';
    end if;
  end if;
  if v_role = 'child' then
    update public.profiles set user_id = v_user, updated_at = now() where family_id = v_family and role = 'child' and user_id is null;
    select id into v_child from public.profiles where family_id = v_family and role = 'child' and user_id = v_user limit 1;
    if v_child is null then raise exception 'The approved child profile could not be linked.'; end if;
    return v_family;
  end if;
  insert into public.profiles (user_id, family_id, role, display_name) values (v_user, v_family, 'parent', 'Parent') on conflict (user_id) do update set family_id = excluded.family_id;
  select id into v_child from public.profiles where family_id = v_family and role = 'child' limit 1;
  if v_child is null then
    insert into public.profiles (user_id, family_id, role, display_name, avatar, nomi_name) values (null, v_family, 'child', coalesce(nullif(trim(p_display_name), ''), 'Explorer'), p_avatar, coalesce(nullif(trim(p_nomi_name), ''), 'Nomi')) returning id into v_child;
  elsif exists (select 1 from public.profiles where id = v_child and user_id is null) then
    update public.profiles set display_name = coalesce(nullif(trim(p_display_name), ''), display_name), avatar = coalesce(nullif(p_avatar, ''), avatar), nomi_name = coalesce(nullif(trim(p_nomi_name), ''), nomi_name), updated_at = now() where id = v_child;
  end if;
  insert into public.family_contact_settings (family_id) values (v_family) on conflict (family_id) do nothing;
  insert into public.guardrail_settings (family_id) values (v_family) on conflict (family_id) do nothing;
  return v_family;
end;
$$;

grant execute on function public.ensure_family_setup(text, text, text) to authenticated;
