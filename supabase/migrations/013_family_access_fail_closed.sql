-- Prevent contact email arrays from granting hosted family access.
-- Existing family_members rows remain valid; new accounts require explicit
-- approval by authenticated user ID through the future admin flow.

begin;

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
  select family_id, role into v_family, v_role
    from public.family_members
    where user_id = v_user
    order by case when role = 'parent' then 0 else 1 end
    limit 1;

  if v_family is null then
    if v_email <> 'thedfamily0@gmail.com' then
      raise exception 'This account is not approved for the Conquerer family. A family administrator must approve its authenticated user ID.';
    end if;
    insert into public.families (created_by) values (v_user) returning id into v_family;
    insert into public.family_members (family_id, user_id, role)
      values (v_family, v_user, 'parent');
    v_role := 'parent';
  end if;

  if v_role = 'child' then
    update public.profiles
      set user_id = v_user, updated_at = now()
      where family_id = v_family and role = 'child' and user_id is null;
    select id into v_child from public.profiles
      where family_id = v_family and role = 'child' and user_id = v_user limit 1;
    if v_child is null then raise exception 'The approved child profile could not be linked.'; end if;
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
  elsif exists (select 1 from public.profiles where id = v_child and user_id is null) then
    update public.profiles
      set display_name = coalesce(nullif(trim(p_display_name), ''), display_name),
          avatar = coalesce(nullif(p_avatar, ''), avatar),
          nomi_name = coalesce(nullif(trim(p_nomi_name), ''), nomi_name),
          updated_at = now()
      where id = v_child;
  end if;
  insert into public.family_contact_settings (family_id) values (v_family) on conflict (family_id) do nothing;
  insert into public.guardrail_settings (family_id) values (v_family) on conflict (family_id) do nothing;
  return v_family;
end;
$$;

grant execute on function public.ensure_family_setup(text, text, text) to authenticated;

commit;
