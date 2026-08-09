-- Child AI quota threshold alerts and parent-approved Johannesburg-day overrides.
-- Overrides are scoped to one linked child account and one local calendar date; they
-- never mutate the family's durable guardrail defaults or grant browser table access.

begin;

create table if not exists public.daily_child_ai_quota_overrides (
  family_id uuid not null references public.families(id) on delete cascade,
  child_user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null,
  daily_message_cap integer,
  nomi_daily_cap integer,
  homework_daily_cap integer,
  set_by_user_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (family_id, child_user_id, usage_date),
  check (daily_message_cap is not null or nomi_daily_cap is not null or homework_daily_cap is not null),
  check (daily_message_cap is null or daily_message_cap between 1 and 500),
  check (nomi_daily_cap is null or nomi_daily_cap between 1 and 200),
  check (homework_daily_cap is null or homework_daily_cap between 1 and 100)
);

create table if not exists public.ai_quota_alert_claims (
  id uuid primary key default extensions.gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null,
  alert_kind text not null check (alert_kind = 'child_ai_95_percent'),
  quota_scope text not null check (quota_scope in ('daily', 'nomi', 'homework')),
  channel text not null check (channel in ('nomi', 'homework')),
  used_request_count integer not null check (used_request_count >= 0),
  effective_cap integer not null check (effective_cap > 0),
  delivery_status text not null default 'pending' check (delivery_status in ('pending', 'processing', 'sent', 'failed')),
  delivery_error text check (delivery_error is null or char_length(delivery_error) <= 500),
  provider_message_id text,
  created_at timestamptz not null default now(),
  delivery_attempted_at timestamptz,
  delivered_at timestamptz,
  unique (family_id, child_user_id, usage_date, alert_kind)
);

create index if not exists daily_child_ai_quota_overrides_date_idx
  on public.daily_child_ai_quota_overrides (usage_date, family_id);
create index if not exists ai_quota_alert_claims_delivery_idx
  on public.ai_quota_alert_claims (delivery_status, created_at);

alter table public.daily_child_ai_quota_overrides enable row level security;
alter table public.ai_quota_alert_claims enable row level security;
revoke all on table public.daily_child_ai_quota_overrides from anon, authenticated;
revoke all on table public.ai_quota_alert_claims from anon, authenticated;

create or replace function public.get_my_child_ai_daily_quota_status()
returns table (
  child_user_id uuid,
  usage_date date,
  used_request_count integer,
  base_daily_message_cap integer,
  base_nomi_daily_cap integer,
  base_homework_daily_cap integer,
  effective_daily_message_cap integer,
  effective_nomi_daily_cap integer,
  effective_homework_daily_cap integer,
  override_active boolean
)
language plpgsql security definer set search_path = public
as $$
declare
  v_family uuid;
  v_child uuid;
  v_today date := (now() at time zone 'Africa/Johannesburg')::date;
  v_daily integer := 100;
  v_nomi integer := 30;
  v_homework integer := 10;
  v_override_daily integer;
  v_override_nomi integer;
  v_override_homework integer;
  v_used integer := 0;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select family_id into v_family from public.family_members
    where user_id = auth.uid() and role = 'parent' limit 1;
  if v_family is null then raise exception 'Parent access required'; end if;

  select daily_message_cap, nomi_daily_cap, homework_daily_cap
    into v_daily, v_nomi, v_homework
    from public.guardrail_settings where family_id = v_family;
  if not found then v_daily := 100; v_nomi := 30; v_homework := 10; end if;

  select user_id into v_child from public.family_members
    where family_id = v_family and role = 'child'
    order by created_at, user_id
    limit 1;
  if exists (
    select 1 from public.family_members
    where family_id = v_family and role = 'child'
    offset 1
  ) then
    raise exception 'Today''s child AI allowance supports one linked child account per family';
  end if;
  if v_child is not null then
    select daily_message_cap, nomi_daily_cap, homework_daily_cap
      into v_override_daily, v_override_nomi, v_override_homework
      from public.daily_child_ai_quota_overrides
      where family_id = v_family and child_user_id = v_child and usage_date = v_today;
    select coalesce(sum(request_count), 0) into v_used from public.ai_usage_daily
      where user_id = v_child and usage_date = v_today;
  end if;

  return query select v_child, v_today, v_used, v_daily, v_nomi, v_homework,
    coalesce(v_override_daily, v_daily), coalesce(v_override_nomi, v_nomi),
    coalesce(v_override_homework, v_homework),
    v_override_daily is not null or v_override_nomi is not null or v_override_homework is not null;
end;
$$;

create or replace function public.set_my_child_ai_daily_quota_override(
  p_daily_message_cap integer default null,
  p_nomi_daily_cap integer default null,
  p_homework_daily_cap integer default null
)
returns boolean language plpgsql security definer set search_path = public
as $$
declare
  v_family uuid;
  v_child uuid;
  v_today date := (now() at time zone 'Africa/Johannesburg')::date;
  v_daily integer := 100;
  v_nomi integer := 30;
  v_homework integer := 10;
  v_current_daily integer;
  v_current_nomi integer;
  v_current_homework integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_daily_message_cap is null and p_nomi_daily_cap is null and p_homework_daily_cap is null then
    raise exception 'Choose at least one child AI allowance to increase';
  end if;
  select family_id into v_family from public.family_members
    where user_id = auth.uid() and role = 'parent' limit 1;
  if v_family is null then raise exception 'Parent access required'; end if;
  select user_id into v_child from public.family_members
    where family_id = v_family and role = 'child'
    order by created_at, user_id
    limit 1;
  if exists (
    select 1 from public.family_members
    where family_id = v_family and role = 'child'
    offset 1
  ) then
    raise exception 'Today''s child AI allowance supports one linked child account per family';
  end if;
  if v_child is null then raise exception 'A linked child Google account is required before a daily AI allowance can be changed'; end if;

  select daily_message_cap, nomi_daily_cap, homework_daily_cap
    into v_daily, v_nomi, v_homework
    from public.guardrail_settings where family_id = v_family;
  if not found then v_daily := 100; v_nomi := 30; v_homework := 10; end if;

  select daily_message_cap, nomi_daily_cap, homework_daily_cap
    into v_current_daily, v_current_nomi, v_current_homework
    from public.daily_child_ai_quota_overrides
    where family_id = v_family and child_user_id = v_child and usage_date = v_today;
  v_current_daily := coalesce(v_current_daily, v_daily);
  v_current_nomi := coalesce(v_current_nomi, v_nomi);
  v_current_homework := coalesce(v_current_homework, v_homework);

  if p_daily_message_cap is not null and (p_daily_message_cap < 1 or p_daily_message_cap > 500 or v_daily = 0 or p_daily_message_cap < v_current_daily) then
    raise exception 'Today''s total child AI allowance must not decrease and must be between 1 and 500';
  end if;
  if p_nomi_daily_cap is not null and (p_nomi_daily_cap < 1 or p_nomi_daily_cap > 200 or v_nomi = 0 or p_nomi_daily_cap < v_current_nomi) then
    raise exception 'Today''s Nomi allowance must not decrease and must be between 1 and 200';
  end if;
  if p_homework_daily_cap is not null and (p_homework_daily_cap < 1 or p_homework_daily_cap > 100 or v_homework = 0 or p_homework_daily_cap < v_current_homework) then
    raise exception 'Today''s homework allowance must not decrease and must be between 1 and 100';
  end if;
  if coalesce(p_daily_message_cap, v_current_daily) = v_current_daily
    and coalesce(p_nomi_daily_cap, v_current_nomi) = v_current_nomi
    and coalesce(p_homework_daily_cap, v_current_homework) = v_current_homework then
    raise exception 'Increase at least one child AI allowance for today';
  end if;

  insert into public.daily_child_ai_quota_overrides (
    family_id, child_user_id, usage_date, daily_message_cap, nomi_daily_cap, homework_daily_cap, set_by_user_id
  ) values (
    v_family, v_child, v_today, p_daily_message_cap, p_nomi_daily_cap, p_homework_daily_cap, auth.uid()
  )
  on conflict (family_id, child_user_id, usage_date) do update set
    daily_message_cap = coalesce(excluded.daily_message_cap, public.daily_child_ai_quota_overrides.daily_message_cap),
    nomi_daily_cap = coalesce(excluded.nomi_daily_cap, public.daily_child_ai_quota_overrides.nomi_daily_cap),
    homework_daily_cap = coalesce(excluded.homework_daily_cap, public.daily_child_ai_quota_overrides.homework_daily_cap),
    set_by_user_id = excluded.set_by_user_id,
    updated_at = now();
  return true;
end;
$$;

-- The function is service-role-only. The Edge Function first verifies the caller's
-- JWT and passes that verified user ID, so neither browser input nor contact email
-- addresses can select a child account or claim an alert.
drop function if exists public.consume_ai_quota(uuid, text);
create function public.consume_ai_quota(p_user_id uuid, p_channel text)
returns table (
  allowed boolean,
  reason text,
  remaining integer,
  retry_after_seconds integer,
  quota_alert_pending boolean,
  quota_alert_id uuid,
  quota_alert_scope text,
  quota_alert_used integer,
  quota_alert_cap integer
)
language plpgsql security definer set search_path = public
as $$
declare
  v_family uuid;
  v_role text;
  v_ai_start integer := 6;
  v_ai_end integer := 20;
  v_total_cap integer := 100;
  v_nomi_cap integer := 30;
  v_homework_cap integer := 10;
  v_parent_cap integer := 5;
  v_interval integer := 3;
  v_override_daily integer;
  v_override_nomi integer;
  v_override_homework integer;
  v_channel_count integer := 0;
  v_total_count integer := 0;
  v_last_request timestamptz;
  v_cap integer;
  v_wait integer;
  v_now timestamptz := now();
  v_today date := (v_now at time zone 'Africa/Johannesburg')::date;
  v_total_after integer;
  v_channel_after integer;
  v_alert_id uuid;
  v_alert_scope text;
  v_alert_used integer;
  v_alert_cap integer;
begin
  if p_channel not in ('nomi', 'homework', 'parent', 'memory') then
    return query select false, 'invalid_channel', 0, 0, false, null::uuid, null::text, null::integer, null::integer;
    return;
  end if;
  select family_id, role into v_family, v_role from public.family_members
    where user_id = p_user_id order by role = 'parent' desc limit 1;
  if v_family is null then
    return query select false, 'family_not_setup', 0, 0, false, null::uuid, null::text, null::integer, null::integer;
    return;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text || ':' || v_today::text, 0));
  select ai_hours_start, ai_hours_end, daily_message_cap, nomi_daily_cap, homework_daily_cap, parent_daily_cap, min_request_interval_seconds
    into v_ai_start, v_ai_end, v_total_cap, v_nomi_cap, v_homework_cap, v_parent_cap, v_interval
    from public.guardrail_settings where family_id = v_family;
  if not found then
    v_ai_start := 6; v_ai_end := 20; v_total_cap := 100; v_nomi_cap := 30; v_homework_cap := 10; v_parent_cap := 5; v_interval := 3;
  end if;
  if v_role = 'child' then
    select daily_message_cap, nomi_daily_cap, homework_daily_cap
      into v_override_daily, v_override_nomi, v_override_homework
      from public.daily_child_ai_quota_overrides
      where family_id = v_family and child_user_id = p_user_id and usage_date = v_today;
    v_total_cap := coalesce(v_override_daily, v_total_cap);
    v_nomi_cap := coalesce(v_override_nomi, v_nomi_cap);
    v_homework_cap := coalesce(v_override_homework, v_homework_cap);
  end if;

  if extract(hour from (v_now at time zone 'Africa/Johannesburg')) < v_ai_start or extract(hour from (v_now at time zone 'Africa/Johannesburg')) >= v_ai_end then
    return query select false, 'outside_hours', 0, 0, false, null::uuid, null::text, null::integer, null::integer;
    return;
  end if;
  select coalesce(sum(request_count), 0), max(last_request_at) into v_total_count, v_last_request
    from public.ai_usage_daily where user_id = p_user_id and usage_date = v_today;
  select coalesce(max(request_count), 0) into v_channel_count from public.ai_usage_daily
    where user_id = p_user_id and usage_date = v_today and channel = p_channel;
  v_cap := case p_channel when 'nomi' then v_nomi_cap when 'homework' then v_homework_cap when 'parent' then v_parent_cap else 1 end;
  if v_total_cap > 0 and v_total_count >= v_total_cap then
    return query select false, 'daily_cap_reached', 0, 0, false, null::uuid, null::text, null::integer, null::integer;
    return;
  end if;
  if v_cap > 0 and v_channel_count >= v_cap then
    return query select false, 'channel_cap_reached', 0, 0, false, null::uuid, null::text, null::integer, null::integer;
    return;
  end if;
  if v_last_request is not null and extract(epoch from (v_now - v_last_request)) < v_interval then
    v_wait := greatest(1, v_interval - extract(epoch from (v_now - v_last_request))::integer);
    return query select false, 'cooldown', v_wait, v_wait, false, null::uuid, null::text, null::integer, null::integer;
    return;
  end if;

  insert into public.ai_usage_daily (usage_date, user_id, channel, request_count, last_request_at)
    values (v_today, p_user_id, p_channel, 1, v_now)
    on conflict (usage_date, user_id, channel) do update set
      request_count = public.ai_usage_daily.request_count + 1,
      last_request_at = excluded.last_request_at;
  v_total_after := v_total_count + 1;
  v_channel_after := v_channel_count + 1;

  if v_role = 'child' and p_channel in ('nomi', 'homework') then
    if v_total_cap > 0 and v_total_after >= ceil(v_total_cap::numeric * 0.95)::integer then
      v_alert_scope := 'daily'; v_alert_used := v_total_after; v_alert_cap := v_total_cap;
    elsif v_cap > 0 and v_channel_after >= ceil(v_cap::numeric * 0.95)::integer then
      v_alert_scope := p_channel; v_alert_used := v_channel_after; v_alert_cap := v_cap;
    end if;
    if v_alert_scope is not null then
      insert into public.ai_quota_alert_claims (
        family_id, child_user_id, usage_date, alert_kind, quota_scope, channel, used_request_count, effective_cap
      ) values (
        v_family, p_user_id, v_today, 'child_ai_95_percent', v_alert_scope, p_channel, v_alert_used, v_alert_cap
      ) on conflict (family_id, child_user_id, usage_date, alert_kind) do nothing
      returning id into v_alert_id;
    end if;
  end if;

  return query select true, 'ok',
    least(case when v_total_cap = 0 then 2147483647 else v_total_cap - v_total_after end, case when v_cap = 0 then 2147483647 else v_cap - v_channel_after end),
    0, v_alert_id is not null, v_alert_id, v_alert_scope, v_alert_used, v_alert_cap;
end;
$$;

revoke all on function public.get_my_child_ai_daily_quota_status() from public;
revoke all on function public.set_my_child_ai_daily_quota_override(integer, integer, integer) from public;
revoke all on function public.consume_ai_quota(uuid, text) from public, anon, authenticated;
grant execute on function public.get_my_child_ai_daily_quota_status() to authenticated;
grant execute on function public.set_my_child_ai_daily_quota_override(integer, integer, integer) to authenticated;
grant execute on function public.consume_ai_quota(uuid, text) to service_role;

commit;
