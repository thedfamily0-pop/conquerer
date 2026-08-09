import { useRef, useState } from 'react';
import { Camera, Check, Loader2, X } from 'lucide-react';
import { scrubExifMetadata } from '../services/exifScrubber';
import { moderateImage, buildImageAlertPayload } from '../services/guardrails/imageModeration';
import { sendParentEmailAlert } from '../services/childSafetyScanner';
import { flattenParentEmails, loadParentEmailSettings } from '../services/parentEmailSettings';

interface Props {
  onCapture: (dataUrl: string) => void;
  onCancel: () => void;
  title?: string;
}

export function PhotoEvidence({ onCapture, onCancel, title = 'Take a photo as proof' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please choose a photo.'); return; }
    if (file.size > 5_000_000) { setError('Photo too large (max 5 MB).'); return; }
    setLoading(true); setError('');
    try {
      // Image moderation check
      const modResult = await moderateImage(file);
      if (!modResult.isSafe) {
        // Notify parents about flagged image
        try {
          const emails = flattenParentEmails(loadParentEmailSettings());
          if (emails.length > 0) {
            const alert = buildImageAlertPayload(modResult.reason || 'Content flagged', 'Chore photo evidence', emails);
            sendParentEmailAlert(alert);
          }
        } catch { /* non-critical */ }
        setError(modResult.reason || 'This photo was flagged. Please take a different one.');
        setLoading(false);
        return;
      }

      const clean = await scrubExifMetadata(file);
      // Resize to max 800px wide to save storage
      const img = new Image();
      img.src = clean.cleanDataUrl;
      await new Promise(resolve => { img.onload = resolve; });
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 800 / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const resized = canvas.toDataURL('image/jpeg', 0.82);
      setPreview(resized);
    } catch {
      setError('Could not process photo. Try again.');
    }
    setLoading(false);
  };

  return (
    <div className="photo-evidence-overlay">
      <div className="glass-card photo-evidence-panel">
        <button className="icon-close" onClick={onCancel} aria-label="Cancel"><X size={18}/></button>
        <h3>📸 {title}</h3>
        <p className="muted">Take a picture to show it's done. GPS data is automatically removed.</p>

        {!preview ? (
          <div className="photo-capture-area">
            {loading ? (
              <div className="photo-loading"><Loader2 size={28} className="spin"/><span>Processing…</span></div>
            ) : (
              <>
                <button className="btn-primary photo-capture-btn" onClick={() => inputRef.current?.click()}>
                  <Camera size={20}/> Take photo or choose from gallery
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  hidden
                  onChange={e => handleFile(e.target.files?.[0])}
                />
              </>
            )}
            {error && <p className="form-error">{error}</p>}
          </div>
        ) : (
          <div className="photo-preview-area">
            <img src={preview} alt="Evidence preview" className="photo-preview-img"/>
            <div className="photo-actions">
              <button className="btn-secondary" onClick={() => { setPreview(null); inputRef.current?.click(); }}>
                <Camera size={16}/> Retake
              </button>
              <button className="btn-primary" onClick={() => onCapture(preview)}>
                <Check size={16}/> Use this photo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
