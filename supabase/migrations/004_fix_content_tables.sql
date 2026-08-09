-- Repair migration: re-create content tables that failed in 003

create table if not exists public.practice_questions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null,
  grade_level smallint not null check (grade_level in (3, 4)),
  subject text not null,
  title text not null,
  question text not null,
  options jsonb not null,
  correct_index smallint not null,
  hints jsonb not null default '[]',
  explanation text not null,
  xp_award smallint not null default 20,
  skill text,
  theme_tag text,
  term smallint,
  week smallint,
  created_at timestamptz not null default now()
);

create table if not exists public.reading_stories (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null,
  title text not null,
  emoji text not null default '📖',
  content jsonb not null,
  quiz_questions jsonb not null default '[]',
  reading_time_minutes smallint not null default 20,
  term smallint,
  week smallint,
  unlock_day smallint default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.weekly_objectives (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null,
  term smallint not null,
  week smallint not null,
  objectives jsonb not null,
  created_at timestamptz not null default now(),
  unique (family_id, term, week)
);

create table if not exists public.content_uploads (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null,
  filename text not null,
  file_size integer not null,
  subjects jsonb not null default '[]',
  item_counts jsonb not null default '{}',
  term smallint not null,
  week smallint not null,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.practice_questions enable row level security;
alter table public.reading_stories enable row level security;
alter table public.weekly_objectives enable row level security;
alter table public.content_uploads enable row level security;

do $$ begin
  create policy "Anyone reads practice" on public.practice_questions for select using (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Parents insert practice" on public.practice_questions for insert with check (
    exists (select 1 from public.profiles where user_id = auth.uid() and role = 'parent'));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Parents update practice" on public.practice_questions for update using (
    exists (select 1 from public.profiles where user_id = auth.uid() and role = 'parent'));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Parents delete practice" on public.practice_questions for delete using (
    exists (select 1 from public.profiles where user_id = auth.uid() and role = 'parent'));
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Anyone reads stories" on public.reading_stories for select using (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Parents insert stories" on public.reading_stories for insert with check (
    exists (select 1 from public.profiles where user_id = auth.uid() and role = 'parent'));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Parents update stories" on public.reading_stories for update using (
    exists (select 1 from public.profiles where user_id = auth.uid() and role = 'parent'));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Parents delete stories" on public.reading_stories for delete using (
    exists (select 1 from public.profiles where user_id = auth.uid() and role = 'parent'));
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Anyone reads objectives" on public.weekly_objectives for select using (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Parents insert objectives" on public.weekly_objectives for insert with check (
    exists (select 1 from public.profiles where user_id = auth.uid() and role = 'parent'));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Parents update objectives" on public.weekly_objectives for update using (
    exists (select 1 from public.profiles where user_id = auth.uid() and role = 'parent'));
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Anyone reads uploads" on public.content_uploads for select using (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Parents log uploads" on public.content_uploads for insert with check (
    exists (select 1 from public.profiles where user_id = auth.uid() and role = 'parent'));
exception when duplicate_object then null;
end $$;

create index if not exists idx_practice_subject on public.practice_questions(family_id, subject, theme_tag);
create index if not exists idx_practice_term on public.practice_questions(family_id, term, week);
create index if not exists idx_stories_term on public.reading_stories(family_id, term, week);
create index if not exists idx_objectives_term on public.weekly_objectives(family_id, term, week);
create index if not exists idx_uploads_family on public.content_uploads(family_id, created_at desc);
