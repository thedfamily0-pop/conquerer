import React, { useState } from 'react';
import { Camera, Sparkles, CheckCircle2, ChevronRight, Volume2, Lightbulb, ShieldCheck } from 'lucide-react';
import { analyzeHomeworkQuestion } from '../services/aiTutor';
import type { HomeworkAnalysis } from '../services/aiTutor';
import { scrubExifMetadata } from '../services/exifScrubber';
import { speakText, playSound } from '../services/audioService';
import { getCurrentTermInfo } from '../data/termCalendar';
import { recordPerformanceEvent } from '../services/performanceData';

interface HomeworkAssistantProps {
  apiKey?: string;
  onCompleteHomeworkStep: (xpGain: number) => void;
  soundEnabled: boolean;
}

export const HomeworkAssistant: React.FC<HomeworkAssistantProps> = ({ onCompleteHomeworkStep, soundEnabled, apiKey: parentApiKey }) => {
  const [questionText, setQuestionText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isExifScrubbed, setIsExifScrubbed] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<HomeworkAnalysis | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [childAnswer, setChildAnswer] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const originalFile = e.target.files[0];
      try {
        const scrubbed = await scrubExifMetadata(originalFile);
        setSelectedFile(originalFile);
        setImagePreview(scrubbed.cleanDataUrl);
        setIsExifScrubbed(true);
        if (soundEnabled) playSound.pop();
      } catch {
        setSelectedFile(originalFile);
        setImagePreview(URL.createObjectURL(originalFile));
        setIsExifScrubbed(false);
      }
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() && !selectedFile) return;

    setLoading(true);
    setAnalysis(null);
    setCompletedSteps([]);
    setCurrentStepIdx(0);
    setShowHint(false);
    setChildAnswer('');

    try {
      const result = await analyzeHomeworkQuestion(questionText, parentApiKey);
      setAnalysis(result);
      if (soundEnabled) playSound.success();
    } catch {
      console.error('Homework analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteStep = (stepNumber: number) => {
    if (!analysis || !childAnswer.trim() || completedSteps.includes(stepNumber)) return;
    const nextCompleted = [...completedSteps, stepNumber];
    const termInfo = getCurrentTermInfo();
    recordPerformanceEvent({
      activity: 'homework', term: termInfo.term, week: termInfo.week, subject: analysis.subject,
      contentId: analysis.topic, questionId: `step_${stepNumber}`, correct: true, score: 1, total: 1,
      hintsShown: showHint ? 1 : 0, xpEarned: 15, metadata: { hasChildGeneratedAnswer: true },
    });
    setCompletedSteps(nextCompleted);
    setChildAnswer('');
    onCompleteHomeworkStep(15);
    if (soundEnabled) playSound.success();
    if (stepNumber < analysis.steps.length) {
      setCurrentStepIdx(stepNumber);
      setShowHint(false);
    }
  };

  // Start a completely new question
  const resetSession = () => {
    setQuestionText('');
    setSelectedFile(null);
    setImagePreview(null);
    setAnalysis(null);
    setCompletedSteps([]);
    setCurrentStepIdx(0);
    setShowHint(false);
    setChildAnswer('');
  }

  return (
    <div className="glass-card animate-pop" style={{ padding: '28px', marginBottom: '32px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(251, 191, 36, 0.2)', padding: '10px', borderRadius: '16px' }}>
            <Sparkles size={24} color="#fbbf24" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', color: '#f8fafc' }}>AI Homework Assistant</h2>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Upload your homework photo or paste your question!</p>
          </div>
        </div>
      </div>

      {/* Form Input */}
      <form onSubmit={handleAnalyze}>
        
        {/* Photo Upload Area */}
        <div style={{ marginBottom: '16px' }}>
          <label 
            htmlFor="hw-photo"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed rgba(255, 255, 255, 0.2)',
              borderRadius: '18px',
              padding: '24px',
              cursor: 'pointer',
              background: imagePreview ? 'rgba(0,0,0,0.3)' : 'rgba(255, 255, 255, 0.03)',
              transition: 'all 0.2s ease'
            }}
          >
            {imagePreview ? (
              <div style={{ textAlign: 'center' }}>
                <img 
                  src={imagePreview} 
                  alt="Homework Sheet" 
                  style={{ maxHeight: '160px', borderRadius: '12px', marginBottom: '10px', objectFit: 'contain' }} 
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: isExifScrubbed ? '#2dd4bf' : '#f59e0b', fontSize: '0.85rem', fontWeight: 700 }}>
                  <ShieldCheck size={16} />
                  <span>{isExifScrubbed ? 'Photo Attached — EXIF GPS Metadata Scrubbed ✅' : 'Photo Attached (Privacy scrubber not applied)'}</span>
                </div>
              </div>
            ) : (
              <>
                <Camera size={36} color="#fbbf24" style={{ marginBottom: '10px' }} />
                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>
                  Click to take or upload a photo of your homework sheet
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', color: '#14b8a6', fontSize: '0.8rem' }}>
                  <ShieldCheck size={14} />
                  <span>EXIF Privacy Scrubber Active</span>
                </div>
              </>
            )}
          </label>
          <input 
            id="hw-photo" 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
          />
        </div>

        {/* Text Input */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Or type your question here (e.g. 52 - 27 or 14 × 6)"
            style={{
              flex: 1,
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--card-border)',
              borderRadius: '14px',
              padding: '14px 18px',
              color: '#f8fafc',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <button 
            type="submit" 
            disabled={loading || (!questionText.trim() && !selectedFile)} 
            className="btn-primary"
            style={{ opacity: loading || (!questionText.trim() && !selectedFile) ? 0.6 : 1 }}
          >
            {loading ? (
              <span>Thinking... 🧠</span>
            ) : (
              <>
                <span>Break It Down</span>
                <Sparkles size={18} />
              </>
            )}
          </button>
        </div>

      </form>

      {/* AI Socratic Step Breakdown Results */}
      {analysis && (
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ background: 'rgba(20, 184, 166, 0.2)', color: '#2dd4bf', padding: '4px 10px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700 }}>
                {analysis.subject}
              </span>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{analysis.topic}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <p style={{ color: '#fbbf24', fontSize: '0.85rem', fontWeight: 700 }}>
                Step {currentStepIdx + 1} of {analysis.steps.length}
              </p>
              <button
                type="button"
                onClick={resetSession}
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '6px 12px', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer' }}
                title="Clear this question and start a new one"
              >
                Ask a new question
              </button>
            </div>
          </div>

          {/* Current Active Step Card */}
          {analysis.steps[currentStepIdx] && (() => {
            const step = analysis.steps[currentStepIdx];
            const isCompleted = completedSteps.includes(step.stepNumber);

            return (
              <div 
                key={step.stepNumber}
                style={{ 
                  background: 'rgba(30, 41, 59, 0.9)', 
                  border: `2px solid ${isCompleted ? '#14b8a6' : '#fbbf24'}`, 
                  borderRadius: '20px', 
                  padding: '24px',
                  boxShadow: '0 15px 30px rgba(0,0,0,0.3)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.2rem', color: '#f8fafc' }}>{step.title}</h3>
                  <button 
                    onClick={() => speakText(`${step.title}. ${step.explanation}. ${step.interactiveQuestion}`)}
                    className="btn-secondary"
                    style={{ padding: '6px 10px', borderRadius: '10px' }}
                  >
                    <Volume2 size={16} color="#fbbf24" />
                  </button>
                </div>

                <p style={{ fontSize: '1rem', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '16px' }}>
                  {step.explanation}
                </p>

                <div style={{ 
                  background: 'rgba(251, 191, 36, 0.12)', 
                  borderLeft: '4px solid #fbbf24', 
                  padding: '12px 16px', 
                  borderRadius: '10px',
                  marginBottom: '18px'
                }}>
                  <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fef08a' }}>
                    ❓ Socratic Question: {step.interactiveQuestion}
                  </p>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Show your thinking in your own words:</label>
                  <textarea value={childAnswer} onChange={event => setChildAnswer(event.target.value)} disabled={isCompleted} placeholder="Type what you think the answer or next step is…" rows={3} style={{ width: '100%', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '10px', padding: '10px', color: '#f8fafc', resize: 'vertical' }} />
                  {!childAnswer.trim() && !isCompleted && <small className="muted">A written answer is needed before this step counts toward academic performance.</small>}
                </div>

                {/* Hint toggle */}
                {showHint && (
                  <div style={{ 
                    background: 'rgba(168, 85, 247, 0.15)', 
                    border: '1px solid rgba(168, 85, 247, 0.4)', 
                    padding: '12px 16px', 
                    borderRadius: '12px',
                    marginBottom: '18px'
                  }}>
                    <p style={{ fontSize: '0.9rem', color: '#e9d5ff' }}>
                      💡 <strong>Hint:</strong> {step.hint}
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => setShowHint(!showHint)}
                    className="btn-secondary"
                    style={{ fontSize: '0.9rem' }}
                  >
                    <Lightbulb size={16} color="#fbbf24" />
                    <span>{showHint ? 'Hide Hint' : 'Need a Hint'}</span>
                  </button>

                  <button 
                    onClick={() => handleCompleteStep(step.stepNumber)}
                    disabled={!isCompleted && !childAnswer.trim()}
                    className="btn-primary"
                    style={{ 
                      fontSize: '0.95rem', 
                      padding: '10px 20px',
                      background: isCompleted ? 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' : undefined 
                    }}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 size={18} />
                        <span>Step Complete (+15 XP)</span>
                      </>
                    ) : (
                      <>
                        <span>I Understand This Step</span>
                        <ChevronRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Encouragement Footer */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.95rem', color: '#2dd4bf', fontStyle: 'italic' }}>
              {analysis.encouragement}
            </p>
          </div>

        </div>
      )}

    </div>
  );
};
