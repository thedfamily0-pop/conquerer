import { useState } from 'react';
import { BookHeart, ChevronDown, ChevronUp, Square, Volume2 } from 'lucide-react';
import type { DiaryEntry } from '../data/scheduleData';
import { speakText, stopSpeech, warmUpSpeechVoices } from '../services/audioService';
interface Props { entries: DiaryEntry[]; }
export function DiaryReadOnly({ entries }: Props) {
  const [open, setOpen] = useState<string | null>(null); const [speaking, setSpeaking] = useState<string | null>(null); const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const read = (entry: DiaryEntry) => { warmUpSpeechVoices(); setSpeaking(entry.id); speakText(entry.content, () => setSpeaking(null)); };
  return <section className="parent-diary"><h3><BookHeart size={19}/> Diary · read only</h3><p className="muted">Entries belong to Ufefe. Dad and Mom may read or listen here, but cannot create, edit, delete, export, or share them.</p>{sorted.length ? sorted.map(entry => <article className="diary-entry" key={entry.id}><button onClick={() => setOpen(open === entry.id ? null : entry.id)}><span>{entry.moodEmoji} {new Date(`${entry.date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>{open === entry.id ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}</button>{open === entry.id && <div className="parent-diary-content"><p>{entry.content}</p><button className="diary-read-button" onClick={() => speaking === entry.id ? (stopSpeech(), setSpeaking(null)) : read(entry)}>{speaking === entry.id ? <><Square size={16}/>Stop</> : <><Volume2 size={16}/>Read aloud</>}</button></div>}</article>) : <p className="empty-state">No diary entries yet.</p>}</section>;
}
