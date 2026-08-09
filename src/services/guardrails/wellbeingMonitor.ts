// ============================================================
// Wellbeing Monitor: Mood Streaks, Usage Anomalies, Diary Sentiment
// Tracks patterns over time and escalates to parents
// ============================================================

import type { MoodStreak, UsageAnomaly, SentimentTrend } from './types';
import type { DiaryEntry } from '../../data/scheduleData';

const MOOD_HISTORY_KEY = 'explorer_mood_history_v1';
const USAGE_LOG_KEY = 'explorer_usage_log_v1';

// ── Mood Streak Tracking ──────────────────────────────────────

interface MoodRecord { date: string; mood: string; }

function getMoodHistory(): MoodRecord[] {
  try {
    return JSON.parse(localStorage.getItem(MOOD_HISTORY_KEY) || '[]');
  } catch { return []; }
}

function saveMoodHistory(history: MoodRecord[]): void {
  // Keep only last 30 days
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const trimmed = history.filter(r => r.date >= cutoff);
  localStorage.setItem(MOOD_HISTORY_KEY, JSON.stringify(trimmed));
}

export function recordMoodCheckin(mood: string): void {
  const today = new Date().toISOString().slice(0, 10);
  const history = getMoodHistory();
  // Only one mood per day (use latest)
  const filtered = history.filter(r => r.date !== today);
  filtered.push({ date: today, mood });
  saveMoodHistory(filtered);
}

/** Check for consecutive negative mood days */
export function checkMoodStreak(): MoodStreak | null {
  const negativeMoods = ['sad', 'worried', 'angry'];
  const history = getMoodHistory().sort((a, b) => b.date.localeCompare(a.date));

  if (history.length < 3) return null;

  let streak = 0;
  const dates: string[] = [];
  let lastMood = '';

  for (const record of history) {
    if (negativeMoods.includes(record.mood)) {
      streak++;
      dates.push(record.date);
      lastMood = record.mood;
    } else {
      break; // Streak broken
    }
  }

  if (streak >= 3) {
    return { mood: lastMood, count: streak, dates };
  }
  return null;
}

// ── Usage Anomaly Detection ───────────────────────────────────

interface UsageRecord { timestamp: string; action: string; }

function getUsageLog(): UsageRecord[] {
  try {
    return JSON.parse(localStorage.getItem(USAGE_LOG_KEY) || '[]');
  } catch { return []; }
}

function saveUsageLog(log: UsageRecord[]): void {
  // Keep only last 7 days
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const trimmed = log.filter(r => new Date(r.timestamp).getTime() > cutoff);
  localStorage.setItem(USAGE_LOG_KEY, JSON.stringify(trimmed));
}

export function recordUsageEvent(action: string): void {
  const log = getUsageLog();
  log.push({ timestamp: new Date().toISOString(), action });
  saveUsageLog(log);
}

/** Detect late-night usage (between 10PM and 5AM) */
export function checkUsageAnomalies(): UsageAnomaly[] {
  const anomalies: UsageAnomaly[] = [];
  const log = getUsageLog();
  const today = new Date().toISOString().slice(0, 10);

  // Late night check
  const lateNightEvents = log.filter(r => {
    const hour = new Date(r.timestamp).getHours();
    return (hour >= 22 || hour < 5) && r.timestamp.startsWith(today);
  });

  if (lateNightEvents.length > 0) {
    anomalies.push({
      type: 'late_night',
      details: `App used ${lateNightEvents.length} time(s) between 10PM and 5AM today.`,
      timestamp: lateNightEvents[lateNightEvents.length - 1].timestamp,
    });
  }

  // Usage spike: more than 50 events in 1 hour
  const lastHour = log.filter(r =>
    new Date(r.timestamp).getTime() > Date.now() - 60 * 60 * 1000
  );
  if (lastHour.length > 50) {
    anomalies.push({
      type: 'usage_spike',
      details: `${lastHour.length} interactions in the last hour (unusually high).`,
      timestamp: new Date().toISOString(),
    });
  }

  return anomalies;
}

// ── Diary Sentiment Analysis ──────────────────────────────────

const POSITIVE_WORDS = ['happy', 'fun', 'love', 'great', 'amazing', 'wonderful', 'good', 'best', 'excited', 'proud', 'enjoyed', 'beautiful', 'friends', 'laugh', 'play', 'smile', 'yay', 'awesome'];
const NEGATIVE_WORDS = ['sad', 'hate', 'angry', 'scared', 'worried', 'cry', 'hurt', 'alone', 'bad', 'ugly', 'stupid', 'boring', 'tired', 'miss', 'sorry', 'afraid', 'mean', 'upset', 'lonely', 'wish'];

export function analyzeDiarySentiment(entries: DiaryEntry[], days = 7): SentimentTrend {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString().slice(0, 10);
  const recent = entries.filter(e => e.date >= cutoffDate);

  if (recent.length === 0) {
    return { averageScore: 0, trend: 'neutral', dayCount: 0 };
  }

  let totalScore = 0;
  for (const entry of recent) {
    const words = entry.content.toLowerCase().split(/\W+/);
    let score = 0;
    for (const w of words) {
      if (POSITIVE_WORDS.includes(w)) score += 1;
      if (NEGATIVE_WORDS.includes(w)) score -= 1;
    }
    // Normalize per entry
    totalScore += Math.max(-1, Math.min(1, score / Math.max(words.length, 1) * 10));
  }

  const avg = totalScore / recent.length;
  const trend: SentimentTrend['trend'] = avg < -0.3 ? 'declining' : avg > 0.2 ? 'positive' : 'neutral';

  return { averageScore: Math.round(avg * 100) / 100, trend, dayCount: recent.length };
}

/** Build escalation email for mood streaks */
export function buildMoodStreakAlert(
  streak: MoodStreak,
  parentEmails: string[]
): { to: string[]; subject: string; body: string } {
  return {
    to: parentEmails,
    subject: `💙 Wellbeing Pattern Alert — ${streak.count} days ${streak.mood}`,
    body: `MOOD PATTERN ESCALATION
=========================================
Date/Time: ${new Date().toLocaleString()}
Pattern: Learner has checked in as "${streak.mood}" for ${streak.count} consecutive days.
Dates: ${streak.dates.join(', ')}

This does not necessarily indicate a crisis, but a consistent negative mood over multiple days may benefit from a conversation, extra attention, or a professional check-in.

Sent automatically by Conquerer Wellbeing Monitor.
`
  };
}

/** Build usage anomaly alert */
export function buildUsageAnomalyAlert(
  anomalies: UsageAnomaly[],
  parentEmails: string[]
): { to: string[]; subject: string; body: string } {
  const details = anomalies.map(a => `- ${a.type}: ${a.details}`).join('\n');
  return {
    to: parentEmails,
    subject: '🕐 Usage Pattern Alert — Conquerer',
    body: `USAGE ANOMALY ALERT
=========================================
Date/Time: ${new Date().toLocaleString()}
Anomalies detected:
${details}

This may indicate anxiety, insomnia, or device access concerns. Consider discussing screen time with your child.

Sent automatically by Conquerer Usage Monitor.
`
  };
}

/** Build diary sentiment trend alert */
export function buildSentimentAlert(
  trend: SentimentTrend,
  parentEmails: string[]
): { to: string[]; subject: string; body: string } {
  return {
    to: parentEmails,
    subject: '📝 Diary Sentiment Alert — Declining Trend Detected',
    body: `DIARY SENTIMENT TREND ALERT
=========================================
Date/Time: ${new Date().toLocaleString()}
Rolling ${trend.dayCount}-day sentiment: ${trend.averageScore.toFixed(2)} (scale: -1 to +1)
Trend: ${trend.trend.toUpperCase()}

The learner's diary entries over the past week show a declining emotional tone. This is a gentle heads-up — consider checking in with a conversation or fun family activity.

Sent automatically by Conquerer Wellbeing Monitor.
`
  };
}
