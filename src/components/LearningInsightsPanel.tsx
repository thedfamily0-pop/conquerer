import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { getPerformanceEvents, type PerformanceEvent } from '../services/performanceData';
import { buildLearningInsights, deleteLearningGoal, deleteSchoolResult, loadLearningRecords, saveLearningGoal, saveSchoolResult, updateLearningGoal, updateSchoolResult, type LearningGoal, type LearningInsight, type SchoolResult } from '../services/learningInsights';

const SUBJECTS = ['Mathematics', 'English Home Language', 'Afrikaans FAL', 'Coding & Robotics', 'Life Skills'];
const today = () => new Date().toISOString().slice(0, 10);
const fieldStyle = { width: '100%', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(71, 85, 105, 0.5)', borderRadius: '10px', padding: '9px 11px', color: '#f8fafc', fontSize: '0.82rem' } as const;

function priorityColor(priority: LearningInsight['priority']): string {
  return priority === 'high' ? '#f87171' : priority === 'focus' ? '#fbbf24' : priority === 'extension-ready' ? '#2dd4bf' : '#a78bfa';
}

export function LearningInsightsPanel() {
  const [results, setResults] = useState<SchoolResult[]>([]);
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [events, setEvents] = useState<PerformanceEvent[]>(getPerformanceEvents);
  const [resultForm, setResultForm] = useState({ subject: SUBJECTS[0], assessmentName: '', assessmentDate: today(), score: '', maxScore: '100', term: '3', academicYear: String(new Date().getFullYear()), source: 'school' as SchoolResult['source'], grade: '', notes: '' });
  const [goalForm, setGoalForm] = useState({ subject: SUBJECTS[0], title: '', baseline: '', target: '85', dueDate: '', notes: '' });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [editingResultId, setEditingResultId] = useState<string | null>(null);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  const refresh = () => { setEvents(getPerformanceEvents()); void loadLearningRecords().then(records => { setResults(records.results); setGoals(records.goals); }); };
  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener('conquerer-learning-insights-updated', handler);
    window.addEventListener('conquerer-performance-updated', handler);
    return () => { window.removeEventListener('conquerer-learning-insights-updated', handler); window.removeEventListener('conquerer-performance-updated', handler); };
  }, []);
  const insights = useMemo(() => buildLearningInsights(results, events, goals), [results, events, goals]);
  const priority = insights.filter(item => item.priority === 'high' || item.priority === 'focus');

  const addResult = async (event: FormEvent) => {
    event.preventDefault();
    const score = Number(resultForm.score); const maxScore = Number(resultForm.maxScore);
    if (!resultForm.assessmentName.trim() || !Number.isFinite(score) || !Number.isFinite(maxScore) || score < 0 || maxScore <= 0 || score > maxScore) { setMessage('Enter an assessment name and a valid score.'); return; }
    setBusy(true); setMessage('');
    try {
      if (editingResultId) {
        await updateSchoolResult(editingResultId, { academicYear: Number(resultForm.academicYear) || new Date().getFullYear(), term: Number(resultForm.term), subject: resultForm.subject, assessmentName: resultForm.assessmentName.trim(), assessmentDate: resultForm.assessmentDate, score, maxScore, source: resultForm.source, grade: resultForm.grade.trim() || undefined, notes: resultForm.notes.trim() || undefined });
        setMessage('School result updated. ✓');
      } else {
        await saveSchoolResult({ academicYear: Number(resultForm.academicYear) || new Date().getFullYear(), term: Number(resultForm.term), subject: resultForm.subject, assessmentName: resultForm.assessmentName.trim(), assessmentDate: resultForm.assessmentDate, score, maxScore, source: resultForm.source, grade: resultForm.grade.trim() || undefined, notes: resultForm.notes.trim() || undefined });
        setMessage('School result saved. ✓');
      }
      setEditingResultId(null);
      setResultForm(current => ({ ...current, assessmentName: '', score: '', grade: '', notes: '' })); refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'The result could not be saved.'); }
    finally { setBusy(false); }
  };

  const addGoal = async (event: FormEvent) => {
    event.preventDefault();
    if (!goalForm.title.trim()) { setMessage('Add a clear goal first.'); return; }
    setBusy(true); setMessage('');
    try {
      const goalInput = { subject: goalForm.subject, title: goalForm.title.trim(), baseline: goalForm.baseline ? Number(goalForm.baseline) : undefined, target: goalForm.target ? Number(goalForm.target) : undefined, targetUnit: 'percent', dueDate: goalForm.dueDate || undefined, status: 'active' as LearningGoal['status'], notes: goalForm.notes.trim() || undefined };
      if (editingGoalId) { await updateLearningGoal(editingGoalId, goalInput); setMessage('Smart goal updated. ✓'); } else { await saveLearningGoal(goalInput); setMessage('Smart goal saved. ✓'); }
      setEditingGoalId(null);
      setGoalForm(current => ({ ...current, title: '', baseline: '', notes: '' })); refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'The goal could not be saved.'); }
    finally { setBusy(false); }
  };

  const editResult = (result: SchoolResult) => { setEditingResultId(result.id); setResultForm({ subject: result.subject, assessmentName: result.assessmentName, assessmentDate: result.assessmentDate, score: String(result.score), maxScore: String(result.maxScore), term: String(result.term), academicYear: String(result.academicYear), source: result.source, grade: result.grade || '', notes: result.notes || '' }); setMessage('Editing this school result.'); };
  const editGoal = (goal: LearningGoal) => { setEditingGoalId(goal.id); setGoalForm({ subject: goal.subject, title: goal.title, baseline: goal.baseline === undefined ? '' : String(goal.baseline), target: goal.target === undefined ? '' : String(goal.target), dueDate: goal.dueDate || '', notes: goal.notes || '' }); setMessage('Editing this smart goal.'); };
  const removeResult = async (id: string) => { if (!window.confirm('Delete this historical result?')) return; setBusy(true); try { await deleteSchoolResult(id); setMessage('School result deleted.'); refresh(); } catch (error) { setMessage(error instanceof Error ? error.message : 'The result could not be deleted.'); } finally { setBusy(false); } };
  const removeGoal = async (id: string) => { if (!window.confirm('Delete this smart goal?')) return; setBusy(true); try { await deleteLearningGoal(id); setMessage('Smart goal deleted.'); refresh(); } catch (error) { setMessage(error instanceof Error ? error.message : 'The goal could not be deleted.'); } finally { setBusy(false); } };

  return <section style={{ marginBottom: '18px' }}>
    <div style={{ background: 'rgba(20, 184, 166, 0.08)', border: '1px solid rgba(20, 184, 166, 0.24)', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
      <h3 style={{ margin: '0 0 6px', color: '#99f6e4' }}>🧭 Learning history & smart planning</h3>
      <p className="muted" style={{ margin: 0, fontSize: '0.82rem' }}>Add school or end-of-term results and set measurable goals. The engine combines those records with current practice evidence to find gaps and recommend what to collect next.</p>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '18px' }}>
      <form onSubmit={addResult} style={{ background: 'rgba(30, 41, 59, 0.55)', borderRadius: '14px', padding: '14px' }}>
        <h4 style={{ margin: '0 0 10px' }}>Add school result</h4>
        <div style={{ display: 'grid', gap: '8px' }}>
          <select value={resultForm.subject} onChange={event => setResultForm(current => ({ ...current, subject: event.target.value }))} style={fieldStyle}>{SUBJECTS.map(subject => <option key={subject}>{subject}</option>)}</select>
          <input value={resultForm.assessmentName} onChange={event => setResultForm(current => ({ ...current, assessmentName: event.target.value }))} placeholder="Assessment name" style={fieldStyle}/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}><input type="number" min="0" value={resultForm.score} onChange={event => setResultForm(current => ({ ...current, score: event.target.value }))} placeholder="Score" style={fieldStyle}/><input type="number" min="1" value={resultForm.maxScore} onChange={event => setResultForm(current => ({ ...current, maxScore: event.target.value }))} placeholder="Out of" style={fieldStyle}/></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}><input type="date" value={resultForm.assessmentDate} onChange={event => setResultForm(current => ({ ...current, assessmentDate: event.target.value }))} style={fieldStyle}/><select value={resultForm.source} onChange={event => setResultForm(current => ({ ...current, source: event.target.value as SchoolResult['source'] }))} style={fieldStyle}><option value="school">School result</option><option value="end_of_term">End of term</option><option value="teacher">Teacher check</option><option value="parent">Parent entry</option></select></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}><input type="number" min="1" max="4" value={resultForm.term} onChange={event => setResultForm(current => ({ ...current, term: event.target.value }))} placeholder="Term" style={fieldStyle}/><input value={resultForm.grade} onChange={event => setResultForm(current => ({ ...current, grade: event.target.value }))} placeholder="Grade / level (optional)" style={fieldStyle}/></div>
          <textarea value={resultForm.notes} onChange={event => setResultForm(current => ({ ...current, notes: event.target.value }))} placeholder="Notes (optional)" rows={2} style={fieldStyle}/>
          <button className="btn-primary" disabled={busy}>{editingResultId ? 'Update result' : 'Save result'}</button>{editingResultId && <button type="button" className="text-button" onClick={() => { setEditingResultId(null); setMessage(''); }}>Cancel editing</button>}
        </div>
      </form>
      <form onSubmit={addGoal} style={{ background: 'rgba(30, 41, 59, 0.55)', borderRadius: '14px', padding: '14px' }}>
        <h4 style={{ margin: '0 0 10px' }}>Set a smart goal</h4>
        <div style={{ display: 'grid', gap: '8px' }}>
          <select value={goalForm.subject} onChange={event => setGoalForm(current => ({ ...current, subject: event.target.value }))} style={fieldStyle}>{SUBJECTS.map(subject => <option key={subject}>{subject}</option>)}</select>
          <input value={goalForm.title} onChange={event => setGoalForm(current => ({ ...current, title: event.target.value }))} placeholder="Example: score 8/10 on multiplication facts" style={fieldStyle}/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}><input type="number" min="0" max="100" value={goalForm.baseline} onChange={event => setGoalForm(current => ({ ...current, baseline: event.target.value }))} placeholder="Baseline %" style={fieldStyle}/><input type="number" min="1" max="100" value={goalForm.target} onChange={event => setGoalForm(current => ({ ...current, target: event.target.value }))} placeholder="Target %" style={fieldStyle}/></div>
          <input type="date" value={goalForm.dueDate} onChange={event => setGoalForm(current => ({ ...current, dueDate: event.target.value }))} style={fieldStyle}/>
          <textarea value={goalForm.notes} onChange={event => setGoalForm(current => ({ ...current, notes: event.target.value }))} placeholder="Strategy or support notes (optional)" rows={2} style={fieldStyle}/>
          <button className="btn-secondary" disabled={busy}>{editingGoalId ? 'Update goal' : 'Save goal'}</button>{editingGoalId && <button type="button" className="text-button" onClick={() => { setEditingGoalId(null); setMessage(''); }}>Cancel editing</button>}
        </div>
      </form>
    </div>
    {message && <p className={message.includes('could not') || message.includes('Enter') || message.includes('Add') ? 'form-error' : 'form-success'} role="status" aria-live="polite">{message}</p>}

    <div style={{ background: 'rgba(30, 41, 59, 0.55)', borderRadius: '14px', padding: '14px', marginBottom: '14px' }}>
      <h4 style={{ margin: '0 0 10px' }}>Trends, gaps & content priorities</h4>
      {insights.length ? insights.map(item => <article key={item.subject} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}><b>{item.subject}</b><span style={{ color: priorityColor(item.priority), fontWeight: 700 }}>{item.combinedScore === null ? 'New evidence' : `${item.combinedScore}% · ${item.priority}`}</span></div><small className="muted">History: {item.historicalScore === null ? 'not entered' : `${item.historicalScore}%`} · App evidence: {item.currentScore === null ? 'not enough yet' : `${item.currentScore}%`} · Trend: {item.trend} · {item.attempts} attempts</small><p style={{ margin: '5px 0 0', fontSize: '0.82rem', color: '#cbd5e1' }}>{item.recommendation}</p></article>) : <p className="empty-state">Add a result or complete learning activities to start finding patterns.</p>}
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '14px' }}>
      <div style={{ background: 'rgba(30, 41, 59, 0.55)', borderRadius: '14px', padding: '14px' }}><h4 style={{ margin: '0 0 10px' }}>Historical results</h4>{results.length ? results.slice().sort((a, b) => b.assessmentDate.localeCompare(a.assessmentDate)).map(result => <article key={result.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}><b>{result.subject}</b><span>{result.score}/{result.maxScore}</span></div><small className="muted">{result.assessmentName} · {result.assessmentDate} · Term {result.term}</small><div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}><button type="button" className="text-button" onClick={() => editResult(result)}>Edit</button><button type="button" className="text-button" onClick={() => { void removeResult(result.id); }} disabled={busy}>Delete</button></div></article>) : <p className="empty-state">No school results added yet.</p>}</div>
      <div style={{ background: 'rgba(30, 41, 59, 0.55)', borderRadius: '14px', padding: '14px' }}><h4 style={{ margin: '0 0 10px' }}>SMART goals</h4>{goals.length ? goals.map(goal => <article key={goal.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}><b>{goal.subject}</b><span className="muted">{goal.status}</span></div><p style={{ margin: '4px 0', fontSize: '0.82rem' }}>{goal.title}</p><small className="muted">Target: {goal.target === undefined ? 'not set' : `${goal.target}%`}{goal.dueDate ? ` · Due ${goal.dueDate}` : ''}</small><div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}><button type="button" className="text-button" onClick={() => editGoal(goal)}>Edit</button><button type="button" className="text-button" onClick={() => { void removeGoal(goal.id); }} disabled={busy}>Delete</button></div></article>) : <p className="empty-state">No smart goals added yet.</p>}</div>
    </div>

    <div style={{ background: 'rgba(251, 191, 36, 0.07)', border: '1px solid rgba(251, 191, 36, 0.22)', borderRadius: '14px', padding: '14px' }}>
      <h4 style={{ margin: '0 0 8px', color: '#fde68a' }}>Next content collection game plan</h4>
      {priority.length ? <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1', fontSize: '0.82rem' }}>{priority.slice(0, 4).map(item => <li key={item.subject} style={{ marginBottom: '6px' }}><b>{item.subject}:</b> collect short current-grade practice, worked examples, and confidence checks before any extension material.</li>)}</ul> : <p className="muted" style={{ margin: 0, fontSize: '0.82rem' }}>No urgent gaps detected yet. Keep collecting mixed current-grade evidence; extension work is only suggested after sustained mastery.</p>}
      {goals.filter(goal => goal.status === 'active').length > 0 && <p className="muted" style={{ margin: '10px 0 0', fontSize: '0.78rem' }}>{goals.filter(goal => goal.status === 'active').length} active smart goal(s) are included in the next review.</p>}
    </div>
  </section>;
}
