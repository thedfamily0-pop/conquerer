import { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Map, Star, CheckCircle2, TrendingUp, Send, RotateCcw } from 'lucide-react';
import { getCurrentTermInfo } from '../data/termCalendar';
import { getATPWeek } from '../data/term4ATP';
import { playSound } from '../services/audioService';
import { ShareButton } from './ShareButton';
import { recordPerformanceEvent } from '../services/performanceData';

interface QuestMapProps { onEarnXp: (amount: number) => void; soundEnabled: boolean; displayName: string; }
interface QuestCheckpoint { level: 'recall' | 'apply' | 'explain'; levelLabel: string; levelEmoji: string; scenario: string; question: string; hint: string; keywords: string[]; sampleAnswer: string; minKeywords: number; stars: number; }
interface QuestNode { id: string; subject: string; subjectEmoji: string; title: string; capsLink: string; checkpoints: QuestCheckpoint[]; xpAward: number; }
interface CheckpointResult { answer: string; keywordsFound: string[]; score: 'excellent' | 'good' | 'developing' | 'retry'; starsEarned: number; timestamp: string; checkpointIndex?: number; attemptId?: string; hintsShown?: number; isRetry?: boolean; }
interface QuestProgress { nodeId: string; checkpointsCompleted: number; results: CheckpointResult[]; totalStars: number; attempts: number; }
interface QuestMapState { week: number; term: number; progress: Record<string, QuestProgress>; totalStars: number; totalXpFromQuests: number; }

const STORAGE_KEY = 'explorer_quest_map_v1';
function loadQuestState(): QuestMapState {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) {
      const parsed = JSON.parse(s);
      if (parsed.progress) { for (const key of Object.keys(parsed.progress)) { const p = parsed.progress[key]; if (p.totalStars === undefined) p.totalStars = p.starsEarned || 0; if (!Array.isArray(p.results)) p.results = []; } }
      return { ...parsed, totalStars: parsed.totalStars || 0, totalXpFromQuests: parsed.totalXpFromQuests || 0 };
    }
  } catch {}
  const info = getCurrentTermInfo();
  return { week: info.week, term: info.term, progress: {}, totalStars: 0, totalXpFromQuests: 0 };
}
function saveQuestState(state: QuestMapState) { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function getTier(stars: number) { if (stars >= 60) return { label: 'Mastery', color: '#fbbf24', emoji: '👑' }; if (stars >= 40) return { label: 'Secure', color: '#2dd4bf', emoji: '🌟' }; if (stars >= 20) return { label: 'Developing', color: '#a78bfa', emoji: '📈' }; return { label: 'Emerging', color: '#64748b', emoji: '🌱' }; }

function evaluateAnswer(answer: string, keywords: string[], minKeywords: number, maxStars: number): { keywordsFound: string[]; score: 'excellent' | 'good' | 'developing' | 'retry'; starsEarned: number } {
  const normalised = answer.toLowerCase().replace(/[^\w\s]/g, '');
  const words = new Set(normalised.split(/\s+/));
  const generic = new Set(['use', 'help', 'when', 'because', 'would', 'example', 'like', 'means', 'important']);
  const found = [...new Set(keywords.map(keyword => keyword.toLowerCase()).filter(keyword => !generic.has(keyword) && words.has(keyword)))];
  const ratio = found.length / Math.max(1, minKeywords);
  if (ratio >= 1) return { keywordsFound: found, score: 'excellent', starsEarned: maxStars };
  if (ratio >= 0.6) return { keywordsFound: found, score: 'good', starsEarned: Math.max(1, Math.ceil(maxStars * 0.7)) };
  if (ratio >= 0.3 || answer.trim().length > 20) return { keywordsFound: found, score: 'developing', starsEarned: Math.max(1, Math.ceil(maxStars * 0.4)) };
  return { keywordsFound: found, score: 'retry', starsEarned: 0 };
}

function buildQuestNodes(week: number): QuestNode[] {
  const entries = getATPWeek(week);
  if (entries.length === 0) return [];
  const subjectEmojis: Record<string, string> = { Mathematics: '🔢', 'English Home Language': '��', 'Afrikaans FAL': '🇿🇦', 'Life Skills': '🌱', 'Coding & Robotics': '🤖' };
  const shortSubject: Record<string, string> = { Mathematics: 'Maths', 'English Home Language': 'English', 'Afrikaans FAL': 'Afrikaans', 'Life Skills': 'Life Skills', 'Coding & Robotics': 'Coding' };

  // Translate stiff CAPS language into 8-year-old-friendly phrasing
  function childify(topic: string): string {
    const map: [RegExp, string][] = [
      [/Whole Numbers.*Place Value.*/i, 'counting and place value'],
      [/Addition & Subtraction.*/i, 'adding and subtracting big numbers'],
      [/Multiplication & Division.*/i, 'times tables and sharing equally'],
      [/Common Fractions/i, 'fractions — pieces of a whole'],
      [/Capacity & Volume/i, 'measuring how much things hold (litres)'],
      [/^Mass$/i, 'weighing things (kilograms and grams)'],
      [/Geometric Patterns.*Number Patterns/i, 'patterns in numbers and shapes'],
      [/3-D Objects.*2-D Shapes.*/i, 'real-life shapes (3D and flat)'],
      [/Collecting.*Data/i, 'doing surveys and making graphs'],
      [/Oral Recount/i, 'telling what happened in order'],
      [/Narrative Writing/i, 'writing your own stories'],
      [/Verbs.*Diary/i, 'past tense words and diary writing'],
      [/Information Text/i, 'reading facts and finding info'],
      [/Descriptive Writing.*Prepositions/i, 'describing things with your 5 senses'],
      [/Poetry.*Rhyme/i, 'poems, rhyming and syllables'],
      [/Letter Writing/i, 'writing a letter to a friend'],
      [/Synonyms.*Antonyms/i, 'word meanings and opposites'],
      [/Creative Writing.*Punctuation/i, 'writing a made-up story with good punctuation'],
      [/Relationships/i, 'being a good friend and family member'],
      [/Rights.*Responsibilities/i, 'your rights and what you must do'],
      [/Abuse Prevention/i, 'keeping your body safe'],
      [/Road Safety/i, 'staying safe near roads'],
      [/Healthy Eating/i, 'eating well and staying clean'],
      [/Printmaking.*Patterns/i, 'SA art — making prints and patterns'],
      [/Performing Arts/i, 'acting, music and dancing'],
      [/Physical Education/i, 'sports, games and fitness'],
      [/Goal Setting/i, 'setting goals and growing your brain'],
      [/Revision.*Sequences/i, 'step-by-step instructions (algorithms)'],
      [/Conditions.*IF-THEN/i, 'making choices in code (if-then)'],
      [/Loops with Conditions/i, 'loops that stop when something happens'],
      [/Inputs.*Outputs.*Sensors/i, 'how robots see and feel things'],
      [/Building.*Programming/i, 'building and coding a robot'],
      [/Internet Safety/i, 'staying safe on the internet'],
      [/Technology Tools/i, 'using computers to create things'],
      [/Mini Coding Project/i, 'your own coding project!'],
      [/Tema.*Vakansie/i, 'holiday words in Afrikaans'],
      [/Tema.*Diere/i, 'animal words in Afrikaans'],
      [/Tema.*Kos/i, 'food words in Afrikaans'],
      [/Tema.*Kleure/i, 'colours and shapes in Afrikaans'],
      [/Tema.*Liggaamsdele/i, 'body parts in Afrikaans'],
      [/Tema.*Weer/i, 'weather words in Afrikaans'],
      [/Tema.*Vervoer/i, 'transport words in Afrikaans'],
      [/Tema.*Feeste/i, 'celebration words in Afrikaans'],
      [/Hersiening/i, 'Afrikaans revision — everything you learned!'],
      [/Jaareind/i, 'end-of-year Afrikaans test'],
    ];
    for (const [re, friendly] of map) { if (re.test(topic)) return friendly; }
    return topic.toLowerCase();
  }

  return entries.map(entry => {
    const friendly = childify(entry.topic);
    const topicWords = entry.topic.toLowerCase().split(/[\s,\-()]+/).filter((w: string) => w.length > 3);

    const checkpoints: QuestCheckpoint[] = [
      {
        level: 'recall', levelLabel: 'Remember', levelEmoji: '💡',
        scenario: `This week you explored: ${friendly}. Let's see what you remember! 🧠`,
        question: `Tell me 2 things you remember about ${friendly}. What did you find interesting or tricky?`,
        hint: `Think back — what did you do in class? What did your teacher explain? Any activities?`,
        keywords: [...topicWords.slice(0, 4), ...(entry.learningOutcomes[0] || '').toLowerCase().split(/\s+/).filter((w: string) => w.length > 4).slice(0, 3)],
        sampleAnswer: `I remember that ${friendly} is about ${entry.learningOutcomes[0]?.toLowerCase() || 'what we practiced'}. We also did: ${entry.activities[0]?.split(' — ')[0]?.toLowerCase() || 'fun activities'}.`,
        minKeywords: 2, stars: 1,
      },
      {
        level: 'apply', levelLabel: 'Use It', levelEmoji: '🔧',
        scenario: `Now think outside school! Where in YOUR life would ${friendly} actually help you? 🌍`,
        question: `Give me a real example: when would YOU use ${friendly}? At home? The shops? With friends? Tell me the situation and what you'd do.`,
        hint: `Think: "When would I need this?" At the shop? Baking? Playing a game? Helping someone?`,
        keywords: [...topicWords.slice(0, 3), 'because', 'example', 'would', 'when', 'use', 'help', ...(entry.learningOutcomes[1] || '').toLowerCase().split(/\s+/).filter((w: string) => w.length > 4).slice(0, 3)],
        sampleAnswer: `I would use ${friendly} when ${entry.activities[0]?.split(' — ')[1]?.toLowerCase() || 'I need to solve a problem in my day'}. For example, ${entry.activities[1]?.split(' — ')[1]?.toLowerCase() || 'this helps me think clearly and make good choices'}.`,
        minKeywords: 3, stars: 2,
      },
      {
        level: 'explain', levelLabel: 'Teach It', levelEmoji: '🎓',
        scenario: `Your little cousin (6 years old) says: "Hey, what is ${friendly}? Teach me!" 👶`,
        question: `Explain ${friendly} to a 6-year-old. Use easy words. Why should they care? Give them an example they'd understand.`,
        hint: `Talk like you're chatting to a little kid: "Ok so basically..." or "It's like when you..."`,
        keywords: [...topicWords.slice(0, 4), 'because', 'means', 'important', 'helps', 'when', 'like', ...(entry.learningOutcomes[2] || entry.learningOutcomes[1] || '').toLowerCase().split(/\s+/).filter((w: string) => w.length > 4).slice(0, 3)],
        sampleAnswer: `Ok so ${friendly} basically means ${entry.learningOutcomes[0]?.toLowerCase() || 'something we practice to get better at'}. It helps because ${entry.learningOutcomes[2]?.toLowerCase() || entry.learningOutcomes[1]?.toLowerCase() || 'you use it in real life all the time'}. It's like when you ${entry.activities[0]?.split(' — ')[1]?.toLowerCase() || 'do something step by step to get it right'}!`,
        minKeywords: 3, stars: 3,
      },
    ];

    return {
      id: `quest_${entry.subject.replace(/\s+/g, '_').toLowerCase()}_w${week}`,
      subject: shortSubject[entry.subject] || entry.subject,
      subjectEmoji: subjectEmojis[entry.subject] || '📘',
      title: friendly.charAt(0).toUpperCase() + friendly.slice(1),
      capsLink: entry.capsContentArea,
      checkpoints,
      xpAward: 45,
    };
  });
}

export function QuestMap({ onEarnXp, soundEnabled, displayName: _displayName }: QuestMapProps) {
  const [state, setState] = useState<QuestMapState>(loadQuestState);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [checkpointIdx, setCheckpointIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<{ keywordsFound: string[]; score: string; starsEarned: number } | null>(null);
  const [hintUsed, setHintUsed] = useState(false);
  const termInfo = getCurrentTermInfo();
  const currentWeek = termInfo.week || 1;
  const questNodes = useMemo(() => buildQuestNodes(currentWeek), [currentWeek]);
  useEffect(() => { saveQuestState(state); }, [state]);
  const tier = getTier(state.totalStars || 0);
  const activeQuest = questNodes.find(n => n.id === activeNode);
  const currentCheckpoint = activeQuest?.checkpoints[checkpointIdx];

  const handleSubmit = () => {
    if (!currentCheckpoint || answer.trim().length < 10 || !activeQuest) return;
    const cp = currentCheckpoint;
    const evaluation = evaluateAnswer(answer, cp.keywords, cp.minKeywords, cp.stars);
    const nodeId = activeNode!;
    const prev = state.progress[nodeId] || { nodeId, checkpointsCompleted: 0, results: [], totalStars: 0, attempts: 0 };
    const priorResults = prev.results || [];
    const hadSuccessfulAttempt = priorResults.some(item => (item.checkpointIndex ?? -1) === checkpointIdx && item.score !== 'retry');
    const newResult: CheckpointResult = { answer: answer.trim(), keywordsFound: evaluation.keywordsFound, score: evaluation.score, starsEarned: evaluation.starsEarned, timestamp: new Date().toISOString(), checkpointIndex: checkpointIdx, attemptId: `quest_attempt_${Date.now()}`, hintsShown: hintUsed ? 1 : 0, isRetry: priorResults.length > 0 };
    const results = [...priorResults, newResult];
    const bestByCheckpoint = [0, 1, 2].map(index => Math.max(0, ...results.filter(item => (item.checkpointIndex ?? -1) === index && item.score !== 'retry').map(item => item.starsEarned)));
    const nextProgress = { ...state.progress, [nodeId]: { ...prev, checkpointsCompleted: bestByCheckpoint.filter(stars => stars > 0).length, results, totalStars: bestByCheckpoint.reduce((sum, stars) => sum + stars, 0), attempts: prev.attempts + 1 } };
    const awardedStars = hadSuccessfulAttempt || evaluation.score === 'retry' ? 0 : evaluation.starsEarned;
    recordPerformanceEvent({ activity: 'quest', term: termInfo.term, week: currentWeek, subject: activeQuest.subject, contentId: nodeId, checkpointIndex: checkpointIdx, correct: evaluation.score !== 'retry', score: evaluation.starsEarned, total: cp.stars, hintsShown: hintUsed ? 1 : 0, xpEarned: awardedStars * 10, answer: answer.trim(), isRetry: newResult.isRetry, metadata: { score: evaluation.score, duplicateCompletion: hadSuccessfulAttempt } });
    setResult(evaluation);
    if (evaluation.score !== 'retry') {
      if (soundEnabled) playSound.success();
      confetti({ particleCount: 40 + evaluation.starsEarned * 15, spread: 50, origin: { y: 0.7 }, colors: ['#fbbf24', '#14b8a6', '#a855f7'] });
      if (awardedStars > 0) onEarnXp(awardedStars * 10);
    } else if (soundEnabled) playSound.pop();
    setState(s => ({ ...s, progress: nextProgress, totalStars: Object.values(nextProgress).reduce((sum, progress) => sum + (progress.totalStars || 0), 0), totalXpFromQuests: s.totalXpFromQuests + awardedStars * 10 }));
  };
  const handleNext = () => { if (result && result.score !== 'retry' && checkpointIdx < 2) { setCheckpointIdx(i => i + 1); } else { setActiveNode(null); setCheckpointIdx(0); } setAnswer(''); setResult(null); setHintUsed(false); };
  const handleRetry = () => { setAnswer(''); setResult(null); setHintUsed(false); };
  const openNode = (nodeId: string) => { const p = state.progress[nodeId]; setActiveNode(nodeId); setCheckpointIdx(p ? Math.min(p.checkpointsCompleted, 2) : 0); setAnswer(''); setResult(null); setHintUsed(false); if (soundEnabled) playSound.pop(); };

  if (!activeQuest) { const totalPossibleStars = questNodes.length * 6; const earnedStars = Object.values(state.progress).reduce((sum, p) => sum + (p.totalStars || 0), 0); return (<section className="glass-card animate-pop" style={{ padding: '24px' }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ background: 'rgba(251, 191, 36, 0.2)', padding: '10px', borderRadius: '16px' }}><Map size={24} color="#fbbf24" /></div><div><h2 style={{ fontSize: '1.3rem', color: '#f8fafc', margin: 0 }}>Quest Map</h2><p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '2px 0 0' }}>Week {currentWeek} — Show what you REALLY understand!</p></div></div><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '12px', padding: '8px 12px', textAlign: 'center' }}><div style={{ fontSize: '1rem', fontWeight: 800, color: '#fbbf24' }}>{earnedStars}<Star size={13} style={{ marginLeft: 2 }} /></div><div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>/{totalPossibleStars}</div></div><div style={{ background: `${tier.color}22`, border: `1px solid ${tier.color}44`, borderRadius: '12px', padding: '8px 12px', textAlign: 'center' }}><div style={{ fontSize: '0.8rem', fontWeight: 700, color: tier.color }}>{tier.emoji} {tier.label}</div></div></div></div><div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', height: '8px', marginBottom: '16px', overflow: 'hidden' }}><div style={{ background: 'linear-gradient(90deg, #fbbf24, #f59e0b)', height: '100%', borderRadius: '10px', width: `${Math.min(100, (earnedStars / Math.max(1, totalPossibleStars)) * 100)}%`, transition: 'width 0.5s ease' }} /></div><p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '14px' }}>Write answers in your OWN words. The more you explain, the more stars you earn!</p><div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{questNodes.map((node) => { const p = state.progress[node.id]; const completed = p?.checkpointsCompleted === 3; const started = (p?.checkpointsCompleted ?? 0) > 0; const stars = p?.totalStars ?? 0; return (<button key={node.id} onClick={() => openNode(node.id)} style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', textAlign: 'left', background: completed ? 'rgba(20, 184, 166, 0.08)' : started ? 'rgba(168, 85, 247, 0.06)' : 'rgba(30, 41, 59, 0.5)', border: `1px solid ${completed ? 'rgba(20, 184, 166, 0.35)' : started ? 'rgba(168, 85, 247, 0.25)' : 'rgba(71, 85, 105, 0.35)'}`, borderRadius: '14px', padding: '12px 16px', cursor: 'pointer', transition: 'all 0.2s ease' }}><div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', background: completed ? 'rgba(20, 184, 166, 0.15)' : 'rgba(15, 23, 42, 0.5)', border: `2px solid ${completed ? '#2dd4bf' : started ? '#a855f7' : '#475569'}` }}>{completed ? <CheckCircle2 size={20} color="#2dd4bf" /> : <span>{node.subjectEmoji}</span>}</div><div style={{ flex: 1 }}><b style={{ fontSize: '0.88rem', color: completed ? '#2dd4bf' : '#f8fafc' }}>{node.subject}</b><p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0' }}>{node.title}</p><div style={{ display: 'flex', gap: '5px', alignItems: 'center', marginTop: '4px' }}>{[0,1,2].map(ci => <div key={ci} style={{ width: 7, height: 7, borderRadius: '50%', background: (p?.checkpointsCompleted ?? 0) > ci ? '#2dd4bf' : '#334155' }} />)}{stars > 0 && <span style={{ fontSize: '0.7rem', color: '#fbbf24', marginLeft: '5px' }}>{stars} stars</span>}</div></div>{!completed && <TrendingUp size={16} color="#64748b" />}</button>); })}</div>{earnedStars > 0 && <div style={{ marginTop: '18px', textAlign: 'center' }}><ShareButton message={`Quest Map Week ${currentWeek}: ${earnedStars} stars! ${tier.emoji} Level: ${tier.label}`} subject="My Quest Map!" /></div>}</section>); }

  const cp = currentCheckpoint!;
  const levelColors: Record<string, string> = { recall: '#60a5fa', apply: '#a78bfa', explain: '#fbbf24' };
  const scoreLabels: Record<string, { text: string; color: string }> = { excellent: { text: 'Excellent! You clearly understand this.', color: '#2dd4bf' }, good: { text: 'Good! A few more details would be perfect.', color: '#a78bfa' }, developing: { text: "You're getting there! Check the model answer.", color: '#f59e0b' }, retry: { text: 'Write more detail. Use the hint to think deeper.', color: '#f87171' } };

  return (<section className="glass-card animate-pop" style={{ padding: '24px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}><button onClick={() => { setActiveNode(null); setCheckpointIdx(0); setAnswer(''); setResult(null); }} style={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid #475569', borderRadius: '10px', padding: '8px 12px', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}>&larr; Back</button><div style={{ flex: 1 }}><h3 style={{ fontSize: '1rem', color: '#f8fafc', margin: 0 }}>{activeQuest.subjectEmoji} {activeQuest.subject}</h3><p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0' }}>{activeQuest.title}</p></div></div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '18px' }}>{activeQuest.checkpoints.map((c, i) => (<div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: i < checkpointIdx ? 'rgba(20, 184, 166, 0.2)' : i === checkpointIdx ? `${levelColors[c.level]}33` : 'rgba(15, 23, 42, 0.5)', border: `2px solid ${i < checkpointIdx ? '#2dd4bf' : i === checkpointIdx ? levelColors[c.level] : '#334155'}`, fontSize: '0.75rem' }}>{i < checkpointIdx ? <CheckCircle2 size={14} color="#2dd4bf" /> : c.levelEmoji}</div>{i < 2 && <div style={{ width: 20, height: 2, background: i < checkpointIdx ? '#2dd4bf' : '#334155' }} />}</div>))}<span style={{ marginLeft: '8px', fontSize: '0.75rem', color: levelColors[cp.level], fontWeight: 700 }}>{cp.levelLabel} — {cp.stars} {cp.stars === 1 ? 'star' : 'stars'}</span></div>
    <div style={{ background: 'rgba(15, 23, 42, 0.5)', border: `1px solid ${levelColors[cp.level]}33`, borderRadius: '16px', padding: '18px' }}>
      <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 10px', fontStyle: 'italic' }}>{cp.scenario}</p>
      <h4 style={{ fontSize: '0.95rem', color: '#f8fafc', margin: '0 0 4px', lineHeight: 1.45 }}>{cp.question}</h4>
      {!hintUsed ? <button type="button" onClick={() => setHintUsed(true)} style={{ background: 'transparent', border: '1px solid rgba(251, 191, 36, 0.35)', borderRadius: '10px', padding: '8px 10px', color: '#fbbf24', cursor: 'pointer', fontSize: '0.78rem', marginBottom: '14px' }}>💡 Show hint</button> : <p style={{ fontSize: '0.78rem', color: '#fbbf24', margin: '0 0 14px' }}>💡 Hint used: {cp.hint}</p>}
      <textarea value={answer} onChange={e => setAnswer(e.target.value)} disabled={!!result} placeholder="Write your answer here in full sentences. Explain your thinking..." style={{ width: '100%', minHeight: '120px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(71, 85, 105, 0.5)', borderRadius: '12px', padding: '14px', color: '#e2e8f0', fontSize: '0.9rem', lineHeight: 1.5, resize: 'vertical', fontFamily: 'inherit' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}><span style={{ fontSize: '0.75rem', color: answer.length < 15 ? '#f87171' : '#64748b' }}>{answer.length} chars {answer.length < 15 ? '— write more!' : ''}</span><span style={{ fontSize: '0.75rem', color: '#64748b' }}>{cp.stars} star{cp.stars > 1 ? 's' : ''} possible</span></div>
      {!result && <button onClick={handleSubmit} disabled={answer.trim().length < 10} style={{ marginTop: '14px', width: '100%', background: answer.trim().length >= 10 ? 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' : 'rgba(71, 85, 105, 0.4)', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '0.92rem', fontWeight: 700, cursor: answer.trim().length >= 10 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Send size={16} /> Submit My Answer</button>}
      {result && (<div style={{ marginTop: '16px' }}><div style={{ padding: '14px', borderRadius: '12px', background: result.score === 'retry' ? 'rgba(248, 113, 113, 0.08)' : 'rgba(20, 184, 166, 0.06)', border: `1px solid ${(scoreLabels[result.score]?.color || '#475569')}33` }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>{result.starsEarned > 0 && <span style={{ color: '#fbbf24', fontWeight: 800 }}>{'⭐'.repeat(result.starsEarned)}</span>}<span style={{ fontSize: '0.85rem', fontWeight: 700, color: scoreLabels[result.score]?.color || '#94a3b8' }}>{scoreLabels[result.score]?.text || ''}</span></div>{result.keywordsFound.length > 0 && <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 8px' }}>Key concepts found: <span style={{ color: '#2dd4bf' }}>{result.keywordsFound.join(', ')}</span></p>}<div style={{ background: 'rgba(15, 23, 42, 0.5)', borderRadius: '10px', padding: '12px', marginTop: '8px' }}><p style={{ fontSize: '0.72rem', color: '#64748b', margin: '0 0 4px', fontWeight: 700 }}>Model answer:</p><p style={{ fontSize: '0.82rem', color: '#e2e8f0', margin: 0, lineHeight: 1.5 }}>{cp.sampleAnswer}</p></div></div><div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>{result.score === 'retry' && <button onClick={handleRetry} style={{ flex: 1, background: 'rgba(251, 191, 36, 0.12)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '12px', padding: '12px', fontSize: '0.88rem', fontWeight: 700, color: '#fbbf24', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><RotateCcw size={15} /> Try Again</button>}<button onClick={handleNext} style={{ flex: 1, background: result.score !== 'retry' ? 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' : 'rgba(71, 85, 105, 0.3)', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer' }}>{result.score !== 'retry' && checkpointIdx < 2 ? `Next: ${activeQuest.checkpoints[checkpointIdx + 1].levelLabel} →` : result.score !== 'retry' ? '🏆 Quest Complete!' : 'Back to Map'}</button></div></div>)}
    </div>
  </section>);
}
