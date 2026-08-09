export type SkinId = 'midnight' | 'ocean' | 'sunset' | 'garden';
export type BackgroundId = 'aurora' | 'stars' | 'clouds';
export interface LearnerProfile { displayName: string; avatar: string; photoDataUrl?: string; skin: SkinId; background: BackgroundId; nomiName: string; setupDone: boolean; }
const PROFILE_KEY = 'explorer_learner_profile_v1';
export const PROFILE_AVATARS = ['🌟', '🚀', '🦋', '🦄', '🌻', '🐬', '🧸', '🎨'];
export const SKINS: { id: SkinId; label: string; emoji: string }[] = [
  { id: 'midnight', label: 'Midnight', emoji: '🌙' }, { id: 'ocean', label: 'Ocean', emoji: '🌊' },
  { id: 'sunset', label: 'Sunset', emoji: '🌅' }, { id: 'garden', label: 'Garden', emoji: '🌿' },
];
export const BACKGROUNDS: { id: BackgroundId; label: string; emoji: string }[] = [
  { id: 'aurora', label: 'Aurora', emoji: '✨' }, { id: 'stars', label: 'Starry', emoji: '⭐' }, { id: 'clouds', label: 'Cloudy', emoji: '☁️' },
];
const DEFAULT_PROFILE: LearnerProfile = { displayName: 'Ufefe', avatar: '🌟', skin: 'midnight', background: 'aurora', nomiName: 'Nomi', setupDone: false };
function isSkin(value: unknown): value is SkinId { return ['midnight', 'ocean', 'sunset', 'garden'].includes(String(value)); }
function isBackground(value: unknown): value is BackgroundId { return ['aurora', 'stars', 'clouds'].includes(String(value)); }
export function loadProfile(): LearnerProfile {
  try {
    const stored = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}') as Partial<LearnerProfile>;
    return { displayName: typeof stored.displayName === 'string' && stored.displayName.trim() ? stored.displayName.trim().slice(0, 24).replace(/^./,  (c: string) => c.toUpperCase()) : DEFAULT_PROFILE.displayName, avatar: PROFILE_AVATARS.includes(stored.avatar || '') ? stored.avatar! : DEFAULT_PROFILE.avatar, photoDataUrl: typeof stored.photoDataUrl === 'string' && stored.photoDataUrl.startsWith('data:image/') ? stored.photoDataUrl : undefined, skin: isSkin(stored.skin) ? stored.skin : DEFAULT_PROFILE.skin, background: isBackground(stored.background) ? stored.background : DEFAULT_PROFILE.background, nomiName: typeof stored.nomiName === 'string' && stored.nomiName.trim() ? stored.nomiName.trim().slice(0, 20) : DEFAULT_PROFILE.nomiName, setupDone: stored.setupDone === true };
  } catch { return DEFAULT_PROFILE; }
}
export function saveProfile(profile: LearnerProfile): void { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); }
