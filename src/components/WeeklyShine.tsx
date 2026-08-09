import { useState, useEffect } from 'react';
import { Heart, Sun, Moon, Sparkles, Star } from 'lucide-react';
import { loadShineState, saveShineState, DAYS_OF_WEEK, AFFIRMATION_CATEGORIES, BEDTIME_AFFIRMATION, getEmptyShineDayEntry } from '../data/shineData';
import type { ShineState, ShineDayEntry } from '../data/shineData';

export function WeeklyShine() {
  const [state, setState] = useState<ShineState>(loadShineState);
  const todayName = DAYS_OF_WEEK[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const [selectedDay, setSelectedDay] = useState(todayName);
  useEffect(() => { saveShineState(state); }, [state]);

  const dayEntry: ShineDayEntry = state.days[selectedDay] || getEmptyShineDayEntry();
  const updateField = (field: keyof ShineDayEntry, value: string) => {
    setState(s => ({ ...s, days: { ...s.days, [selectedDay]: { ...dayEntry, [field]: value } } }));
  };

  const fields: { key: keyof ShineDayEntry; label: string; placeholder: string }[] = [
    { key: 'proud', label: '⭐ I am proud of...', placeholder: 'Something I did well today...' },
    { key: 'grateful', label: '💜 I am grateful for...', placeholder: 'Something or someone I appreciate...' },
    { key: 'kindness', label: '💗 An act of kindness...', placeholder: 'A kind thing I did or someone did for me...' },
    { key: 'todayI', label: '✅ Today I...', placeholder: 'Something I accomplished or tried...' },
    { key: 'shineGoal', label: '🌟 My shine goal today', placeholder: 'One thing I want to focus on...' },
  ];

  return (
    <section style={{ padding: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ background: 'rgba(251, 191, 36, 0.2)', padding: '10px', borderRadius: '16px' }}><Sun size={24} color="#fbbf24" /></div>
        <div>
          <h2 style={{ fontSize: '1.3rem', color: '#f8fafc', margin: 0 }}>My Weekly Shine ✨</h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '2px 0 0' }}>I feel it. I name it. I grow through it. I shine every day!</p>
        </div>
      </div>

      {/* Day selector */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '0 4px' }}>
        {DAYS_OF_WEEK.map(day => (
          <button key={day} onClick={() => setSelectedDay(day)} style={{ flexShrink: 0, border: day === selectedDay ? 'none' : '1px solid rgba(71, 85, 105, 0.4)', cursor: 'pointer', borderRadius: '12px', padding: '8px 12px', background: day === selectedDay ? 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' : 'rgba(30, 41, 59, 0.6)', color: day === selectedDay ? '#fff' : '#94a3b8', fontWeight: 700, fontSize: '0.78rem', transition: 'all 0.2s ease' }}>{day.slice(0, 3)}</button>
        ))}
      </div>

      {/* Daily reflection fields */}
      <div className="glass-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {fields.map(f => (
          <div key={f.key}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0', display: 'block', marginBottom: '5px' }}>{f.label}</label>
            <input value={dayEntry[f.key]} onChange={e => updateField(f.key, e.target.value)} placeholder={f.placeholder} style={{ width: '100%', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(71, 85, 105, 0.4)', borderRadius: '10px', padding: '10px 14px', color: '#f8fafc', fontSize: '0.88rem', outline: 'none' }} />
          </div>
        ))}
      </div>

      {/* Growing Goal */}
      <div className="glass-card" style={{ padding: '16px', borderLeft: '4px solid #a855f7' }}>
        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#c084fc', display: 'block', marginBottom: '6px' }}>🌱 Growing Goal This Week</label>
        <input value={state.growingGoal} onChange={e => setState(s => ({ ...s, growingGoal: e.target.value }))} placeholder="My focus this week is..." style={{ width: '100%', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '10px', padding: '10px 14px', color: '#f8fafc', fontSize: '0.88rem', outline: 'none' }} />
      </div>

      {/* Note from Mom */}
      {state.momNote && (
        <div className="glass-card" style={{ padding: '16px', borderLeft: '4px solid #ec4899', background: 'rgba(236, 72, 153, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}><Heart size={16} color="#ec4899" /><span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f9a8d4' }}>�� A Note From Mom</span></div>
          <p style={{ fontSize: '0.88rem', color: '#e2e8f0', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>{state.momNote}</p>
        </div>
      )}

      {/* Affirmations */}
      <div className="glass-card" style={{ padding: '18px' }}>
        <h3 style={{ fontSize: '1.05rem', color: '#f8fafc', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}><Sparkles size={18} color="#fbbf24" /> My Affirmations</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {AFFIRMATION_CATEGORIES.map(cat => (
            <div key={cat.title} style={{ background: 'rgba(15, 23, 42, 0.4)', border: `1px solid ${cat.color}33`, borderRadius: '14px', padding: '12px 14px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: cat.color, marginBottom: '8px' }}>{cat.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {cat.items.map(line => <div key={line} style={{ fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.5 }}>💛 {line}</div>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bedtime Affirmation */}
      <div className="glass-card" style={{ padding: '16px', background: 'rgba(30, 27, 75, 0.6)', borderLeft: '4px solid #6366f1' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}><Moon size={16} color="#a5b4fc" /><span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#a5b4fc' }}>Bedtime Affirmation</span></div>
        <p style={{ fontSize: '0.85rem', color: '#e2e8f0', margin: 0, lineHeight: 1.8 }}>{BEDTIME_AFFIRMATION.join(' · ')}</p>
      </div>

      {/* Mommy's Special Affirmation */}
      <div className="glass-card" style={{ padding: '16px', borderLeft: '4px solid #fbbf24', background: 'rgba(251, 191, 36, 0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}><Star size={16} color="#fbbf24" /><span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fde68a' }}>A Special Affirmation From Mommy 💕</span></div>
        <p style={{ fontSize: '0.88rem', color: '#e2e8f0', margin: 0, lineHeight: 1.7, fontStyle: 'italic' }}>{state.mommyAffirmation}</p>
      </div>
    </section>
  );
}
