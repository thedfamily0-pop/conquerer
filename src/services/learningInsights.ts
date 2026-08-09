import { supabase, hasSupabaseConfig } from './supabase';
import { getFamilyId, getChildProfileId, SUPABASE_SYNC_ENABLED } from './syncEngine';
import type { PerformanceEvent } from './performanceData';

export interface SchoolResult {
  id: string;
  academicYear: number;
  term: number;
  subject: string;
  assessmentName: string;
  assessmentDate: string;
  score: number;
  maxScore: number;
  grade?: string;
  source: 'school' | 'end_of_term' | 'teacher' | 'parent';
  notes?: string;
}

export interface LearningGoal {
  id: string;
  subject: string;
  title: string;
  baseline?: number;
  target?: number;
  targetUnit: string;
  dueDate?: string;
  status: 'active' | 'met' | 'paused' | 'archived';
  notes?: string;
}

export interface LearningInsight {
  subject: string;
  historicalScore: number | null;
  currentScore: number | null;
  combinedScore: number | null;
  attempts: number;
  trend: 'improving' | 'steady' | 'declining' | 'new';
  priority: 'high' | 'focus' | 'maintain' | 'extension-ready';
  recommendation: string;
}

const RESULTS_KEY = 'explorer_school_results_v1';
const GOALS_KEY = 'explorer_learning_goals_v1';
const makeId = (): string => {
  try { return crypto.randomUUID(); } catch {
    const suffix = `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`.replace(/[^0-9a-f]/gi, '').padEnd(12, '0').slice(0, 12);
    return `00000000-0000-4000-8000-${suffix}`;
  }
};

function localRead<T>(key: string): T[] {
  try { const value: unknown = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value as T[] : []; } catch { return []; }
}
function localWrite<T>(key: string, value: T[]): void { localStorage.setItem(key, JSON.stringify(value)); }
function localWriteAndNotify<T>(key: string, value: T[]): void { localWrite(key, value); window.dispatchEvent(new CustomEvent('conquerer-learning-insights-updated')); }

export function getLocalSchoolResults(): SchoolResult[] { return localRead<SchoolResult>(RESULTS_KEY); }
export function getLocalLearningGoals(): LearningGoal[] { return localRead<LearningGoal>(GOALS_KEY); }

function hostedReady(): boolean { return SUPABASE_SYNC_ENABLED && hasSupabaseConfig && Boolean(getFamilyId() && getChildProfileId()); }

export async function loadLearningRecords(): Promise<{ results: SchoolResult[]; goals: LearningGoal[] }> {
  if (!hostedReady()) return { results: getLocalSchoolResults(), goals: getLocalLearningGoals() };
  const childId = getChildProfileId();
  if (!childId) return { results: getLocalSchoolResults(), goals: getLocalLearningGoals() };
  const [resultRows, goalRows] = await Promise.all([
    supabase.from('school_results').select('id,academic_year,term,subject,assessment_name,assessment_date,score,max_score,grade,source,notes').eq('child_id', childId).order('assessment_date', { ascending: false }),
    supabase.from('learning_goals').select('id,subject,title,baseline,target,target_unit,due_date,status,notes').eq('child_id', childId).order('created_at', { ascending: false }),
  ]);
  if (resultRows.error || goalRows.error) return { results: getLocalSchoolResults(), goals: getLocalLearningGoals() };
  const results = (resultRows.data || []).map(row => ({ id: row.id, academicYear: row.academic_year, term: row.term, subject: row.subject, assessmentName: row.assessment_name, assessmentDate: row.assessment_date, score: Number(row.score), maxScore: Number(row.max_score), grade: row.grade || undefined, source: row.source, notes: row.notes || undefined })) as SchoolResult[];
  const goals = (goalRows.data || []).map(row => ({ id: row.id, subject: row.subject, title: row.title, baseline: row.baseline === null ? undefined : Number(row.baseline), target: row.target === null ? undefined : Number(row.target), targetUnit: row.target_unit, dueDate: row.due_date || undefined, status: row.status, notes: row.notes || undefined })) as LearningGoal[];
  localWrite(RESULTS_KEY, results); localWrite(GOALS_KEY, goals);
  return { results, goals };
}

export async function saveSchoolResult(input: Omit<SchoolResult, 'id'>): Promise<SchoolResult> {
  const saved: SchoolResult = { ...input, id: makeId() };
  const results = [...getLocalSchoolResults(), saved];
  if (hostedReady()) {
    const familyId = getFamilyId(); const childId = getChildProfileId();
    const { data: { user } } = await supabase.auth.getUser();
    if (familyId && childId && user) {
      const { error } = await supabase.from('school_results').upsert({ id: saved.id, family_id: familyId, child_id: childId, academic_year: saved.academicYear, term: saved.term, subject: saved.subject, assessment_name: saved.assessmentName, assessment_date: saved.assessmentDate, score: saved.score, max_score: saved.maxScore, grade: saved.grade || null, source: saved.source, notes: saved.notes || null, created_by: user.id, updated_at: new Date().toISOString() }, { onConflict: 'id' });
      if (error) throw new Error('The school result could not be saved to the family account.');
    }
  }
  localWriteAndNotify(RESULTS_KEY, results);
  return saved;
}

export async function updateSchoolResult(id: string, input: Omit<SchoolResult, 'id'>): Promise<SchoolResult> {
  const updated: SchoolResult = { ...input, id };
  if (hostedReady()) {
    const familyId = getFamilyId(); const childId = getChildProfileId();
    if (familyId && childId) {
      const { error } = await supabase.from('school_results').update({ academic_year: updated.academicYear, term: updated.term, subject: updated.subject, assessment_name: updated.assessmentName, assessment_date: updated.assessmentDate, score: updated.score, max_score: updated.maxScore, grade: updated.grade || null, source: updated.source, notes: updated.notes || null, updated_at: new Date().toISOString() }).eq('id', id).eq('child_id', childId);
      if (error) throw new Error('The school result could not be updated on the family account.');
    }
  }
  localWriteAndNotify(RESULTS_KEY, getLocalSchoolResults().map(result => result.id === id ? updated : result));
  return updated;
}

export async function deleteSchoolResult(id: string): Promise<void> {
  if (hostedReady()) {
    const childId = getChildProfileId();
    if (childId) { const { error } = await supabase.from('school_results').delete().eq('id', id).eq('child_id', childId); if (error) throw new Error('The school result could not be deleted from the family account.'); }
  }
  localWriteAndNotify(RESULTS_KEY, getLocalSchoolResults().filter(result => result.id !== id));
}

export async function saveLearningGoal(input: Omit<LearningGoal, 'id'>): Promise<LearningGoal> {
  const saved: LearningGoal = { ...input, id: makeId() };
  const goals = [...getLocalLearningGoals(), saved];
  if (hostedReady()) {
    const familyId = getFamilyId(); const childId = getChildProfileId();
    const { data: { user } } = await supabase.auth.getUser();
    if (familyId && childId && user) {
      const { error } = await supabase.from('learning_goals').upsert({ id: saved.id, family_id: familyId, child_id: childId, subject: saved.subject, title: saved.title, baseline: saved.baseline ?? null, target: saved.target ?? null, target_unit: saved.targetUnit, due_date: saved.dueDate || null, status: saved.status, notes: saved.notes || null, created_by: user.id, updated_at: new Date().toISOString() }, { onConflict: 'id' });
      if (error) throw new Error('The learning goal could not be saved to the family account.');
    }
  }
  localWriteAndNotify(GOALS_KEY, goals);
  return saved;
}

export async function updateLearningGoal(id: string, input: Omit<LearningGoal, 'id'>): Promise<LearningGoal> {
  const updated: LearningGoal = { ...input, id };
  if (hostedReady()) {
    const familyId = getFamilyId(); const childId = getChildProfileId();
    if (familyId && childId) {
      const { error } = await supabase.from('learning_goals').update({ subject: updated.subject, title: updated.title, baseline: updated.baseline ?? null, target: updated.target ?? null, target_unit: updated.targetUnit, due_date: updated.dueDate || null, status: updated.status, notes: updated.notes || null, updated_at: new Date().toISOString() }).eq('id', id).eq('child_id', childId);
      if (error) throw new Error('The learning goal could not be updated on the family account.');
    }
  }
  localWriteAndNotify(GOALS_KEY, getLocalLearningGoals().map(goal => goal.id === id ? updated : goal));
  return updated;
}

export async function deleteLearningGoal(id: string): Promise<void> {
  if (hostedReady()) {
    const childId = getChildProfileId();
    if (childId) { const { error } = await supabase.from('learning_goals').delete().eq('id', id).eq('child_id', childId); if (error) throw new Error('The learning goal could not be deleted from the family account.'); }
  }
  localWriteAndNotify(GOALS_KEY, getLocalLearningGoals().filter(goal => goal.id !== id));
}

function eventScore(events: PerformanceEvent[], subject: string): { score: number | null; attempts: number; trend: LearningInsight['trend'] } {
  const scored = events.filter(event => event.subject === subject && event.total > 0).sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  if (!scored.length) return { score: null, attempts: 0, trend: 'new' };
  const score = Math.round(scored.reduce((sum, event) => sum + event.score / event.total, 0) / scored.length * 100);
  const midpoint = Math.max(1, Math.floor(scored.length / 2));
  const earlier = scored.slice(0, midpoint).reduce((sum, event) => sum + event.score / event.total, 0) / midpoint;
  const recent = scored.slice(midpoint).reduce((sum, event) => sum + event.score / event.total, 0) / Math.max(1, scored.length - midpoint);
  const delta = recent - earlier;
  return { score, attempts: scored.length, trend: delta > 0.08 ? 'improving' : delta < -0.08 ? 'declining' : 'steady' };
}

export function buildLearningInsights(results: SchoolResult[], events: PerformanceEvent[], goals: LearningGoal[]): LearningInsight[] {
  const subjects = [...new Set([...results.map(result => result.subject), ...events.map(event => event.subject), ...goals.map(goal => goal.subject)])].sort();
  return subjects.map(subject => {
    const historical = results.filter(result => result.subject === subject && result.maxScore > 0);
    const historicalScore = historical.length ? Math.round(historical.reduce((sum, result) => sum + result.score / result.maxScore, 0) / historical.length * 100) : null;
    const current = eventScore(events, subject);
    const combinedScore = historicalScore === null ? current.score : current.score === null ? historicalScore : Math.round(historicalScore * 0.4 + current.score * 0.6);
    const priority = combinedScore === null ? 'focus' : combinedScore < 60 ? 'high' : combinedScore < 80 ? 'focus' : combinedScore >= 88 && current.attempts >= 5 ? 'extension-ready' : 'maintain';
    const recommendation = priority === 'high' ? 'Rebuild the current-grade foundations with short guided practice and confidence checks.' : priority === 'focus' ? 'Keep practising this current-grade skill until accuracy and independent confidence are secure.' : priority === 'extension-ready' ? 'Current work looks secure; offer a small next-grade challenge after a warm-up, never instead of revision.' : 'Maintain with spaced retrieval, mixed practice, and occasional mastery checks.';
    return { subject, historicalScore, currentScore: current.score, combinedScore, attempts: current.attempts, trend: current.trend, priority, recommendation };
  });
}
