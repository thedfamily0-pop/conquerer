-- Parent-reviewed teaching-video metadata and varied interactive practice formats.
-- The app validates YouTube hosts/IDs before embedding; raw provider links are
-- never trusted as executable content.

alter table public.practice_questions
  add column if not exists teaching_video jsonb,
  add column if not exists activity_format text,
  add column if not exists accepted_answers jsonb,
  add column if not exists matching_pairs jsonb;
