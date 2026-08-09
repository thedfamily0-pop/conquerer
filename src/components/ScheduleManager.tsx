import { useState } from 'react';
import { Copy, Plus, Trash2 } from 'lucide-react';
import { ColorPicker } from './ColorPicker';
import { DAY_NAMES, EMOJI_PICKER, type ChoreTask, type ScheduleItem } from '../data/scheduleData';

interface Props { schedule: ScheduleItem[]; chores: ChoreTask[]; onScheduleChange: (items: ScheduleItem[]) => void; onChoresChange: (items: ChoreTask[]) => void; }
const inputStyle: React.CSSProperties = { width: '100%', border: '1px solid rgba(255,255,255,.16)', borderRadius: 9, padding: 9, background: 'rgba(15,23,42,.65)', color: '#f8fafc' };

export function ScheduleManager({ schedule, chores, onScheduleChange, onChoresChange }: Props) {
  const [day, setDay] = useState(1);
  const [event, setEvent] = useState({ time: '15:30', title: '', emoji: '📚', color: '#8b5cf6', reminderMinutes: 15, notifyEmail: false });
  const [chore, setChore] = useState({ title: '', emoji: '⭐', dueDate: '', xpReward: 10, addedBy: 'Dad', requiresPhoto: true });
  const events = schedule.filter(item => item.dayOfWeek === day).sort((a, b) => a.time.localeCompare(b.time));

  const addEvent = (e: React.FormEvent) => { e.preventDefault(); if (!event.title.trim()) return; onScheduleChange([...schedule, { ...event, id: `event_${Date.now()}`, dayOfWeek: day, title: event.title.trim() }]); setEvent(current => ({ ...current, title: '' })); };
  const copyDay = (target: number) => { const copied = events.map(item => ({ ...item, id: `event_${Date.now()}_${item.id}`, dayOfWeek: target })); onScheduleChange([...schedule.filter(item => item.dayOfWeek !== target), ...copied]); };
  const addChore = (e: React.FormEvent) => { e.preventDefault(); if (!chore.title.trim()) return; onChoresChange([{ ...chore, id: `chore_${Date.now()}`, title: chore.title.trim(), dueDate: chore.dueDate || undefined, isCompleted: false, createdAt: new Date().toISOString(), requiresPhoto: chore.requiresPhoto }, ...chores]); setChore(current => ({ ...current, title: '' })); };

  return (
    <section className="schedule-manager">
      <div className="manager-days">{DAY_NAMES.map((name, index) => <button key={name} className={day === index ? 'selected' : ''} onClick={() => setDay(index)} title={name}>{name.slice(0, 3)}</button>)}</div>

      <div className="manager-card">
        <h3>{DAY_NAMES[day]}'s timetable</h3>
        {events.length ? events.map(item => (
          <div className="manager-list-row" key={item.id}>
            <i style={{ background: item.color }}/>
            <span title="Event emoji">{item.emoji}</span>
            <b>{item.time} · {item.title}</b>
            <small>{item.reminderMinutes} min reminder{item.notifyEmail ? ' · email' : ''}</small>
            <button onClick={() => onScheduleChange(schedule.filter(entry => entry.id !== item.id))} aria-label={`Delete ${item.title}`} title="Remove event"><Trash2 size={16}/></button>
          </div>
        )) : <p className="empty-state">No events on this day yet.</p>}
        <div className="copy-row"><Copy size={16}/><span>Copy this day to:</span>{DAY_NAMES.map((name, index) => index !== day && <button key={name} onClick={() => copyDay(index)} title={`Copy to ${name}`}>{name.slice(0, 3)}</button>)}</div>
      </div>

      <form className="manager-card manager-form" onSubmit={addEvent}>
        <h3><Plus size={17}/> Add event</h3>
        <div className="form-grid">
          <input type="time" value={event.time} onChange={e => setEvent({ ...event, time: e.target.value })} style={inputStyle} title="Event time"/>
          <input placeholder="Event title" value={event.title} onChange={e => setEvent({ ...event, title: e.target.value })} style={inputStyle} title="Event title"/>
          <select value={event.emoji} onChange={e => setEvent({ ...event, emoji: e.target.value })} style={inputStyle} title="Event emoji">{EMOJI_PICKER.map(emoji => <option key={emoji}>{emoji}</option>)}</select>
          <select value={event.reminderMinutes} onChange={e => setEvent({ ...event, reminderMinutes: Number(e.target.value) })} style={inputStyle} title="Reminder time">{[5, 10, 15, 30].map(minutes => <option key={minutes} value={minutes}>{minutes} minutes before</option>)}</select>
          <label className="toggle-label" title="Send email notification to parents"><input type="checkbox" checked={event.notifyEmail} onChange={e => setEvent({ ...event, notifyEmail: e.target.checked })}/> Email Dad & Mom</label>
        </div>
        <div className="form-section">
          <label className="form-label-inline">Event colour</label>
          <ColorPicker value={event.color} onChange={color => setEvent({ ...event, color })}/>
        </div>
        <button className="btn-primary" type="submit" title="Add this event to the timetable"><Plus size={17}/>Add to {DAY_NAMES[day]}</button>
      </form>

      <form className="manager-card manager-form" onSubmit={addChore}>
        <h3>✨ Chores & one-off tasks</h3>
        {chores.map(item => (
          <div className="manager-list-row" key={item.id}>
            <span title="Chore emoji">{item.emoji}</span>
            <b>{item.title}</b>
            <small>{item.isCompleted ? 'Done ✓' : `+${item.xpReward} XP`} · {item.addedBy}</small>
            <button onClick={() => onChoresChange(chores.filter(choreItem => choreItem.id !== item.id))} aria-label={`Delete ${item.title}`} title="Remove task"><Trash2 size={16}/></button>
          </div>
        ))}
        <div className="form-grid">
          <input placeholder="Task title" value={chore.title} onChange={e => setChore({ ...chore, title: e.target.value })} style={inputStyle} title="Task name"/>
          <select value={chore.emoji} onChange={e => setChore({ ...chore, emoji: e.target.value })} style={inputStyle} title="Task emoji">{EMOJI_PICKER.map(emoji => <option key={emoji}>{emoji}</option>)}</select>
          <input type="date" value={chore.dueDate} onChange={e => setChore({ ...chore, dueDate: e.target.value })} style={inputStyle} title="Due date (optional)"/>
          <input type="number" min="1" max="100" value={chore.xpReward} onChange={e => setChore({ ...chore, xpReward: Number(e.target.value) || 1 })} style={inputStyle} title="XP reward for completing"/>
          <select value={chore.addedBy} onChange={e => setChore({ ...chore, addedBy: e.target.value })} style={inputStyle} title="Added by"><option>Dad</option><option>Mom</option></select>
          <label className="toggle-label" title="Require photo proof when completing"><input type="checkbox" checked={chore.requiresPhoto} onChange={e => setChore({ ...chore, requiresPhoto: e.target.checked })}/> 📸 Require photo proof</label>
        </div>
        <button className="btn-secondary" type="submit" title="Add this task"><Plus size={17}/>Add task</button>
      </form>
    </section>
  );
}
