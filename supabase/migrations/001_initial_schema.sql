-- Explorer AI — Supabase Schema
-- Run with: supabase db push (or paste into SQL Editor)

-- ═══════════════════════════════════════════════════════════════
-- PROFILES
-- ═══════════════════════════════════════════════════════════════
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  role text not null check (role in ('child', 'parent')),
  display_name text not null default 'Explorer',
  avatar text not null default '🌟',
  photo_url text,
  skin text not null default 'midnight',
  background text not null default 'aurora',
  nomi_name text not null default 'Nomi',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════
-- SCHEDULE
-- ═══════════════════════════════════════════════════════════════
create table public.schedule_items (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  time text not null,
  title text not null,
  emoji text not null default '📚',
  color text not null default '#8b5cf6',
  reminder_minutes smallint not null default 15,
  notify_email boolean not null default false,
  created_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════
-- CHORES
-- ═══════════════════════════════════════════════════════════════
create table public.chores (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null,
  title text not null,
  emoji text not null default '⭐',
  due_date date,
  is_completed boolean not null default false,
  completed_at timestamptz,
  xp_reward smallint not null default 10,
  added_by text not null default 'Dad',
  created_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════
-- DIARY (child-owned, parent read-only)
-- ═══════════════════════════════════════════════════════════════
create table public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  content text not null,
  mood text not null,
  mood_emoji text not null,
  created_at timestamptz not null default now(),
  unique (child_id, date)
);

-- ═══════════════════════════════════════════════════════════════
-- NOMI MEMORY
-- ═══════════════════════════════════════════════════════════════
create table public.nomi_messages (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('nomi', 'ufefe')),
  content text not null,
  created_at timestamptz not null default now()
);

create table public.nomi_memory (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references public.profiles(id) on delete cascade not null,
  fact_type text not null, -- 'favourite', 'event', 'preference', 'mood_pattern'
  content text not null,
  confidence real not null default 0.8,
  source_message_id uuid references public.nomi_messages(id),
  created_at timestamptz not null default now(),
  expires_at timestamptz -- null = permanent memory
);

-- ═══════════════════════════════════════════════════════════════
-- XP WALLET & STORE
-- ═══════════════════════════════════════════════════════════════
create table public.xp_wallets (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references public.profiles(id) on delete cascade not null unique,
  balance integer not null default 0,
  lifetime_earned integer not null default 0,
  updated_at timestamptz not null default now()
);

create table public.store_items (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null,
  name text not null,
  description text,
  xp_cost integer not null check (xp_cost > 0),
  image_url text,
  stock integer, -- null = unlimited
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.store_purchases (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references public.profiles(id) on delete cascade not null,
  item_id uuid references public.store_items(id) on delete set null,
  item_name text not null,
  xp_cost integer not null,
  image_url text,
  purchased_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════
-- NOTIFICATIONS / ALERTS
-- ═══════════════════════════════════════════════════════════════
create table public.parent_alerts (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null,
  mood text not null,
  mood_emoji text not null,
  note text not null,
  is_urgent boolean not null default false,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════
-- APP SETTINGS (family-level)
-- ═══════════════════════════════════════════════════════════════
create table public.family_settings (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null unique,
  parent_pin text not null default '',
  dad_email text,
  mom_email text,
  llm_provider text, -- 'gemini', 'openai', 'claude'
  llm_api_key_encrypted text, -- encrypted at rest
  spotify_refresh_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════
alter table public.profiles enable row level security;
alter table public.schedule_items enable row level security;
alter table public.chores enable row level security;
alter table public.diary_entries enable row level security;
alter table public.nomi_messages enable row level security;
alter table public.nomi_memory enable row level security;
alter table public.xp_wallets enable row level security;
alter table public.store_items enable row level security;
alter table public.store_purchases enable row level security;
alter table public.parent_alerts enable row level security;
alter table public.family_settings enable row level security;

-- Profiles: users can read/update their own
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = user_id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = user_id);

-- Diary: child can CRUD their own; parents can only SELECT
create policy "Child can manage own diary" on public.diary_entries for all using (
  child_id = (select id from public.profiles where user_id = auth.uid() and role = 'child')
);
create policy "Parents can read child diary" on public.diary_entries for select using (
  exists (select 1 from public.profiles where user_id = auth.uid() and role = 'parent')
);

-- Nomi messages: child only
create policy "Child owns nomi messages" on public.nomi_messages for all using (
  child_id = (select id from public.profiles where user_id = auth.uid())
);

-- Nomi memory: child only
create policy "Child owns nomi memory" on public.nomi_memory for all using (
  child_id = (select id from public.profiles where user_id = auth.uid())
);

-- XP wallet: child can read, system updates via service role
create policy "Child can view wallet" on public.xp_wallets for select using (
  child_id = (select id from public.profiles where user_id = auth.uid())
);

-- Store items: parents manage, child reads available
create policy "Parents manage store" on public.store_items for all using (
  exists (select 1 from public.profiles where user_id = auth.uid() and role = 'parent')
);
create policy "Child views available store items" on public.store_items for select using (is_available = true);

-- Purchases: child can view own
create policy "Child views own purchases" on public.store_purchases for select using (
  child_id = (select id from public.profiles where user_id = auth.uid())
);

-- Schedule: family members can read/write
create policy "Family members access schedule" on public.schedule_items for all using (true);
create policy "Family members access chores" on public.chores for all using (true);
create policy "Family members access alerts" on public.parent_alerts for all using (true);
create policy "Family members access settings" on public.family_settings for all using (true);

-- ═══════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════
create index idx_schedule_day on public.schedule_items(family_id, day_of_week);
create index idx_chores_family on public.chores(family_id, is_completed);
create index idx_diary_child_date on public.diary_entries(child_id, date desc);
create index idx_nomi_messages_child on public.nomi_messages(child_id, created_at desc);
create index idx_nomi_memory_child on public.nomi_memory(child_id, fact_type);
create index idx_alerts_family on public.parent_alerts(family_id, created_at desc);
