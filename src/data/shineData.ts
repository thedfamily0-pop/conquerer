/**
 * Weekly Shine & Affirmations data layer
 * Daily reflection + affirmation categories + Mom's Note
 */

const SHINE_KEY = 'explorer_shine_v1';

export interface ShineDayEntry {
  proud: string;
  grateful: string;
  kindness: string;
  todayI: string;
  shineGoal: string;
}

export interface ShineState {
  days: Record<string, ShineDayEntry>;
  growingGoal: string;
  momNote: string;
  mommyAffirmation: string;
}

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const AFFIRMATION_CATEGORIES = [
  { title: '💛 I Am Worthy', color: '#fbbf24', items: ['I am enough exactly as I am.', 'I deserve love and kindness.', 'My feelings matter.', 'I am worthy of good things.'] },
  { title: '�� I Am Brave', color: '#f97316', items: ['I can do hard things.', 'Mistakes help me grow.', 'I am braver than I feel.', 'I will try again tomorrow.'] },
  { title: '💗 I Am Kind', color: '#ec4899', items: ['I choose kindness every day.', 'My words can heal.', 'I make the world brighter.', 'Helping others fills my heart.'] },
  { title: '🌟 I Am Growing', color: '#a78bfa', items: ['Every day I learn something new.', 'I am proud of my progress.', 'My brain gets stronger when I practise.', 'I celebrate small wins.'] },
  { title: '🙏 I Am Blessed', color: '#14b8a6', items: ['I am thankful for my family.', 'God made me wonderfully.', 'I am protected and guided.', 'I have everything I need today.'] },
];

export const BEDTIME_AFFIRMATION = [
  'I am safe.', 'I am loved.', 'I am kind.', 'I am brave.',
  'I am smart.', 'I am strong.', 'I can learn.', 'I matter.',
  'Tomorrow is a brand-new day.',
];

export const DEFAULT_MOMMY_AFFIRMATION = "Ufefe, you are my greatest gift. I love you exactly as you are \u2014 you don't have to earn my love with perfect marks or by being perfect. You are brave, kind, clever and wonderfully made. Even on hard days, I will keep loving you, listening to you, and believing in you. Love always, Mommy. \u{1F49C}";

export function loadShineState(): ShineState {
  try {
    const stored = localStorage.getItem(SHINE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { days: {}, growingGoal: '', momNote: '', mommyAffirmation: DEFAULT_MOMMY_AFFIRMATION };
}

export function saveShineState(state: ShineState): void {
  localStorage.setItem(SHINE_KEY, JSON.stringify(state));
}

export function getEmptyShineDayEntry(): ShineDayEntry {
  return { proud: '', grateful: '', kindness: '', todayI: '', shineGoal: '' };
}
