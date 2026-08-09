import { useState, useEffect } from 'react';
import { Code2, Rocket, CheckCircle2, Circle, Lightbulb, Trophy } from 'lucide-react';
import { VIBING_LESSONS, VIBING_PROJECTS } from '../data/vibingData';
import { getCurrentTermInfo } from '../data/termCalendar';
import type { VibingLesson, VibingProject } from '../data/vibingData';

interface Props {
  onEarnXp: (amount: number) => void;
}

interface VibingProgress {
  completedLessons: string[];
  completedMilestones: Record<string, number[]>; // projectId -> week[]
  lastActivity: string;
}

const STORAGE_KEY = 'explorer_vibing_progress_v1';

function loadProgress(): VibingProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as VibingProgress;
  } catch { /* empty */ }
  return { completedLessons: [], completedMilestones: {}, lastActivity: '' };
}

function saveProgress(progress: VibingProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function VibingZone({ onEarnXp }: Props) {
  const [progress, setProgress] = useState<VibingProgress>(loadProgress);
  const [showChallenge, setShowChallenge] = useState(false);

  useEffect(() => { saveProgress(progress); }, [progress]);

  const termInfo = getCurrentTermInfo();
  const currentTerm = termInfo.isHoliday ? 1 : termInfo.term;
  const currentWeek = termInfo.isHoliday ? 1 : termInfo.week;

  // Find this week's lesson
  const thisLesson: VibingLesson | undefined = VIBING_LESSONS.find(
    l => l.term === currentTerm && l.week === currentWeek
  ) || VIBING_LESSONS[0];

  // Find this term's project
  const thisProject: VibingProject | undefined = VIBING_PROJECTS.find(
    p => p.term === currentTerm
  ) || VIBING_PROJECTS[0];

  const isLessonDone = progress.completedLessons.includes(thisLesson.id);
  const projectMilestones = progress.completedMilestones[thisProject.id] || [];

  const completeLesson = () => {
    if (isLessonDone) return;
    const updated = { ...progress, completedLessons: [...progress.completedLessons, thisLesson.id], lastActivity: new Date().toISOString() };
    setProgress(updated);
    onEarnXp(thisLesson.xpReward);
  };

  const completeMilestone = (week: number) => {
    const current = progress.completedMilestones[thisProject.id] || [];
    if (current.includes(week)) return;
    const updated = { ...progress, completedMilestones: { ...progress.completedMilestones, [thisProject.id]: [...current, week] }, lastActivity: new Date().toISOString() };
    setProgress(updated);
    onEarnXp(10);
  };

  return (
    <div className="glass-card animate-pop" style={{ padding: '28px', marginBottom: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '10px', borderRadius: '16px' }}>
          <Code2 size={24} color="#818cf8" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.3rem', color: '#f8fafc' }}>Vibing Zone 💻</h2>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Learn to code, one week at a time</p>
        </div>
      </div>

      {/* This Week's Lesson */}
      <div style={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(129, 140, 248, 0.3)', borderRadius: '20px', padding: '22px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Week {thisLesson.week} · Term {thisLesson.term}
          </span>
          <span style={{ fontSize: '0.85rem', color: '#14b8a6', fontWeight: 700 }}>+{thisLesson.xpReward} XP</span>
        </div>
        <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', marginBottom: '8px' }}>{thisLesson.title}</h3>
        <p style={{ fontSize: '0.92rem', color: '#cbd5e1', marginBottom: '12px' }}>{thisLesson.objective}</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
          {thisLesson.concepts.map(c => (
            <span key={c} style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>{c}</span>
          ))}
        </div>

        <div style={{ background: 'rgba(251, 191, 36, 0.08)', borderLeft: '3px solid #fbbf24', padding: '12px 16px', borderRadius: '10px', marginBottom: '14px' }}>
          <h4 style={{ fontSize: '0.85rem', color: '#fef08a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><Lightbulb size={14} /> Activity</h4>
          <p style={{ fontSize: '0.9rem', color: '#f8fafc' }}>{thisLesson.activity}</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowChallenge(!showChallenge)}
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', border: 'none', borderRadius: '12px', padding: '10px 18px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}
          >
            <Rocket size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            {showChallenge ? 'Hide Challenge' : 'Try it!'}
          </button>
          {!isLessonDone && (
            <button
              onClick={completeLesson}
              style={{ background: 'rgba(20, 184, 166, 0.2)', color: '#2dd4bf', border: '2px solid rgba(20, 184, 166, 0.4)', borderRadius: '12px', padding: '10px 18px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}
            >
              <CheckCircle2 size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Mark Complete
            </button>
          )}
          {isLessonDone && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2dd4bf', fontSize: '0.9rem', fontWeight: 700 }}>
              <CheckCircle2 size={18} /> Completed!
            </span>
          )}
        </div>

        {showChallenge && (
          <div style={{ marginTop: '14px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '14px', padding: '16px' }}>
            <h4 style={{ fontSize: '0.9rem', color: '#a5b4fc', marginBottom: '8px' }}>🚀 Challenge Prompt</h4>
            <p style={{ fontSize: '0.9rem', color: '#f8fafc', lineHeight: 1.5 }}>{thisLesson.challengePrompt}</p>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '8px' }}>Copy this prompt and use it with your AI assistant (or Nomi) to try the challenge!</p>
          </div>
        )}
      </div>

      {/* Term Project */}
      <div style={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '20px', padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <Trophy size={20} color="#fbbf24" />
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#f8fafc' }}>Term {thisProject.term} Project: {thisProject.title}</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{thisProject.description}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {thisProject.milestones.map(m => {
            const isDone = projectMilestones.includes(m.week);
            return (
              <div key={m.week} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: isDone ? 'rgba(20, 184, 166, 0.08)' : 'rgba(255,255,255,0.03)', borderRadius: '12px', border: `1px solid ${isDone ? 'rgba(20, 184, 166, 0.3)' : 'rgba(255,255,255,0.06)'}` }}>
                <button
                  onClick={() => completeMilestone(m.week)}
                  disabled={isDone}
                  style={{ background: 'none', border: 'none', cursor: isDone ? 'default' : 'pointer', padding: 0, display: 'flex' }}
                  title={isDone ? 'Completed' : 'Mark as done'}
                >
                  {isDone ? <CheckCircle2 size={20} color="#2dd4bf" /> : <Circle size={20} color="#475569" />}
                </button>
                <div style={{ flex: 1 }}>
                  <b style={{ color: '#f8fafc', fontSize: '0.9rem' }}>Week {m.week}: {m.title}</b>
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>{m.deliverable}</p>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>+10 XP</span>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '14px', padding: '10px 14px', background: 'rgba(251, 191, 36, 0.08)', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.82rem', color: '#fef08a', margin: 0 }}>
            🎯 Final deliverable: {thisProject.finalDeliverable}
          </p>
        </div>
      </div>
    </div>
  );
}
