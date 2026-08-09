import React from 'react';
import { Award, X } from 'lucide-react';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  xp: number;
  level: number;
}

const BADGES = [
  { id: 'b1', name: 'First Spark', emoji: '✨', reqXp: 10, desc: 'You started your learning adventure.' },
  { id: 'b2', name: 'Kind Mind', emoji: '💛', reqXp: 25, desc: 'You made space for your feelings and wellbeing.' },
  { id: 'b3', name: 'Curiosity Spark', emoji: '🔎', reqXp: 40, desc: 'You followed a question and explored a new idea.' },
  { id: 'b4', name: 'Brave Beginner', emoji: '🌱', reqXp: 60, desc: 'You tried something that felt a little tricky.' },
  { id: 'b5', name: 'Reading Trailblazer', emoji: '📚', reqXp: 75, desc: 'You opened the door to more story worlds.' },
  { id: 'b6', name: 'Maths Pathfinder', emoji: '🧭', reqXp: 100, desc: 'You kept looking for a smart way through a maths challenge.' },
  { id: 'b7', name: 'Practice Voyager', emoji: '🌍', reqXp: 125, desc: 'You explored your learning path with steady curiosity.' },
  { id: 'b8', name: 'Try-Again Trailblazer', emoji: '🔁', reqXp: 150, desc: 'You discovered that a second try can grow an idea.' },
  { id: 'b9', name: 'Afrikaans Explorer', emoji: '🇿🇦', reqXp: 175, desc: 'You made room for new words and sounds.' },
  { id: 'b10', name: 'Coding Builder', emoji: '🤖', reqXp: 200, desc: 'You built your thinking one small step at a time.' },
  { id: 'b11', name: 'Quest Guide', emoji: '🗺️', reqXp: 250, desc: 'You remembered, used, and explained ideas.' },
  { id: 'b12', name: 'Steady Explorer', emoji: '🔥', reqXp: 300, desc: 'You kept making time for learning.' },
  { id: 'b13', name: 'Confident Explainer', emoji: '🎓', reqXp: 400, desc: 'You practised putting your ideas into your own words.' },
  { id: 'b14', name: 'Wonder Collector', emoji: '🌟', reqXp: 500, desc: 'You collected many moments of curiosity and growth.' },
];

export const BadgesModal: React.FC<BadgesModalProps> = ({ isOpen, onClose, xp }) => {
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
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Every curious question, brave try, and thoughtful retry counts.</p>
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
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
