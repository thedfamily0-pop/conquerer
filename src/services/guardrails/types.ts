// ============================================================
// guardrails/types.ts — Shared types for all security guardrails
// ============================================================

export type AIChannel = 'nomi' | 'homework' | 'parent' | 'memory';

export interface GuardrailSettings {
  // AI available hours (set by parent)
  aiHoursStart: number; // 0-23, e.g. 6 = 6:00 AM
  aiHoursEnd: number;   // 0-23, e.g. 20 = 8:00 PM
  dailyMessageCap: number; // total max AI requests per day (0 = unlimited)
  nomiDailyCap: number;
  homeworkDailyCap: number;
  parentDailyCap: number;
  minRequestIntervalSeconds: number;

  // Session timeout
  sessionTimeoutMinutes: number; // 0 = disabled

  // PIN lockout
  maxPinAttempts: number;
  lockoutMinutes: number;
}

export interface PIIDetectionResult {
  hasPII: boolean;
  types: ('phone' | 'email' | 'address' | 'fullName' | 'idNumber')[];
  message: string;
}

export interface URLDetectionResult {
  hasURLs: boolean;
  urls: string[];
}

export interface ImageModerationResult {
  isSafe: boolean;
  reason?: string;
}

export interface MoodStreak {
  mood: string;
  count: number;
  dates: string[];
}

export interface UsageAnomaly {
  type: 'late_night' | 'usage_spike';
  details: string;
  timestamp: string;
}

export interface SentimentTrend {
  averageScore: number; // -1 to 1
  trend: 'positive' | 'neutral' | 'declining';
  dayCount: number;
}

export const DEFAULT_GUARDRAIL_SETTINGS: GuardrailSettings = {
  aiHoursStart: 6,
  aiHoursEnd: 20,
  dailyMessageCap: 100,
  nomiDailyCap: 30,
  homeworkDailyCap: 10,
  parentDailyCap: 5,
  minRequestIntervalSeconds: 3,
  sessionTimeoutMinutes: 15,
  maxPinAttempts: 5,
  lockoutMinutes: 15,
};
