/**
 * WCED (Western Cape Education Department) 7-Point Grading Scale
 * Used in South African schools for formal assessment results.
 */

export interface WCEDLevel {
  level: number;
  label: string;
  min: number;
  max: number;
  color: string;
}

export const WCED_SCALE: WCEDLevel[] = [
  { level: 7, label: 'Outstanding Achievement', min: 80, max: 100, color: '#2dd4bf' },
  { level: 6, label: 'Meritorious Achievement', min: 70, max: 79, color: '#22c55e' },
  { level: 5, label: 'Substantial Achievement', min: 60, max: 69, color: '#a3e635' },
  { level: 4, label: 'Adequate Achievement', min: 50, max: 59, color: '#fbbf24' },
  { level: 3, label: 'Moderate Achievement', min: 40, max: 49, color: '#f97316' },
  { level: 2, label: 'Elementary Achievement', min: 30, max: 39, color: '#ef4444' },
  { level: 1, label: 'Not Achieved', min: 0, max: 29, color: '#94a3b8' },
];

export function getWCEDLevel(percentage: number): WCEDLevel {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));
  return WCED_SCALE.find(l => clamped >= l.min) || WCED_SCALE[WCED_SCALE.length - 1];
}

export function getWCEDFromStars(starsEarned: number, totalPossible: number): WCEDLevel {
  if (totalPossible === 0) return WCED_SCALE[WCED_SCALE.length - 1];
  const pct = (starsEarned / totalPossible) * 100;
  return getWCEDLevel(pct);
}
