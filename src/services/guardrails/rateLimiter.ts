// AI Rate Limiter & Available Hours
// Client-side guardrail for offline/demo mode. The Edge Function provides
// the authoritative server-side limit when the app is connected.

import type { AIChannel, GuardrailSettings } from './types';
import { DEFAULT_GUARDRAIL_SETTINGS } from './types';

const STORAGE_KEY = 'explorer_ai_usage_v1';

interface DailyUsage {
  date: string;
  messageCount: number;
  channelCounts: Partial<Record<AIChannel, number>>;
  lastRequestAt?: string;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getUsage(): DailyUsage {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as Partial<DailyUsage> | null;
    if (stored && stored.date === todayKey()) {
      return {
        date: stored.date,
        messageCount: stored.messageCount || 0,
        channelCounts: stored.channelCounts || {},
        lastRequestAt: stored.lastRequestAt,
      };
    }
  } catch { /* reset to a clean daily record */ }
  return { date: todayKey(), messageCount: 0, channelCounts: {} };
}

function saveUsage(usage: DailyUsage): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
}

function channelLimit(settings: GuardrailSettings, channel: AIChannel): number {
  if (channel === 'nomi') return settings.nomiDailyCap;
  if (channel === 'homework') return settings.homeworkDailyCap;
  if (channel === 'parent') return settings.parentDailyCap;
  return 1;
}

export interface RateLimitCheck {
  allowed: boolean;
  reason?: 'outside_hours' | 'daily_cap_reached' | 'channel_cap_reached' | 'cooldown';
  friendlyMessage?: string;
  remainingMessages?: number;
}

export function checkAIAvailability(settings?: GuardrailSettings, channel: AIChannel = 'nomi'): RateLimitCheck {
  const config = settings || loadGuardrailSettings();
  const now = new Date();
  const currentHour = now.getHours();

  if (currentHour < config.aiHoursStart || currentHour >= config.aiHoursEnd) {
    return {
      allowed: false,
      reason: 'outside_hours',
      friendlyMessage: `🌙 It's rest time now! I'm available between ${formatHour(config.aiHoursStart)} and ${formatHour(config.aiHoursEnd)}. Sweet dreams, star! ⭐`,
    };
  }

  const usage = getUsage();
  const channelCount = usage.channelCounts[channel] || 0;
  const limit = channelLimit(config, channel);
  if (limit > 0 && channelCount >= limit) {
    const label = channel === 'nomi' ? 'chat messages' : channel === 'homework' ? 'homework questions' : 'AI requests';
    return {
      allowed: false,
      reason: 'channel_cap_reached',
      friendlyMessage: `🎉 You've used all your ${limit} ${label} for today. Let's continue tomorrow! 📚`,
      remainingMessages: 0,
    };
  }

  if (config.dailyMessageCap > 0 && usage.messageCount >= config.dailyMessageCap) {
    return {
      allowed: false,
      reason: 'daily_cap_reached',
      friendlyMessage: `🎉 We've used all ${config.dailyMessageCap} AI requests for today. Let's continue tomorrow! 📚`,
      remainingMessages: 0,
    };
  }

  if (usage.lastRequestAt && config.minRequestIntervalSeconds > 0) {
    const elapsed = (Date.now() - Date.parse(usage.lastRequestAt)) / 1000;
    if (elapsed < config.minRequestIntervalSeconds) {
      return {
        allowed: false,
        reason: 'cooldown',
        friendlyMessage: '⏳ Take a tiny breath before sending another message.',
        remainingMessages: Math.min(
          limit > 0 ? limit - channelCount : Number.MAX_SAFE_INTEGER,
          config.dailyMessageCap > 0 ? config.dailyMessageCap - usage.messageCount : Number.MAX_SAFE_INTEGER,
        ),
      };
    }
  }

  return {
    allowed: true,
    remainingMessages: Math.min(
      limit > 0 ? limit - channelCount : Number.MAX_SAFE_INTEGER,
      config.dailyMessageCap > 0 ? config.dailyMessageCap - usage.messageCount : Number.MAX_SAFE_INTEGER,
    ),
  };
}

export function recordAIMessage(channel: AIChannel = 'nomi'): void {
  const usage = getUsage();
  usage.messageCount += 1;
  usage.channelCounts[channel] = (usage.channelCounts[channel] || 0) + 1;
  usage.lastRequestAt = new Date().toISOString();
  saveUsage(usage);
}

export function getMessagesUsedToday(channel?: AIChannel): number {
  const usage = getUsage();
  return channel ? usage.channelCounts[channel] || 0 : usage.messageCount;
}

function formatHour(hour: number): string {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${h}:00 ${suffix}`;
}

const SETTINGS_KEY = 'explorer_guardrail_settings_v1';

export function loadGuardrailSettings(): GuardrailSettings {
  try {
    const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
    if (stored) return { ...DEFAULT_GUARDRAIL_SETTINGS, ...stored };
  } catch { /* use defaults */ }
  return DEFAULT_GUARDRAIL_SETTINGS;
}

export function saveGuardrailSettings(settings: GuardrailSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
