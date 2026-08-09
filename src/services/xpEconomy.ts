import { supabase, hasSupabaseConfig } from './supabase';

export type XpTransactionKind = 'earn' | 'purchase' | 'parent-adjustment';

export interface XpTransaction {
  id: string;
  delta: number;
  kind: XpTransactionKind;
  source: string;
  sourceId?: string;
  reason?: string;
  createdAt: string;
}

export const DAILY_LEARNING_XP_CAP = 100;
const XP_TRANSACTIONS_KEY = 'explorer_xp_transactions_v1';
const DAILY_LEARNING_XP_KEY = 'explorer_daily_learning_xp_v1';
const LEARNING_CLAIM_IDS_KEY = 'explorer_learning_xp_claim_ids_v1';
const MAX_TRANSACTIONS = 500;
const MAX_CLAIM_IDS = 1000;

const text = (value: unknown, limit: number): string => typeof value === 'string' ? value.trim().slice(0, limit) : '';
const transactionId = (): string => {
  try { return `xp_${crypto.randomUUID()}`; } catch { return `xp_${Date.now()}_${Math.random().toString(36).slice(2)}`; }
};

function localDay(): string { return new Date().toLocaleDateString('en-CA'); }
function readDailyLearningXp(): { date: string; earned: number } {
  try {
    const value = JSON.parse(localStorage.getItem(DAILY_LEARNING_XP_KEY) || 'null') as { date?: unknown; earned?: unknown } | null;
    if (value?.date === localDay() && typeof value.earned === 'number' && Number.isSafeInteger(value.earned)) return { date: value.date, earned: Math.max(0, value.earned) };
  } catch { /* use today's empty ledger */ }
  return { date: localDay(), earned: 0 };
}

/** Atomically claims the remaining learning XP for this device/calendar day. */
export function claimDailyLearningXp(requested: number): { requested: number; awarded: number; total: number; remaining: number } {
  const amount = Math.max(0, Math.trunc(requested));
  if (!amount) return { requested: 0, awarded: 0, total: readDailyLearningXp().earned, remaining: DAILY_LEARNING_XP_CAP };
  const current = readDailyLearningXp();
  const awarded = Math.min(amount, Math.max(0, DAILY_LEARNING_XP_CAP - current.earned));
  const total = current.earned + awarded;
  try { localStorage.setItem(DAILY_LEARNING_XP_KEY, JSON.stringify({ date: current.date, earned: total })); } catch { /* the in-memory result still protects this award call */ }
  return { requested: amount, awarded, total, remaining: DAILY_LEARNING_XP_CAP - total };
}

export function getDailyLearningXp(): number { return readDailyLearningXp().earned; }

function parseTransaction(value: unknown): XpTransaction | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Partial<XpTransaction>;
  const delta = typeof item.delta === 'number' && Number.isSafeInteger(item.delta) ? item.delta : 0;
  const kind = item.kind === 'purchase' || item.kind === 'parent-adjustment' || item.kind === 'earn' ? item.kind : null;
  const source = text(item.source, 80);
  if (!delta || !kind || !source) return null;
  return { id: text(item.id, 100) || transactionId(), delta, kind, source, sourceId: text(item.sourceId, 100) || undefined, reason: text(item.reason, 180) || undefined, createdAt: text(item.createdAt, 40) || new Date().toISOString() };
}

export function createXpTransaction(input: Omit<XpTransaction, 'id' | 'createdAt'>): XpTransaction {
  return { ...input, id: transactionId(), createdAt: new Date().toISOString() };
}

export function loadXpTransactions(startingBalance = 0): XpTransaction[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(XP_TRANSACTIONS_KEY) || 'null');
    if (Array.isArray(saved)) {
      const parsed = saved.map(parseTransaction).filter((item): item is XpTransaction => Boolean(item));
      if (parsed.length) return parsed.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, MAX_TRANSACTIONS);
    }
  } catch { /* Start with the safe local fallback below. */ }
  return startingBalance > 0 ? [createXpTransaction({ delta: startingBalance, kind: 'earn', source: 'Previous activity', reason: 'XP already in your wallet before the tracker was added.' })] : [];
}

export function saveXpTransactions(transactions: XpTransaction[]): void {
  localStorage.setItem(XP_TRANSACTIONS_KEY, JSON.stringify(transactions.slice(0, MAX_TRANSACTIONS)));
}

export function appendXpTransaction(transactions: XpTransaction[], transaction: XpTransaction): XpTransaction[] {
  return [transaction, ...transactions.filter(item => item.id !== transaction.id)].slice(0, MAX_TRANSACTIONS);
}

export interface LearningXpClaim {
  requested: number;
  awarded: number;
  total: number;
  remaining: number;
  balance?: number;
  lifetimeEarned?: number;
  hosted: boolean;
  error?: string;
}

/** Returns one durable transaction ID for an activity completion across retries. */
export function getStableLearningXpClientId(activityKey: string): string {
  const key = text(activityKey, 180);
  if (!key) return transactionId();
  try {
    const saved = JSON.parse(localStorage.getItem(LEARNING_CLAIM_IDS_KEY) || '{}') as Record<string, unknown>;
    const existing = text(saved[key], 180);
    if (existing) return existing;
    const id = transactionId();
    const entries = Object.entries(saved).slice(-(MAX_CLAIM_IDS - 1));
    localStorage.setItem(LEARNING_CLAIM_IDS_KEY, JSON.stringify(Object.fromEntries([...entries, [key, id]])));
    return id;
  } catch {
    return transactionId();
  }
}

/** Uses the family-scoped atomic RPC when hosted sync is enabled; localStorage is offline-only fallback. */
export async function claimLearningXp(requested: number, source: string, reason: string, activityKey?: string): Promise<LearningXpClaim> {
  const amount = Math.max(0, Math.trunc(requested));
  if (import.meta.env.VITE_SUPABASE_SYNC_ENABLED === 'true' && hasSupabaseConfig) {
    const clientId = activityKey ? getStableLearningXpClientId(activityKey) : transactionId();
    const { data, error } = await supabase.rpc('claim_learning_xp', {
      p_child_id: null,
      p_client_id: clientId,
      p_requested_xp: amount,
      p_source: source,
      p_reason: reason,
    });
    if (error) return { requested: amount, awarded: 0, total: 0, remaining: 0, hosted: true, error: 'Learning XP could not be confirmed by the family server. Try again when you are online.' };
    const row = (Array.isArray(data) ? data[0] : data) as { requested_xp?: number; awarded_xp?: number; total_awarded_xp?: number; remaining_xp?: number; balance?: number; lifetime_earned?: number } | undefined;
    if (!row) return { requested: amount, awarded: 0, total: 0, remaining: 0, hosted: true, error: 'The family server returned no XP claim.' };
    return { requested: Number(row.requested_xp) || amount, awarded: Number(row.awarded_xp) || 0, total: Number(row.total_awarded_xp) || 0, remaining: Number(row.remaining_xp) || 0, balance: Number(row.balance) || 0, lifetimeEarned: Number(row.lifetime_earned) || 0, hosted: true };
  }
  const local = claimDailyLearningXp(amount);
  return { requested: local.requested, awarded: local.awarded, total: local.total, remaining: local.remaining, hosted: false };
}
