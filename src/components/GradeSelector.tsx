import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';

interface GradeSelectorProps {
  currentGrade: 3 | 4;
  onSelectGrade: (grade: 3 | 4) => void;
}

export const GradeSelector: React.FC<GradeSelectorProps> = ({ currentGrade, onSelectGrade }) => {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      background: 'rgba(15, 23, 42, 0.6)',
      border: '1px solid var(--card-border)',
      padding: '4px 6px',
      borderRadius: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 8px', color: '#fbbf24', fontSize: '0.82rem', fontWeight: 700 }}>
        <BookOpen size={14} />
        <span>Curriculum:</span>
      </div>

      <button
        onClick={() => onSelectGrade(3)}
        style={{
          background: currentGrade === 3 ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' : 'transparent',
          color: currentGrade === 3 ? '#1e1b4b' : '#94a3b8',
          border: 'none',
          borderRadius: '12px',
          padding: '6px 12px',
          fontSize: '0.82rem',
          fontWeight: 800,
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        Grade 3
      </button>

      <button
        onClick={() => onSelectGrade(4)}
        style={{
          background: currentGrade === 4 ? 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' : 'transparent',
          color: currentGrade === 4 ? '#ffffff' : '#94a3b8',
          border: 'none',
          borderRadius: '12px',
          padding: '6px 12px',
          fontSize: '0.82rem',
          fontWeight: 800,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          transition: 'all 0.2s ease'
        }}
      >
        <span>Grade 4</span>
        <Sparkles size={12} />
      </button>
    </div>
  );
};
