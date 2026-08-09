import { useState, type ChangeEvent } from 'react';
import { CheckCircle2, Database, Download, FileText, Upload } from 'lucide-react';
import { loadSchedule, saveSchedule, loadChores, saveChores } from '../data/scheduleData';
import { addLogEntry, loadContentLog, type ContentUploadLog } from '../data/contentLog';
import { getCurrentTermInfo } from '../data/termCalendar';

interface Props { onDataImported?: () => void; }

function hasReviewedYoutubeVideo(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const video = value as { youtubeUrl?: unknown; parentReviewed?: unknown };
  if (video.parentReviewed !== true || typeof video.youtubeUrl !== 'string') return false;
  try {
    const url = new URL(video.youtubeUrl);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    const id = host === 'youtu.be' ? url.pathname.slice(1) : host === 'youtube.com' || host === 'm.youtube.com' ? url.searchParams.get('v') || (url.pathname.startsWith('/embed/') ? url.pathname.slice('/embed/'.length) : '') : '';
    return /^[A-Za-z0-9_-]{11}$/.test(id);
  } catch { return false; }
}

const CONTENT_TEMPLATE = `# Conquerer — Weekly Content Research & Import Template
# ======================================================
# This JSON imports learning content into Conquerer. First use Parent Zone → AI
# → “Create this week's CAPS content research brief” to get exact research
# queries. Verify every source and video before importing.
#
# Allocate estimated learning time across the complete pack as follows:
# - 60% core: current week's CAPS/ATP outcomes
# - 35% opportunity: evidence-led consolidation for skills the learner needs help with
# - 5% stretch: optional, creative, outside-the-box challenge only after core mastery
#
# Return ONLY valid JSON. Never invent a YouTube URL. A parent must review every
# video and set parentReviewed=true before it can embed in the child app.

## JSON Structure

\`\`\`json
{
  "weeklyResearchBrief": {
    "term": 3,
    "week": 1,
    "allocation": { "core": 60, "opportunity": 35, "stretch": 5 },
    "deepResearchQueries": [
      { "objective": "CAPS objective", "query": "exact curriculum research query", "allocation": "core" }
    ],
    "activityMix": ["multiple-choice", "missing-fields", "question-and-answer", "connecting-fields", "guided video practice"],
    "videoStandard": "Every imported practice question includes a reviewed teaching video or a parent-created one-to-two-minute visual-video brief that is produced, reviewed, and uploaded before import."
  },
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
      "themeTag": "drawing-observation",
      "contentAllocation": "core",
      "activityFormat": "multiple-choice",
      "acceptedAnswers": ["42"],
      "teachingVideo": {
        "provider": "youtube",
        "youtubeUrl": "https://www.youtube.com/watch?v=VERIFIED_VIDEO_ID",
        "youtubeSearchQuery": "Grade 3 South Africa addition carrying visual lesson",
        "title": "Parent-reviewed addition with carrying lesson",
        "durationMinutes": 4,
        "parentReviewed": true
      }
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
  "weeklyObjectives": ["Objective 1", "Objective 2", "Objective 3"],
  "vocab": [
    { "word": "sketch", "meaning": "a quick drawing", "language": "english", "example": "I made a sketch of the flower." }
  ]
}
\`\`\`

## Field Rules
- subject: "maths" | "english" | "afrikaans" | "robotics" | "vibing"
- gradeLevel: 3 or 4
- contentAllocation: "core" | "opportunity" | "stretch"; maintain the full-pack 60/35/5 balance by estimated learning time
- activityFormat: "multiple-choice" | "missing-fields" | "question-and-answer" | "connecting-fields". Use a varied mix across the pack.
- multiple-choice: provide options and correctIndex. missing-fields/question-and-answer: provide acceptedAnswers and an empty options array. connecting-fields: provide matchingPairs as objects with left and right strings and an empty options array.
- themeTag: short kebab-case tag matching the Life Skills theme (e.g. "colour-shape", "movement-dance")
- stories content: array of paragraphs (12-15 for a 20-min story)
- vocab language: "english" | "afrikaans" | "zulu" | "other"
- teachingVideo: required for each imported practice question. Use provider "youtube" only with a real, parent-reviewed YouTube URL. If no suitable YouTube lesson exists, use provider "parent-created", omit youtubeUrl, set parentReviewed=false, and supply a precise fallbackBrief for a one-to-two-minute child-safe cartoon, graphical, infographic, or Notebook-style visual lesson. Generate, review, and upload that fallback as an approved YouTube video before importing the practice question, because the learner must watch the lesson before practice unlocks.
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
          const unavailableLessons = data.practiceQuestions.filter((question: { teachingVideo?: unknown }) => !hasReviewedYoutubeVideo(question.teachingVideo));
          if (unavailableLessons.length) {
            setStatus({ type: 'error', message: `${unavailableLessons.length} practice question(s) need a valid, parent-reviewed YouTube lesson before import. Generate a one-to-two-minute fallback when needed, upload it as unlisted, review it, then retry.` });
            return;
          }
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
        let researchBriefImported = false;
        if (data.weeklyResearchBrief && typeof data.weeklyResearchBrief === 'object' && !Array.isArray(data.weeklyResearchBrief)) {
          localStorage.setItem('explorer_weekly_content_research_brief_v1', JSON.stringify(data.weeklyResearchBrief));
          researchBriefImported = true;
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

        const total = (counts.questions || 0) + (counts.stories || 0) + (counts.objectives || 0) + (counts.vocab || 0) + (researchBriefImported ? 1 : 0);
        if (total === 0) { setStatus({ type: 'error', message: 'No valid content or research brief found in file.' }); return; }

        const termInfo = getCurrentTermInfo();
        addLogEntry({ filename: file.name, fileSize: file.size, subjects: [...new Set(subjects)], itemCounts: counts, term: termInfo.term, week: termInfo.week });
        const researchBriefMessage = researchBriefImported ? ' Saved the weekly research brief.' : '';
        setStatus({ type: 'success', message: `Imported: ${counts.questions || 0} questions, ${counts.stories || 0} stories, ${counts.objectives || 0} objectives, ${counts.vocab || 0} vocab words.${researchBriefMessage}` });
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
