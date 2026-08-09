import React, { useState } from 'react';
import { Heart, Volume2, Send, ShieldAlert, Sparkles, Mail, X } from 'lucide-react';
import { speakText, playSound } from '../services/audioService';
import { scanChildInput, sendParentEmailAlert } from '../services/childSafetyScanner';

export type CheckinContext = 'morning' | 'after-homework' | 'after-quest' | 'after-reading' | 'bedtime';

export interface ParentNotification {
  id: string;
  timestamp: string;
  mood: string;
  moodEmoji: string;
  note: string;
  isUrgent: boolean;
  createdAt?: string;
}

interface WellbeingCheckinProps {
  onCheckinComplete: (mood: string, xpBonus: number) => void;
  onNewParentAlert: (notification: ParentNotification) => void;
  soundEnabled: boolean;
  parentEmails?: string[];
  context?: CheckinContext;
  onDismiss?: () => void;
  isModal?: boolean;
}

const FEELINGS = [
  { id: 'happy', label: 'Happy', emoji: '😊', bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.4)' },
  { id: 'calm', label: 'Calm', emoji: '😌', bg: 'rgba(20, 184, 166, 0.15)', border: 'rgba(20, 184, 166, 0.4)' },
  { id: 'okay', label: 'Okay', emoji: '😐', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)' },
  { id: 'worried', label: 'Worried', emoji: '😟', bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.4)' },
  { id: 'sad', label: 'Sad', emoji: '😢', bg: 'rgba(255, 107, 107, 0.15)', border: 'rgba(255, 107, 107, 0.4)' },
  { id: 'angry', label: 'Angry', emoji: '😠', bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.4)' },
];

const CONTEXT_PROMPTS: Record<CheckinContext, { title: string; subtitle: string }> = {
  'morning': { title: 'Good Morning Check-in', subtitle: 'How are you feeling to start the day?' },
  'after-homework': { title: 'Homework Check-in', subtitle: 'How did homework make you feel?' },
  'after-quest': { title: 'Quest Check-in', subtitle: 'How are you feeling after your quest?' },
  'after-reading': { title: 'Reading Check-in', subtitle: 'How did reading time make you feel?' },
  'bedtime': { title: 'Bedtime Check-in', subtitle: 'How are you feeling before bed?' },
};

const RESPONSES: Record<string, string> = {
  happy: "That is wonderful! Let us do a mindfulness moment: close your eyes and notice that happy feeling in your body — is it in your chest? Your tummy? Your smile? Noticing good feelings helps your brain remember them later. What made you feel this way today? 🌟",
  calm: "Beautiful! You are being mindful right now by noticing how calm you feel. Try this: take one slow breath in through your nose (smell the flowers 🌸) and blow out through your mouth (blow out the candles 🕯️). You are centred and ready!",
  okay: "Thank you for noticing and naming that feeling — that is a mindfulness superpower! It is totally fine to feel just okay. One thing at a time. You could try the STOP skill: Stop what you are doing, Take a breath, Observe what is happening, then Proceed with one small step. 💛",
  worried: "Thank you for trusting me. Worried feelings mean your brain is trying to protect you — but sometimes it gets too loud. Let us try TIPP: Temperature — splash cold water on your face or hold an ice cube for 30 seconds. This tells your body 'I am safe.' Then try paced breathing: breathe in for 4, out for 6, nice and slow. You can also try 5-4-3-2-1 grounding: name 5 things you see, 4 you hear, 3 you can touch, 2 you smell, 1 you taste. You are safe right now. 💜",
  sad: "I hear you. Sad is a real feeling and it is okay to have it. Let us try the ACCEPTS skill — do something kind for yourself right now: Activity (draw, colour, dance to one song), Contribute (do something nice for someone — even a small thing like a smile), or Sensations (hold something warm, wrap in a blanket, smell something nice). You could also try self-soothing: hug yourself tight like a butterfly hug 🦋 — cross your arms over your chest and tap left, right, left, right slowly. You are not alone. 💙",
  angry: "Thank you for being honest. Anger is a signal — something feels unfair or wrong. Let us use TIPP to cool the volcano: Temperature — hold ice cubes in your hands or press a cold cloth to your face for 30 seconds. Intense exercise — do 10 star jumps or run on the spot for 20 seconds. Then paced breathing: in for 4, out for 6. Once your body is calmer, you can use Wise Mind to think about what happened: 'What do I feel? What do I know? What is the wise thing to do next?' 🧡"
};

const BEDTIME_RESPONSES: Record<string, string> = {
  happy: "What a lovely way to end the day! Let us do a gratitude moment — a mindfulness skill: think of 3 things today that made you smile. Hold each one in your mind like a little star. Your brain loves ending the day with happy thoughts. Sweet dreams! 🌙",
  calm: "Feeling calm at bedtime is wonderful. Try a body scan: start at your toes and slowly move up — notice your feet, legs, tummy, chest, arms, face. Tell each part 'you can rest now.' By the time you reach the top of your head, your whole body will feel soft. Goodnight! 🌟",
  okay: "That is perfectly fine. Not every day needs to sparkle. You showed up and did your best — that takes courage. Try this gentle bedtime skill: put your hand on your heart and say quietly 'I did enough today. I am enough.' Rest well. 💫",
  worried: "Busy brain at bedtime is tough. Let us try a skill called Worry Time: tell your worry 'I hear you, but right now is sleep time. I will think about you tomorrow.' You can even write your worry on paper and put it in a 'worry jar' next to your bed — your brain can let go because it knows the worry is saved. Then do 4-7-8 breathing: breathe in for 4, hold for 7, out for 8. Dad & Mom are right here. 💜",
  sad: "Sad feelings at night can feel extra big because everything is quiet. Let us try self-soothe with your 5 senses: feel your soft blanket (touch), listen to your breathing (sound), notice the dark behind your eyelids (sight), think of your favourite smell, imagine the taste of hot chocolate. Then give yourself a butterfly hug 🦋 — arms crossed, tap left, right, left, right. Tomorrow is a fresh new page. You are so loved. 💙",
  angry: "Anger at bedtime is really hard. Your body is holding tension. Let us use progressive muscle relaxation: scrunch your toes tight for 5 seconds — release. Squeeze your legs — release. Clench your fists — release. Scrunch your face — release. Feel how different 'tense' and 'relaxed' feel. Now try the Wise Mind skill: put one hand on your heart (feelings) and one on your head (thoughts). Where they meet in the middle — that is your wise mind. It knows you are safe. Rest now, talk about it tomorrow. 🧡"
};

// ─────────────────────────────────────────────────────────────────────────────
// FEELINGS WHEEL — Simplified for 8-year-olds
// Based on Plutchik's wheel + Gottman emotion coaching, simplified to 2 layers
// Core emotion → more specific sub-feelings → maps to a primary FEELINGS id
// ─────────────────────────────────────────────────────────────────────────────

interface WheelEmotion {
  id: string;
  label: string;
  emoji: string;
  description: string; // "It feels like…" to help identify
  mapsTo: string; // which FEELINGS id this resolves to
}

interface WheelCore {
  id: string;
  label: string;
  emoji: string;
  colour: string;
  prompt: string; // question to help narrow down
  subFeelings: WheelEmotion[];
}

const FEELINGS_WHEEL: WheelCore[] = [
  {
    id: 'good', label: 'Something good', emoji: '🌈', colour: 'rgba(251, 191, 36, 0.3)',
    prompt: 'What kind of good feeling?',
    subFeelings: [
      { id: 'excited', label: 'Excited', emoji: '🤩', description: 'Like butterflies in my tummy — something fun is coming!', mapsTo: 'happy' },
      { id: 'proud', label: 'Proud', emoji: '🥹', description: 'I did something well and feel good about myself', mapsTo: 'happy' },
      { id: 'grateful', label: 'Thankful', emoji: '🙏', description: 'Someone was kind to me or something nice happened', mapsTo: 'happy' },
      { id: 'peaceful', label: 'Peaceful', emoji: '☁️', description: 'Everything feels quiet and safe inside', mapsTo: 'calm' },
      { id: 'loved', label: 'Loved', emoji: '🥰', description: 'I feel warm because people care about me', mapsTo: 'happy' },
    ],
  },
  {
    id: 'bad', label: 'Something bad', emoji: '🌧️', colour: 'rgba(59, 130, 246, 0.3)',
    prompt: 'What kind of bad feeling?',
    subFeelings: [
      { id: 'lonely', label: 'Lonely', emoji: '🫥', description: 'Like nobody is with me or nobody understands', mapsTo: 'sad' },
      { id: 'disappointed', label: 'Disappointed', emoji: '😞', description: 'Something I wanted didn\'t happen', mapsTo: 'sad' },
      { id: 'embarrassed', label: 'Embarrassed', emoji: '🫣', description: 'Everyone was looking at me and I wanted to hide', mapsTo: 'worried' },
      { id: 'jealous', label: 'Jealous', emoji: '😒', description: 'Someone has something I want and it feels unfair', mapsTo: 'angry' },
      { id: 'guilty', label: 'Guilty', emoji: '😔', description: 'I did something wrong and my tummy feels heavy', mapsTo: 'sad' },
    ],
  },
  {
    id: 'scared', label: 'Something scary', emoji: '😰', colour: 'rgba(168, 85, 247, 0.3)',
    prompt: 'What kind of scared feeling?',
    subFeelings: [
      { id: 'nervous', label: 'Nervous', emoji: '😬', description: 'I have to do something and my hands feel shaky', mapsTo: 'worried' },
      { id: 'anxious', label: 'Stressed', emoji: '😵‍💫', description: 'My brain won\'t stop thinking about things', mapsTo: 'worried' },
      { id: 'overwhelmed', label: 'Too much', emoji: '🤯', description: 'Everything is too loud or too fast or too hard', mapsTo: 'worried' },
      { id: 'insecure', label: 'Not good enough', emoji: '😣', description: 'I feel like I can\'t do it or I\'m not smart enough', mapsTo: 'worried' },
    ],
  },
  {
    id: 'angry', label: 'Something unfair', emoji: '🌋', colour: 'rgba(249, 115, 22, 0.3)',
    prompt: 'What kind of angry feeling?',
    subFeelings: [
      { id: 'frustrated', label: 'Frustrated', emoji: '😤', description: 'I keep trying but it won\'t work!', mapsTo: 'angry' },
      { id: 'annoyed', label: 'Annoyed', emoji: '🙄', description: 'Someone or something keeps bothering me', mapsTo: 'angry' },
      { id: 'hurt', label: 'Hurt', emoji: '💔', description: 'Someone said or did something that made my heart sore', mapsTo: 'sad' },
      { id: 'left-out', label: 'Left out', emoji: '😶', description: 'Others are having fun but I\'m not included', mapsTo: 'angry' },
    ],
  },
  {
    id: 'confused', label: 'Something mixed up', emoji: '🌀', colour: 'rgba(20, 184, 166, 0.3)',
    prompt: 'What kind of mixed-up feeling?',
    subFeelings: [
      { id: 'unsure', label: 'Unsure', emoji: '🤷', description: 'I don\'t know what to pick or what\'s right', mapsTo: 'okay' },
      { id: 'torn', label: 'Two feelings at once', emoji: '↔️', description: 'Part of me feels one thing and part feels another', mapsTo: 'okay' },
      { id: 'numb', label: 'Nothing really', emoji: '😶‍🌫️', description: 'I can\'t feel much of anything right now', mapsTo: 'okay' },
      { id: 'tired', label: 'Tired', emoji: '🥱', description: 'My body or brain feels heavy and done', mapsTo: 'calm' },
    ],
  },
];

function FeelingsWheel({ step, selectedCore, onSelectCore, onSelectFeeling, onBack, onClose }: {
  step: 'core' | 'sub';
  selectedCore: string | null;
  onSelectCore: (id: string) => void;
  onSelectFeeling: (mapsTo: string) => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const coreData = FEELINGS_WHEEL.find(c => c.id === selectedCore);

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '20px', padding: '20px', marginBottom: '20px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h3 style={{ color: '#f8fafc', fontSize: '1rem', margin: '0 0 4px' }}>
            {step === 'core' ? '🎯 Let\'s figure it out together!' : `${coreData?.emoji} ${coreData?.prompt}`}
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>
            {step === 'core' ? 'Does it feel more like...' : 'Which one sounds most like you right now?'}
          </p>
        </div>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}>
          <X size={16} color="#94a3b8" />
        </button>
      </div>

      {step === 'core' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
          {FEELINGS_WHEEL.map(core => (
            <button
              key={core.id}
              onClick={() => onSelectCore(core.id)}
              style={{
                background: core.colour, border: '2px solid rgba(255,255,255,0.15)',
                borderRadius: '14px', padding: '14px 12px', cursor: 'pointer', textAlign: 'center',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: '26px', marginBottom: '4px' }}>{core.emoji}</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc' }}>{core.label}</div>
            </button>
          ))}
        </div>
      )}

      {step === 'sub' && coreData && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {coreData.subFeelings.map(sub => (
              <button
                key={sub.id}
                onClick={() => onSelectFeeling(sub.mapsTo)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left',
                  background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px', padding: '12px 14px', cursor: 'pointer', transition: 'all 0.15s',
                  width: '100%',
                }}
              >
                <span style={{ fontSize: '24px', flexShrink: 0 }}>{sub.emoji}</span>
                <div>
                  <div style={{ color: '#f8fafc', fontSize: '0.9rem', fontWeight: 600 }}>{sub.label}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem', lineHeight: '1.3', marginTop: '2px' }}>{sub.description}</div>
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={onBack}
            style={{
              marginTop: '12px', background: 'none', border: 'none', color: '#94a3b8',
              fontSize: '0.82rem', cursor: 'pointer', padding: '6px 0',
            }}
          >
            ← Back to the first question
          </button>
        </>
      )}
    </div>
  );
}

export const WellbeingCheckin: React.FC<WellbeingCheckinProps> = ({ onCheckinComplete, onNewParentAlert, soundEnabled, parentEmails, context = 'morning', onDismiss, isModal = false }) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [safetyAlert, setSafetyAlert] = useState<string | null>(null);
  const [emailSentStatus, setEmailSentStatus] = useState<boolean>(false);
  const [hasAwarded, setHasAwarded] = useState(false);
  const [showFeelingsWheel, setShowFeelingsWheel] = useState(false);
  const [wheelStep, setWheelStep] = useState<'core' | 'sub'>('core');
  const [selectedCore, setSelectedCore] = useState<string | null>(null);

  const handleSelectMood = (moodId: string) => {
    setSelectedMood(moodId);
    setSafetyAlert(null);
    setEmailSentStatus(false);
    if (soundEnabled) playSound.pop();

    const responses = context === 'bedtime' ? BEDTIME_RESPONSES : RESPONSES;
    const response = responses[moodId];
    setAiReply(response);

    if (soundEnabled) {
      speakText(response);
    }

    const moodObj = FEELINGS.find(f => f.id === moodId);
    const scanResult = scanChildInput('', moodId);

    if (scanResult.emailAlertPayload) {
      sendParentEmailAlert(scanResult.emailAlertPayload);
      setEmailSentStatus(true);
    }

    // Push parent alert
    onNewParentAlert({
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mood: moodId,
      moodEmoji: moodObj?.emoji || '💛',
      note: `Learner selected feeling: ${moodObj?.label || moodId} (${context} check-in)`,
      isUrgent: scanResult.isUrgent,
      createdAt: new Date().toISOString()
    });

    if (!hasAwarded) {
      onCheckinComplete(moodId, 10);
      setHasAwarded(true);
    }
  };

  const handleSendCustomText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    const scanResult = scanChildInput(customText, selectedMood || 'talk', parentEmails);
    const moodObj = FEELINGS.find(f => f.id === selectedMood);

    if (scanResult.emailAlertPayload) {
      sendParentEmailAlert(scanResult.emailAlertPayload);
      setEmailSentStatus(true);
    }

    if (scanResult.isUrgent) {
      setSafetyAlert(scanResult.reassuranceMessage || null);
      if (soundEnabled) speakText(scanResult.reassuranceMessage || '');

      onNewParentAlert({
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mood: selectedMood || 'urgent',
        moodEmoji: '🚨',
        note: `URGENT SAFETY FLAG: "${customText}"`,
        isUrgent: true,
        createdAt: new Date().toISOString()
      });
      return;
    }

    setSafetyAlert(null);
    const textReply = `Thank you for sharing that with me! You are doing a wonderful job expressing your thoughts today. ✨`;
    setAiReply(textReply);
    if (soundEnabled) speakText(textReply);

    onNewParentAlert({
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mood: selectedMood || 'talk',
      moodEmoji: moodObj?.emoji || '💬',
      note: `Learner note: "${customText}"`,
      isUrgent: false,
      createdAt: new Date().toISOString()
    });

    setCustomText('');
  };

  const contextPrompt = CONTEXT_PROMPTS[context];

  const content = (
    <div className="glass-card animate-pop" style={{ padding: '28px', marginBottom: isModal ? '0' : '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(255, 107, 107, 0.2)', padding: '10px', borderRadius: '16px' }}>
            <Heart size={24} color="#ff6b6b" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', color: '#f8fafc' }}>{contextPrompt.title}</h2>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{contextPrompt.subtitle}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {emailSentStatus && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', padding: '4px 10px', borderRadius: '10px', fontSize: '0.78rem' }}>
              <Mail size={14} />
              <span>Parent alert prepared (delivery not confirmed)</span>
            </div>
          )}
          {isModal && onDismiss && selectedMood && (
            <button onClick={onDismiss} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '12px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Close" aria-label="Close check-in">
              <X size={20} color="#94a3b8" />
            </button>
          )}
        </div>
      </div>

      {/* Feelings Selector Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
        gap: '12px',
        marginBottom: '12px' 
      }}>
        {FEELINGS.map(f => {
          const isSelected = selectedMood === f.id;
          return (
            <button
              key={f.id}
              onClick={() => { setShowFeelingsWheel(false); handleSelectMood(f.id); }}
              style={{
                background: isSelected ? f.border : f.bg,
                border: `2px solid ${isSelected ? '#ffffff' : f.border}`,
                borderRadius: '18px',
                padding: '16px 12px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                boxShadow: isSelected ? '0 10px 20px rgba(0,0,0,0.4)' : 'none'
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '6px' }}>{f.emoji}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>{f.label}</div>
            </button>
          );
        })}
      </div>

      {/* "I don't know" button */}
      {!selectedMood && !showFeelingsWheel && (
        <button
          onClick={() => { setShowFeelingsWheel(true); setWheelStep('core'); setSelectedCore(null); }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            background: 'rgba(255, 255, 255, 0.05)', border: '2px dashed rgba(255, 255, 255, 0.2)',
            borderRadius: '14px', padding: '12px', cursor: 'pointer', color: '#94a3b8',
            fontSize: '0.9rem', marginBottom: '20px', transition: 'all 0.2s',
          }}
        >
          🤔 I don&apos;t know how I feel
        </button>
      )}

      {/* Feelings Wheel — simplified for children */}
      {showFeelingsWheel && <FeelingsWheel
        step={wheelStep}
        selectedCore={selectedCore}
        onSelectCore={(core) => { setSelectedCore(core); setWheelStep('sub'); }}
        onSelectFeeling={(feelingId) => { setShowFeelingsWheel(false); handleSelectMood(feelingId); }}
        onBack={() => { setWheelStep('core'); setSelectedCore(null); }}
        onClose={() => setShowFeelingsWheel(false)}
      />}

      {/* Urgent Safety Alert Card */}
      {safetyAlert && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.2)', 
          border: '1px solid rgba(239, 68, 68, 0.5)', 
          padding: '18px', 
          borderRadius: '16px',
          marginBottom: '20px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}>
          <ShieldAlert size={28} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ color: '#fca5a5', marginBottom: '4px', fontSize: '1rem' }}>Safety Support Alert</h4>
            <p style={{ color: '#fee2e2', fontSize: '0.92rem', lineHeight: '1.4' }}>{safetyAlert}</p>
          </div>
        </div>
      )}

      {/* AI Voice & Text Empathetic Reply */}
      {aiReply && !safetyAlert && (
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.06)', 
          border: '1px solid rgba(255, 255, 255, 0.15)', 
          borderRadius: '18px', 
          padding: '18px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Sparkles size={22} color="#fbbf24" style={{ flexShrink: 0 }} />
            <p style={{ color: '#f8fafc', fontSize: '0.95rem', lineHeight: '1.4' }}>
              {aiReply}
            </p>
          </div>
          <button 
            onClick={() => speakText(aiReply)} 
            className="btn-secondary"
            style={{ padding: '8px 12px', borderRadius: '12px', flexShrink: 0 }}
            title="Listen out loud"
          >
            <Volume2 size={18} color="#fbbf24" />
          </button>
        </div>
      )}

      {/* Optional Tell Me More Input */}
      {selectedMood && (
        <form onSubmit={handleSendCustomText} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Want to tell me a little more in your own words?"
            style={{
              flex: 1,
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--card-border)',
              borderRadius: '14px',
              padding: '12px 16px',
              color: '#f8fafc',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '12px 18px' }}>
            <Send size={18} />
          </button>
        </form>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(6px)',
        padding: '20px',
      }}>
        <div style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
          {content}
        </div>
      </div>
    );
  }

  return content;
};

// ─────────────────────────────────────────────────────────────────────────────
// CHECK-IN TRACKER — Tracks which check-ins have been completed today
// ─────────────────────────────────────────────────────────────────────────────

const CHECKIN_STORAGE_KEY = 'explorer_checkins_today_v1';

interface CheckinRecord {
  date: string; // YYYY-MM-DD
  completed: CheckinContext[];
}

function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function getCompletedCheckins(): CheckinContext[] {
  try {
    const stored = JSON.parse(localStorage.getItem(CHECKIN_STORAGE_KEY) || 'null') as CheckinRecord | null;
    if (stored && stored.date === getTodayKey()) return stored.completed;
    return [];
  } catch { return []; }
}

export function markCheckinDone(context: CheckinContext): void {
  const completed = getCompletedCheckins();
  if (!completed.includes(context)) {
    completed.push(context);
  }
  const record: CheckinRecord = { date: getTodayKey(), completed };
  localStorage.setItem(CHECKIN_STORAGE_KEY, JSON.stringify(record));
}

export function isCheckinNeeded(context: CheckinContext): boolean {
  return !getCompletedCheckins().includes(context);
}

export function isBedtimeWindow(): boolean {
  const hour = new Date().getHours();
  return hour >= 19; // 7 PM onwards
}

