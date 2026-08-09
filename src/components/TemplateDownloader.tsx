import { useState, type ChangeEvent } from 'react';
import { Download, Upload, CheckCircle2 } from 'lucide-react';
import { loadSchedule, saveSchedule, loadChores, saveChores } from '../data/scheduleData';
import { getCurrentTermInfo } from '../data/termCalendar';
import { getATPWeek } from '../data/term4ATP';

interface TemplateDownloaderProps {
  onDataImported?: () => void;
}

function buildTemplateContent(): string {
  const termInfo = getCurrentTermInfo();
  const atpEntries = termInfo.term === 4 ? getATPWeek(termInfo.week) : [];

  const atpSection = atpEntries.length > 0 ? `
## 📚 THIS WEEK'S CAPS CURRICULUM OBJECTIVES (Term ${termInfo.term}, Week ${termInfo.week})
## USE THESE to align all generated content to the curriculum!

${atpEntries.map(entry => `### ${entry.subject} — ${entry.topic}
**CAPS Content Area:** ${entry.capsContentArea}
**Learning Outcomes:**
${entry.learningOutcomes.map(lo => `- ${lo}`).join('\n')}
**Suggested Activities:**
${entry.activities.map(a => `- ${a}`).join('\n')}
**Assessment Focus:** ${entry.assessmentFocus || 'Continuous assessment'}
`).join('\n')}
---
` : '';

  return `# Conquerer Learning App — Content Template for LLM
# =====================================================
# INSTRUCTIONS FOR THE LLM:
# Generate content in STRICT JSON format matching the structures below.
# Return ONLY a JSON object with the keys you want to update.
# The parent will paste your response into a .json file and upload it to the app.
#
# IMPORTANT: All content MUST align with the CAPS curriculum objectives listed below.
# Every practice question, story, and activity should reinforce the learning outcomes
# for the current week of the Annual Teaching Plan (ATP).
#
# ⚠️ CRITICAL — THEMATIC CONTENT APPROACH:
# The Life Skills weekly theme is the CREATIVE LENS for ALL subjects.
# ALL content you generate MUST be flavoured by the current week's theme.
#
# Example: If the theme is "Drawing & Observation":
#   - Maths: "You drew 5 apples in your still life. You eat 2. How many are left in the picture?"
#   - English: Vocabulary about art (sketch, shade, outline, perspective)
#   - Afrikaans: Art-related words (teken = draw, verf = paint, kleur = colour)
#   - Stories: Characters who are artists or observing nature
#   - Robotics: Programming a drawing robot, pixel art
#   - Vibing: Designing a drawing app feature
#
# This makes learning feel cohesive, creative, and fun for the child.
# =====================================================
${atpSection}
## Required JSON Structure

\`\`\`json
{
  "schedule": [
    {
      "id": "unique_string",
      "dayOfWeek": 1,
      "time": "07:30",
      "title": "Activity Title",
      "emoji": "📚",
      "color": "#3b82f6",
      "reminderMinutes": 15,
      "notifyEmail": false
    }
  ],
  "chores": [
    {
      "id": "unique_string",
      "title": "Chore description",
      "emoji": "🧹",
      "isCompleted": false,
      "xpReward": 10,
      "addedBy": "Dad",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "reading": [
    {
      "title": "Story Title",
      "emoji": "📖",
      "content": [
        "Paragraph 1 of the story.",
        "Paragraph 2 of the story.",
        "Paragraph 3 of the story."
      ],
      "quizQuestions": [
        {
          "question": "Comprehension question?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctIndex": 0,
          "explanation": "Why this answer is correct."
        }
      ]
    }
  ],
  "weeklyObjectives": [
    "Objective 1: What the learner should achieve",
    "Objective 2: Another learning goal",
    "Objective 3: A third goal for the week"
  ],
  "practiceQuestions": [
    {
      "id": "custom_q1",
      "gradeLevel": 3,
      "subject": "maths",
      "title": "Question Title 🔢",
      "question": "What is 25 + 17?",
      "options": ["42", "52", "32", "43"],
      "correctIndex": 0,
      "hints": ["Add the ones first: 5 + 7 = 12", "Carry the 1 to the tens: 2 + 1 + 1 = 4"],
      "explanation": "25 + 17 = 42. Well done!",
      "xpAward": 20,
      "skill": "Addition with carrying"
    }
  ]
}
\`\`\`

## Field Rules

### Schedule
- dayOfWeek: 0=Sunday, 1=Monday, ... 6=Saturday
- time: 24-hour format "HH:MM"
- color: hex colour string (e.g. "#f59e0b")
- reminderMinutes: how many minutes before to alert (5, 10, 15, 30)
- notifyEmail: true to email parents when reminder fires

### Chores
- xpReward: typically 5-20 XP
- addedBy: "Dad" or "Mom"
- isCompleted: always false for new chores

### Reading
- content: array of paragraph strings (15-20 paragraphs, age-appropriate for Grade 3)
- quizQuestions: 3-4 comprehension questions per story
- correctIndex: 0-based index of the correct option
- MUST align with this week's English HL or Life Skills CAPS topics

### Practice Questions
- gradeLevel: 3 or 4
- subject: "maths" | "english" | "afrikaans" | "robotics" | "vibing"
- hints: array of 2-3 progressive hints (Socratic — guide, don't give answers)
- xpAward: typically 15-30 XP
- MUST align with the CAPS learning outcomes listed above for the current week

### Weekly Objectives
- Array of 3-5 strings describing this week's learning goals
- Pull directly from the CAPS learning outcomes above

## Example Prompt to Give an LLM

"Using the CAPS curriculum objectives in this template, generate a full week of content
for my Grade 3 child's Conquerer learning app. Include:
- 5 practice questions per subject (maths, english, afrikaans) aligned to this week's ATP topics
- 2 short reading stories (15 paragraphs each) with 3 quiz questions each, linked to the English HL topic
- 5 chores that reinforce this week's Life Skills objectives
- Weekly objectives pulled from the ATP learning outcomes
Return as JSON matching the template format exactly."
`;
}

export function TemplateDownloader({ onDataImported }: TemplateDownloaderProps) {
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');

  const handleDownloadTemplate = () => {
    const blob = new Blob([buildTemplateContent()], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `explorer-content-template-week${getCurrentTermInfo().week}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        let imported = 0;

        // Import schedule items
        if (Array.isArray(data.schedule) && data.schedule.length > 0) {
          const currentSchedule = loadSchedule();
          const newSchedule = [...currentSchedule, ...data.schedule];
          saveSchedule(newSchedule);
          imported++;
        }

        // Import chores
        if (Array.isArray(data.chores) && data.chores.length > 0) {
          const currentChores = loadChores();
          const newChores = [...currentChores, ...data.chores];
          saveChores(newChores);
          imported++;
        }

        // Import reading content (store in localStorage)
        if (Array.isArray(data.reading) && data.reading.length > 0) {
          const key = 'explorer_custom_reading_v1';
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          localStorage.setItem(key, JSON.stringify([...existing, ...data.reading]));
          imported++;
        }

        // Import weekly objectives
        if (Array.isArray(data.weeklyObjectives) && data.weeklyObjectives.length > 0) {
          localStorage.setItem('explorer_weekly_objectives_v1', JSON.stringify(data.weeklyObjectives));
          imported++;
        }

        // Import practice questions
        if (Array.isArray(data.practiceQuestions) && data.practiceQuestions.length > 0) {
          const key = 'explorer_custom_practice_v1';
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          localStorage.setItem(key, JSON.stringify([...existing, ...data.practiceQuestions]));
          imported++;
        }

        if (imported > 0) {
          setImportStatus('success');
          setImportMessage(`Imported ${imported} section${imported > 1 ? 's' : ''} successfully! Reload the app to see changes.`);
          onDataImported?.();
        } else {
          setImportStatus('error');
          setImportMessage('No valid data sections found in the file.');
        }
      } catch {
        setImportStatus('error');
        setImportMessage('Could not parse file. Make sure it is valid JSON.');
      }
    };
    reader.readAsText(file);

    // Reset file input
    event.target.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: '14px', padding: '16px' }}>
        <h4 style={{ color: '#a5b4fc', margin: '0 0 8px', fontSize: '0.95rem' }}>📥 Content Template</h4>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 12px' }}>
          Download a markdown template with formatting instructions. Send it to any LLM (ChatGPT, Claude, etc.) to generate schedule, chores, stories, and practice content for the app.
        </p>
        <button
          onClick={handleDownloadTemplate}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Download size={16} />
          <span>Download Template</span>
        </button>
      </div>

      <div style={{ background: 'rgba(20, 184, 166, 0.08)', border: '1px solid rgba(20, 184, 166, 0.25)', borderRadius: '14px', padding: '16px' }}>
        <h4 style={{ color: '#2dd4bf', margin: '0 0 8px', fontSize: '0.95rem' }}>📤 Upload Content</h4>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 12px' }}>
          Upload a .json file generated by an LLM using the template. It will merge new content into the app.
        </p>
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(20, 184, 166, 0.15)',
            border: '1px solid rgba(20, 184, 166, 0.4)',
            borderRadius: '12px',
            padding: '10px 16px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: '#2dd4bf',
            transition: 'all 0.2s ease',
          }}
        >
          <Upload size={16} />
          <span>Upload .json File</span>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </label>

        {importStatus !== 'idle' && (
          <div style={{
            marginTop: '12px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: importStatus === 'success' ? 'rgba(20, 184, 166, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${importStatus === 'success' ? 'rgba(20, 184, 166, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            color: importStatus === 'success' ? '#2dd4bf' : '#fca5a5',
          }}>
            {importStatus === 'success' && <CheckCircle2 size={16} />}
            <span>{importMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
