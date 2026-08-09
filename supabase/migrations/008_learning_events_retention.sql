-- Local migration for the Stage 1 performance and alert contract.
-- Review and apply only after explicit approval in a Supabase development project.

alter table if exists public.family_settings alter column parent_pin set default '';

create table if not exists public.learning_performance_events (
  id uuid primary key default gen_random_uuid(),
  client_id text not null,
  family_id uuid not null,
  child_id uuid not null references public.profiles(id) on delete cascade,
  activity text not null check (activity in ('practice', 'quest', 'reading', 'homework')),
  occurred_at timestamptz not null default now(),
  term smallint not null default 0,
  week smallint not null default 0,
  subject text not null,
  content_id text not null,
  question_id text,
  checkpoint_index smallint,
  correct boolean not null default false,
  score numeric not null default 0,
  total numeric not null default 0,
  hints_shown smallint not null default 0,
  xp_earned integer not null default 0,
  answer text,
  is_retry boolean not null default false,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique (child_id, client_id)
);

create index if not exists idx_learning_events_child_time on public.learning_performance_events(child_id, occurred_at desc);
create index if not exists idx_learning_events_family_time on public.learning_performance_events(family_id, occurred_at desc);
alter table public.learning_performance_events enable row level security;

create policy "Family members view learning events" on public.learning_performance_events for select
  using (public.is_family_member(family_id));
create policy "Family members insert learning events" on public.learning_performance_events for insert
  with check (public.is_family_member(family_id));

create or replace function public.prune_parent_alerts()
returns integer language plpgsql security definer set search_path = public
as $$
declare deleted_count integer;
begin
  delete from public.parent_alerts where created_at < now() - interval '1 day';
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;
revoke execute on function public.prune_parent_alerts() from public, anon, authenticated;
grant execute on function public.prune_parent_alerts() to service_role;
