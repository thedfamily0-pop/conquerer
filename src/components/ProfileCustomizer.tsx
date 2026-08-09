import { useRef, useState } from 'react';
import { Camera, Palette, X } from 'lucide-react';
import { scrubExifMetadata } from '../services/exifScrubber';
import { BACKGROUNDS, PROFILE_AVATARS, SKINS, type LearnerProfile } from '../data/profileData';

interface Props { profile: LearnerProfile; onChange: (profile: LearnerProfile) => void; onClose: () => void; }
export function ProfileCustomizer({ profile, onChange, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null); const [error, setError] = useState('');
  const update = (patch: Partial<LearnerProfile>) => onChange({ ...profile, ...patch });
  const upload = async (file?: File) => {
    if (!file) return; if (!file.type.startsWith('image/')) { setError('Please choose an image file.'); return; }
    if (file.size > 2_000_000) { setError('Choose a photo smaller than 2 MB.'); return; }
    try { setError(''); const clean = await scrubExifMetadata(file); update({ photoDataUrl: clean.cleanDataUrl }); }
    catch { setError('That photo could not be used. Please try another one.'); }
  };
  return <div className="profile-overlay" role="dialog" aria-modal="true" aria-label="Make Conquerer yours"><div className="glass-card profile-panel">
    <button className="icon-close" onClick={onClose} aria-label="Close customisation"><X size={18}/></button><h2>Make Conquerer yours 🎨</h2><p className="muted">These choices stay on this device and never change your diary.</p>
    <label className="form-label">Name Nomi should use<input value={profile.displayName} maxLength={24} onChange={e => update({ displayName: e.target.value.replace(/[^\p{L}\p{N} .'-]/gu, '') })}/></label>
    <div className="profile-photo">{profile.photoDataUrl ? <img src={profile.photoDataUrl} alt="Your chosen profile"/> : <span>{profile.avatar}</span>}<button className="btn-secondary" onClick={() => inputRef.current?.click()}><Camera size={16}/>Choose photo</button><input ref={inputRef} type="file" accept="image/*" hidden onChange={e => upload(e.target.files?.[0])}/>{profile.photoDataUrl && <button className="text-button" onClick={() => update({ photoDataUrl: undefined })}>Use an avatar instead</button>}</div>
    {error && <p className="form-error">{error}</p>}<h3>Choose an avatar</h3><div className="choice-grid">{PROFILE_AVATARS.map(avatar => <button key={avatar} className={profile.avatar === avatar && !profile.photoDataUrl ? 'selected' : ''} onClick={() => update({ avatar, photoDataUrl: undefined })}>{avatar}</button>)}</div>
    <h3><Palette size={16}/> Your colours</h3><div className="theme-options">{SKINS.map(skin => <button key={skin.id} className={profile.skin === skin.id ? 'selected' : ''} onClick={() => update({ skin: skin.id })}>{skin.emoji} {skin.label}</button>)}</div><h3>Background</h3><div className="theme-options">{BACKGROUNDS.map(background => <button key={background.id} className={profile.background === background.id ? 'selected' : ''} onClick={() => update({ background: background.id })}>{background.emoji} {background.label}</button>)}</div>
  </div></div>;
}
