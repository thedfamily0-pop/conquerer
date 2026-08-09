-- Historical school results, smart goals, adaptive reporting, and atomic learning XP.
-- Report times use Africa/Johannesburg by default because the learner is in South Africa.

create extension if not exists pgcrypto;

-- Keep the hosted performance contract self-contained. Migration 008 contains the
-- same table for environments that apply the performance migration separately.
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
drop policy if exists "Family members view learning events" on public.learning_performance_events;
create policy "Family members view learning events" on public.learning_performance_events for select
  using (public.is_family_member(family_id));
drop policy if exists "Family members insert learning events" on public.learning_performance_events;
create policy "Family members insert learning events" on public.learning_performance_events for insert
  with check (public.is_family_member(family_id));
grant select, insert on public.learning_performance_events to authenticated;

create table if not exists public.school_results (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid not null references public.profiles(id) on delete cascade,
  academic_year smallint not null,
  term smallint not null check (term between 1 and 4),
  subject text not null,
  assessment_name text not null,
  assessment_date date not null,
  score numeric not null check (score >= 0),
  max_score numeric not null check (max_score > 0),
  grade text,
  source text not null default 'school' check (source in ('school', 'end_of_term', 'teacher', 'parent')),
  notes text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists school_results_unique_assessment
  on public.school_results(child_id, academic_year, term, subject, assessment_name, assessment_date);
create index if not exists school_results_child_subject_date
  on public.school_results(child_id, subject, assessment_date desc);

create table if not exists public.learning_goals (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null,
  title text not null,
  baseline numeric,
  target numeric,
  target_unit text not null default 'percent',
  due_date date,
  status text not null default 'active' check (status in ('active', 'met', 'paused', 'archived')),
  notes text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists learning_goals_child_status
  on public.learning_goals(child_id, status, due_date);

create table if not exists public.parent_report_settings (
  family_id uuid primary key references public.families(id) on delete cascade,
  daily_enabled boolean not null default true,
  daily_hour smallint not null default 20 check (daily_hour between 0 and 23),
  weekly_enabled boolean not null default true,
  weekly_day smallint not null default 6 check (weekly_day between 0 and 6),
  weekly_hour smallint not null default 13 check (weekly_hour between 0 and 23),
  timezone text not null default 'Africa/Johannesburg',
  updated_at timestamptz not null default now()
);

create table if not exists public.parent_report_deliveries (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  report_kind text not null check (report_kind in ('daily', 'weekly')),
  report_date date not null,
  status text not null default 'started' check (status in ('started', 'sent', 'failed', 'skipped')),
  recipient_count smallint not null default 0,
  provider_message_id text,
  error text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (family_id, report_kind, report_date)
);

create table if not exists public.learning_xp_daily (
  child_id uuid not null references public.profiles(id) on delete cascade,
  learning_date date not null,
  awarded_xp integer not null default 0 check (awarded_xp between 0 and 100),
  updated_at timestamptz not null default now(),
  primary key (child_id, learning_date)
);

create table if not exists public.learning_xp_transactions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.profiles(id) on delete cascade,
  learning_date date not null,
  client_id text not null,
  requested_xp integer not null check (requested_xp > 0),
  awarded_xp integer not null check (awarded_xp >= 0),
  source text not null,
  reason text,
  created_at timestamptz not null default now(),
  unique (child_id, client_id)
);

alter table public.school_results enable row level security;
alter table public.learning_goals enable row level security;
alter table public.parent_report_settings enable row level security;
alter table public.parent_report_deliveries enable row level security;
alter table public.learning_xp_daily enable row level security;
alter table public.learning_xp_transactions enable row level security;

drop policy if exists "Family parents manage school results" on public.school_results;
create policy "Family parents manage school results" on public.school_results for all
  using (public.is_family_parent(family_id)) with check (public.is_family_parent(family_id));
drop policy if exists "Family parents manage learning goals" on public.learning_goals;
create policy "Family parents manage learning goals" on public.learning_goals for all
  using (public.is_family_parent(family_id)) with check (public.is_family_parent(family_id));
drop policy if exists "Family parents manage report settings" on public.parent_report_settings;
create policy "Family parents manage report settings" on public.parent_report_settings for all
  using (public.is_family_parent(family_id)) with check (public.is_family_parent(family_id));

revoke all on public.parent_report_deliveries from anon, authenticated;
revoke all on public.learning_xp_daily from anon, authenticated;
revoke all on public.learning_xp_transactions from anon, authenticated;
grant select, insert, update, delete on public.school_results to authenticated;
grant select, insert, update, delete on public.learning_goals to authenticated;
grant select, insert, update, delete on public.parent_report_settings to authenticated;

create or replace function public.claim_learning_xp(
  p_child_id uuid,
  p_client_id text,
  p_requested_xp integer,
  p_source text,
  p_reason text default null
)
returns table (
  requested_xp integer,
  awarded_xp integer,
  total_awarded_xp integer,
  remaining_xp integer,
  balance integer,
  lifetime_earned integer,
  duplicate boolean
)
language plpgsql security definer set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_family uuid;
  v_day date := (now() at time zone 'Africa/Johannesburg')::date;
  v_requested integer := greatest(0, least(coalesce(p_requested_xp, 0), 100));
  v_awarded integer;
  v_total integer;
  v_balance integer;
  v_lifetime integer;
  v_previous record;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if p_child_id is null then p_child_id := public.current_child_profile_id(); end if;
  if p_client_id is null or length(trim(p_client_id)) < 8 then raise exception 'A stable XP transaction id is required'; end if;
  if p_source is null or length(trim(p_source)) = 0 then raise exception 'An XP source is required'; end if;
  select p.family_id into v_family from public.profiles p
    where p.id = p_child_id and p.role = 'child';
  if v_family is null or not public.is_family_member(v_family) then raise exception 'Child profile is not in the authenticated family'; end if;
  if p_child_id <> public.current_child_profile_id() and not public.is_family_parent(v_family) then
    raise exception 'Only the linked child or a family parent may claim learning XP';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_child_id::text || ':' || v_day::text, 0));
  select t.requested_xp, t.awarded_xp into v_previous
    from public.learning_xp_transactions t
    where t.child_id = p_child_id and t.client_id = trim(p_client_id);
  if found then
    select coalesce(d.awarded_xp, 0) into v_total from public.learning_xp_daily d
      where d.child_id = p_child_id and d.learning_date = v_day;
    select coalesce(w.balance, 0), coalesce(w.lifetime_earned, 0) into v_balance, v_lifetime
      from public.xp_wallets w where w.child_id = p_child_id;
    return query select v_previous.requested_xp, v_previous.awarded_xp, coalesce(v_total, 0),
      greatest(0, 100 - coalesce(v_total, 0)), coalesce(v_balance, 0), coalesce(v_lifetime, 0), true;
    return;
  end if;

  insert into public.learning_xp_daily(child_id, learning_date, awarded_xp)
    values (p_child_id, v_day, 0)
    on conflict (child_id, learning_date) do nothing;
  select d.awarded_xp into v_total from public.learning_xp_daily d
    where d.child_id = p_child_id and d.learning_date = v_day;
  v_awarded := least(v_requested, greatest(0, 100 - v_total));
  v_total := v_total + v_awarded;
  update public.learning_xp_daily set awarded_xp = v_total, updated_at = now()
    where child_id = p_child_id and learning_date = v_day;

  insert into public.xp_wallets(child_id, balance, lifetime_earned, updated_at)
    values (p_child_id, v_awarded, v_awarded, now())
    on conflict (child_id) do update set
      balance = public.xp_wallets.balance + excluded.balance,
      lifetime_earned = public.xp_wallets.lifetime_earned + excluded.lifetime_earned,
      updated_at = now();
  insert into public.learning_xp_transactions(child_id, learning_date, client_id, requested_xp, awarded_xp, source, reason)
    values (p_child_id, v_day, trim(p_client_id), v_requested, v_awarded, left(trim(p_source), 120), left(p_reason, 500));
  select coalesce(w.balance, 0), coalesce(w.lifetime_earned, 0) into v_balance, v_lifetime
    from public.xp_wallets w where w.child_id = p_child_id;
  return query select v_requested, v_awarded, v_total, greatest(0, 100 - v_total), v_balance, v_lifetime, false;
end;
$$;

revoke all on function public.claim_learning_xp(uuid, text, integer, text, text) from public, anon;
grant execute on function public.claim_learning_xp(uuid, text, integer, text, text) to authenticated;

insert into public.parent_report_settings(family_id)
  select id from public.families
  on conflict (family_id) do update set daily_hour = 20, weekly_day = 6, weekly_hour = 13, timezone = 'Africa/Johannesburg', updated_at = now();
