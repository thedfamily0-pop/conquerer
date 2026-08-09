-- Additive, non-destructive hosted child-customisation update path.

begin;

create or replace function public.update_my_child_profile(
  p_display_name text,
  p_avatar text,
  p_skin text,
  p_background text,
  p_nomi_name text
)
returns table (
  display_name text,
  avatar text,
  skin text,
  background text,
  nomi_name text,
  updated_at timestamptz
)
language plpgsql security definer set search_path = public
as $$
declare
  v_profile public.profiles%rowtype;
  v_display_name text := left(trim(coalesce(p_display_name, '')), 24);
  v_avatar text := trim(coalesce(p_avatar, ''));
  v_skin text := trim(coalesce(p_skin, ''));
  v_background text := trim(coalesce(p_background, ''));
  v_nomi_name text := left(trim(coalesce(p_nomi_name, '')), 20);
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select p.* into v_profile from public.profiles p
    join public.family_members m on m.family_id = p.family_id
      and m.user_id = auth.uid() and m.role = 'child'
    where p.user_id = auth.uid() and p.role = 'child'
    limit 1;
  if v_profile.id is null then raise exception 'Child profile access required'; end if;
  if v_display_name = '' or v_nomi_name = '' then raise exception 'Names cannot be empty'; end if;
  if v_avatar not in ('🌟', '🚀', '🦋', '🦄', '🌻', '🐬', '🧸', '🎨') then raise exception 'Invalid avatar'; end if;
  if v_skin not in ('midnight', 'ocean', 'sunset', 'garden') then raise exception 'Invalid skin'; end if;
  if v_background not in ('aurora', 'stars', 'clouds') then raise exception 'Invalid background'; end if;

  update public.profiles p set
    display_name = v_display_name, avatar = v_avatar, skin = v_skin,
    background = v_background, nomi_name = v_nomi_name, updated_at = now()
    where p.id = v_profile.id
    returning p.display_name, p.avatar, p.skin, p.background, p.nomi_name, p.updated_at
    into display_name, avatar, skin, background, nomi_name, updated_at;
  return next;
end;
$$;

revoke all on function public.update_my_child_profile(text, text, text, text, text) from public;
grant execute on function public.update_my_child_profile(text, text, text, text, text) to authenticated;

commit;
