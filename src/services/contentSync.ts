/**
 * Content Sync — pushes uploaded practice content to Supabase
 * and fetches it for the child's practice sessions.
 */
import { supabase } from './supabase';
import { getCurrentTermInfo } from '../data/termCalendar';

import { SUPABASE_SYNC_ENABLED } from './syncEngine';

const DEV_MODE = !SUPABASE_SYNC_ENABLED;

interface UploadedQuestion {
  id?: string;
  gradeLevel: number;
  subject: string;
  title: string;
  question: string;
  options: string[];
  correctIndex: number;
  hints: string[];
  explanation: string;
  xpAward: number;
  skill?: string;
  themeTag?: string;
}

interface UploadedStory {
  title: string;
  emoji?: string;
  content: string[];
  quizQuestions: { question: string; options: string[]; correctIndex: number; explanation: string }[];
}

/** Push uploaded practice questions to Supabase */
export async function pushPracticeQuestions(questions: UploadedQuestion[], familyId: string): Promise<void> {
  if (DEV_MODE) return;
  const termInfo = getCurrentTermInfo();
  const rows = questions.map(q => ({
    family_id: familyId,
    grade_level: q.gradeLevel,
    subject: q.subject,
    title: q.title,
    question: q.question,
    options: q.options,
    correct_index: q.correctIndex,
    hints: q.hints,
    explanation: q.explanation,
    xp_award: q.xpAward,
    skill: q.skill || null,
    theme_tag: q.themeTag || null,
    term: termInfo.term,
    week: termInfo.week,
  }));
  await supabase.from('practice_questions').insert(rows);
}

/** Push uploaded stories to Supabase */
export async function pushStories(stories: UploadedStory[], familyId: string): Promise<void> {
  if (DEV_MODE) return;
  const termInfo = getCurrentTermInfo();
  const rows = stories.map(s => ({
    family_id: familyId,
    title: s.title,
    emoji: s.emoji || '📖',
    content: s.content,
    quiz_questions: s.quizQuestions,
    reading_time_minutes: Math.round(s.content.join(' ').split(' ').length / 130),
    term: termInfo.term,
    week: termInfo.week,
  }));
  await supabase.from('reading_stories').insert(rows);
}

/** Push weekly objectives */
export async function pushObjectives(objectives: string[], familyId: string): Promise<void> {
  if (DEV_MODE) return;
  const termInfo = getCurrentTermInfo();
  await supabase.from('weekly_objectives').upsert({
    family_id: familyId,
    term: termInfo.term,
    week: termInfo.week,
    objectives,
  }, { onConflict: 'family_id,term,week' });
}

/** Log a content upload */
export async function logContentUpload(entry: { filename: string; fileSize: number; subjects: string[]; itemCounts: Record<string, number> }, familyId: string): Promise<void> {
  if (DEV_MODE) return;
  const termInfo = getCurrentTermInfo();
  await supabase.from('content_uploads').insert({
    family_id: familyId,
    filename: entry.filename,
    file_size: entry.fileSize,
    subjects: entry.subjects,
    item_counts: entry.itemCounts,
    term: termInfo.term,
    week: termInfo.week,
  });
}

/** Fetch practice questions for the current term/week from Supabase */
export async function fetchPracticeQuestions(familyId: string): Promise<UploadedQuestion[]> {
  if (DEV_MODE) return [];
  const termInfo = getCurrentTermInfo();
  const { data } = await supabase
    .from('practice_questions')
    .select('*')
    .eq('family_id', familyId)
    .eq('term', termInfo.term)
    .eq('week', termInfo.week);
  if (!data) return [];
  return data.map(row => ({
    id: row.id,
    gradeLevel: row.grade_level,
    subject: row.subject,
    title: row.title,
    question: row.question,
    options: row.options,
    correctIndex: row.correct_index,
    hints: row.hints,
    explanation: row.explanation,
    xpAward: row.xp_award,
    skill: row.skill,
    themeTag: row.theme_tag,
  }));
}

/** Fetch stories for the current term/week */
export async function fetchStories(familyId: string): Promise<UploadedStory[]> {
  if (DEV_MODE) return [];
  const termInfo = getCurrentTermInfo();
  const { data } = await supabase
    .from('reading_stories')
    .select('*')
    .eq('family_id', familyId)
    .eq('term', termInfo.term)
    .eq('week', termInfo.week);
  if (!data) return [];
  return data.map(row => ({
    title: row.title,
    emoji: row.emoji,
    content: row.content,
    quizQuestions: row.quiz_questions,
  }));
}

/** Fetch upload log */
export async function fetchContentLog(familyId: string): Promise<{ filename: string; fileSize: number; subjects: string[]; itemCounts: Record<string, number>; term: number; week: number; date: string }[]> {
  if (DEV_MODE) return [];
  const { data } = await supabase
    .from('content_uploads')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false })
    .limit(30);
  if (!data) return [];
  return data.map(row => ({
    filename: row.filename,
    fileSize: row.file_size,
    subjects: row.subjects,
    itemCounts: row.item_counts,
    term: row.term,
    week: row.week,
    date: row.created_at,
  }));
}
