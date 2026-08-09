import { useState, type FC } from 'react';
import confetti from 'canvas-confetti';
import { BookOpen, Volume2, Square, CheckCircle2, Sparkles, Calendar } from 'lucide-react';
import { STORIES_BANK } from '../data/curriculumData';
import type { ReadingStory } from '../data/curriculumData';
import { speakText, stopSpeech, playSound } from '../services/audioService';
import { getCurrentTermInfo } from '../data/termCalendar';
import { recordPerformanceEvent } from '../services/performanceData';

interface ReadingCompanionProps {
  onEarnXp: (amount: number) => void;
  soundEnabled: boolean;
}

export const ReadingCompanion: FC<ReadingCompanionProps> = ({ onEarnXp, soundEnabled }) => {
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const dayOfWeek = new Date().getDay(); // 0=Sun, 1=Mon...6=Sat
  const defaultStoryIdx = (dayOfWeek >= 3 && dayOfWeek <= 4) ? 1 : 0; // Wed+Thu = story 2
  const [selectedStoryIdx, setSelectedStoryIdx] = useState<number>(defaultStoryIdx);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentParagraphIdx, setCurrentParagraphIdx] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const termInfo = getCurrentTermInfo();

  // Filter 2 stories for selected week
  const weekStories = STORIES_BANK.filter(s => s.weekNumber === selectedWeek);
  const currentStory: ReadingStory = weekStories[selectedStoryIdx] || weekStories[0] || STORIES_BANK[0];
  const quizQuestionsList = currentStory.quizQuestions || currentStory.day1Questions || [];

  const handleReadOutLoud = () => {
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
      setCurrentParagraphIdx(null);
      return;
    }

    setIsPlayingAudio(true);
    let idx = 0;

    const readNext = () => {
      if (idx < currentStory.content.length) {
        setCurrentParagraphIdx(idx);
        speakText(currentStory.content[idx], () => {
          idx++;
          readNext();
        });
      } else {
        setIsPlayingAudio(false);
        setCurrentParagraphIdx(null);
      }
    };

    readNext();
  };

  const handleSelectQuizOption = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
    if (soundEnabled) playSound.pop();
  };

  const handleSubmitQuiz = () => {
    if (Object.keys(quizAnswers).length < quizQuestionsList.length) return;
    setQuizSubmitted(true);

    let correctCount = 0;
    quizQuestionsList.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const xpEarned = correctCount * 15 + 20;
    recordPerformanceEvent({
      activity: 'reading',
      term: termInfo.term,
      week: selectedWeek,
      subject: 'English Home Language',
      contentId: currentStory.id,
      correct: correctCount === quizQuestionsList.length,
      score: correctCount,
      total: quizQuestionsList.length,
      hintsShown: 0,
      xpEarned,
      metadata: { storyTitle: currentStory.title },
    });
    onEarnXp(xpEarned);

    if (soundEnabled) {
      playSound.success();
      confetti({ particleCount: 70, spread: 50, origin: { y: 0.7 } });
    }
  };

  const handleSwitchStory = (storyIndex: number) => {
    stopSpeech();
    setIsPlayingAudio(false);
    setCurrentParagraphIdx(null);
    setSelectedStoryIdx(storyIndex);
    setQuizAnswers({});
    setQuizSubmitted(false);
    if (soundEnabled) playSound.pop();
  };

  const handleSwitchWeek = (week: number) => {
    stopSpeech();
    setIsPlayingAudio(false);
    setCurrentParagraphIdx(null);
    setSelectedWeek(week);
    setSelectedStoryIdx(0);
    setQuizAnswers({});
    setQuizSubmitted(false);
    if (soundEnabled) playSound.pop();
  };

  return (
    <div className="glass-card animate-pop" style={{ padding: '28px', marginBottom: '32px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(20, 184, 166, 0.2)', padding: '10px', borderRadius: '16px' }}>
            <BookOpen size={24} color="#14b8a6" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', color: '#f8fafc' }}>Reading Companion (6-Week Term Bank)</h2>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Explore 12 curated story adventures with audio narration!</p>
          </div>
        </div>

        {/* Audio Reader Toggle */}
        <button 
          onClick={handleReadOutLoud} 
          className="btn-primary"
          style={{ 
            background: isPlayingAudio 
              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
              : 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
            color: '#ffffff'
          }}
        >
          {isPlayingAudio ? (
            <>
              <Square size={18} />
              <span>Pause Audio</span>
            </>
          ) : (
            <>
              <Volume2 size={18} />
              <span>Listen Out Loud</span>
            </>
          )}
        </button>
      </div>

      {/* 6-Week Selector Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>
          <Calendar size={16} />
          <span>Term Week:</span>
        </div>

        {[1, 2, 3, 4, 5, 6].map(w => (
          <button
            key={w}
            onClick={() => handleSwitchWeek(w)}
            style={{
              background: selectedWeek === w ? 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' : 'rgba(255, 255, 255, 0.05)',
              color: selectedWeek === w ? '#ffffff' : '#94a3b8',
              border: `1px solid ${selectedWeek === w ? '#14b8a6' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '12px',
              padding: '6px 14px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.2s ease'
            }}
          >
            Week {w}
          </button>
        ))}
      </div>

      {/* Day-locked progression: Story 1 = Mon+Tue, Story 2 = Wed+Thu, both = Fri-Sun */}
      {dayOfWeek >= 1 && dayOfWeek <= 4 && (
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '10px', textAlign: 'center' }}>
          {dayOfWeek <= 2 ? '📖 Story 1 is unlocked today (Mon–Tue). Story 2 opens Wednesday!' : '📖 Story 2 is unlocked today (Wed–Thu). Story 1 was earlier this week.'}
        </p>
      )}
      {/* Story 1 vs Story 2 Sub-Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {weekStories.map((st, sIdx) => (
          <button
            key={st.id}
            onClick={() => handleSwitchStory(sIdx)}
            style={{
              flex: 1,
              background: selectedStoryIdx === sIdx ? 'rgba(251, 191, 36, 0.2)' : 'rgba(15, 23, 42, 0.6)',
              border: `2px solid ${selectedStoryIdx === sIdx ? '#fbbf24' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '14px',
              padding: '12px',
              color: selectedStoryIdx === sIdx ? '#fbbf24' : '#cbd5e1',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            {st.emoji} Story {sIdx + 1}: {st.title}
          </button>
        ))}
      </div>

      {/* Active Story Card */}
      {currentStory && (
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.8)', 
          border: '1px solid var(--card-border)', 
          borderRadius: '20px', 
          padding: '24px',
          marginBottom: '24px' 
        }}>
          <h3 style={{ fontSize: '1.3rem', color: '#fbbf24', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>{currentStory.emoji}</span>
            <span>{currentStory.title}</span>
          </h3>

          {/* Paragraphs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {currentStory.content.map((paragraph, idx) => {
              const isHighlight = currentParagraphIdx === idx;
              return (
                <p
                  key={idx}
                  style={{
                    fontSize: '1.05rem',
                    lineHeight: '1.6',
                    color: isHighlight ? '#fef08a' : '#cbd5e1',
                    background: isHighlight ? 'rgba(251, 191, 36, 0.15)' : 'transparent',
                    padding: isHighlight ? '10px 14px' : '0px',
                    borderRadius: '10px',
                    borderLeft: isHighlight ? '4px solid #fbbf24' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>
      )}

      {/* Comprehension Quiz */}
      {currentStory && (
        <div style={{ 
          background: 'rgba(15, 23, 42, 0.6)', 
          border: '1px solid var(--card-border)', 
          borderRadius: '20px', 
          padding: '24px' 
        }}>
          <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#fbbf24" />
            <span>Story Comprehension Quiz</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {quizQuestionsList.map((q, qIdx) => (
              <div key={qIdx} style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '16px', borderRadius: '14px' }}>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '10px' }}>
                  {qIdx + 1}. {q.question}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                  {q.options.map((opt, optIdx) => {
                    const isSelected = quizAnswers[qIdx] === optIdx;
                    let bg = 'rgba(255, 255, 255, 0.05)';
                    let border = 'rgba(255, 255, 255, 0.12)';

                    if (quizSubmitted) {
                      if (optIdx === q.correctIndex) {
                        bg = 'rgba(20, 184, 166, 0.25)';
                        border = '#14b8a6';
                      } else if (isSelected) {
                        bg = 'rgba(239, 68, 68, 0.25)';
                        border = '#ef4444';
                      }
                    } else if (isSelected) {
                      bg = 'rgba(251, 191, 36, 0.2)';
                      border = '#fbbf24';
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                        disabled={quizSubmitted}
                        style={{
                          background: bg,
                          border: `1px solid ${border}`,
                          borderRadius: '10px',
                          padding: '10px 14px',
                          fontSize: '0.9rem',
                          color: '#f8fafc',
                          cursor: quizSubmitted ? 'default' : 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {!quizSubmitted ? (
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(quizAnswers).length < quizQuestionsList.length}
                className="btn-primary"
                style={{ opacity: Object.keys(quizAnswers).length < quizQuestionsList.length ? 0.5 : 1 }}
              >
                <span>Submit Quiz (+50 XP)</span>
                <CheckCircle2 size={18} />
              </button>
            </div>
          ) : (
            <div style={{ marginTop: '20px', background: 'rgba(20, 184, 166, 0.2)', padding: '16px', borderRadius: '14px', textAlign: 'center' }}>
              <p style={{ color: '#2dd4bf', fontWeight: 700, fontSize: '1rem' }}>
                🎉 Story Completed! You earned bonus XP for great reading comprehension!
              </p>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
