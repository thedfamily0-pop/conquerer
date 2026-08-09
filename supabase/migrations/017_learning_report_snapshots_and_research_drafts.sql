-- Deterministic Johannesburg learning snapshots and parent-reviewable research drafts.
-- No raw answers, diary text, AI conversation, contact addresses, or event metadata
-- is copied into these reporting records.

begin;

alter table public.parent_report_settings
  add column if not exists weekly_research_enabled boolean not null default true;

create table if not exists public.learning_calendar_weeks (
  academic_year smallint not null check (academic_year between 2020 and 2100),
  term smallint not null check (term between 1 and 4),
  week smallint not null check (week between 1 and 16),
  starts_on date not null,
  ends_on date not null,
  theme text,
  caps_atp_outcomes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (academic_year, term, week),
  check (ends_on >= starts_on),
  check (jsonb_typeof(caps_atp_outcomes) = 'array')
);
create index if not exists learning_calendar_weeks_date_range_idx
  on public.learning_calendar_weeks (starts_on, ends_on);

create table if not exists public.daily_learning_report_snapshots (
  id uuid primary key default extensions.gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  snapshot_date date not null,
  timezone text not null default 'Africa/Johannesburg' check (timezone = 'Africa/Johannesburg'),
  window_starts_at timestamptz not null,
  window_ends_at timestamptz not null,
  definition_version text not null,
  source_event_count integer not null default 0 check (source_event_count >= 0),
  metrics jsonb not null,
  generated_at timestamptz not null default now(),
  unique (family_id, snapshot_date),
  check (window_ends_at > window_starts_at),
  check (jsonb_typeof(metrics) = 'object')
);
create index if not exists daily_learning_report_snapshots_family_date_idx
  on public.daily_learning_report_snapshots (family_id, snapshot_date desc);

create table if not exists public.weekly_content_research_drafts (
  id uuid primary key default extensions.gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  review_academic_year smallint not null,
  review_term smallint not null check (review_term between 1 and 4),
  review_week smallint not null check (review_week between 1 and 16),
  review_starts_on date not null,
  review_ends_on date not null,
  target_academic_year smallint not null,
  target_term smallint not null check (target_term between 1 and 4),
  target_week smallint not null check (target_week between 1 and 16),
  target_starts_on date not null,
  target_ends_on date not null,
  input_snapshot_dates date[] not null default '{}',
  input_digest text not null check (input_digest ~ '^[0-9a-f]{64}$'),
  prompt_version text not null,
  model text not null,
  draft jsonb,
  status text not null default 'started' check (status in ('started', 'ready', 'failed', 'reviewed', 'published')),
  generation_lease_expires_at timestamptz,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (family_id, target_academic_year, target_term, target_week),
  check (review_ends_on >= review_starts_on),
  check (target_ends_on >= target_starts_on),
  check ((status = 'ready' and draft is not null) or status <> 'ready'),
  check (error is null or char_length(error) <= 500)
);
create index if not exists weekly_content_research_drafts_family_target_idx
  on public.weekly_content_research_drafts (family_id, target_starts_on desc);

alter table public.learning_calendar_weeks enable row level security;
alter table public.daily_learning_report_snapshots enable row level security;
alter table public.weekly_content_research_drafts enable row level security;

revoke all on public.learning_calendar_weeks from anon;
revoke all on public.daily_learning_report_snapshots from anon, authenticated;
revoke all on public.weekly_content_research_drafts from anon, authenticated;
grant select on public.learning_calendar_weeks to authenticated;
grant select on public.daily_learning_report_snapshots to authenticated;
grant select on public.weekly_content_research_drafts to authenticated;

create policy "Authenticated users view learning calendar" on public.learning_calendar_weeks
  for select to authenticated using (true);
create policy "Family parents view deterministic learning snapshots" on public.daily_learning_report_snapshots
  for select to authenticated using (public.is_family_parent(family_id));
create policy "Family parents view weekly research drafts" on public.weekly_content_research_drafts
  for select to authenticated using (public.is_family_parent(family_id));

-- Seed the current review/target pair from the application Grade 3 Term 3 ATP.
-- More academic years/terms are intentionally added as explicit reviewed calendar data,
-- rather than asking Gemini to infer dates or curriculum outcomes.
insert into public.learning_calendar_weeks
  (academic_year, term, week, starts_on, ends_on, theme, caps_atp_outcomes)
values
  (2026, 3, 3, '2026-08-05', '2026-08-11', 'Visual Arts: Drawing from Observation & Imagination', $week3$
[
  {"subject":"Mathematics","topic":"Multiplication (×2, ×3, ×4, ×5, ×10) — Building fluency","learningOutcomes":["Know multiplication tables for 2, 3, 4, 5, and 10","Use repeated addition, arrays and groups to solve multiplication","Multiply a 2-digit number by a 1-digit number using breaking down","Solve context problems involving multiplication (equal groups, arrays)","Recognise multiplication as commutative: 3 × 4 = 4 × 3"],"capsReference":"CAPS Mathematics FP p.125–127; ATP Term 3 Week 3"},
  {"subject":"English Home Language","topic":"Information Report Reading & Nouns (common, proper, collective)","learningOutcomes":["Read a short information report and identify the topic, facts and structure","Distinguish between fiction (story) and non-fiction (information) texts","Identify and classify nouns: common, proper and collective nouns","Use capital letters for proper nouns (names of people, places, days, months)","Use phonics to decode words with digraphs (sh, ch, th, wh, ph)"],"capsReference":"CAPS English HL FP p.35–38; ATP Term 3 Week 3"},
  {"subject":"Afrikaans FAL","topic":"Tema: My Huis (My House) — Sinne skryf & Posisiewoorde","learningOutcomes":["Write simple sentences about rooms and furniture in the house","Use position words (prepositions): op, in, onder, langs, agter, voor, bo, by","Learn house vocabulary: huis, kamer, kombuis, sitkamer, slaapkamer, badkamer, tuin","Furniture vocabulary: tafel, stoel, bed, kas, bank, TV, yskas, stoof","Copy and complete sentences using position words"],"capsReference":"CAPS Afrikaans FAL FP p.24–26; ATP Term 3 Week 3"},
  {"subject":"Life Skills","topic":"Visual Arts: Drawing from Observation & Imagination","learningOutcomes":["Draw from observation: look carefully and draw what you see (still life)","Use pencil control techniques: shading, hatching, light and dark","Develop fine motor control through detailed drawing","Draw from imagination: illustrate a story or dream","Compare observational and imaginative drawings and discuss differences"],"capsReference":"CAPS Life Skills FP p.41–43; ATP Term 3 Week 3 (Creative Arts)"},
  {"subject":"Coding & Robotics","topic":"Pattern Recognition & Decomposition","learningOutcomes":["Identify repeating patterns in sequences of shapes, colours, or actions","Describe the rule of a pattern (what repeats, what changes)","Understand decomposition: breaking a big problem into smaller parts","Decompose a complex task into 3–4 smaller sub-tasks","Recognise that patterns in problems help us solve them more efficiently"],"capsReference":"Draft CAPS Coding & Robotics Grade 3; ATP Term 3 Week 3"}
]$week3$::jsonb),
  (2026, 3, 4, '2026-08-12', '2026-08-18', 'Performing Arts: Creative Movement & Dance', $week4$
[
  {"subject":"Mathematics","topic":"Division (÷2, ÷3, ÷4, ÷5, ÷10) — Grouping & Sharing","learningOutcomes":["Divide numbers up to 80 by 2, 3, 4, 5, and 10 with and without remainders","Understand division as equal sharing and as grouping","Use multiplication facts to solve division (inverse relationship)","Solve context problems involving equal sharing and grouping","Write remainders appropriately: 13 ÷ 4 = 3 remainder 1"],"capsReference":"CAPS Mathematics FP p.128–130; ATP Term 3 Week 4"},
  {"subject":"English Home Language","topic":"Information Report Writing & Oral Presentation","learningOutcomes":["Write a short information report (6–8 sentences) with an opening statement, facts, and closing","Use present tense for factual writing (lives, eats, has, is)","Include at least 3 facts about the topic","Present a 1-minute oral report about a chosen topic to the class","Use visual aids (drawing or object) to support an oral presentation"],"capsReference":"CAPS English HL FP p.39–42; ATP Term 3 Week 4"},
  {"subject":"Afrikaans FAL","topic":"Tema: Gesondheid (Health) — Luister, praat en lees","learningOutcomes":["Listen to a passage about staying healthy and answer oral questions","Name body actions for health: was, borsel, oefen, eet, slaap, drink","Read sentences about healthy habits with comprehension","Use Ek moet… (I must…) and Ek moenie… (I must not…) in sentences","Phonics: double vowels in Afrikaans (aa, ee, oo, uu) and their sounds"],"capsReference":"CAPS Afrikaans FAL FP p.27–29; ATP Term 3 Week 4"},
  {"subject":"Life Skills","topic":"Performing Arts: Creative Movement & Dance","learningOutcomes":["Express feelings and ideas through creative body movement","Move in response to different types of music (fast, slow, loud, soft)","Learn and perform a simple dance sequence (8–16 counts)","Demonstrate spatial awareness: levels (high, middle, low), directions, pathways","Work cooperatively in a group to create a short movement piece"],"capsReference":"CAPS Life Skills FP p.44–46; ATP Term 3 Week 4 (Creative Arts/PE)"},
  {"subject":"Coding & Robotics","topic":"Loops — Repeat Instructions","learningOutcomes":["Understand that a loop repeats a set of instructions a specific number of times","Identify repeated actions in everyday life (e.g. clap 4 times, jump 3 times)","Rewrite repetitive instructions using Repeat X times notation","Use loops to shorten an algorithm","Predict the outcome of a simple loop"],"capsReference":"Draft CAPS Coding & Robotics Grade 3; ATP Term 3 Week 4"}
]$week4$::jsonb)
on conflict (academic_year, term, week) do update set
  starts_on = excluded.starts_on,
  ends_on = excluded.ends_on,
  theme = excluded.theme,
  caps_atp_outcomes = excluded.caps_atp_outcomes,
  updated_at = now();

commit;
