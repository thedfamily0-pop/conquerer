// ============================================================
// notificationService.ts
// Reminder engine: checks schedule every 60s, fires in-app
// toasts, browser push notifications, and email payloads.
// ============================================================

import type { ScheduleItem } from '../data/scheduleData';
import { flattenParentEmails, DEFAULT_PARENT_EMAILS } from './parentEmailSettings';

export interface AppToast {
  id: string;
  message: string;
  emoji: string;
  type: 'reminder' | 'chore' | 'achievement' | 'safety';
  expiresAt: number;
}

type ToastCallback = (toast: AppToast) => void;
type EmailCallback = (payload: { to: string[]; subject: string; body: string }) => void;

let toastCb: ToastCallback | null = null;
let emailCb: EmailCallback | null = null;
let parentEmails: string[] = flattenParentEmails(DEFAULT_PARENT_EMAILS);

// Cache: set of "eventId_YYYY-MM-DD" that have already fired today
const firedCache = new Set<string>();

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function cacheKey(id: string): string {
  return `${id}_${todayKey()}`;
}

// ── Request browser notification permission ───────────────────
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

// ── Show browser push notification ───────────────────────────
function pushBrowserNotification(title: string, body: string, emoji: string): void {
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    new Notification(`${emoji} ${title}`, {
      body,
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🚀</text></svg>',
      tag: 'explorer-reminder',
    });
  }
}

// ── Emit in-app toast ─────────────────────────────────────────
export function showToast(message: string, emoji: string, type: AppToast['type'] = 'reminder'): void {
  if (!toastCb) return;
  const toast: AppToast = {
    id: `toast_${Date.now()}`,
    message,
    emoji,
    type,
    expiresAt: Date.now() + 5000,
  };
  toastCb(toast);
  pushBrowserNotification('Conquerer Reminder', message, emoji);
}

// ── Register callbacks ────────────────────────────────────────
export function registerToastCallback(cb: ToastCallback): void { toastCb = cb; }
export function registerEmailCallback(cb: EmailCallback): void { emailCb = cb; }
export function setParentEmails(emails: string[]): void { parentEmails = emails; }

// ── Main reminder engine ──────────────────────────────────────
export function startReminderEngine(getSchedule: () => ScheduleItem[]): () => void {
  function check() {
    const now = new Date();
    const todayDow = now.getDay();
    const nowMins  = now.getHours() * 60 + now.getMinutes();
    const schedule = getSchedule();

    for (const item of schedule) {
      if (item.dayOfWeek !== todayDow) continue;

      const [h, m]  = item.time.split(':').map(Number);
      const eventMin = h * 60 + m;
      const diff     = eventMin - nowMins;

      // Fire when diff == reminderMinutes (±1 min tolerance)
      if (diff >= item.reminderMinutes - 1 && diff <= item.reminderMinutes + 1) {
        const ck = cacheKey(item.id);
        if (firedCache.has(ck)) continue;
        firedCache.add(ck);

        const msg = `${item.title} starts in ${item.reminderMinutes} minutes!`;
        showToast(msg, item.emoji, 'reminder');

        if (item.notifyEmail && emailCb) {
          emailCb({
            to: parentEmails,
            subject: `📅 Schedule Reminder: ${item.title} for Ufefe`,
            body: `Hi Dad & Mom,\n\nThis is a reminder that "${item.title}" ${item.emoji} is scheduled for ${item.time} today — starting in ${item.reminderMinutes} minutes.\n\nSent automatically by Conquerer.`,
          });
        }
      }
    }

    // Keep only today's entries; this makes the cache naturally reset at midnight.
    const currentDay = todayKey();
    for (const key of firedCache) {
      if (!key.endsWith(currentDay)) firedCache.delete(key);
    }
  }

  const interval = window.setInterval(check, 60_000);
  check(); // run immediately on start
  return () => clearInterval(interval);
}
