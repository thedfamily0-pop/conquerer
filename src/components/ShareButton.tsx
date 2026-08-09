import { useState, useRef, useEffect } from 'react';
import { Share2 } from 'lucide-react';
import { confirmShare } from '../services/guardrails/shareConfirmation';

interface Props {
  message: string;
  subject?: string;
}

const SIGNATURE = '\n\n— sent from Conquerer 🚀';

export function ShareButton({ message, subject = 'Look what I did!' }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const fullMessage = message + SIGNATURE;

  const shareWhatsApp = async () => {
    const confirmed = await confirmShare('whatsapp');
    if (!confirmed) { setOpen(false); return; }
    window.open(`https://wa.me/?text=${encodeURIComponent(fullMessage)}`, '_blank');
    setOpen(false);
  };

  const shareEmail = async () => {
    const confirmed = await confirmShare('email');
    if (!confirmed) { setOpen(false); return; }
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`, '_self');
    setOpen(false);
  };

  return (
    <div className="share-button-wrapper" ref={ref}>
      <button
        className="share-trigger"
        onClick={() => setOpen(!open)}
        aria-label="Share"
        title="Share this"
      >
        <Share2 size={16} />
      </button>
      {open && (
        <div className="share-dropdown glass-card">
          <button onClick={shareWhatsApp}>💬 WhatsApp</button>
          <button onClick={shareEmail}>✉️ Email</button>
        </div>
      )}
    </div>
  );
}
