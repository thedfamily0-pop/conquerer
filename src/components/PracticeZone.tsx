import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Target, HelpCircle, CheckCircle2, XCircle, RotateCcw, Volume2, Award, BookOpen } from 'lucide-react';
import { PRACTICE_BANK } from '../data/curriculumData';
import type { PracticeQuestion } from '../data/curriculumData';
import { playSound, speakText } from '../services/audioService';
import { getCurrentTermInfo } from '../data/termCalendar';
import { getATPBySubject } from '../data/term4ATP';
import { recordPerformanceEvent } from '../services/performanceData';

interface PracticeZoneProps {
  onEarnXp: (amount: number, activityKey?: string) => void;
  soundEnabled: boolean;
}

function getReviewedYoutubeLesson(video: PracticeQuestion['teachingVideo']): { embedUrl: string; playerId: string } | null {
  if (!video?.parentReviewed || !video.youtubeUrl) return null;
  try {
    const url = new URL(video.youtubeUrl);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    const videoId = host === 'youtu.be'
      ? url.pathname.slice(1)
      : host === 'youtube.com' || host === 'm.youtube.com'
        ? url.searchParams.get('v') || (url.pathname.startsWith('/embed/') ? url.pathname.slice('/embed/'.length) : '')
        : '';
    if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) return null;
    const playerId = `lesson-${videoId}`;
    const origin = typeof window === 'undefined' ? '' : `&origin=${encodeURIComponent(window.location.origin)}`;
    return { playerId, embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&rel=0${origin}` };
  } catch { return null; }
}
function lessonCompletionKey(question: PracticeQuestion, playerId: string): string {
  return `explorer_lesson_complete_v1:${question.id || question.skill}:${playerId}`;
}

export const PracticeZone: React.FC<PracticeZoneProps> = ({ onEarnXp, soundEnabled }) => {
  const [activeSubject, setActiveSubject] = useState<'maths' | 'english' | 'afrikaans' | 'robotics' | 'vibing'>('maths');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [answerCorrect, setAnswerCorrect] = useState<boolean | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [freeResponse, setFreeResponse] = useState('');
  const [matchingAnswers, setMatchingAnswers] = useState<Record<string, string>>({});

  // ATP curriculum focus for current week
  const termInfo = getCurrentTermInfo();
  const atpSubjectMap: Record<string, string> = { maths: 'Mathematics', english: 'English Home Language', afrikaans: 'Afrikaans FAL', robotics: 'Coding & Robotics', vibing: 'Coding & Robotics' };
  const currentATPEntries = termInfo.term === 4 ? getATPBySubject(atpSubjectMap[activeSubject] || '') : [];
  const currentWeekATP = currentATPEntries.find(e => e.week === termInfo.week);

  // Also load parent-uploaded custom questions from localStorage
  const customQuestions: PracticeQuestion[] = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem('explorer_custom_practice_v1') || '[]'); } catch { return []; }
  }, []);

  const allQuestions = [...PRACTICE_BANK, ...customQuestions];
  const filteredQuestions = allQuestions.filter(q => q.subject === activeSubject);
  const currentQuestion: PracticeQuestion = filteredQuestions[currentQuestionIdx % filteredQuestions.length];
  const reviewedLesson = getReviewedYoutubeLesson(currentQuestion?.teachingVideo);
  const lessonPlayerId = reviewedLesson?.playerId;
  const lessonKey = reviewedLesson ? lessonCompletionKey(currentQuestion, reviewedLesson.playerId) : null;
  const [lessonComplete, setLessonComplete] = useState(false);
  const lessonUnavailable = Boolean(currentQuestion?.teachingVideo) && !reviewedLesson;
  const lessonLocked = Boolean(reviewedLesson && !lessonComplete) || lessonUnavailable;

  useEffect(() => {
    if (!lessonKey) { setLessonComplete(false); return; }
    try { setLessonComplete(localStorage.getItem(lessonKey) === 'complete'); } catch { setLessonComplete(false); }
  }, [lessonKey]);

  useEffect(() => {
    if (!lessonPlayerId || !lessonKey) return;
    const markComplete = () => {
      try { localStorage.setItem(lessonKey, 'complete'); } catch { /* The current session still unlocks practice. */ }
      setLessonComplete(true);
    };
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com' && event.origin !== 'https://www.youtube-nocookie.com') return;
      let message: unknown = event.data;
      try { if (typeof message === 'string') message = JSON.parse(message); } catch { return; }
      if (message && typeof message === 'object' && (message as { event?: unknown }).event === 'onStateChange' && Number((message as { info?: unknown }).info) === 0) markComplete();
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [lessonKey, lessonPlayerId]);

  const completeAnswer = (isCorrect: boolean, optionIndex: number | null = null, answer?: string) => {
    if (isAnswered) return;
    setSelectedOption(optionIndex);
    setIsAnswered(true);
    setAnswerCorrect(isCorrect);
    recordPerformanceEvent({
      activity: 'practice',
      term: termInfo.term,
      week: termInfo.week,
      subject: atpSubjectMap[activeSubject] || activeSubject,
      contentId: String(currentQuestion.id || currentQuestion.skill),
      questionId: String(currentQuestion.id || currentQuestion.skill),
      correct: isCorrect,
      score: isCorrect ? 1 : 0,
      total: 1,
      hintsShown: hintLevel,
      xpEarned: isCorrect ? currentQuestion.xpAward : 0,
      answer: answer?.slice(0, 1000),
      metadata: { skill: currentQuestion.skill, activityFormat: currentQuestion.activityFormat || 'multiple-choice' },
    });
    if (isCorrect) {
      if (soundEnabled) playSound.success();
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      onEarnXp(currentQuestion.xpAward, `practice:${activeSubject}:${currentQuestion.id || currentQuestion.skill}:${currentQuestionIdx}`);
      if (soundEnabled) speakText(currentQuestion.explanation, undefined, { language: activeSubject === 'afrikaans' ? 'afrikaans' : 'english' });
    } else if (soundEnabled) playSound.pop();
  };

  const handleSelectOption = (idx: number) => completeAnswer(idx === currentQuestion.correctIndex, idx, currentQuestion.options[idx]);

  const handleFreeResponse = () => {
    const response = freeResponse.trim().toLocaleLowerCase();
    const accepted = (currentQuestion.acceptedAnswers || []).map(answer => answer.trim().toLocaleLowerCase());
    completeAnswer(Boolean(response && accepted.includes(response)), null, freeResponse.trim());
  };

  const handleMatchingSubmit = () => {
    const pairs = currentQuestion.matchingPairs || [];
    const isCorrect = pairs.length > 0 && pairs.every(pair => matchingAnswers[pair.left]?.trim().toLocaleLowerCase() === pair.right.trim().toLocaleLowerCase());
    completeAnswer(isCorrect, null, pairs.map(pair => `${pair.left} → ${matchingAnswers[pair.left] || ''}`).join('; '));
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setAnswerCorrect(null);
    setHintLevel(0);
    setFreeResponse('');
    setMatchingAnswers({});
    setCurrentQuestionIdx(prev => prev + 1);
    if (soundEnabled) playSound.pop();
  };

  const handleShowHint = () => {
    if (hintLevel < currentQuestion.hints.length) {
      setHintLevel(prev => prev + 1);
      if (soundEnabled) playSound.pop();
    }
  };

  return (
    <div className="glass-card animate-pop" style={{ padding: '28px', marginBottom: '32px' }}>
      
      {/* Header & Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(168, 85, 247, 0.2)', padding: '10px', borderRadius: '16px' }}>
            <Target size={24} color="#a855f7" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', color: '#f8fafc' }}>CAPS Practice Zone</h2>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Grade 3 Curriculum Challenges</p>
          </div>
        </div>

        {/* Subject Selector Tabs */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(15, 23, 42, 0.6)', padding: '6px', borderRadius: '16px', flexWrap: 'wrap' }}>
          {(['maths', 'english', 'afrikaans', 'robotics', 'vibing'] as const).map(sub => {
            const isActive = activeSubject === sub;
            const labels = { maths: 'Maths 🔢', english: 'English 🇬🇧', afrikaans: 'Afrikaans 🇿🇦', robotics: 'Robotics 🤖', vibing: 'Vibing 💻' };
            return (
              <button
                key={sub}
                onClick={() => {
                  setActiveSubject(sub);
                  setCurrentQuestionIdx(0);
                  setSelectedOption(null);
                  setIsAnswered(false);
                  setAnswerCorrect(null);
                  setHintLevel(0);
                  setFreeResponse('');
                  setMatchingAnswers({});
                  if (soundEnabled) playSound.pop();
                }}
                style={{
                  background: isActive ? 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' : 'transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '8px 14px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {labels[sub]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ATP Week Focus Banner */}
      {currentWeekATP && (
        <div style={{ background: 'rgba(20, 184, 166, 0.08)', border: '1px solid rgba(20, 184, 166, 0.25)', borderRadius: '14px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <BookOpen size={18} color="#2dd4bf" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '0.82rem', color: '#2dd4bf', fontWeight: 700, margin: '0 0 2px' }}>CAPS Week {termInfo.week} Focus: {currentWeekATP.topic}</p>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>{currentWeekATP.learningOutcomes[0]}</p>
          </div>
        </div>
      )}

      {/* Question Card */}
      {currentQuestion && (
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.8)', 
          border: '1px solid var(--card-border)', 
          borderRadius: '20px', 
          padding: '24px' 
        }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Skill: {currentQuestion.skill}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#14b8a6', fontSize: '0.85rem', fontWeight: 700 }}>
              <Award size={16} />
              <span>+{currentQuestion.xpAward} XP</span>
            </div>
          </div>

          <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', marginBottom: '18px', lineHeight: '1.4' }}>
            {currentQuestion.question}
          </h3>

          {reviewedLesson && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ color: '#a5b4fc', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>▶ Lesson first: {currentQuestion.teachingVideo?.title}</p>
              <iframe
                src={reviewedLesson.embedUrl}
                title={currentQuestion.teachingVideo?.title || 'Teaching lesson'}
                width="100%"
                height="220"
                loading="lazy"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                onLoad={event => {
                  const player = event.currentTarget.contentWindow;
                  player?.postMessage(JSON.stringify({ event: 'listening', id: reviewedLesson.playerId }), 'https://www.youtube-nocookie.com');
                  player?.postMessage(JSON.stringify({ event: 'command', func: 'addEventListener', args: ['onStateChange'], id: reviewedLesson.playerId }), 'https://www.youtube-nocookie.com');
                }}
                style={{ border: 0, borderRadius: '14px', background: '#0f172a' }}
              />
              {!lessonComplete && <p style={{ color: '#c4b5fd', fontSize: '0.82rem', marginTop: '8px' }}>Finish the lesson to unlock this practice activity.</p>}
            </div>
          )}
          {lessonUnavailable && (
            <p style={{ color: '#fbbf24', fontSize: '0.85rem', marginBottom: '20px' }}>This activity is waiting for a parent-reviewed lesson video. A parent can create the approved one-to-two-minute fallback lesson, upload it as an unlisted YouTube video, review it, and then import the activity.</p>
          )}

          {/* Answer Activity */}
          {lessonLocked ? (
            <div style={{ border: '1px solid rgba(196,181,253,0.35)', background: 'rgba(124,58,237,0.12)', borderRadius: '14px', padding: '16px', marginBottom: '20px' }}>
              <strong style={{ color: '#ddd6fe' }}>Lesson required before practice</strong>
              <p style={{ color: '#cbd5e1', fontSize: '0.88rem', margin: '8px 0 0' }}>{lessonUnavailable ? 'This uploaded activity cannot unlock until its parent-reviewed lesson video is available.' : 'Practice unlocks automatically when the reviewed teaching video finishes.'}</p>
            </div>
          ) : currentQuestion.activityFormat === 'connecting-fields' ? (
            <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
              {(currentQuestion.matchingPairs || []).map(pair => (
                <label key={pair.left} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(140px, 1fr)', gap: '12px', alignItems: 'center', color: '#f8fafc' }}>
                  <span>{pair.left}</span>
                  <select value={matchingAnswers[pair.left] || ''} disabled={isAnswered} onChange={event => setMatchingAnswers(current => ({ ...current, [pair.left]: event.target.value }))} style={{ borderRadius: '10px', padding: '10px', border: '1px solid rgba(255,255,255,0.2)', background: '#0f172a', color: '#f8fafc' }}>
                    <option value="">Choose the matching answer</option>
                    {(currentQuestion.matchingPairs || []).map(option => <option key={option.right} value={option.right}>{option.right}</option>)}
                  </select>
                </label>
              ))}
              <button className="btn-primary" onClick={handleMatchingSubmit} disabled={isAnswered || !(currentQuestion.matchingPairs || []).length}>Check connections</button>
            </div>
          ) : currentQuestion.activityFormat === 'missing-fields' || currentQuestion.activityFormat === 'question-and-answer' ? (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <input value={freeResponse} disabled={isAnswered} onChange={event => setFreeResponse(event.target.value)} onKeyDown={event => event.key === 'Enter' && handleFreeResponse()} placeholder={currentQuestion.activityFormat === 'missing-fields' ? 'Fill in the missing word or number' : 'Write your answer'} style={{ flex: '1 1 240px', borderRadius: '12px', padding: '13px', border: '1px solid rgba(255,255,255,0.2)', background: '#0f172a', color: '#f8fafc' }} />
              <button className="btn-primary" onClick={handleFreeResponse} disabled={isAnswered || !freeResponse.trim()}>Check answer</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              {currentQuestion.options.map((opt, idx) => {
                let btnBg = 'rgba(255, 255, 255, 0.06)';
                let btnBorder = 'rgba(255, 255, 255, 0.15)';
                let btnColor = '#f8fafc';
                if (isAnswered) {
                  if (idx === currentQuestion.correctIndex) { btnBg = 'rgba(20, 184, 166, 0.25)'; btnBorder = '#14b8a6'; btnColor = '#2dd4bf'; }
                  else if (idx === selectedOption) { btnBg = 'rgba(239, 68, 68, 0.25)'; btnBorder = '#ef4444'; btnColor = '#fca5a5'; }
                }
                return <button key={idx} onClick={() => handleSelectOption(idx)} disabled={isAnswered} style={{ background: btnBg, border: `2px solid ${btnBorder}`, borderRadius: '16px', padding: '16px', fontSize: '1.05rem', fontWeight: 700, color: btnColor, cursor: isAnswered ? 'default' : 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s ease' }}>
                  <span>{opt}</span>
                  {isAnswered && idx === currentQuestion.correctIndex && <CheckCircle2 size={20} color="#2dd4bf" />}
                  {isAnswered && idx === selectedOption && idx !== currentQuestion.correctIndex && <XCircle size={20} color="#fca5a5" />}
                </button>;
              })}
            </div>
          )}

          {/* Hints Section */}
          {hintLevel > 0 && (
            <div style={{ 
              background: 'rgba(251, 191, 36, 0.12)', 
              borderLeft: '4px solid #fbbf24', 
              padding: '14px 18px', 
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <h4 style={{ fontSize: '0.9rem', color: '#fef08a', marginBottom: '4px' }}>
                💡 Hint {hintLevel} of {currentQuestion.hints.length}:
              </h4>
              <p style={{ fontSize: '0.92rem', color: '#f8fafc' }}>
                {currentQuestion.hints[hintLevel - 1]}
              </p>
            </div>
          )}

          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            
            <button
              onClick={handleShowHint}
              disabled={hintLevel >= currentQuestion.hints.length || isAnswered}
              className="btn-secondary"
              style={{ opacity: hintLevel >= currentQuestion.hints.length || isAnswered ? 0.5 : 1 }}
            >
              <HelpCircle size={16} color="#fbbf24" />
              <span>{hintLevel >= currentQuestion.hints.length ? 'All Hints Used' : '🤔 Need a Hint'}</span>
            </button>

            {isAnswered && (
              <button onClick={handleNextQuestion} className="btn-primary">
                <span>Next Question</span>
                <RotateCcw size={18} />
              </button>
            )}

          </div>

          {/* Explanation Banner */}
          {isAnswered && (
            <div style={{ 
              marginTop: '20px', 
              padding: '16px', 
              borderRadius: '14px', 
              background: answerCorrect ? 'rgba(20, 184, 166, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${answerCorrect ? 'rgba(20, 184, 166, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <p style={{ color: '#f8fafc', fontSize: '0.95rem' }}>
                {currentQuestion.explanation}
              </p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                <button 
                  onClick={() => speakText(currentQuestion.explanation, undefined, { language: activeSubject === 'afrikaans' ? 'afrikaans' : 'english' })}
                  className="btn-secondary" 
                  aria-label="Read explanation aloud"
                  title="Read explanation aloud"
                  style={{ padding: '6px 10px' }}
                >
                  <Volume2 size={16} color="#fbbf24" />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
