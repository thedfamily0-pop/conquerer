-- ============================================================
-- Migration 004: Security Guardrails Tables
-- URL/Link logging, PII detection logs, image moderation logs,
-- device fingerprints, conversation sentiment history,
-- usage analytics, and guardrail settings
-- ============================================================

-- ═══════════════════════════════════════════════════════════════
-- URL/LINK DETECTION LOG (parents can review)
-- ═══════════════════════════════════════════════════════════════
create table public.detected_links (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null,
  child_id uuid references public.profiles(id) on delete cascade,
  url text not null,
  context text not null, -- 'nomi_chat', 'diary', 'wellbeing'
  child_input text, -- the full message containing the link
  reviewed boolean not null default false,
  created_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════
-- PII DETECTION LOG
-- ═══════════════════════════════════════════════════════════════
create table public.pii_detections (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null,
  child_id uuid references public.profiles(id) on delete cascade,
  pii_types text[] not null, -- ['phone', 'email', 'address']
  context text not null,
  child_input text,
  reviewed boolean not null default false,
  created_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════
-- IMAGE MODERATION LOG
-- ═══════════════════════════════════════════════════════════════
create table public.image_moderation_log (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null,
  child_id uuid references public.profiles(id) on delete cascade,
  context text not null, -- 'chore_evidence', 'profile_photo'
  result text not null, -- 'safe', 'blocked', 'flagged'
  reason text,
  reviewed boolean not null default false,
  created_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════
-- DEVICE FINGERPRINTS
-- ═══════════════════════════════════════════════════════════════
create table public.known_devices (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null,
  fingerprint text not null,
  user_agent text,
  screen_resolution text,
  timezone text,
  language text,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  unique (family_id, fingerprint)
);

-- ═══════════════════════════════════════════════════════════════
-- CONVERSATION SENTIMENT HISTORY (Nomi memory persistence)
-- ═══════════════════════════════════════════════════════════════
create table public.conversation_sentiments (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references public.profiles(id) on delete cascade not null,
  period text not null, -- "2026-07-10 to 2026-07-20"
  message_count integer not null,
  topics text[] not null default '{}',
  overall_mood text not null check (overall_mood in ('positive', 'neutral', 'concerned')),
  key_learnings text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════
-- USAGE ANALYTICS
-- ═══════════════════════════════════════════════════════════════
create table public.usage_events (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references public.profiles(id) on delete cascade not null,
  event_type text not null, -- 'app_open', 'nomi_chat', 'diary_write', 'practice'
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════
-- GUARDRAIL SETTINGS (family-level, extends family_settings)
-- ═══════════════════════════════════════════════════════════════
create table public.guardrail_settings (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null unique,
  ai_hours_start smallint not null default 6,
  ai_hours_end smallint not null default 20,
  daily_message_cap smallint not null default 100,
  session_timeout_minutes smallint not null default 15,
  max_pin_attempts smallint not null default 5,
  lockout_minutes smallint not null default 15,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════
-- PIN ACCESS LOG (audit trail)
-- ═══════════════════════════════════════════════════════════════
create table public.pin_access_log (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null,
  success boolean not null,
  device_fingerprint text,
  created_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════
alter table public.detected_links enable row level security;
alter table public.pii_detections enable row level security;
alter table public.image_moderation_log enable row level security;
alter table public.known_devices enable row level security;
alter table public.conversation_sentiments enable row level security;
alter table public.usage_events enable row level security;
alter table public.guardrail_settings enable row level security;
alter table public.pin_access_log enable row level security;

-- Parents can view all guardrail data
create policy "Parents view links" on public.detected_links for select using (
  exists (select 1 from public.profiles where user_id = auth.uid() and role = 'parent')
);
create policy "Parents view pii" on public.pii_detections for select using (
  exists (select 1 from public.profiles where user_id = auth.uid() and role = 'parent')
);
create policy "Parents view images" on public.image_moderation_log for select using (
  exists (select 1 from public.profiles where user_id = auth.uid() and role = 'parent')
);
create policy "Parents view devices" on public.known_devices for all using (
  exists (select 1 from public.profiles where user_id = auth.uid() and role = 'parent')
);
create policy "Child owns sentiments" on public.conversation_sentiments for all using (
  child_id = (select id from public.profiles where user_id = auth.uid())
);
create policy "Parents view usage" on public.usage_events for select using (
  exists (select 1 from public.profiles where user_id = auth.uid() and role = 'parent')
);
create policy "Parents manage guardrail settings" on public.guardrail_settings for all using (
  exists (select 1 from public.profiles where user_id = auth.uid() and role = 'parent')
);
create policy "Parents view pin log" on public.pin_access_log for select using (
  exists (select 1 from public.profiles where user_id = auth.uid() and role = 'parent')
);

-- System can insert to all guardrail tables (service role)
create policy "System inserts links" on public.detected_links for insert with check (true);
create policy "System inserts pii" on public.pii_detections for insert with check (true);
create policy "System inserts images" on public.image_moderation_log for insert with check (true);
create policy "System inserts usage" on public.usage_events for insert with check (true);
create policy "System inserts pin log" on public.pin_access_log for insert with check (true);

-- ═══════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════
create index idx_links_family on public.detected_links(family_id, created_at desc);
create index idx_pii_family on public.pii_detections(family_id, created_at desc);
create index idx_image_mod_family on public.image_moderation_log(family_id, created_at desc);
create index idx_devices_family on public.known_devices(family_id);
create index idx_sentiments_child on public.conversation_sentiments(child_id, created_at desc);
create index idx_usage_child on public.usage_events(child_id, created_at desc);
create index idx_pin_log_family on public.pin_access_log(family_id, created_at desc);
