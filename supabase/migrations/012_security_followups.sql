-- Follow-up hardening for hosted family data access.
-- Apply after 011_learning_results_reports_xp.sql.

begin;

drop policy if exists "Family members insert learning events" on public.learning_performance_events;
create policy "Family members insert learning events" on public.learning_performance_events for insert
  with check (
    public.is_family_member(family_id)
    and exists (
      select 1
      from public.profiles as child
      where child.id = learning_performance_events.child_id
        and child.family_id = learning_performance_events.family_id
        and child.role = 'child'
    )
  );

grant select on public.parent_report_deliveries to authenticated;
drop policy if exists "Family parents view report deliveries" on public.parent_report_deliveries;
create policy "Family parents view report deliveries" on public.parent_report_deliveries for select
  using (public.is_family_parent(family_id));

drop policy if exists "Family parents manage wallet" on public.xp_wallets;
create policy "Family parents manage wallet" on public.xp_wallets for all
  using (
    public.is_family_parent((select family_id from public.profiles where id = xp_wallets.child_id))
  )
  with check (
    public.is_family_parent((select family_id from public.profiles where id = xp_wallets.child_id))
  );

commit;
