// ============================================================
// Session Timeout Manager
// Auto-locks the app after configurable inactivity period
// ============================================================

import { loadGuardrailSettings } from './rateLimiter';

type LockCallback = () => void;

let timeoutId: ReturnType<typeof setTimeout> | null = null;
let lockCallback: LockCallback | null = null;
let isActive = false;

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll'];

export function startSessionTimer(onLock: LockCallback): () => void {
  lockCallback = onLock;
  isActive = true;
  resetTimer();

  const handler = () => resetTimer();
  for (const event of ACTIVITY_EVENTS) {
    window.addEventListener(event, handler, { passive: true });
  }

  return () => {
    isActive = false;
    if (timeoutId) clearTimeout(timeoutId);
    for (const event of ACTIVITY_EVENTS) {
      window.removeEventListener(event, handler);
    }
  };
}

function resetTimer(): void {
  if (!isActive) return;
  if (timeoutId) clearTimeout(timeoutId);

  const settings = loadGuardrailSettings();
  if (settings.sessionTimeoutMinutes <= 0) return;

  const ms = settings.sessionTimeoutMinutes * 60 * 1000;
  timeoutId = setTimeout(() => {
    if (lockCallback) lockCallback();
  }, ms);
}

/** Manually reset the timer (e.g. after unlocking) */
export function touchSession(): void {
  resetTimer();
}
