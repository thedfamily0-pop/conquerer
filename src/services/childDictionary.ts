export interface DictionaryLookup { ok: boolean; meaning?: string; example?: string; error?: string; }
interface CacheEntry { meaning: string; example?: string; cachedAt: string; }
interface DictionaryEntry { meanings?: Array<{ partOfSpeech?: string; definitions?: Array<{ definition?: string; example?: string }> }>; }

const CACHE_KEY = 'explorer_dictionary_cache_v1';
const MAX_CACHE_ENTRIES = 200;
const MAX_CACHE_AGE_MS = 90 * 24 * 60 * 60 * 1000;

function normaliseWord(value: string): string | null {
  const word = value.trim().toLowerCase();
  return /^[a-z]+(?:['-][a-z]+)*$/.test(word) && word.length <= 60 ? word : null;
}

function readCache(): Record<string, CacheEntry> {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') as Record<string, CacheEntry>; }
  catch { return {}; }
}

function saveCache(cache: Record<string, CacheEntry>): void {
  const entries = Object.entries(cache).sort(([, a], [, b]) => b.cachedAt.localeCompare(a.cachedAt)).slice(0, MAX_CACHE_ENTRIES);
  localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
}

function cleanDefinition(value: string): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, 240);
}

export async function lookupEnglishWord(rawWord: string): Promise<DictionaryLookup> {
  const word = normaliseWord(rawWord);
  if (!word) return { ok: false, error: 'Try one English word, using letters, apostrophes, or hyphens.' };
  const cache = readCache();
  const cached = cache[word];
  if (cached && Date.now() - new Date(cached.cachedAt).getTime() < MAX_CACHE_AGE_MS) return { ok: true, meaning: cached.meaning, example: cached.example };
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!response.ok) return { ok: false, error: 'I could not find that word yet. You can add your own meaning.' };
    const entries = await response.json() as DictionaryEntry[];
    const definition = entries.flatMap(entry => entry.meanings || []).flatMap(meaning => (meaning.definitions || []).map(definition => ({ partOfSpeech: meaning.partOfSpeech, ...definition }))).find(item => typeof item.definition === 'string' && item.definition.trim());
    if (!definition?.definition) return { ok: false, error: 'I could not find a short meaning for that word. You can add your own.' };
    const meaning = `${definition.partOfSpeech ? `${definition.partOfSpeech}: ` : ''}${cleanDefinition(definition.definition)}`;
    const example = definition.example ? cleanDefinition(definition.example) : undefined;
    cache[word] = { meaning, example, cachedAt: new Date().toISOString() };
    saveCache(cache);
    return { ok: true, meaning, example };
  } catch {
    return { ok: false, error: 'Dictionary lookup is offline right now. You can still write your own meaning.' };
  }
}
