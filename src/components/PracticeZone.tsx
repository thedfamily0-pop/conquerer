import React, { useState } from 'react';
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

export const PracticeZone: React.FC<PracticeZoneProps> = ({ onEarnXp, soundEnabled }) => {
  const [activeSubject, setActiveSubject] = useState<'maths' | 'english' | 'afrikaans' | 'robotics' | 'vibing'>('maths');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);

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

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    const isCorrect = idx === currentQuestion.correctIndex;
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
      metadata: { skill: currentQuestion.skill },
    });

    if (isCorrect) {
      if (soundEnabled) playSound.success();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
      onEarnXp(currentQuestion.xpAward, `practice:${activeSubject}:${currentQuestion.id || currentQuestion.skill}:${currentQuestionIdx}`);
      if (soundEnabled) speakText(currentQuestion.explanation, undefined, { language: activeSubject === 'afrikaans' ? 'afrikaans' : 'english' });
    } else {
      if (soundEnabled) playSound.pop();
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setHintLevel(0);
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
                  setHintLevel(0);
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

          {/* Options Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            {currentQuestion.options.map((opt, idx) => {
              let btnBg = 'rgba(255, 255, 255, 0.06)';
              let btnBorder = 'rgba(255, 255, 255, 0.15)';
              let btnColor = '#f8fafc';

              if (isAnswered) {
                if (idx === currentQuestion.correctIndex) {
                  btnBg = 'rgba(20, 184, 166, 0.25)';
                  btnBorder = '#14b8a6';
                  btnColor = '#2dd4bf';
                } else if (idx === selectedOption) {
                  btnBg = 'rgba(239, 68, 68, 0.25)';
                  btnBorder = '#ef4444';
                  btnColor = '#fca5a5';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  style={{
                    background: btnBg,
                    border: `2px solid ${btnBorder}`,
                    borderRadius: '16px',
                    padding: '16px',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: btnColor,
                    cursor: isAnswered ? 'default' : 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>{opt}</span>
                  {isAnswered && idx === currentQuestion.correctIndex && (
                    <CheckCircle2 size={20} color="#2dd4bf" />
                  )}
                  {isAnswered && idx === selectedOption && idx !== currentQuestion.correctIndex && (
                    <XCircle size={20} color="#fca5a5" />
                  )}
                </button>
              );
            })}
          </div>

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
              background: selectedOption === currentQuestion.correctIndex ? 'rgba(20, 184, 166, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${selectedOption === currentQuestion.correctIndex ? 'rgba(20, 184, 166, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
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
