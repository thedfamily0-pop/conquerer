import { supabase, hasSupabaseConfig } from './supabase';

export interface ParentEmailSettings {
  dad: string[];
  mom: string[];
  /** Contact/invitation address only; it does not grant app access. */
  childEmail: string;
}

export const PARENT_EMAIL_STORAGE_KEY = 'explorer_parent_emails_v1';
export const MAX_EMAILS_PER_ADULT = 3;
export const DEFAULT_PARENT_EMAILS: ParentEmailSettings = {
  dad: [],
  mom: [],
  childEmail: '',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type Adult = 'dad' | 'mom';

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
  if (!value || typeof value !== 'object') return { ...DEFAULT_PARENT_EMAILS, dad: [], mom: [] };
  const stored = value as Partial<Record<Adult, unknown>> & { childEmail?: unknown; child_email?: unknown };
  return {
    dad: normalizeList(stored.dad),
    mom: normalizeList(stored.mom),
    childEmail: normalizeEmail(stored.childEmail ?? stored.child_email) || '',
  };
}

export function loadParentEmailSettings(): ParentEmailSettings {
  try {
    return normalizeParentEmailSettings(JSON.parse(localStorage.getItem(PARENT_EMAIL_STORAGE_KEY) || 'null'));
  } catch {
    return { ...DEFAULT_PARENT_EMAILS, dad: [], mom: [] };
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

export function updateChildEmail(settings: ParentEmailSettings, value: string): ParentEmailSettings {
  return { ...settings, childEmail: value };
}

interface RemoteFamilyContactSettings {
  dad_emails?: unknown;
  mom_emails?: unknown;
  child_email?: unknown;
}

export type FamilyEmailSettingsResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export async function loadFamilyEmailSettings(familyId: string): Promise<FamilyEmailSettingsResult<ParentEmailSettings | null>> {
  if (!hasSupabaseConfig) return { ok: false, error: 'Supabase is not configured.' };
  const { data, error } = await supabase
    .from('family_contact_settings')
    .select('dad_emails,mom_emails,child_email')
    .eq('family_id', familyId)
    .maybeSingle();
  if (error) {
    console.warn('[Conquerer family contacts] Could not load server settings:', error.message);
    return { ok: false, error: 'Email settings could not be loaded from the family account.' };
  }
  if (!data) return { ok: true, value: null };
  const remote = data as RemoteFamilyContactSettings;
  return { ok: true, value: normalizeParentEmailSettings({ dad: remote.dad_emails, mom: remote.mom_emails, childEmail: remote.child_email }) };
}

export async function saveFamilyEmailSettings(familyId: string, settings: ParentEmailSettings): Promise<FamilyEmailSettingsResult<ParentEmailSettings>> {
  if (!hasSupabaseConfig) return { ok: false, error: 'Supabase is not configured.' };
  const normalized = normalizeParentEmailSettings(settings);
  const { error } = await supabase.from('family_contact_settings').upsert({
    family_id: familyId,
    dad_emails: normalized.dad,
    mom_emails: normalized.mom,
    child_email: normalized.childEmail || null,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    console.warn('[Conquerer family contacts] Could not save server settings:', error.message);
    return { ok: false, error: 'Email settings could not be saved. Your previous recipients are still active.' };
  }
  return { ok: true, value: normalized };
}
