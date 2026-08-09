-- Allow a parent to resolve the child profile in their own family after invitation redemption.
-- This migration changes only the authorization resolver; it does not alter profiles,
-- memberships, invitations, or learning data.

begin;

create or replace function public.current_child_profile_id()
returns uuid language sql stable security definer set search_path = public
as $$
  select p.id
  from public.profiles p
  join public.family_members m
    on m.family_id = p.family_id
   and m.user_id = auth.uid()
  where p.role = 'child'
    and (
      (m.role = 'child' and p.user_id = auth.uid())
      or m.role = 'parent'
    )
  order by case when p.user_id = auth.uid() then 0 else 1 end
  limit 1
$$;

revoke all on function public.current_child_profile_id() from public;
grant execute on function public.current_child_profile_id() to authenticated;

commit;
