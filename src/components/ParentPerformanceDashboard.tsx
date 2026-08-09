import { useEffect, useMemo, useState } from 'react';
import { filterPerformanceEvents, getPerformanceEvents, summarisePerformance, type PerformanceFilter, type PerformanceEvent } from '../services/performanceData';
import { getCurrentTermInfo } from '../data/termCalendar';
import { getWCEDLevel } from '../data/wcedScale';

const FILTERS: Array<{ id: PerformanceFilter; label: string }> = [
  { id: '24h', label: '24 hours' }, { id: 'week', label: 'Current week' }, { id: 'month', label: 'Current month' }, { id: 'term', label: 'Current term' }, { id: 'all', label: 'All time' },
];

function scoreText(event: PerformanceEvent): string {
  return `${event.score}/${event.total}${event.activity === 'quest' ? ' stars' : ''}`;
}

export function ParentPerformanceDashboard() {
  const [filter, setFilter] = useState<PerformanceFilter>('week');
  const [events, setEvents] = useState<PerformanceEvent[]>(getPerformanceEvents);
  useEffect(() => {
    const refresh = () => setEvents(getPerformanceEvents());
    window.addEventListener('conquerer-performance-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => { window.removeEventListener('conquerer-performance-updated', refresh); window.removeEventListener('storage', refresh); };
  }, []);
  const filtered = useMemo(() => filterPerformanceEvents(events, filter), [events, filter]);
  const summary = useMemo(() => summarisePerformance(filtered), [filtered]);
  const wced = getWCEDLevel(summary.academicScore);
  const questEvents = filtered.filter(event => event.activity === 'quest').sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const term = getCurrentTermInfo();

  return <section style={{ marginTop: '18px' }}>
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
      {FILTERS.map(option => <button key={option.id} onClick={() => setFilter(option.id)} className={filter === option.id ? 'btn-primary' : 'btn-secondary'}>{option.label}</button>)}
    </div>
    <p className="muted" style={{ fontSize: '0.8rem' }}>Scores use learning events in the selected period. Diary entries are never included. Current term: {term.isHoliday ? 'holiday' : `Term ${term.term}` }.</p>
    <div className="progress-stats-row">
      <div className="stat-card"><b>{summary.engagementScore}%</b><small>Engagement Score</small><span className="muted">Participation: active learning days and completed learning actions.</span></div>
      <div className="stat-card"><b>{summary.academicScore}%</b><small>Academic Performance Score</small><span className="muted">Verified points earned ÷ verified points possible.</span></div>
      <div className="stat-card"><b>{summary.confidenceScore}%</b><small>Confidence signal</small><span className="muted">Performance × (70% + 30% independent work).</span></div>
    </div>
    <div style={{ background: `${wced.color}18`, border: `1px solid ${wced.color}55`, borderRadius: '14px', padding: '14px', marginBottom: '16px' }}>
      <b style={{ color: wced.color }}>Conquerer learning signal · WCED-style Level {wced.level}: {wced.label}</b>
      <p className="muted" style={{ margin: '6px 0 0', fontSize: '0.8rem' }}>Informal parent-facing reference only — not an official school assessment. The signal uses verified learning evidence, not XP, chores, wellbeing, or parent adjustments.</p>
    </div>
    <div style={{ background: 'rgba(30, 41, 59, 0.55)', borderRadius: '14px', padding: '14px', marginBottom: '16px' }}>
      <h4 style={{ margin: '0 0 8px' }}>Confidence / evidence</h4>
      <p style={{ margin: 0, color: '#fbbf24', fontWeight: 700 }}>{summary.evidenceLabel}</p>
      <p className="muted" style={{ fontSize: '0.8rem', margin: '6px 0 0' }}>{summary.scoredAttempts} unique scored attempts · {Math.round(summary.independentRate * 100)}% completed without a hint. Hints reduce confidence modestly; they do not make an answer a failure.</p>
    </div>
    <div style={{ background: 'rgba(30, 41, 59, 0.55)', borderRadius: '14px', padding: '14px', marginBottom: '16px' }}>
      <h4 style={{ margin: '0 0 10px' }}>Subject-by-subject performance</h4>
      {summary.subjectBreakdown.length ? summary.subjectBreakdown.map(item => <div key={item.subject} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}><span>{item.subject} <small className="muted">({item.attempts} attempts)</small></span><b>{item.score}%</b></div>) : <p className="empty-state">Not enough evidence yet. Complete a practice question, reading quiz, homework step with your own answer, or Quest checkpoint.</p>}
    </div>
    <div style={{ background: 'rgba(30, 41, 59, 0.55)', borderRadius: '14px', padding: '14px' }}>
      <h4 style={{ margin: '0 0 10px' }}>Quest answers and retry history</h4>
      {questEvents.length ? questEvents.map(event => <article key={event.id} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}><b>{event.subject} · Checkpoint {(event.checkpointIndex ?? 0) + 1}</b><span style={{ color: event.correct ? '#2dd4bf' : '#f87171' }}>{scoreText(event)} · {event.isRetry ? 'Retry' : 'First attempt'}</span></div><p style={{ margin: '5px 0', color: '#cbd5e1', fontSize: '0.85rem' }}>{event.answer || 'No written answer saved.'}</p><small className="muted">{new Date(event.occurredAt).toLocaleString()} · {event.hintsShown ? 'Hint used' : 'Independent attempt'}</small></article>) : <p className="empty-state">No Quest answers recorded for this period.</p>}
    </div>
  </section>;
}
