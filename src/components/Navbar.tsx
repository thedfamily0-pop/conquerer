import React from 'react';
import { Flame, Award, Volume2, VolumeX, ShieldCheck, Sparkles } from 'lucide-react';

interface NavbarProps {
  xp: number;
  level: number;
  streak: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenParentPortal: () => void;
  onOpenBadges: () => void;
  onOpenXpTracker: () => void;
  displayName: string;
  profilePhoto?: string;
  avatar: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  xp,
  level,
  streak,
  soundEnabled,
  onToggleSound,
  onOpenParentPortal,
  onOpenBadges,
  onOpenXpTracker,
  displayName,
  profilePhoto,
  avatar,
}) => {
  return (
    <header className="glass-card" style={{ padding: '16px 28px', marginBottom: '28px', borderRadius: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div 
            className="animate-float" 
            style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '16px', 
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              boxShadow: '0 8px 16px rgba(245, 158, 11, 0.4)'
            }}
          >
            {profilePhoto ? <img src={profilePhoto} alt={`${displayName}'s profile`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} /> : avatar}
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', color: '#f8fafc', letterSpacing: '-0.02em' }}>
              Conquerer
            </h1>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{displayName}'s Grade 3 Companion</p>
          </div>
        </div>

        {/* Gamification Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          
          {/* Level Badge */}
          <div 
            onClick={onOpenBadges}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'rgba(168, 85, 247, 0.18)', 
              border: '1px solid rgba(168, 85, 247, 0.35)', 
              padding: '8px 14px', 
              borderRadius: '14px',
              cursor: 'pointer'
            }}
          >
            <Award size={20} color="#a855f7" />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e9d5ff' }}>
              Level {level}
            </span>
          </div>

          {/* XP Counter */}
          <button
            onClick={onOpenXpTracker}
            aria-label="Open XP activity tracker"
            title="See when you earned and spent XP"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(251, 191, 36, 0.18)',
              border: '1px solid rgba(251, 191, 36, 0.35)',
              padding: '8px 14px',
              borderRadius: '14px',
              cursor: 'pointer',
              color: '#fef08a'
            }}
          >
            <Sparkles size={20} color="#fbbf24" />
            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
              {xp} XP to spend
            </span>
          </button>

          {/* Streak Counter */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(255, 107, 107, 0.18)', 
            border: '1px solid rgba(255, 107, 107, 0.35)', 
            padding: '8px 14px', 
            borderRadius: '14px' 
          }}>
            <Flame size={20} color="#ff6b6b" />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fca5a5' }}>
              {streak} Day Streak
            </span>
          </div>

          {/* Sound Toggle */}
          <button 
            onClick={onToggleSound} 
            className="btn-secondary" 
            style={{ padding: '8px 12px', borderRadius: '12px' }}
            title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
          >
            {soundEnabled ? <Volume2 size={18} color="#14b8a6" /> : <VolumeX size={18} color="#94a3b8" />}
          </button>

          {/* Parent Portal Button */}
          <button 
            onClick={onOpenParentPortal} 
            className="btn-secondary" 
            style={{ padding: '8px 14px', borderRadius: '12px', borderColor: 'rgba(59, 130, 246, 0.4)', background: 'rgba(59, 130, 246, 0.15)' }}
          >
            <ShieldCheck size={18} color="#60a5fa" />
            <span style={{ fontSize: '0.85rem', color: '#93c5fd' }}>Parent Zone</span>
          </button>

        </div>

      </div>
    </header>
  );
};
