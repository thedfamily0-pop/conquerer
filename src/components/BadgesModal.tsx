import React from 'react';
import { Award, X } from 'lucide-react';
import { ShareButton } from './ShareButton';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  xp: number;
  level: number;
}

const BADGES = [
  { id: 'b1', name: 'First Check-in', emoji: '💛', reqXp: 10, desc: 'Completed your first daily wellbeing check-in!' },
  { id: 'b2', name: 'Maths Wizard', emoji: '🧙‍♂️', reqXp: 40, desc: 'Solved Grade 3 subtraction with regrouping!' },
  { id: 'b3', name: 'Reading Star', emoji: '🏔️', reqXp: 75, desc: 'Explored the Secret of Table Mountain story!' },
  { id: 'b4', name: 'Afrikaans Champ', emoji: '🇿🇦', reqXp: 100, desc: 'Mastered Grade 3 Afrikaans vocabulary!' },
  { id: 'b5', name: 'Streak Explorer', emoji: '🔥', reqXp: 150, desc: 'Maintained a active learning streak!' },
  { id: 'b6', name: 'AI Scholar', emoji: '🚀', reqXp: 200, desc: 'Reached Level 3 Conquerer status!' },
];

export const BadgesModal: React.FC<BadgesModalProps> = ({ isOpen, onClose, xp, level }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      zIndex: 1000
    }}>
      <div className="glass-card animate-pop" style={{ maxWidth: '600px', width: '100%', padding: '28px', position: 'relative' }}>
        
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f8fafc',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(168, 85, 247, 0.2)', padding: '10px', borderRadius: '16px' }}>
            <Award size={26} color="#a855f7" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', color: '#f8fafc' }}>Conquerer Achievements Gallery</h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Earn XP to unlock shiny new badges!</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
          {BADGES.map(badge => {
            const isUnlocked = xp >= badge.reqXp;
            return (
              <div 
                key={badge.id}
                style={{
                  background: isUnlocked ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.5)',
                  border: `2px solid ${isUnlocked ? '#fbbf24' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '18px',
                  padding: '16px',
                  textAlign: 'center',
                  opacity: isUnlocked ? 1 : 0.6,
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>
                  {badge.emoji}
                </div>
                <h4 style={{ fontSize: '0.95rem', color: isUnlocked ? '#fbbf24' : '#cbd5e1', marginBottom: '4px' }}>
                  {badge.name}
                </h4>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.3' }}>
                  {badge.desc}
                </p>
                <div style={{ marginTop: '8px', fontSize: '0.75rem', fontWeight: 700, color: isUnlocked ? '#2dd4bf' : '#64748b' }}>
                  {isUnlocked ? 'Unlocked ✓' : `Requires ${badge.reqXp} XP`}
                </div>
                {isUnlocked && (
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center' }}>
                    <ShareButton message={`I earned the ${badge.name} badge! ${badge.emoji} Level ${level} Conquerer! 🏆`} subject={`Badge unlocked: ${badge.name}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
