/**
 * Weekly Completion Percentage
 * Calculates how much of the week's learning activities have been done.
 * Visible to both child (progress bar) and parent (metric).
 */

const COMPLETION_KEY = 'explorer_weekly_completion_v1';

export interface WeeklyCompletionData {
  week: number;
  term: number;
  questStars: number;
  questTotal: number;
  practiceQuestionsAnswered: number;
  readingSessionsDone: number;
  choresCompleted: number;
  choresTotal: number;
  homeworkSessionsDone: number;
  diaryEntriesThisWeek: number;
  shineEntriesThisWeek: number;
}

export function calculateWeeklyCompletion(data: WeeklyCompletionData): number {
  const questPct = data.questTotal > 0 ? (data.questStars / data.questTotal) : 0;
  const practicePct = Math.min(1, data.practiceQuestionsAnswered / 10);
  const readingPct = Math.min(1, data.readingSessionsDone / 2);
  const choresPct = data.choresTotal > 0 ? (data.choresCompleted / data.choresTotal) : 1;
  const homeworkPct = Math.min(1, data.homeworkSessionsDone / 3);
  const reflectionPct = Math.min(1, (data.diaryEntriesThisWeek + data.shineEntriesThisWeek) / 5);

  const weighted = (questPct * 0.30) + (practicePct * 0.20) + (readingPct * 0.15) +
                   (choresPct * 0.15) + (homeworkPct * 0.10) + (reflectionPct * 0.10);

  return Math.round(weighted * 100);
}

export function loadWeeklyCompletion(): WeeklyCompletionData {
  try {
    const stored = localStorage.getItem(COMPLETION_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { week: 0, term: 0, questStars: 0, questTotal: 30, practiceQuestionsAnswered: 0, readingSessionsDone: 0, choresCompleted: 0, choresTotal: 0, homeworkSessionsDone: 0, diaryEntriesThisWeek: 0, shineEntriesThisWeek: 0 };
}

export function saveWeeklyCompletion(data: WeeklyCompletionData): void {
  localStorage.setItem(COMPLETION_KEY, JSON.stringify(data));
}
