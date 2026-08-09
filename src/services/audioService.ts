// Device-native audio effects and non-cloud text-to-speech.
let audioCtx: AudioContext | null = null;
const VOICE_PREFERENCE_KEY = 'explorer_voice_preference_v1';

export const VOICE_CHOICES = [
  { id: 'sunny', label: 'Sunny', emoji: '☀️', description: 'Bright, cheerful, and curious.' },
  { id: 'calm', label: 'Calm', emoji: '🌿', description: 'Gentle, steady, and soothing.' },
  { id: 'storyteller', label: 'Storyteller', emoji: '📚', description: 'Warm, expressive, and playful.' },
] as const;
export type VoiceChoiceId = typeof VOICE_CHOICES[number]['id'];
export type SpeechLanguage = 'english' | 'afrikaans';

const VOICE_PRESETS: Record<VoiceChoiceId, { rate: number; pitch: number; keywords: string[] }> = {
  sunny: { rate: 0.98, pitch: 1.08, keywords: ['samantha', 'google', 'natural', 'enhanced', 'en-us', 'en-au'] },
  calm: { rate: 0.88, pitch: 0.98, keywords: ['en-za', 'karen', 'moira', 'natural', 'enhanced', 'en-gb'] },
  storyteller: { rate: 0.92, pitch: 1.02, keywords: ['natural', 'enhanced', 'premium', 'neural', 'siri', 'google', 'en-gb'] },
};

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const Context = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new Context();
  }
  if (audioCtx.state === 'suspended') void audioCtx.resume();
  return audioCtx;
}
function playNotes(notes: number[], type: OscillatorType, spacing: number, duration: number): void {
  try {
    const ctx = getAudioContext();
    notes.forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const at = ctx.currentTime + index * spacing;
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, at);
      gain.gain.setValueAtTime(.24, at);
      gain.gain.exponentialRampToValueAtTime(.01, at + duration);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(at);
      oscillator.stop(at + duration);
    });
  } catch { /* Audio is optional. */ }
}
export const playSound = { pop: () => playNotes([400, 800], 'sine', .06, .12), success: () => playNotes([523.25, 659.25, 783.99, 1046.5], 'triangle', .08, .2), badge: () => playNotes([440, 554.37, 659.25, 880], 'sine', .1, .3) };

export function loadVoicePreference(): VoiceChoiceId {
  try {
    const value = localStorage.getItem(VOICE_PREFERENCE_KEY);
    return VOICE_CHOICES.some(choice => choice.id === value) ? value as VoiceChoiceId : 'sunny';
  } catch { return 'sunny'; }
}
export function saveVoicePreference(choice: VoiceChoiceId): void {
  try { localStorage.setItem(VOICE_PREFERENCE_KEY, choice); } catch { /* Device storage is optional. */ }
}
function voiceScore(voice: SpeechSynthesisVoice, choice: VoiceChoiceId, language: SpeechLanguage): number {
  const name = voice.name.toLowerCase();
  const locale = voice.lang.toLowerCase();
  const preset = VOICE_PRESETS[choice];
  const keywordScore = language === 'english'
    ? preset.keywords.reduce((score, keyword, index) => score + (name.includes(keyword) || locale.includes(keyword) ? 18 - index : 0), 0)
    : (name.includes('afrikaans') || name.includes('af-za') || locale.startsWith('af-za') ? 100 : 0);
  const localeScore = language === 'afrikaans'
    ? (locale.startsWith('af-za') ? 160 : 0)
    : (locale.startsWith('en-za') ? 80 : locale.startsWith('en-gb') ? 35 : locale.startsWith('en-au') ? 30 : locale.startsWith('en-') ? 20 : 0);
  return keywordScore + localeScore + (voice.localService ? 4 : 0);
}
function preferredVoice(choice: VoiceChoiceId, language: SpeechLanguage): SpeechSynthesisVoice | undefined {
  const prefix = language === 'afrikaans' ? 'af-' : 'en-';
  const voices = window.speechSynthesis.getVoices().filter(voice => voice.lang.toLowerCase().startsWith(prefix));
  return [...voices].sort((a, b) => voiceScore(b, choice, language) - voiceScore(a, choice, language))[0];
}

let speechRequestId = 0;
const VOICE_LOAD_RETRIES = 3;

function speakTextAttempt(text: string, onEnd: (() => void) | undefined, options: { voice?: VoiceChoiceId; language?: SpeechLanguage } | undefined, requestId: number, attempt: number): void {
  if (requestId !== speechRequestId) return;
  try {
    const voices = window.speechSynthesis.getVoices();
    // iOS and some Android browsers populate voices asynchronously. Wait briefly
    // before the first utterance so a selected native voice can be used.
    if (!voices.length && attempt < VOICE_LOAD_RETRIES) {
      window.setTimeout(() => speakTextAttempt(text, onEnd, options, requestId, attempt + 1), 120 * (attempt + 1));
      return;
    }
    const choice = options?.voice || loadVoicePreference();
    const language = options?.language || 'english';
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = preferredVoice(choice, language);
    const preset = VOICE_PRESETS[choice];
    if (voice) { utterance.voice = voice; utterance.lang = voice.lang; }
    else utterance.lang = language === 'afrikaans' ? 'af-ZA' : 'en-ZA';
    utterance.rate = preset.rate;
    utterance.pitch = preset.pitch;
    const finish = () => { if (requestId === speechRequestId) onEnd?.(); };
    utterance.onend = finish;
    utterance.onerror = finish;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } catch { if (requestId === speechRequestId) onEnd?.(); }
}

/** Speaks English with a selected personality or Afrikaans with an Afrikaans device voice. */
export function speakText(text: string, onEnd?: () => void, options?: { voice?: VoiceChoiceId; language?: SpeechLanguage }): void {
  const finish = () => onEnd?.();
  if (!text.trim() || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') { finish(); return; }
  speechRequestId += 1;
  window.speechSynthesis.cancel();
  speakTextAttempt(text, onEnd, options, speechRequestId, 0);
}
/** Call from a user interaction to make browser voice availability more reliable on mobile devices. */
export function warmUpSpeechVoices(): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.getVoices();
  if ('addEventListener' in window.speechSynthesis) window.speechSynthesis.addEventListener('voiceschanged', () => window.speechSynthesis.getVoices(), { once: true });
}
export function stopSpeech(): void { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }
