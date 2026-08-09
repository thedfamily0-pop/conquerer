import { getCurrentTermInfo } from '../data/termCalendar';

export type PerformanceActivity = 'practice' | 'quest' | 'reading' | 'homework';
export type PerformanceFilter = '24h' | 'week' | 'month' | 'term' | 'all';

export interface PerformanceEvent {
  id: string;
  activity: PerformanceActivity;
  occurredAt: string;
  term: number;
  week: number;
  subject: string;
  contentId: string;
  questionId?: string;
  checkpointIndex?: number;
  correct: boolean;
  score: number;
  total: number;
  hintsShown: number;
  xpEarned: number;
  answer?: string;
  isRetry?: boolean;
  metadata?: Record<string, unknown>;
}

export interface PerformanceSummary {
  engagementScore: number;
  academicScore: number;
  confidenceScore: number;
  evidenceLabel: string;
  scoredAttempts: number;
  independentRate: number;
  subjectBreakdown: Array<{ subject: string; score: number; attempts: number }>;
}

const STORAGE_KEY = 'explorer_performance_v1';
const MAX_EVENTS = 2000;

function makeId(): string {
  return typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `performance_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function getPerformanceEvents(): PerformanceEvent[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((event): event is PerformanceEvent => Boolean(event && typeof event === 'object' && typeof (event as PerformanceEvent).activity === 'string' && typeof (event as PerformanceEvent).occurredAt === 'string'));
  } catch { return []; }
}

export function mergePerformanceEvents(remoteEvents: PerformanceEvent[]): PerformanceEvent[] {
  const merged = new Map(getPerformanceEvents().map(event => [event.id, event]));
  remoteEvents.forEach(event => merged.set(event.id, event));
  const events = [...merged.values()].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt)).slice(-MAX_EVENTS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  window.dispatchEvent(new CustomEvent('conquerer-performance-updated'));
  return events;
}

export function recordPerformanceEvent(event: Omit<PerformanceEvent, 'id' | 'occurredAt'> & { occurredAt?: string }): PerformanceEvent {
  const saved: PerformanceEvent = { ...event, id: makeId(), occurredAt: event.occurredAt || new Date().toISOString() };
  mergePerformanceEvents([saved]);
  return saved;
}

function startOfWeek(date: Date): Date {
  const start = new Date(date);
  const day = start.getDay();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
  return start;
}

export function filterPerformanceEvents(events: PerformanceEvent[], filter: PerformanceFilter, now = new Date()): PerformanceEvent[] {
  if (filter === 'all') return events;
  const start = filter === '24h' ? new Date(now.getTime() - 24 * 60 * 60 * 1000) : filter === 'week' ? startOfWeek(now) : filter === 'month' ? new Date(now.getFullYear(), now.getMonth(), 1) : null;
  return events.filter(event => {
    const date = new Date(event.occurredAt);
    return filter === 'term' ? event.term === getCurrentTermInfo(now).term : Boolean(start && date >= start);
  });
}

export function getLearningStreak(events: PerformanceEvent[], now = new Date()): number {
  const activeDates = new Set(events.map(event => event.occurredAt.slice(0, 10)));
  let cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let streak = 0;
  while (activeDates.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function effectiveEvents(events: PerformanceEvent[]): PerformanceEvent[] {
  const questBest = new Map<string, PerformanceEvent>();
  const result: PerformanceEvent[] = [];
  for (const event of events) {
    if (event.activity !== 'quest' || event.checkpointIndex === undefined) { result.push(event); continue; }
    const key = `${event.term}:${event.week}:${event.contentId}:${event.checkpointIndex}`;
    const current = questBest.get(key);
    if (!current || event.score / Math.max(1, event.total) > current.score / Math.max(1, current.total)) questBest.set(key, event);
  }
  return [...result, ...questBest.values()];
}

export function summarisePerformance(events: PerformanceEvent[]): PerformanceSummary {
  const scored = effectiveEvents(events).filter(event => event.total > 0);
  const possible = scored.reduce((sum, event) => sum + event.total, 0);
  const earned = scored.reduce((sum, event) => sum + event.score, 0);
  const academicScore = possible ? Math.round((earned / possible) * 100) : 0;
  const independentAttempts = scored.filter(event => event.hintsShown === 0).length;
  const independentRate = scored.length ? independentAttempts / scored.length : 0;
  const confidenceScore = scored.length ? Math.round(academicScore * (0.7 + 0.3 * independentRate)) : 0;
  const evidenceLabel = scored.length < 3 ? 'Not enough evidence yet' : scored.length < 6 ? 'Early signal' : scored.length < 10 ? 'Moderate confidence' : 'Stronger confidence';
  const activeDays = new Set(events.map(event => event.occurredAt.slice(0, 10))).size;
  const engagementScore = Math.min(100, activeDays * 10 + events.length * 3);
  const subjects = new Map<string, { earned: number; possible: number; attempts: number }>();
  for (const event of scored) {
    const current = subjects.get(event.subject) || { earned: 0, possible: 0, attempts: 0 };
    current.earned += event.score; current.possible += event.total; current.attempts += 1; subjects.set(event.subject, current);
  }
  const subjectBreakdown = [...subjects.entries()].map(([subject, value]) => ({ subject, attempts: value.attempts, score: Math.round((value.earned / Math.max(1, value.possible)) * 100) }));
  return { engagementScore, academicScore, confidenceScore, evidenceLabel, scoredAttempts: scored.length, independentRate, subjectBreakdown };
}
