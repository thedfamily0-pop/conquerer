-- Restrict family bootstrap to the approved account and persist family contact settings.
-- Email addresses are invitation/contact values; family_members.user_id remains the
-- authorization boundary for every family-scoped operation.

create table if not exists public.family_contact_settings (
  family_id uuid primary key references public.families(id) on delete cascade,
  dad_emails text[] not null default '{}',
  mom_emails text[] not null default '{}',
  child_email text,
  updated_at timestamptz not null default now(),
  constraint family_contact_child_email_format check (
    child_email is null or child_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  )
);

alter table public.family_contact_settings enable row level security;

create policy "Family parents manage contact settings"
  on public.family_contact_settings for all
  using (public.is_family_parent(family_id))
  with check (public.is_family_parent(family_id));

-- Preserve any legacy single-address settings when they exist.
insert into public.family_contact_settings (family_id, dad_emails, mom_emails)
select family_id,
  case when nullif(trim(dad_email), '') is null then '{}'::text[] else array[lower(trim(dad_email))] end,
  case when nullif(trim(mom_email), '') is null then '{}'::text[] else array[lower(trim(mom_email))] end
from public.family_settings
on conflict (family_id) do nothing;

-- Bootstrap and existing-family access are deliberately server-side. The
-- bootstrap email is only used to identify the first account; membership UUIDs
-- remain the durable authorization records.
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
  if v_email = '' then
    select lower(trim(email)) into v_email from auth.users where id = v_user;
  end if;

  select family_id, role into v_family, v_role
  from public.family_members
  where user_id = v_user
  order by case when role = 'parent' then 0 else 1 end
  limit 1;

  if v_family is null then
    if v_email = 'thedfamily0@gmail.com' then
      insert into public.families (created_by) values (v_user) returning id into v_family;
      insert into public.family_members (family_id, user_id, role)
        values (v_family, v_user, 'parent');
      v_role := 'parent';
    else
      select family_id into v_family
      from public.family_contact_settings
      where child_email is not null and lower(trim(child_email)) = v_email
      limit 1;
      if v_family is null then
        raise exception 'This account is not approved for the Conquerer family.';
      end if;
      insert into public.family_members (family_id, user_id, role)
        values (v_family, v_user, 'child')
        on conflict (family_id, user_id) do nothing;
      v_role := 'child';
    end if;
  end if;

  if v_role = 'child' then
    update public.profiles
      set user_id = v_user, updated_at = now()
      where family_id = v_family and role = 'child' and user_id is null;
    select id into v_child from public.profiles
      where family_id = v_family and role = 'child' and user_id = v_user limit 1;
    if v_child is null then
      raise exception 'The approved child profile could not be linked.';
    end if;
    return v_family;
  end if;

  insert into public.profiles (user_id, family_id, role, display_name)
    values (v_user, v_family, 'parent', 'Parent')
    on conflict (user_id) do update set family_id = excluded.family_id;

  select id into v_child from public.profiles
    where family_id = v_family and role = 'child' limit 1;
  if v_child is null then
    insert into public.profiles (user_id, family_id, role, display_name, avatar, nomi_name)
      values (null, v_family, 'child', coalesce(nullif(trim(p_display_name), ''), 'Explorer'), p_avatar, coalesce(nullif(trim(p_nomi_name), ''), 'Nomi'))
      returning id into v_child;
  else
    update public.profiles
      set display_name = coalesce(nullif(trim(p_display_name), ''), display_name),
          avatar = coalesce(nullif(p_avatar, ''), avatar),
          nomi_name = coalesce(nullif(trim(p_nomi_name), ''), nomi_name),
          updated_at = now()
      where id = v_child and user_id is null;
  end if;
  insert into public.family_contact_settings (family_id) values (v_family)
    on conflict (family_id) do nothing;
  insert into public.guardrail_settings (family_id) values (v_family)
    on conflict (family_id) do nothing;
  return v_family;
end;
$$;

create or replace function public.current_child_profile_id()
returns uuid language sql stable security definer set search_path = public
as $$
  select id from (
    select p.id, 0 as priority
    from public.profiles p
    where p.user_id = auth.uid() and p.role = 'child'
    union all
    select p.id, 1 as priority
    from public.profiles p
    where p.family_id in (select public.current_family_ids())
      and p.role = 'child' and p.user_id is null
  ) candidates
  order by priority
  limit 1
$$;

revoke execute on function public.ensure_family_setup(text, text, text) from public, anon;
revoke execute on function public.current_child_profile_id() from public, anon;
grant execute on function public.ensure_family_setup(text, text, text) to authenticated;
grant execute on function public.current_child_profile_id() to authenticated;

create index if not exists idx_family_contact_child_email
  on public.family_contact_settings (lower(child_email))
  where child_email is not null;
