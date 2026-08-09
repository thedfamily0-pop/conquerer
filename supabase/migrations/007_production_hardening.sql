-- Production hardening for the offline-first family app.
-- Review existing data and run against a development project before production.

alter table public.guardrail_settings
  add column if not exists nomi_daily_cap smallint not null default 30,
  add column if not exists homework_daily_cap smallint not null default 10,
  add column if not exists parent_daily_cap smallint not null default 5,
  add column if not exists min_request_interval_seconds smallint not null default 3;

alter table public.nomi_messages add column if not exists client_id text;
create unique index if not exists idx_nomi_messages_child_client
  on public.nomi_messages(child_id, client_id) where client_id is not null;

create or replace function public.is_family_member(p_family_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.family_members
    where family_id = p_family_id and user_id = auth.uid()
  )
$$;

create or replace function public.is_family_parent(p_family_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.family_members
    where family_id = p_family_id and user_id = auth.uid() and role = 'parent'
  )
$$;

grant execute on function public.is_family_member(uuid) to authenticated;
grant execute on function public.is_family_parent(uuid) to authenticated;

-- Remove legacy broad or role-only policies before adding family-scoped policies.
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Child can manage own diary" on public.diary_entries;
drop policy if exists "Parents can read child diary" on public.diary_entries;
drop policy if exists "Child owns nomi messages" on public.nomi_messages;
drop policy if exists "Nomi messages child access" on public.nomi_messages;
drop policy if exists "Child owns nomi memory" on public.nomi_memory;
drop policy if exists "XP wallet child access" on public.xp_wallets;
drop policy if exists "Child can view wallet" on public.xp_wallets;
drop policy if exists "Parents manage store" on public.store_items;
drop policy if exists "Child views available store items" on public.store_items;
drop policy if exists "Child views own purchases" on public.store_purchases;
drop policy if exists "Family members access schedule" on public.schedule_items;
drop policy if exists "Family members access chores" on public.chores;
drop policy if exists "Family members access alerts" on public.parent_alerts;
drop policy if exists "Family members access settings" on public.family_settings;
drop policy if exists "Child owns vocab" on public.vocab_words;
drop policy if exists "Parents can read vocab" on public.vocab_words;
drop policy if exists "Anyone reads practice" on public.practice_questions;
drop policy if exists "Parents insert practice" on public.practice_questions;
drop policy if exists "Parents update practice" on public.practice_questions;
drop policy if exists "Parents delete practice" on public.practice_questions;
drop policy if exists "Anyone reads stories" on public.reading_stories;
drop policy if exists "Parents insert stories" on public.reading_stories;
drop policy if exists "Parents update stories" on public.reading_stories;
drop policy if exists "Parents delete stories" on public.reading_stories;
drop policy if exists "Anyone reads objectives" on public.weekly_objectives;
drop policy if exists "Parents insert objectives" on public.weekly_objectives;
drop policy if exists "Parents update objectives" on public.weekly_objectives;
drop policy if exists "Anyone reads uploads" on public.content_uploads;
drop policy if exists "Parents log uploads" on public.content_uploads;
drop policy if exists "Parents view links" on public.detected_links;
drop policy if exists "Parents view pii" on public.pii_detections;
drop policy if exists "Parents view images" on public.image_moderation_log;
drop policy if exists "Parents view devices" on public.known_devices;
drop policy if exists "Child owns sentiments" on public.conversation_sentiments;
drop policy if exists "Parents view usage" on public.usage_events;
drop policy if exists "Parents manage guardrail settings" on public.guardrail_settings;
drop policy if exists "Parents view pin log" on public.pin_access_log;
drop policy if exists "System inserts links" on public.detected_links;
drop policy if exists "System inserts pii" on public.pii_detections;
drop policy if exists "System inserts images" on public.image_moderation_log;
drop policy if exists "System inserts usage" on public.usage_events;
drop policy if exists "System inserts pin log" on public.pin_access_log;

-- Family/profile access.
create policy "Family members view profiles" on public.profiles for select
  using (family_id in (select public.current_family_ids()) or user_id = auth.uid());
create policy "Parents update family profiles" on public.profiles for update
  using (public.is_family_parent(family_id))
  with check (public.is_family_parent(family_id));

-- Child-owned data is also accessible to the authenticated parent of the same family,
-- which lets the parent session safely sync the shared child device.
create policy "Family members manage diary" on public.diary_entries for all
  using (child_id in (select id from public.profiles where family_id in (select public.current_family_ids())))
  with check (child_id in (select id from public.profiles where family_id in (select public.current_family_ids())));
create policy "Family members manage nomi messages" on public.nomi_messages for all
  using (child_id in (select id from public.profiles where family_id in (select public.current_family_ids())))
  with check (child_id in (select id from public.profiles where family_id in (select public.current_family_ids())));
create policy "Family members manage nomi memory" on public.nomi_memory for all
  using (child_id in (select id from public.profiles where family_id in (select public.current_family_ids())))
  with check (child_id in (select id from public.profiles where family_id in (select public.current_family_ids())));
create policy "Family members view wallet" on public.xp_wallets for select
  using (child_id in (select id from public.profiles where family_id in (select public.current_family_ids())));
create policy "Family members view purchases" on public.store_purchases for select
  using (child_id in (select id from public.profiles where family_id in (select public.current_family_ids())));
create policy "Family members manage vocab" on public.vocab_words for all
  using (child_id in (select id from public.profiles where family_id in (select public.current_family_ids())))
  with check (child_id in (select id from public.profiles where family_id in (select public.current_family_ids())));

create policy "Family members manage schedule" on public.schedule_items for all
  using (public.is_family_member(family_id)) with check (public.is_family_member(family_id));
create policy "Family members manage chores" on public.chores for all
  using (public.is_family_member(family_id)) with check (public.is_family_member(family_id));
create policy "Family members manage alerts" on public.parent_alerts for all
  using (public.is_family_member(family_id)) with check (public.is_family_member(family_id));
create policy "Family parents manage settings" on public.family_settings for all
  using (public.is_family_parent(family_id)) with check (public.is_family_parent(family_id));

-- Content is private to a family, not public to every anonymous visitor.
create policy "Family members read practice" on public.practice_questions for select
  using (public.is_family_member(family_id));
create policy "Family parents manage practice" on public.practice_questions for all
  using (public.is_family_parent(family_id)) with check (public.is_family_parent(family_id));
create policy "Family members read stories" on public.reading_stories for select
  using (public.is_family_member(family_id));
create policy "Family parents manage stories" on public.reading_stories for all
  using (public.is_family_parent(family_id)) with check (public.is_family_parent(family_id));
create policy "Family members read objectives" on public.weekly_objectives for select
  using (public.is_family_member(family_id));
create policy "Family parents manage objectives" on public.weekly_objectives for all
  using (public.is_family_parent(family_id)) with check (public.is_family_parent(family_id));
create policy "Family members read uploads" on public.content_uploads for select
  using (public.is_family_member(family_id));
create policy "Family parents manage uploads" on public.content_uploads for all
  using (public.is_family_parent(family_id)) with check (public.is_family_parent(family_id));

-- Parent-only guardrail reporting. Inserts are made by trusted server code.
create policy "Family parents view links" on public.detected_links for select using (public.is_family_parent(family_id));
create policy "Family parents view pii" on public.pii_detections for select using (public.is_family_parent(family_id));
create policy "Family parents view images" on public.image_moderation_log for select using (public.is_family_parent(family_id));
create policy "Family parents manage devices" on public.known_devices for all
  using (public.is_family_parent(family_id)) with check (public.is_family_parent(family_id));
create policy "Family members view sentiments" on public.conversation_sentiments for select
  using (child_id in (select id from public.profiles where family_id in (select public.current_family_ids())));
create policy "Family parents view usage" on public.usage_events for select
  using (child_id in (select id from public.profiles where family_id in (select public.current_family_ids())));
create policy "Family parents manage guardrail settings" on public.guardrail_settings for all
  using (public.is_family_parent(family_id)) with check (public.is_family_parent(family_id));
create policy "Family parents view pin log" on public.pin_access_log for select
  using (public.is_family_parent(family_id));

-- Atomic server-side quota consumption. The Edge Function calls this using service_role.
create or replace function public.consume_ai_quota(p_user_id uuid, p_channel text)
returns table(allowed boolean, reason text, remaining integer, retry_after_seconds integer)
language plpgsql security definer set search_path = public
as $$
declare
  v_family uuid;
  v_ai_start integer := 6;
  v_ai_end integer := 20;
  v_total_cap integer := 100;
  v_nomi_cap integer := 30;
  v_homework_cap integer := 10;
  v_parent_cap integer := 5;
  v_interval integer := 3;
  v_channel_count integer := 0;
  v_total_count integer := 0;
  v_last_request timestamptz;
  v_cap integer;
  v_wait integer;
  v_now timestamptz := now();
  v_today date := (v_now at time zone 'Africa/Johannesburg')::date;
begin
  if p_channel not in ('nomi', 'homework', 'parent', 'memory') then return query select false, 'invalid_channel', 0, 0; return; end if;
  select family_id into v_family from public.family_members where user_id = p_user_id order by role = 'parent' desc limit 1;
  if v_family is null then return query select false, 'family_not_setup', 0, 0; return; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text || ':' || v_today::text, 0));
  select ai_hours_start, ai_hours_end, daily_message_cap, nomi_daily_cap, homework_daily_cap, parent_daily_cap, min_request_interval_seconds
    into v_ai_start, v_ai_end, v_total_cap, v_nomi_cap, v_homework_cap, v_parent_cap, v_interval
    from public.guardrail_settings where family_id = v_family;
  if extract(hour from (v_now at time zone 'Africa/Johannesburg')) < v_ai_start or extract(hour from (v_now at time zone 'Africa/Johannesburg')) >= v_ai_end then
    return query select false, 'outside_hours', 0, 0; return;
  end if;
  select coalesce(sum(request_count), 0), max(last_request_at) into v_total_count, v_last_request
    from public.ai_usage_daily where user_id = p_user_id and usage_date = v_today;
  select coalesce(request_count, 0) into v_channel_count from public.ai_usage_daily
    where user_id = p_user_id and usage_date = v_today and channel = p_channel;
  v_cap := case p_channel when 'nomi' then v_nomi_cap when 'homework' then v_homework_cap when 'parent' then v_parent_cap else 1 end;
  if v_total_cap > 0 and v_total_count >= v_total_cap then return query select false, 'daily_cap_reached', 0, 0; return; end if;
  if v_cap > 0 and v_channel_count >= v_cap then return query select false, 'channel_cap_reached', 0, 0; return; end if;
  if v_last_request is not null and extract(epoch from (v_now - v_last_request)) < v_interval then
    v_wait := greatest(1, v_interval - extract(epoch from (v_now - v_last_request))::integer);
    return query select false, 'cooldown', v_wait, v_wait; return;
  end if;
  insert into public.ai_usage_daily(usage_date, user_id, channel, request_count, last_request_at)
    values (v_today, p_user_id, p_channel, 1, v_now)
    on conflict (usage_date, user_id, channel) do update set request_count = public.ai_usage_daily.request_count + 1, last_request_at = excluded.last_request_at;
  return query select true, 'ok', least(case when v_total_cap = 0 then 2147483647 else v_total_cap - v_total_count - 1 end, case when v_cap = 0 then 2147483647 else v_cap - v_channel_count - 1 end), 0;
end;
$$;

revoke execute on function public.consume_ai_quota(uuid, text) from public, anon, authenticated;
grant execute on function public.consume_ai_quota(uuid, text) to service_role;

create index if not exists idx_ai_usage_daily_user_date on public.ai_usage_daily(user_id, usage_date);

-- Keep the shared child profile aligned when the local Setup Wizard is completed.
create or replace function public.ensure_family_setup(
  p_display_name text default 'Explorer', p_avatar text default '🌟', p_nomi_name text default 'Nomi'
)
returns uuid language plpgsql security definer set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_family uuid;
  v_child uuid;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  select family_id into v_family from public.family_members where user_id = v_user and role = 'parent' limit 1;
  if v_family is null then
    insert into public.families (created_by) values (v_user) returning id into v_family;
    insert into public.family_members (family_id, user_id, role) values (v_family, v_user, 'parent');
  end if;
  insert into public.profiles (user_id, family_id, role, display_name)
    values (v_user, v_family, 'parent', 'Parent')
    on conflict (user_id) do update set family_id = excluded.family_id;
  select id into v_child from public.profiles where family_id = v_family and role = 'child' limit 1;
  if v_child is null then
    insert into public.profiles (user_id, family_id, role, display_name, avatar, nomi_name)
      values (null, v_family, 'child', coalesce(nullif(trim(p_display_name), ''), 'Explorer'), p_avatar, coalesce(nullif(trim(p_nomi_name), ''), 'Nomi'))
      returning id into v_child;
  else
    update public.profiles set display_name = coalesce(nullif(trim(p_display_name), ''), display_name), avatar = coalesce(nullif(p_avatar, ''), avatar), nomi_name = coalesce(nullif(trim(p_nomi_name), ''), nomi_name), updated_at = now()
      where id = v_child;
  end if;
  insert into public.guardrail_settings (family_id) values (v_family) on conflict (family_id) do nothing;
  return v_family;
end;
$$;

revoke execute on function public.is_family_member(uuid) from public, anon;
revoke execute on function public.is_family_parent(uuid) from public, anon;
revoke execute on function public.ensure_family_setup(text, text, text) from public, anon;
revoke execute on function public.current_family_ids() from public, anon;
grant execute on function public.is_family_member(uuid) to authenticated;
grant execute on function public.is_family_parent(uuid) to authenticated;
grant execute on function public.ensure_family_setup(text, text, text) to authenticated;
grant execute on function public.current_family_ids() to authenticated;
revoke execute on function public.current_child_profile_id() from public, anon;
grant execute on function public.current_child_profile_id() to authenticated;

alter table public.store_purchases add column if not exists client_id text;
create unique index if not exists idx_store_purchases_child_client on public.store_purchases(child_id, client_id) where client_id is not null;

create policy "Family members read available store" on public.store_items for select
  using (public.is_family_member(family_id) and is_available = true);
create policy "Family parents manage store" on public.store_items for all
  using (public.is_family_parent(family_id)) with check (public.is_family_parent(family_id));

create policy "Family parents manage wallet" on public.xp_wallets for all
  using (child_id in (select id from public.profiles where family_id in (select public.current_family_ids())))
  with check (child_id in (select id from public.profiles where family_id in (select public.current_family_ids())));
create policy "Family members insert purchases" on public.store_purchases for insert
  with check (child_id in (select id from public.profiles where family_id in (select public.current_family_ids())));
