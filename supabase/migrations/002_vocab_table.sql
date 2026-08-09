-- Vocab book table for term-end "Wrapped" infographic
create table public.vocab_words (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references public.profiles(id) on delete cascade not null,
  word text not null,
  meaning text not null,
  example text,
  language text not null default 'english',
  term smallint not null,
  week smallint not null,
  created_at timestamptz not null default now()
);

alter table public.vocab_words enable row level security;

create policy "Child owns vocab" on public.vocab_words for all using (
  child_id = (select id from public.profiles where user_id = auth.uid())
);
create policy "Parents can read vocab" on public.vocab_words for select using (
  exists (select 1 from public.profiles where user_id = auth.uid() and role = 'parent')
);

create index idx_vocab_child_term on public.vocab_words(child_id, term, week);
