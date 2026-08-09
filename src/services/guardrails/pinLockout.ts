// ============================================================
// PIN Lockout Manager
// Locks Parent Zone after N failed attempts, notifies parents
// ============================================================

import { loadGuardrailSettings } from './rateLimiter';
import { sendParentEmailAlert } from '../childSafetyScanner';

const STORAGE_KEY = 'explorer_pin_lockout_v1';

interface LockoutState {
  failedAttempts: number;
  lockedUntil: string | null; // ISO timestamp
  lastAttempt: string | null;
}

function getState(): LockoutState {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (stored) return stored;
  } catch { /* default */ }
  return { failedAttempts: 0, lockedUntil: null, lastAttempt: null };
}

function saveState(state: LockoutState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export interface PinCheckResult {
  allowed: boolean;
  isLocked: boolean;
  remainingLockMinutes?: number;
  failedAttempts: number;
}

/** Check if PIN entry is currently allowed (not locked out) */
export function checkPinLockout(): PinCheckResult {
  const state = getState();

  if (state.lockedUntil) {
    const lockEnd = new Date(state.lockedUntil).getTime();
    const now = Date.now();
    if (now < lockEnd) {
      const remainingMs = lockEnd - now;
      return {
        allowed: false,
        isLocked: true,
        remainingLockMinutes: Math.ceil(remainingMs / 60_000),
        failedAttempts: state.failedAttempts,
      };
    }
    // Lock expired — reset
    saveState({ failedAttempts: 0, lockedUntil: null, lastAttempt: null });
  }

  return {
    allowed: true,
    isLocked: false,
    failedAttempts: state.failedAttempts,
  };
}

/** Record a failed PIN attempt; returns whether lockout was triggered */
export function recordFailedPinAttempt(parentEmails: string[]): boolean {
  const state = getState();
  const settings = loadGuardrailSettings();

  state.failedAttempts += 1;
  state.lastAttempt = new Date().toISOString();

  if (state.failedAttempts >= settings.maxPinAttempts) {
    const lockUntil = new Date(Date.now() + settings.lockoutMinutes * 60_000);
    state.lockedUntil = lockUntil.toISOString();
    saveState(state);

    // Notify parents
    sendParentEmailAlert({
      to: parentEmails,
      subject: '🔒 PIN Lockout — Conquerer Security Alert',
      body: `PARENT ZONE LOCKOUT ALERT
=========================================
Date/Time: ${new Date().toLocaleString()}
Failed attempts: ${state.failedAttempts}
Locked for: ${settings.lockoutMinutes} minutes

Someone attempted to access the Parent Zone ${state.failedAttempts} times with an incorrect PIN.
The Parent Zone is now locked for ${settings.lockoutMinutes} minutes.

If this was not you, please check your device.

Sent automatically by Conquerer Security.
`
    });
    return true;
  }

  saveState(state);
  return false;
}

/** Reset lockout state (call on successful unlock) */
export function resetPinLockout(): void {
  saveState({ failedAttempts: 0, lockedUntil: null, lastAttempt: null });
}
