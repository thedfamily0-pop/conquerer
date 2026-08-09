import { useMemo, useState } from 'react';
import { BookHeart, ChevronDown, ChevronUp, Edit3, Plus, Square, Trash2, Volume2, X } from 'lucide-react';
import type { DiaryEntry } from '../data/scheduleData';
import { speakText, stopSpeech, warmUpSpeechVoices } from '../services/audioService';

const MOODS = [
  { id: 'happy', emoji: '😊', label: 'Happy' },
  { id: 'excited', emoji: '🤩', label: 'Excited' },
  { id: 'calm', emoji: '😌', label: 'Calm' },
  { id: 'proud', emoji: '🥹', label: 'Proud' },
  { id: 'okay', emoji: '😐', label: 'Okay' },
  { id: 'sad', emoji: '😢', label: 'Sad' },
  { id: 'worried', emoji: '😟', label: 'Worried' },
  { id: 'angry', emoji: '😠', label: 'Angry' },
];

const today = () => new Date().toISOString().slice(0, 10);

interface Props {
  entries: DiaryEntry[];
  onChange: (entries: DiaryEntry[]) => void;
  displayName: string;
}

export function DiaryJournal({ entries, onChange, displayName }: Props) {
  const date = today();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editMood, setEditMood] = useState('happy');
  const [newEntryDate, setNewEntryDate] = useState('');
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Today's entry
  const todayEntry = entries.find(e => e.date === date);
  const [todayContent, setTodayContent] = useState(todayEntry?.content ?? '');
  const [todayMood, setTodayMood] = useState(todayEntry?.mood ?? 'happy');
  const todayMoodInfo = MOODS.find(m => m.id === todayMood) ?? MOODS[0];

  // All past entries sorted newest first
  const pastEntries = useMemo(
    () => entries.filter(e => e.date !== date).sort((a, b) => b.date.localeCompare(a.date)),
    [entries, date]
  );

  const saveToday = () => {
    const trimmed = todayContent.trim();
    const rest = entries.filter(e => e.date !== date);
    if (trimmed) {
      onChange([{
        id: todayEntry?.id ?? `diary_${Date.now()}`,
        date,
        content: trimmed,
        mood: todayMood,
        moodEmoji: todayMoodInfo.emoji,
        createdAt: todayEntry?.createdAt ?? new Date().toISOString(),
      }, ...rest]);
    } else if (todayEntry) {
      onChange(rest);
    }
  };

  const startEdit = (entry: DiaryEntry) => {
    setEditingId(entry.id);
    setEditContent(entry.content);
    setEditMood(entry.mood);
    setExpandedId(null);
  };

  const saveEdit = (entryId: string) => {
    const trimmed = editContent.trim();
    if (!trimmed) return;
    const moodInfo = MOODS.find(m => m.id === editMood) ?? MOODS[0];
    onChange(entries.map(e => e.id === entryId ? {
      ...e,
      content: trimmed,
      mood: editMood,
      moodEmoji: moodInfo.emoji,
    } : e));
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const deleteEntry = (entryId: string) => {
    onChange(entries.filter(e => e.id !== entryId));
    setDeleteConfirm(null);
    setExpandedId(null);
  };

  const addNewEntry = () => {
    if (!newEntryDate || !editContent.trim()) return;
    const moodInfo = MOODS.find(m => m.id === editMood) ?? MOODS[0];
    // Remove existing entry for that date if any
    const rest = entries.filter(e => e.date !== newEntryDate);
    onChange([{
      id: `diary_${Date.now()}`,
      date: newEntryDate,
      content: editContent.trim(),
      mood: editMood,
      moodEmoji: moodInfo.emoji,
      createdAt: new Date().toISOString(),
    }, ...rest]);
    setShowNewEntry(false);
    setEditContent('');
    setEditMood('happy');
    setNewEntryDate('');
  };

  const readAloud = (text: string) => {
    if (!text.trim()) return;
    warmUpSpeechVoices();
    setSpeaking(true);
    speakText(text, () => setSpeaking(false));
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(`${dateStr}T12:00:00`);
    return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const formatDateShort = (dateStr: string) => {
    const d = new Date(`${dateStr}T12:00:00`);
    return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <section className="diary-journal">
      {/* Header — feels like opening your diary */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(168, 85, 247, 0.2)', padding: '12px', borderRadius: '16px' }}>
              <BookHeart size={26} color="#a855f7" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', color: '#f8fafc', margin: 0 }}>
                {displayName}&apos;s Diary
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '2px 0 0' }}>
                This is your private space. Write whatever you feel — it&apos;s just for you. 💜
              </p>
            </div>
          </div>
          <span style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', padding: '6px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
      </div>

      {/* Today's Entry — always at the top like the current page */}
      <div className="glass-card" style={{ padding: '22px', marginBottom: '20px', borderLeft: '4px solid #a855f7' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', margin: 0 }}>
            📝 Today — {formatDate(date)}
          </h3>
          {todayEntry && (
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Auto-saves ✨</span>
          )}
        </div>

        {/* Mood selector */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
          {MOODS.map(m => (
            <button
              key={m.id}
              onClick={() => setTodayMood(m.id)}
              style={{
                background: todayMood === m.id ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255,255,255,0.05)',
                border: todayMood === m.id ? '2px solid #a855f7' : '2px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '8px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s',
              }}
              title={m.label}
            >
              <span style={{ fontSize: '18px' }}>{m.emoji}</span>
              <span style={{ fontSize: '0.75rem', color: '#e2e8f0', fontWeight: todayMood === m.id ? 700 : 400 }}>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Writing area */}
        <textarea
          value={todayContent}
          maxLength={2000}
          onChange={e => setTodayContent(e.target.value)}
          onBlur={saveToday}
          placeholder="Dear diary, today I…"
          style={{
            width: '100%',
            minHeight: '140px',
            background: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '14px',
            padding: '14px 16px',
            color: '#f8fafc',
            fontSize: '0.95rem',
            lineHeight: '1.6',
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'inherit',
          }}
          aria-label="Today's diary entry"
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{todayContent.length}/2000</span>
          <button
            onClick={() => speaking ? (stopSpeech(), setSpeaking(false)) : readAloud(todayContent)}
            disabled={!todayContent.trim()}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '10px', padding: '8px 14px', cursor: 'pointer', color: '#c084fc', fontSize: '0.85rem',
              opacity: todayContent.trim() ? 1 : 0.4,
            }}
          >
            {speaking ? <><Square size={14} /> Stop</> : <><Volume2 size={14} /> Read aloud</>}
          </button>
        </div>
      </div>

      {/* Add a past entry button */}
      {!showNewEntry && (
        <button
          onClick={() => { setShowNewEntry(true); setEditContent(''); setEditMood('happy'); setNewEntryDate(''); }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            background: 'rgba(168, 85, 247, 0.1)', border: '2px dashed rgba(168, 85, 247, 0.3)',
            borderRadius: '14px', padding: '14px', cursor: 'pointer', color: '#c084fc', fontSize: '0.9rem',
            fontWeight: 600, marginBottom: '20px', transition: 'all 0.2s',
          }}
        >
          <Plus size={18} /> Add an entry for another day
        </button>
      )}

      {/* New entry form (for a different date) */}
      {showNewEntry && (
        <div className="glass-card" style={{ padding: '20px', marginBottom: '20px', borderLeft: '4px solid #14b8a6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ color: '#f8fafc', fontSize: '1rem', margin: 0 }}>✏️ New entry</h3>
            <button onClick={() => setShowNewEntry(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <X size={20} />
            </button>
          </div>
          <input
            type="date"
            value={newEntryDate}
            max={date}
            onChange={e => setNewEntryDate(e.target.value)}
            style={{
              width: '100%', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', padding: '10px 14px', color: '#f8fafc', fontSize: '0.9rem', marginBottom: '12px',
            }}
          />
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {MOODS.map(m => (
              <button
                key={m.id}
                onClick={() => setEditMood(m.id)}
                style={{
                  background: editMood === m.id ? 'rgba(20, 184, 166, 0.3)' : 'rgba(255,255,255,0.05)',
                  border: editMood === m.id ? '2px solid #14b8a6' : '2px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', padding: '6px 10px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}
                title={m.label}
              >
                <span style={{ fontSize: '16px' }}>{m.emoji}</span>
                <span style={{ fontSize: '0.7rem', color: '#e2e8f0' }}>{m.label}</span>
              </button>
            ))}
          </div>
          <textarea
            value={editContent}
            maxLength={2000}
            onChange={e => setEditContent(e.target.value)}
            placeholder="What happened that day?"
            style={{
              width: '100%', minHeight: '100px', background: 'rgba(15, 23, 42, 0.5)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 14px',
              color: '#f8fafc', fontSize: '0.9rem', lineHeight: '1.5', resize: 'vertical', outline: 'none', fontFamily: 'inherit',
            }}
          />
          <button
            onClick={addNewEntry}
            disabled={!newEntryDate || !editContent.trim()}
            style={{
              marginTop: '12px', background: '#14b8a6', border: 'none', borderRadius: '10px',
              padding: '10px 20px', color: '#fff', fontSize: '0.9rem', fontWeight: 600,
              cursor: newEntryDate && editContent.trim() ? 'pointer' : 'not-allowed',
              opacity: newEntryDate && editContent.trim() ? 1 : 0.5,
            }}
          >
            Save entry
          </button>
        </div>
      )}

      {/* Past entries — all of them, like flipping through diary pages */}
      {pastEntries.length > 0 && (
        <div>
          <h3 style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
            📖 Previous entries
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pastEntries.map(entry => {
              const isExpanded = expandedId === entry.id;
              const isEditing = editingId === entry.id;
              const entryMood = MOODS.find(m => m.id === entry.mood) ?? MOODS[0];

              return (
                <div
                  key={entry.id}
                  className="glass-card"
                  style={{
                    padding: isExpanded || isEditing ? '18px' : '14px 18px',
                    transition: 'all 0.2s',
                    borderLeft: isExpanded ? '3px solid rgba(168, 85, 247, 0.5)' : '3px solid transparent',
                  }}
                >
                  {/* Entry header — always visible */}
                  <button
                    onClick={() => { if (!isEditing) setExpandedId(isExpanded ? null : entry.id); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '22px' }}>{entry.moodEmoji || entryMood.emoji}</span>
                      <div style={{ textAlign: 'left' }}>
                        <span style={{ color: '#f8fafc', fontSize: '0.9rem', fontWeight: 600 }}>
                          {formatDateShort(entry.date)}
                        </span>
                        <span style={{ color: '#64748b', fontSize: '0.78rem', display: 'block' }}>
                          {entryMood.label}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {!isEditing && (
                        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                          {entry.content.length > 60 ? entry.content.slice(0, 60) + '…' : ''}
                        </span>
                      )}
                      {isExpanded ? <ChevronUp size={18} color="#94a3b8" /> : <ChevronDown size={18} color="#94a3b8" />}
                    </div>
                  </button>

                  {/* Expanded view — reading the entry */}
                  {isExpanded && !isEditing && (
                    <div style={{ marginTop: '14px' }}>
                      <p style={{
                        color: '#e2e8f0', fontSize: '0.92rem', lineHeight: '1.7',
                        whiteSpace: 'pre-wrap', margin: '0 0 14px',
                        background: 'rgba(15, 23, 42, 0.3)', borderRadius: '10px', padding: '14px',
                      }}>
                        {entry.content}
                      </p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => readAloud(entry.content)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.25)',
                            borderRadius: '8px', padding: '7px 12px', cursor: 'pointer', color: '#c084fc', fontSize: '0.8rem',
                          }}
                        >
                          <Volume2 size={14} /> Read aloud
                        </button>
                        <button
                          onClick={() => startEdit(entry)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.25)',
                            borderRadius: '8px', padding: '7px 12px', cursor: 'pointer', color: '#93c5fd', fontSize: '0.8rem',
                          }}
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(entry.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)',
                            borderRadius: '8px', padding: '7px 12px', cursor: 'pointer', color: '#fca5a5', fontSize: '0.8rem',
                          }}
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>

                      {/* Delete confirmation */}
                      {deleteConfirm === entry.id && (
                        <div style={{
                          marginTop: '12px', background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '14px',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                          <span style={{ color: '#fca5a5', fontSize: '0.85rem' }}>Remove this entry?</span>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => deleteEntry(entry.id)}
                              style={{
                                background: '#ef4444', border: 'none', borderRadius: '8px',
                                padding: '6px 14px', color: '#fff', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600,
                              }}
                            >
                              Yes, remove
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              style={{
                                background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px',
                                padding: '6px 14px', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer',
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Editing mode */}
                  {isEditing && (
                    <div style={{ marginTop: '14px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        {MOODS.map(m => (
                          <button
                            key={m.id}
                            onClick={() => setEditMood(m.id)}
                            style={{
                              background: editMood === m.id ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255,255,255,0.05)',
                              border: editMood === m.id ? '2px solid #3b82f6' : '2px solid rgba(255,255,255,0.08)',
                              borderRadius: '8px', padding: '5px 8px', cursor: 'pointer',
                            }}
                            title={m.label}
                          >
                            <span style={{ fontSize: '14px' }}>{m.emoji}</span>
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={editContent}
                        maxLength={2000}
                        onChange={e => setEditContent(e.target.value)}
                        style={{
                          width: '100%', minHeight: '100px', background: 'rgba(15, 23, 42, 0.5)',
                          border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '10px', padding: '12px 14px',
                          color: '#f8fafc', fontSize: '0.9rem', lineHeight: '1.5', resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button
                          onClick={() => saveEdit(entry.id)}
                          disabled={!editContent.trim()}
                          style={{
                            background: '#3b82f6', border: 'none', borderRadius: '8px',
                            padding: '8px 16px', color: '#fff', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600,
                          }}
                        >
                          Save changes
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={{
                            background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px',
                            padding: '8px 16px', color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {pastEntries.length === 0 && !todayEntry && (
        <div style={{
          textAlign: 'center', padding: '40px 20px', color: '#64748b',
        }}>
          <p style={{ fontSize: '2rem', marginBottom: '8px' }}>📔</p>
          <p style={{ fontSize: '0.95rem' }}>Your diary is empty. Start writing today!</p>
        </div>
      )}
    </section>
  );
}
