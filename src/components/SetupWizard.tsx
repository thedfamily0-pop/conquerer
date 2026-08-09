import { useState } from 'react';
import { Rocket, Sparkles } from 'lucide-react';
import { PROFILE_AVATARS, type LearnerProfile } from '../data/profileData';

interface Props { onComplete: (profile: Partial<LearnerProfile> & { nomiName: string; parentPin: string }) => void; }

export function SetupWizard({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🌟');
  const [nomiName, setNomiName] = useState('Nomi');
  const [parentPin, setParentPin] = useState('');

  const finish = () => {
    onComplete({ displayName: name.trim() || 'Explorer', avatar, nomiName: nomiName.trim() || 'Nomi', parentPin: parentPin.trim() });
  };

  return (
    <div className="setup-overlay">
      <div className="glass-card setup-panel animate-pop">
        {step === 0 && (
          <div className="setup-step">
            <div className="setup-emoji">🚀</div>
            <h1>Welcome to Conquerer!</h1>
            <p>Let's set things up so the app feels like yours.</p>
            <button className="btn-primary" onClick={() => setStep(1)}>
              <Rocket size={18}/> Let's go!
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="setup-step">
            <div className="setup-emoji">👋</div>
            <h2>What should we call you?</h2>
            <p className="muted">This is the name your AI companion will use.</p>
            <input
              className="setup-input"
              value={name}
              maxLength={24}
              onChange={e => setName(e.target.value.replace(/[^\p{L}\p{N} .'-]/gu, ''))}
              placeholder="Your first name"
              autoFocus
            />
            <button className="btn-primary" onClick={() => setStep(2)} disabled={!name.trim()}>
              Next →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="setup-step">
            <div className="setup-emoji">✨</div>
            <h2>Pick your avatar</h2>
            <p className="muted">This will show on your profile.</p>
            <div className="choice-grid setup-avatars">
              {PROFILE_AVATARS.map(a => (
                <button key={a} className={avatar === a ? 'selected' : ''} onClick={() => setAvatar(a)}>{a}</button>
              ))}
            </div>
            <button className="btn-primary" onClick={() => setStep(3)}>Next →</button>
          </div>
        )}

        {step === 3 && (
          <div className="setup-step">
            <div className="setup-emoji"><Sparkles size={40} color="#fbbf24"/></div>
            <h2>Name your AI friend</h2>
            <p className="muted">This is your personal companion who chats with you, tells jokes, and helps with homework.</p>
            <input className="setup-input" value={nomiName} maxLength={20} onChange={e => setNomiName(e.target.value.replace(/[^\p{L}\p{N} .'-]/gu, ''))} placeholder="e.g. Nomi, Star, Zuki" autoFocus />
            <button className="btn-primary" onClick={() => setStep(4)}>Next →</button>
          </div>
        )}

        {step === 4 && (
          <div className="setup-step">
            <div className="setup-emoji">🔒</div>
            <h2>Create a private portal PIN</h2>
            <p className="muted">Create a private portal PIN for this account. You can change it any time from Settings.</p>
            <input className="setup-input" type="password" inputMode="numeric" minLength={4} maxLength={12} value={parentPin} onChange={e => setParentPin(e.target.value.replace(/\D/g, ''))} placeholder="At least 4 digits" autoFocus />
            <button className="btn-primary" onClick={finish} disabled={parentPin.length < 4}>
              <Sparkles size={17}/> Start exploring!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
