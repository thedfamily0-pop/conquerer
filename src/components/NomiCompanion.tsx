import { useEffect, useRef, useState } from 'react';
import { Mic, Send, Sparkles } from 'lucide-react';
import { ShareButton } from './ShareButton';
import { checkChildSafety, nomiChat, nomiOpeningGreeting } from '../services/nomiAI';
import { detectURLs, detectPII, buildInputAlertPayload } from '../services/guardrails/inputScanner';
import { pruneConversation } from '../services/guardrails/conversationManager';
import { recordUsageEvent } from '../services/guardrails/wellbeingMonitor';
import { sendParentEmailAlert } from '../services/childSafetyScanner';
import { syncInputDetection } from '../services/syncEngine';
import { flattenParentEmails, loadParentEmailSettings } from '../services/parentEmailSettings';
import type { NomiMessage } from '../data/scheduleData';

type SpeechRecognitionInstance = { start: () => void; onresult: ((event: { results: { 0: { transcript: string } }[] }) => void) | null; onerror: (() => void) | null; };
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;
interface Props { displayName: string; nomiName: string; messages: NomiMessage[]; onChange: (messages: NomiMessage[]) => void; onEarnXp: (amount: number) => void; onSafetyAlert: () => void; apiKey?: string; }
const suggestions = ['Tell me a joke 😄', 'Help me with maths 🔢', "What's next today? 📅", "I'm feeling sad 💙"];

export function NomiCompanion({ displayName, nomiName, messages, onChange, onEarnXp, onSafetyAlert, apiKey }: Props) {
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const greeted = useRef(false);

  // Send opening greeting once
  useEffect(() => {
    if (!greeted.current && messages.length === 0) {
      greeted.current = true;
      onChange([{ role: 'nomi', content: nomiOpeningGreeting(displayName), timestamp: new Date().toISOString() }]);
    }
  }, [displayName, messages.length, onChange]);

  // Scroll to bottom on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const send = async (message = draft) => {
    const content = message.trim();
    if (!content || thinking) return;

    // Record usage for anomaly detection
    recordUsageEvent('nomi_chat');

    // URL detection — allow but log for parents
    const urlCheck = detectURLs(content);
    if (urlCheck.hasURLs) {
      void syncInputDetection('url', urlCheck.urls.join(', '), content);
      const emails = flattenParentEmails(loadParentEmailSettings());
      if (emails.length > 0) {
        const payload = buildInputAlertPayload('url', urlCheck.urls.join(', '), content, emails);
        sendParentEmailAlert(payload);
      }
    }

    // PII detection — allow but alert parents
    const piiCheck = detectPII(content);
    if (piiCheck.hasPII) {
      void syncInputDetection('pii', piiCheck.types.join(', '), content);
      const emails = flattenParentEmails(loadParentEmailSettings());
      if (emails.length > 0) {
        const payload = buildInputAlertPayload('pii', piiCheck.types.join(', '), content, emails);
        sendParentEmailAlert(payload);
      }
    }

    const user: NomiMessage = { role: 'ufefe', content, timestamp: new Date().toISOString() };
    const next = [...messages, user];

    // Prune conversation: 100 message cap, 30-day TTL, sentiment preserved
    const { pruned } = pruneConversation(next, 100, 30);
    onChange(pruned);
    setDraft('');
    setThinking(true);
    const safety = checkChildSafety(content);
    try {
      const reply = await nomiChat(content, pruned, apiKey, displayName);
      const updated = [...pruned, { role: 'nomi' as const, content: reply, timestamp: new Date().toISOString() }];
      const { pruned: finalPruned } = pruneConversation(updated, 100, 30);
      onChange(finalPruned);
      if (safety.isUrgent) onSafetyAlert();
      const exchanges = finalPruned.filter(item => item.role === 'ufefe').length;
      if (exchanges > 0 && exchanges % 5 === 0) onEarnXp(5);
    } finally {
      setThinking(false);
    }
  };

  const useVoice = () => {
    const Speech = (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;
    if (!Speech) { setVoiceError('Voice input is not available in this browser.'); return; }
    const recognition = new Speech();
    recognition.onresult = event => setDraft(event.results[0][0].transcript);
    recognition.onerror = () => setVoiceError('I could not hear that. Try typing instead.');
    recognition.start();
  };

  return (
    <section className="nomi-companion glass-card">
      <header>
        <div className="nomi-avatar"><Sparkles size={30}/></div>
        <div>
          <span className="eyebrow">Your friendly sidekick</span>
          <h2>{nomiName} 🌟</h2>
          <p className="muted">Warm chats, clever clues, and lekker encouragement.</p>
        </div>
      </header>
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div className={`chat-bubble ${message.role}`} key={`${message.timestamp}-${index}`}>
            <b>{message.role === 'nomi' ? `${nomiName} 🌟` : displayName}</b>
            <p>{message.content}</p>
          </div>
        ))}
        {thinking && <div className="chat-bubble nomi typing"><b>{nomiName} 🌟</b><p>Thinking… ✨</p></div>}
        <div ref={endRef}/>
      </div>
      <div className="suggestion-row">
        {suggestions.map(suggestion => <button key={suggestion} onClick={() => send(suggestion)}>{suggestion}</button>)}
        {messages.length >= 2 && (() => {
          const lastNomi = [...messages].reverse().find(m => m.role === 'nomi');
          const lastUser = [...messages].reverse().find(m => m.role === 'ufefe');
          const shareMoment = lastUser && lastNomi ? `Me: ${lastUser.content}\n${nomiName}: ${lastNomi.content}` : '';
          return shareMoment ? <ShareButton message={`Check out my chat with ${nomiName}! 🌟\n\n${shareMoment}`} subject={`My chat with ${nomiName}`} /> : null;
        })()}
      </div>
      {voiceError && <p className="form-error">{voiceError}</p>}
      <form className="chat-form" onSubmit={e => { e.preventDefault(); send(); }}>
        <button type="button" onClick={useVoice} aria-label="Use voice input"><Mic size={19}/></button>
        <input value={draft} maxLength={400} onChange={e => setDraft(e.target.value)} placeholder={`Chat with ${nomiName}, ${displayName}…`}/>
        <button type="submit" disabled={!draft.trim() || thinking} aria-label="Send message"><Send size={19}/></button>
      </form>
    </section>
  );
}
