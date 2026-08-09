import { useState, type ChangeEvent } from 'react';
import { CheckCircle2, Database, Download, FileText, Upload } from 'lucide-react';
import { loadSchedule, saveSchedule, loadChores, saveChores } from '../data/scheduleData';
import { addLogEntry, loadContentLog, type ContentUploadLog } from '../data/contentLog';
import { getCurrentTermInfo } from '../data/termCalendar';

interface Props { onDataImported?: () => void; }

const CONTENT_TEMPLATE = `# Conquerer — Practice Content Template
# =========================================
# This template is for LEARNING CONTENT ONLY:
# Practice questions, stories, vocabulary, and weekly objectives.
#
# For SCHEDULE updates (timetable, events), use the Schedule template instead.
#
# Return ONLY valid JSON matching the structure below.
# =========================================

## JSON Structure

\`\`\`json
{
  "practiceQuestions": [
    {
      "id": "q_unique_id",
      "gradeLevel": 3,
      "subject": "maths",
      "title": "Question Title 🔢",
      "question": "What is 25 + 17?",
      "options": ["42", "52", "32", "43"],
      "correctIndex": 0,
      "hints": ["Add the ones first: 5 + 7 = 12", "Carry the 1 to tens"],
      "explanation": "25 + 17 = 42. Well done!",
      "xpAward": 20,
      "skill": "Addition with carrying",
      "themeTag": "drawing-observation"
    }
  ],
  "stories": [
    {
      "title": "Story Title",
      "emoji": "📖",
      "content": ["Paragraph 1…", "Paragraph 2…", "Paragraph 3…"],
      "quizQuestions": [
        {
          "question": "Comprehension question?",
          "options": ["A", "B", "C", "D"],
          "correctIndex": 0,
          "explanation": "Why this is correct."
        }
      ]
    }
  ],
  "weeklyObjectives": [
    "Objective 1",
    "Objective 2",
    "Objective 3"
  ],
  "vocab": [
    { "word": "sketch", "meaning": "a quick drawing", "language": "english", "example": "I made a sketch of the flower." }
  ]
}
\`\`\`

## Field Rules
- subject: "maths" | "english" | "afrikaans" | "robotics" | "vibing"
- gradeLevel: 3 or 4
- themeTag: short kebab-case tag matching the Life Skills theme (e.g. "colour-shape", "movement-dance")
- stories content: array of paragraphs (12-15 for a 20-min story)
- vocab language: "english" | "afrikaans" | "zulu" | "other"
`;

const SCHEDULE_TEMPLATE = `# Conquerer — Schedule Template
# =========================================
# This template is for TIMETABLE & CHORES ONLY.
# No AI required — just fill in the JSON and upload.
# =========================================

## JSON Structure

\`\`\`json
{
  "schedule": [
    {
      "id": "evt_unique",
      "dayOfWeek": 1,
      "time": "07:30",
      "title": "Leave for School",
      "emoji": "🚌",
      "color": "#3b82f6",
      "reminderMinutes": 15,
      "notifyEmail": true
    }
  ],
  "chores": [
    {
      "id": "chore_unique",
      "title": "Make your bed",
      "emoji": "🛏️",
      "xpReward": 10,
      "addedBy": "Dad",
      "requiresPhoto": true,
      "isCompleted": false,
      "createdAt": "2026-08-09T00:00:00.000Z"
    }
  ]
}
\`\`\`

## dayOfWeek values
0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday

## Notes
- time: 24-hour format "HH:MM"
- color: any hex colour (e.g. "#f59e0b")
- reminderMinutes: 5, 10, 15, or 30
- requiresPhoto: true = child must take a photo to complete
`;

export function ContentManager({ onDataImported }: Props) {
  const [log] = useState<ContentUploadLog[]>(loadContentLog);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const download = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleContentUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        let subjects: string[] = [];
        const counts: ContentUploadLog['itemCounts'] = {};

        if (Array.isArray(data.practiceQuestions) && data.practiceQuestions.length) {
          const key = 'explorer_custom_practice_v1';
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          localStorage.setItem(key, JSON.stringify([...existing, ...data.practiceQuestions]));
          counts.questions = data.practiceQuestions.length;
          const subs = [...new Set(data.practiceQuestions.map((q: { subject?: string }) => q.subject).filter(Boolean))] as string[];
          subjects.push(...subs);
        }
        if (Array.isArray(data.stories) && data.stories.length) {
          const key = 'explorer_custom_reading_v1';
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          localStorage.setItem(key, JSON.stringify([...existing, ...data.stories]));
          counts.stories = data.stories.length;
          subjects.push('reading');
        }
        if (Array.isArray(data.weeklyObjectives) && data.weeklyObjectives.length) {
          localStorage.setItem('explorer_weekly_objectives_v1', JSON.stringify(data.weeklyObjectives));
          counts.objectives = data.weeklyObjectives.length;
        }
        if (Array.isArray(data.vocab) && data.vocab.length) {
          const key = 'explorer_custom_vocab_v1';
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          localStorage.setItem(key, JSON.stringify([...existing, ...data.vocab]));
          counts.vocab = data.vocab.length;
          subjects.push('vocab');
        }

        const total = (counts.questions || 0) + (counts.stories || 0) + (counts.objectives || 0) + (counts.vocab || 0);
        if (total === 0) { setStatus({ type: 'error', message: 'No valid content found in file.' }); return; }

        const termInfo = getCurrentTermInfo();
        addLogEntry({ filename: file.name, fileSize: file.size, subjects: [...new Set(subjects)], itemCounts: counts, term: termInfo.term, week: termInfo.week });
        setStatus({ type: 'success', message: `Imported: ${counts.questions || 0} questions, ${counts.stories || 0} stories, ${counts.objectives || 0} objectives, ${counts.vocab || 0} vocab words.` });
        onDataImported?.();
      } catch { setStatus({ type: 'error', message: 'Invalid JSON file.' }); }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleScheduleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        let msg = '';
        if (Array.isArray(data.schedule)) {
          saveSchedule([...loadSchedule(), ...data.schedule]);
          msg += `${data.schedule.length} events. `;
        }
        if (Array.isArray(data.chores)) {
          saveChores([...loadChores(), ...data.chores]);
          msg += `${data.chores.length} chores.`;
        }
        if (!msg) { setStatus({ type: 'error', message: 'No schedule or chores found.' }); return; }
        setStatus({ type: 'success', message: `Schedule updated: ${msg} Reload to see changes.` });
        onDataImported?.();
      } catch { setStatus({ type: 'error', message: 'Invalid JSON file.' }); }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <section className="content-manager">
      <div className="content-section">
        <h4><Database size={17}/> Practice content</h4>
        <p className="muted">Upload questions, stories, vocab, and objectives. Each upload is logged below.</p>
        <div className="content-actions">
          <button className="btn-secondary" onClick={() => download(CONTENT_TEMPLATE, 'explorer-content-template.md')}><Download size={16}/> Download content template</button>
          <label className="btn-secondary upload-label"><Upload size={16}/> Upload content (.json)<input type="file" accept=".json" hidden onChange={handleContentUpload}/></label>
        </div>
      </div>

      <div className="content-section">
        <h4><FileText size={17}/> Schedule & chores</h4>
        <p className="muted">Update the weekly timetable and task list. No AI needed — just fill in the JSON.</p>
        <div className="content-actions">
          <button className="btn-secondary" onClick={() => download(SCHEDULE_TEMPLATE, 'explorer-schedule-template.md')}><Download size={16}/> Download schedule template</button>
          <label className="btn-secondary upload-label"><Upload size={16}/> Upload schedule (.json)<input type="file" accept=".json" hidden onChange={handleScheduleUpload}/></label>
        </div>
      </div>

      {status && <div className={`content-status ${status.type}`}><CheckCircle2 size={16}/><span>{status.message}</span></div>}

      <div className="content-section">
        <h4>📋 Upload history</h4>
        {log.length ? (
          <div className="content-log">
            {log.map(entry => (
              <div className="log-entry" key={entry.id}>
                <div className="log-meta">
                  <span className="log-date">{new Date(entry.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                  <span className="log-term">T{entry.term}W{entry.week}</span>
                </div>
                <div className="log-details">
                  <b>{entry.filename}</b>
                  <small>{(entry.fileSize / 1024).toFixed(1)} KB · {entry.subjects.join(', ')}</small>
                  <small>{entry.itemCounts.questions ? `${entry.itemCounts.questions} Q` : ''} {entry.itemCounts.stories ? `${entry.itemCounts.stories} stories` : ''} {entry.itemCounts.vocab ? `${entry.itemCounts.vocab} vocab` : ''} {entry.itemCounts.objectives ? `${entry.itemCounts.objectives} obj` : ''}</small>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="empty-state">No content uploaded yet. Use the templates above to get started.</p>}
      </div>
    </section>
  );
}
