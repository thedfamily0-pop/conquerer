/** Offline-first synchronization with explicit production opt-in. */
import { supabase, hasSupabaseConfig, isSupabaseAvailable } from './supabase';
import type { DiaryEntry, NomiMessage, ScheduleItem, ChoreTask } from '../data/scheduleData';
import type { VocabWord } from '../data/vocabData';
import type { StoreState } from '../data/storeData';

export const SUPABASE_SYNC_ENABLED = import.meta.env.VITE_SUPABASE_SYNC_ENABLED === 'true' && hasSupabaseConfig;

let online = false;
let familyId: string | null = null;
let childProfileId: string | null = null;
let lastSyncError: string | null = null;

interface RemoteState {
  diary: DiaryEntry[];
  nomiMessages: NomiMessage[];
  schedule: ScheduleItem[];
  chores: ChoreTask[];
}
interface RemoteScheduleRow { id: string; day_of_week: number; time: string; title: string; emoji: string; color: string; reminder_minutes: number; notify_email: boolean; }
interface RemoteChoreRow { id: string; title: string; emoji: string; due_date: string | null; is_completed: boolean; completed_at: string | null; evidence_photo_url?: string | null; xp_reward: number; added_by: string; created_at: string; }

function setSyncError(error: unknown): void {
  lastSyncError = error instanceof Error ? error.message : 'Supabase synchronization failed.';
  console.warn(`[Conquerer sync] ${lastSyncError}`);
}
function requireData<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}
function remoteUuid(namespace: string, localId: string): string {
  const key = 'explorer_remote_ids_v1';
  try {
    const mapping = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, string>;
    const mapKey = `${namespace}:${localId}`;
    if (mapping[mapKey]) return mapping[mapKey];
    const value = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`.replace(/[^0-9a-f-]/gi, '').padEnd(32, '0').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12}).*$/, '$1-$2-$3-$4-$5');
    mapping[mapKey] = value; localStorage.setItem(key, JSON.stringify(mapping)); return value;
  } catch { return typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : '00000000-0000-4000-8000-000000000000'; }
}

export async function initSync(profile?: { displayName: string; avatar: string; nomiName: string }): Promise<{ online: boolean; remote: RemoteState | null }> {
  online = false; familyId = null; childProfileId = null; lastSyncError = null;
  if (!SUPABASE_SYNC_ENABLED || !await isSupabaseAvailable()) return { online: false, remote: null };
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { online: false, remote: null };

  try {
    const setup = await supabase.rpc('ensure_family_setup', {
      p_display_name: profile?.displayName || 'Explorer', p_avatar: profile?.avatar || '🌟', p_nomi_name: profile?.nomiName || 'Nomi',
    });
    requireData(setup);
    const membership = requireData(await supabase.from('family_members').select('family_id').eq('user_id', session.user.id).limit(1).maybeSingle()) as { family_id: string } | null;
    const child = requireData(await supabase.rpc('current_child_profile_id')) as string | null;
    if (!membership?.family_id || !child) throw new Error('Family setup did not return a child profile.');
    familyId = membership.family_id; childProfileId = child as string; online = true;
    return { online: true, remote: await loadRemoteState() };
  } catch (error) {
    setSyncError(error); return { online: false, remote: null };
  }
}

async function loadRemoteState(): Promise<RemoteState> {
  if (!online || !childProfileId || !familyId) return { diary: [], nomiMessages: [], schedule: [], chores: [] };
  const [diary, messages, schedule, chores] = await Promise.all([
    supabase.from('diary_entries').select('id,date,content,mood,mood_emoji,created_at').eq('child_id', childProfileId).order('date', { ascending: false }),
    supabase.from('nomi_messages').select('role,content,created_at').eq('child_id', childProfileId).order('created_at', { ascending: true }).limit(100),
    supabase.from('schedule_items').select('*').eq('family_id', familyId),
    supabase.from('chores').select('*').eq('family_id', familyId),
  ]);
  return {
    diary: requireData(diary).map(row => ({ id: row.id, date: row.date, content: row.content, mood: row.mood, moodEmoji: row.mood_emoji, createdAt: row.created_at })),
    nomiMessages: requireData(messages).map(row => ({ role: row.role as NomiMessage['role'], content: row.content, timestamp: row.created_at })),
    schedule: requireData(schedule).map((row: RemoteScheduleRow) => ({ id: row.id, dayOfWeek: row.day_of_week, time: row.time, title: row.title, emoji: row.emoji, color: row.color, reminderMinutes: row.reminder_minutes, notifyEmail: row.notify_email })),
    chores: requireData(chores).map((row: RemoteChoreRow) => ({ id: row.id, title: row.title, emoji: row.emoji, dueDate: row.due_date || undefined, isCompleted: row.is_completed, completedAt: row.completed_at || undefined, evidencePhotoUrl: row.evidence_photo_url || undefined, xpReward: row.xp_reward, addedBy: row.added_by, createdAt: row.created_at })),
  };
}
export async function syncDiary(entries: DiaryEntry[]): Promise<void> {
  if (!online || !childProfileId) return;
  try {
    const rows = entries.map(entry => ({ id: remoteUuid('diary', entry.id), child_id: childProfileId, date: entry.date, content: entry.content, mood: entry.mood, mood_emoji: entry.moodEmoji, created_at: entry.createdAt }));
    requireData(await supabase.from('diary_entries').upsert(rows, { onConflict: 'id' }));
  } catch (error) { setSyncError(error); }
}

export async function syncNomiMessages(messages: NomiMessage[]): Promise<void> {
  if (!online || !childProfileId) return;
  try {
    const rows = messages.slice(-50).map(msg => ({
      child_id: childProfileId, client_id: `${msg.timestamp}|${msg.role}|${msg.content.slice(0, 120)}`,
      role: msg.role, content: msg.content, created_at: msg.timestamp,
    }));
    if (rows.length) requireData(await supabase.from('nomi_messages').upsert(rows, { onConflict: 'child_id,client_id' }));
  } catch (error) { setSyncError(error); }
}

export async function syncSchedule(items: ScheduleItem[]): Promise<void> {
  if (!online || !familyId) return;
  try {
    const ids = items.map(item => remoteUuid('schedule', item.id));
    const deleteResult = ids.length
      ? supabase.from('schedule_items').delete().eq('family_id', familyId).not('id', 'in', `(${ids.join(',')})`)
      : supabase.from('schedule_items').delete().eq('family_id', familyId);
    requireData(await deleteResult);
    if (items.length) requireData(await supabase.from('schedule_items').upsert(items.map(item => ({ id: remoteUuid('schedule', item.id), family_id: familyId, day_of_week: item.dayOfWeek, time: item.time, title: item.title, emoji: item.emoji, color: item.color, reminder_minutes: item.reminderMinutes, notify_email: item.notifyEmail })), { onConflict: 'id' }));
  } catch (error) { setSyncError(error); }
}

export async function syncChores(chores: ChoreTask[]): Promise<void> {
  if (!online || !familyId) return;
  try {
    const ids = chores.map(chore => remoteUuid('chore', chore.id));
    const deleteResult = ids.length
      ? supabase.from('chores').delete().eq('family_id', familyId).not('id', 'in', `(${ids.join(',')})`)
      : supabase.from('chores').delete().eq('family_id', familyId);
    requireData(await deleteResult);
    if (chores.length) requireData(await supabase.from('chores').upsert(chores.map(chore => ({ id: remoteUuid('chore', chore.id), family_id: familyId, title: chore.title, emoji: chore.emoji, due_date: chore.dueDate || null, is_completed: chore.isCompleted, completed_at: chore.completedAt || null, evidence_photo_url: chore.evidencePhotoUrl || null, xp_reward: chore.xpReward, added_by: chore.addedBy, created_at: chore.createdAt })), { onConflict: 'id' }));
  } catch (error) { setSyncError(error); }
}

export async function syncVocab(words: VocabWord[]): Promise<void> {
  if (!online || !childProfileId) return;
  try {
    for (const word of words.slice(-30)) {
      requireData(await supabase.from('vocab_words').upsert({ id: remoteUuid('vocab', word.id), child_id: childProfileId, word: word.word, meaning: word.meaning, example: word.example || null, language: word.language, term: word.term, week: word.week, created_at: word.addedAt }, { onConflict: 'id' }));
    }
  } catch (error) { setSyncError(error); }
}

export async function loadNomiMemories(): Promise<string[]> {
  if (!online || !childProfileId) return [];
  try {
    const result = await supabase.from('nomi_memory').select('content').eq('child_id', childProfileId).order('created_at', { ascending: false }).limit(10);
    return requireData(result)?.map(row => row.content) || [];
  } catch (error) { setSyncError(error); return []; }
}

export function isSyncOnline(): boolean { return online; }
export function getFamilyId(): string | null { return familyId; }
export function getChildProfileId(): string | null { return childProfileId; }
export function getLastSyncError(): string | null { return lastSyncError; }

export async function syncParentAlert(alert: { mood: string; moodEmoji: string; note: string; isUrgent: boolean }): Promise<void> {
  if (!online || !familyId) return;
  try {
    requireData(await supabase.from('parent_alerts').insert({ family_id: familyId, mood: alert.mood, mood_emoji: alert.moodEmoji, note: alert.note, is_urgent: alert.isUrgent }));
  } catch (error) { setSyncError(error); }
}

export async function syncUsageEvent(eventType: string, metadata: Record<string, unknown> = {}): Promise<void> {
  if (!online || !childProfileId) return;
  try {
    requireData(await supabase.from('usage_events').insert({ child_id: childProfileId, event_type: eventType, metadata }));
  } catch (error) { setSyncError(error); }
}

export async function syncInputDetection(type: 'url' | 'pii', details: string, childInput: string): Promise<void> {
  if (!online || !familyId) return;
  try {
    if (type === 'url') {
      requireData(await supabase.from('detected_links').insert({ family_id: familyId, child_id: childProfileId, url: details, context: 'nomi_chat', child_input: childInput.slice(0, 1000) }));
    } else {
      requireData(await supabase.from('pii_detections').insert({ family_id: familyId, child_id: childProfileId, pii_types: details.split(',').map(value => value.trim()), context: 'nomi_chat', child_input: childInput.slice(0, 1000) }));
    }
  } catch (error) { setSyncError(error); }
}

export async function syncGuardrailSettings(settings: { aiHoursStart: number; aiHoursEnd: number; dailyMessageCap: number; nomiDailyCap: number; homeworkDailyCap: number; parentDailyCap: number; minRequestIntervalSeconds: number; sessionTimeoutMinutes: number; maxPinAttempts: number; lockoutMinutes: number }): Promise<void> {
  if (!online || !familyId) return;
  try {
    requireData(await supabase.from('guardrail_settings').upsert({ family_id: familyId, ai_hours_start: settings.aiHoursStart, ai_hours_end: settings.aiHoursEnd, daily_message_cap: settings.dailyMessageCap, nomi_daily_cap: settings.nomiDailyCap, homework_daily_cap: settings.homeworkDailyCap, parent_daily_cap: settings.parentDailyCap, min_request_interval_seconds: settings.minRequestIntervalSeconds, session_timeout_minutes: settings.sessionTimeoutMinutes, max_pin_attempts: settings.maxPinAttempts, lockout_minutes: settings.lockoutMinutes }, { onConflict: 'family_id' }));
  } catch (error) { setSyncError(error); }
}

export async function syncStoreState(state: StoreState): Promise<void> {
  if (!online || !familyId || !childProfileId) return;
  try {
    requireData(await supabase.from('xp_wallets').upsert({ child_id: childProfileId, balance: state.wallet.balance, lifetime_earned: state.wallet.lifetimeEarned, updated_at: new Date().toISOString() }, { onConflict: 'child_id' }));
    if (state.items.length) {
      requireData(await supabase.from('store_items').upsert(state.items.map(item => ({ id: remoteUuid('store-item', item.id), family_id: familyId, name: item.name, description: item.description, xp_cost: item.xpCost, image_url: null, stock: item.stock, is_available: item.isAvailable, created_at: item.createdAt, updated_at: item.updatedAt })), { onConflict: 'id' }));
    }
    if (state.purchases.length) {
      requireData(await supabase.from('store_purchases').upsert(state.purchases.map(purchase => ({ id: remoteUuid('purchase', purchase.id), client_id: `${purchase.id}|${purchase.purchasedAt}`, child_id: childProfileId, item_id: state.items.some(item => item.id === purchase.itemId) ? remoteUuid('store-item', purchase.itemId) : null, item_name: purchase.itemName, xp_cost: purchase.xpCost, image_url: null, purchased_at: purchase.purchasedAt })), { onConflict: 'child_id,client_id' }));
    }
  } catch (error) { setSyncError(error); }
}
