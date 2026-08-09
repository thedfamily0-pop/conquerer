export interface ParentEmailSettings {
  dad: string[];
  mom: string[];
}

export const PARENT_EMAIL_STORAGE_KEY = 'explorer_parent_emails_v1';
export const MAX_EMAILS_PER_ADULT = 3;
export const DEFAULT_PARENT_EMAILS: ParentEmailSettings = {
  dad: ['dad@family.co.za'],
  mom: ['mom@family.co.za'],
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Adult = keyof ParentEmailSettings;

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  return email && EMAIL_PATTERN.test(email) ? email : null;
}

function normalizeList(value: unknown): string[] {
  const values = Array.isArray(value) ? value : [value];
  return [...new Set(values.map(normalizeEmail).filter((email): email is string => Boolean(email)))].slice(0, MAX_EMAILS_PER_ADULT);
}

export function normalizeParentEmailSettings(value: unknown): ParentEmailSettings {
  if (!value || typeof value !== 'object') return { dad: [...DEFAULT_PARENT_EMAILS.dad], mom: [...DEFAULT_PARENT_EMAILS.mom] };
  const stored = value as Partial<Record<Adult, unknown>>;
  return {
    dad: normalizeList(stored.dad),
    mom: normalizeList(stored.mom),
  };
}

export function loadParentEmailSettings(): ParentEmailSettings {
  try {
    return normalizeParentEmailSettings(JSON.parse(localStorage.getItem(PARENT_EMAIL_STORAGE_KEY) || 'null'));
  } catch {
    return { dad: [...DEFAULT_PARENT_EMAILS.dad], mom: [...DEFAULT_PARENT_EMAILS.mom] };
  }
}

export function saveParentEmailSettings(settings: ParentEmailSettings): void {
  localStorage.setItem(PARENT_EMAIL_STORAGE_KEY, JSON.stringify(normalizeParentEmailSettings(settings)));
}

export function flattenParentEmails(settings: ParentEmailSettings): string[] {
  return [...new Set([...settings.dad, ...settings.mom].map(normalizeEmail).filter((email): email is string => Boolean(email)))];
}

export function updateParentEmail(settings: ParentEmailSettings, adult: Adult, index: number, value: string): ParentEmailSettings {
  if (index < 0 || index >= MAX_EMAILS_PER_ADULT) return settings;
  const addresses = [...settings[adult]];
  while (addresses.length <= index) addresses.push('');
  addresses[index] = value;
  return { ...settings, [adult]: addresses.slice(0, MAX_EMAILS_PER_ADULT) };
}
