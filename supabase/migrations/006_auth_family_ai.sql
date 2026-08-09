-- Auth, family membership, family-scoped RLS, and server-side AI usage.
-- Apply only after reviewing the existing production data and creating a backup.

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Explorer Family',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.family_members (
  family_id uuid references public.families(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null check (role in ('parent', 'child')),
  created_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

alter table public.profiles add column if not exists family_id uuid references public.families(id) on delete cascade;
alter table public.profiles alter column user_id drop not null;
alter table public.profiles add constraint profiles_family_role_unique unique (family_id, role);

create table if not exists public.ai_usage_daily (
  usage_date date not null default current_date,
  user_id uuid references auth.users(id) on delete cascade not null,
  channel text not null check (channel in ('nomi', 'homework', 'parent', 'memory')),
  request_count integer not null default 0 check (request_count >= 0),
  last_request_at timestamptz,
  primary key (usage_date, user_id, channel)
);

alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.ai_usage_daily enable row level security;

create or replace function public.current_family_ids()
returns setof uuid language sql stable security definer set search_path = public
as $$ select family_id from public.family_members where user_id = auth.uid() $$;

create or replace function public.current_child_profile_id()
returns uuid language sql stable security definer set search_path = public
as $$
  select id from public.profiles
  where family_id in (select public.current_family_ids()) and role = 'child'
  limit 1
$$;

create or replace function public.ensure_family_setup(
  p_display_name text default 'Explorer',
  p_avatar text default '🌟',
  p_nomi_name text default 'Nomi'
)
returns uuid language plpgsql security definer set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_family uuid;
  v_parent_profile uuid;
  v_child_profile uuid;
begin
  if v_user is null then raise exception 'Authentication required'; end if;

  select family_id into v_family from public.family_members
    where user_id = v_user and role = 'parent' limit 1;
  if v_family is null then
    insert into public.families (created_by) values (v_user) returning id into v_family;
    insert into public.family_members (family_id, user_id, role) values (v_family, v_user, 'parent');
  end if;

  select id into v_parent_profile from public.profiles where user_id = v_user;
  if v_parent_profile is null then
    insert into public.profiles (user_id, family_id, role, display_name)
      values (v_user, v_family, 'parent', 'Parent') returning id into v_parent_profile;
  end if;

  select id into v_child_profile from public.profiles where family_id = v_family and role = 'child';
  if v_child_profile is null then
    insert into public.profiles (user_id, family_id, role, display_name, avatar, nomi_name)
      values (null, v_family, 'child', coalesce(nullif(trim(p_display_name), ''), 'Explorer'), p_avatar, coalesce(nullif(trim(p_nomi_name), ''), 'Nomi'))
      returning id into v_child_profile;
  end if;

  return v_family;
end;
$$;

grant execute on function public.ensure_family_setup(text, text, text) to authenticated;
grant execute on function public.current_family_ids() to authenticated;
grant execute on function public.current_child_profile_id() to authenticated;

create policy "Users view own families" on public.families for select using (id in (select public.current_family_ids()));
create policy "Members view membership" on public.family_members for select using (family_id in (select public.current_family_ids()));

create policy "Users cannot read AI usage" on public.ai_usage_daily for select using (false);
create policy "Users cannot write AI usage" on public.ai_usage_daily for all using (false) with check (false);

create index if not exists idx_family_members_user on public.family_members(user_id, family_id);
create index if not exists idx_profiles_family_role on public.profiles(family_id, role);
