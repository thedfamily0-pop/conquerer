import { getCurrentTermInfo } from './termCalendar';

export interface VocabWord {
  id: string;
  word: string;
  meaning: string;
  example?: string;
  language: 'english' | 'afrikaans' | 'zulu' | 'other';
  term: number;
  week: number;
  addedAt: string;
}

const VOCAB_KEY = 'explorer_vocab_book_v1';

export function loadVocab(): VocabWord[] {
  try { return JSON.parse(localStorage.getItem(VOCAB_KEY) || '[]'); }
  catch { return []; }
}

export function saveVocab(words: VocabWord[]): void {
  localStorage.setItem(VOCAB_KEY, JSON.stringify(words));
}

/** Create a new vocab entry stamped with the current term/week */
export function createVocabWord(word: string, meaning: string, example?: string, language: VocabWord['language'] = 'english'): VocabWord {
  const info = getCurrentTermInfo();
  return {
    id: `vocab_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    word: word.trim(),
    meaning: meaning.trim(),
    example: example?.trim() || undefined,
    language,
    term: info.term,
    week: info.week,
    addedAt: new Date().toISOString(),
  };
}

/** Stats for "Wrapped" style infographic */
export interface VocabWrappedStats {
  totalWords: number;
  byLanguage: Record<string, number>;
  byWeek: { week: number; count: number }[];
  topWeek: { week: number; count: number } | null;
  longestWord: string;
  firstWord: string;
  lastWord: string;
}

export function getWrappedStats(words: VocabWord[], term: number): VocabWrappedStats {
  const termWords = words.filter(w => w.term === term);
  const byLanguage: Record<string, number> = {};
  const weekMap: Record<number, number> = {};

  for (const w of termWords) {
    byLanguage[w.language] = (byLanguage[w.language] || 0) + 1;
    weekMap[w.week] = (weekMap[w.week] || 0) + 1;
  }

  const byWeek = Object.entries(weekMap).map(([week, count]) => ({ week: Number(week), count })).sort((a, b) => a.week - b.week);
  const topWeek = byWeek.length ? byWeek.reduce((a, b) => b.count > a.count ? b : a) : null;
  const sorted = [...termWords].sort((a, b) => a.addedAt.localeCompare(b.addedAt));

  return {
    totalWords: termWords.length,
    byLanguage,
    byWeek,
    topWeek,
    longestWord: termWords.reduce((longest, w) => w.word.length > longest.length ? w.word : longest, ''),
    firstWord: sorted[0]?.word || '',
    lastWord: sorted[sorted.length - 1]?.word || '',
  };
}
