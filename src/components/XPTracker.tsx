import { History, Minus, Plus, Sparkles, X } from 'lucide-react';
import type { XpTransaction } from '../services/xpEconomy';

interface Props { isOpen: boolean; balance: number; transactions: XpTransaction[]; onClose: () => void; }

const formatDate = (value: string): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown time' : date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

export function XPTracker({ isOpen, balance, transactions, onClose }: Props) {
  if (!isOpen) return null;
  return <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(15, 23, 42, 0.86)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="glass-card animate-pop" role="dialog" aria-modal="true" aria-labelledby="xp-tracker-title" style={{ maxWidth: '560px', width: '100%', maxHeight: 'min(720px, 92vh)', overflow: 'hidden', padding: '24px', position: 'relative' }}>
      <button onClick={onClose} aria-label="Close XP tracker" style={{ position: 'absolute', top: '18px', right: '18px', border: 0, borderRadius: '50%', width: '36px', height: '36px', background: 'rgba(255,255,255,0.1)', color: '#f8fafc', cursor: 'pointer' }}><X size={20} /></button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingRight: '42px' }}><div style={{ background: 'rgba(251, 191, 36, 0.18)', padding: '10px', borderRadius: '14px' }}><History size={25} color="#fbbf24" /></div><div><h2 id="xp-tracker-title" style={{ color: '#f8fafc', margin: 0 }}>XP activity</h2><p className="muted" style={{ margin: '4px 0 0' }}>See when you earned or spent your points.</p></div></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 14px', padding: '14px 16px', borderRadius: '16px', background: 'rgba(251, 191, 36, 0.12)', border: '1px solid rgba(251, 191, 36, 0.3)' }}><span style={{ color: '#fde68a', fontWeight: 700 }}>Current balance</span><strong style={{ color: '#fbbf24', fontSize: '1.35rem' }}><Sparkles size={18} style={{ verticalAlign: '-3px', marginRight: '5px' }} />{balance} XP</strong></div>
      <div style={{ overflowY: 'auto', maxHeight: 'calc(min(720px, 92vh) - 190px)', display: 'grid', gap: '10px' }}>
        {transactions.length === 0 ? <div style={{ padding: '28px 12px', textAlign: 'center' }}><Sparkles size={30} color="#fbbf24" /><h3 style={{ color: '#f8fafc' }}>No XP activity yet</h3><p className="muted">Complete a learning activity and it will appear here.</p></div> : transactions.map(transaction => <article key={transaction.id} style={{ display: 'grid', gridTemplateColumns: '34px 1fr auto', gap: '10px', alignItems: 'center', padding: '12px', borderRadius: '14px', background: 'rgba(15, 23, 42, 0.45)', border: '1px solid rgba(148, 163, 184, 0.16)' }}><div style={{ color: transaction.delta > 0 ? '#34d399' : '#fb7185' }}>{transaction.delta > 0 ? <Plus size={20} /> : <Minus size={20} />}</div><div><strong style={{ color: '#f8fafc', display: 'block' }}>{transaction.source}</strong><span className="muted" style={{ fontSize: '0.82rem' }}>{transaction.reason || (transaction.kind === 'purchase' ? 'XP Store reward' : 'XP update')}</span><small style={{ color: '#64748b', display: 'block', marginTop: '4px' }}>{formatDate(transaction.createdAt)}</small></div><strong style={{ color: transaction.delta > 0 ? '#34d399' : '#fb7185', whiteSpace: 'nowrap' }}>{transaction.delta > 0 ? '+' : ''}{transaction.delta} XP</strong></article>)}
      </div>
    </section>
  </div>;
}
