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

const XP_TRANSACTIONS_KEY = 'explorer_xp_transactions_v1';
const MAX_TRANSACTIONS = 500;

const text = (value: unknown, limit: number): string => typeof value === 'string' ? value.trim().slice(0, limit) : '';
const transactionId = (): string => {
  try { return `xp_${crypto.randomUUID()}`; } catch { return `xp_${Date.now()}_${Math.random().toString(36).slice(2)}`; }
};

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
