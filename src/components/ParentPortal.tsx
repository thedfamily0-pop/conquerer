import React, { useEffect, useMemo, useState } from 'react';
import { Award, Bell, CheckCircle2, Download, Key, Lock, LogOut, Mail, Settings, ShieldCheck, Share2, Sparkles, X } from 'lucide-react';
import { DiaryReadOnly } from './DiaryReadOnly';
import { ParentPerformanceDashboard } from './ParentPerformanceDashboard';
import { LearningInsightsPanel } from './LearningInsightsPanel';
import { LLMDashboard } from './LLMDashboard';
import { ContentManager } from './ContentManager';
import { ScheduleManager } from './ScheduleManager';
import { StoreManager } from './StoreManager';
import type { ParentNotification } from './WellbeingCheckin';
import type { ChoreTask, DiaryEntry, ScheduleItem, NomiMessage } from '../data/scheduleData';
import type { StoreItem } from '../data/storeData';
import { getCurrentTermInfo } from '../data/termCalendar';
import { getWeekTheme } from '../data/termData';
import { VIBING_PROJECTS } from '../data/vibingData';
import { getATPWeek } from '../data/term4ATP';
import { checkPinLockout, recordFailedPinAttempt, resetPinLockout } from '../services/guardrails/pinLockout';
import { loadGuardrailSettings, saveGuardrailSettings } from '../services/guardrails/rateLimiter';
import type { GuardrailSettings } from '../services/guardrails/types';
import { syncGuardrailSettings } from '../services/syncEngine';
import { verifyPortalPin, setPortalPin, requestPortalPinReset } from '../services/portalPin';
import { flattenParentEmails, normalizeParentEmailSettings, updateChildEmail, updateParentEmail, type ParentEmailSettings } from '../services/parentEmailSettings';
import type { FamilyInvitation, FamilyInvitationRole } from '../services/familyInvitations';

type PortalTab = 'overview' | 'schedule' | 'content' | 'store' | 'progress' | 'shine' | 'alerts' | 'ai' | 'settings';
interface Props { isOpen: boolean; onClose: () => void; onSignOut: () => void | Promise<void>; xp: number; level: number; streak: number; notifications: ParentNotification[]; onClearNotifications: () => void; schedule: ScheduleItem[]; chores: ChoreTask[]; diary: DiaryEntry[]; nomiMessages: NomiMessage[]; storeItems: StoreItem[]; xpBalance: number; onScheduleChange: (items: ScheduleItem[]) => void; onChoresChange: (items: ChoreTask[]) => void; onStoreItemsChange: (items: StoreItem[]) => void; emails: ParentEmailSettings; onSaveEmails: (emails: ParentEmailSettings) => Promise<{ ok: boolean; message?: string }>; invitations: FamilyInvitation[]; invitationsLoading?: boolean; onSendInvitation: (input: { email: string; displayName: string; role: FamilyInvitationRole }) => Promise<{ ok: boolean; message?: string }>; onRevokeInvitation: (invitationId: string) => Promise<{ ok: boolean; message?: string }>; accountEmail?: string; onOpenChildApp?: () => void; currentPin: string; hostedPinRequired?: boolean; onPinChange: (pin: string) => void; llmProvider: string; llmApiKey: string; onLlmConfigChange: (provider: string, key: string) => void; spotifyPlaylist: string; onSpotifyPlaylistChange: (url: string) => void; onAdjustXp: (amount: number, reason: string) => void; }

function VibingProjectProgress() {
  const termInfo = getCurrentTermInfo();
  const currentTerm = termInfo.isHoliday ? 1 : termInfo.term;
  const project = VIBING_PROJECTS.find(p => p.term === currentTerm) || VIBING_PROJECTS[0];
  let progress: { completedMilestones: Record<string, number[]>; lastActivity: string } = { completedMilestones: {}, lastActivity: '' };
  try { const stored = localStorage.getItem('explorer_vibing_progress_v1'); if (stored) progress = JSON.parse(stored); } catch { /* empty */ }
  const doneMilestones = progress.completedMilestones[project.id] || [];
  return (
    <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: '14px', padding: '16px', marginTop: '16px' }}>
      <h4 style={{ color: '#a5b4fc', margin: '0 0 8px', fontSize: '0.95rem' }}>💻 Vibing Project — Term {project.term}</h4>
      <p style={{ color: '#f8fafc', fontWeight: 700, margin: '0 0 4px' }}>{project.title}</p>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 12px' }}>{project.description}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {project.milestones.map(m => { const isDone = doneMilestones.includes(m.week); return (
          <div key={m.week} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            {isDone ? <CheckCircle2 size={16} color="#2dd4bf" /> : <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #475569', display: 'inline-block' }} />}
            <span style={{ color: isDone ? '#2dd4bf' : '#94a3b8' }}>Week {m.week}: {m.title}</span>
          </div>
        ); })}
      </div>
      {progress.lastActivity && <p style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '10px' }}>Last activity: {new Date(progress.lastActivity).toLocaleDateString()}</p>}
    </div>
  );
}

function NomiConversationPanel({ messages }: { messages: NomiMessage[] }) {
  return <div style={{ background: 'rgba(20, 184, 166, 0.06)', border: '1px solid rgba(20, 184, 166, 0.2)', borderRadius: '14px', padding: '14px', marginTop: '16px' }}>
    <h4 style={{ color: '#2dd4bf', margin: '0 0 6px' }}>💬 Nomi conversations</h4>
    <p className="muted" style={{ fontSize: '0.78rem' }}>Parents can review Nomi messages here. Diary content is not included in this view or in the family AI context.</p>
    {messages.length ? messages.slice(-30).map(message => <div key={`${message.timestamp}-${message.role}-${message.content}`} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}><small className="muted">{message.role === 'nomi' ? 'Nomi' : 'Child'} · {new Date(message.timestamp).toLocaleString()}</small><p style={{ margin: '3px 0', color: '#e2e8f0', fontSize: '0.84rem' }}>{message.content}</p></div>) : <p className="empty-state">No Nomi conversations recorded yet.</p>}
  </div>;
}

export function ParentPortal({ isOpen, onClose, onSignOut, xp, level, streak, notifications, onClearNotifications, schedule, chores, diary, nomiMessages, storeItems, xpBalance, onScheduleChange, onChoresChange, onStoreItemsChange, emails, onSaveEmails, invitations, invitationsLoading = false, onSendInvitation, onRevokeInvitation, accountEmail, onOpenChildApp, currentPin, hostedPinRequired = false, onPinChange, llmProvider, llmApiKey, onLlmConfigChange, spotifyPlaylist, onSpotifyPlaylistChange, onAdjustXp }: Props) {
  const [pin, setPin] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState<PortalTab>('overview');
  const [error, setError] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinMsg, setPinMsg] = useState('');
  const [pinBusy, setPinBusy] = useState(false);
  const [draftEmails, setDraftEmails] = useState<ParentEmailSettings>(() => normalizeParentEmailSettings(emails));
  const [emailStatus, setEmailStatus] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<FamilyInvitationRole>('parent');
  const [inviteStatus, setInviteStatus] = useState('');
  const [inviteBusy, setInviteBusy] = useState(false);
  const [guardrailConfig, setGuardrailConfig] = useState<GuardrailSettings>(loadGuardrailSettings);
  const normalizedDraftEmails = useMemo(
    () => normalizeParentEmailSettings(draftEmails),
    [draftEmails],
  );
  const normalizedEmails = useMemo(
    () => normalizeParentEmailSettings(emails),
    [emails],
  );
  const emailDirty = JSON.stringify(normalizedDraftEmails) !== JSON.stringify(normalizedEmails);
  useEffect(() => {
    if (!emailSaving && !emailDirty) {
      setDraftEmails(current =>
        JSON.stringify(current) === JSON.stringify(normalizedEmails)
          ? current
          : normalizedEmails,
      );
    }
  }, [emailDirty, emailSaving, normalizedEmails]);
  const updateGuardrailConfig = (updated: GuardrailSettings) => { setGuardrailConfig(updated); saveGuardrailSettings(updated); void syncGuardrailSettings(updated); };

  if (!isOpen) return null;

  const handleClose = () => {
    if (emailDirty && tab === 'settings') {
      setEmailStatus('Save or discard your email changes before closing Settings.');
      return;
    }
    setUnlocked(false); setPin(''); onClose();
  };
  const saveEmails = async () => {
    setEmailSaving(true); setEmailStatus('Saving email settings…');
    const result = await onSaveEmails(normalizedDraftEmails);
    setEmailSaving(false);
    setEmailStatus(result.ok ? 'Email settings saved successfully. ✓' : (result.message || 'Email settings could not be saved.'));
  };
  const discardEmailChanges = () => { setDraftEmails(normalizedEmails); setEmailStatus('Unsaved email changes discarded.'); };
  const sendInvitation = async () => {
    setInviteBusy(true); setInviteStatus('Sending welcome invitation…');
    const result = await onSendInvitation({ email: inviteEmail, displayName: inviteName, role: inviteRole });
    setInviteBusy(false);
    setInviteStatus(result.ok ? (result.message || 'Welcome invitation sent.') : (result.message || 'Invitation could not be sent.'));
    if (result.ok) { setInviteEmail(''); setInviteName(''); setInviteRole('parent'); }
  };
  const revokeInvitation = async (invitationId: string) => {
    setInviteBusy(true); setInviteStatus('Revoking invitation…');
    const result = await onRevokeInvitation(invitationId);
    setInviteBusy(false);
    setInviteStatus(result.ok ? (result.message || 'Invitation revoked.') : (result.message || 'Invitation could not be revoked.'));
  };

  const unlock = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!hostedPinRequired) {
      const lockoutStatus = checkPinLockout();
      if (!lockoutStatus.allowed) {
        setError(`🔒 Parent Zone is locked for ${lockoutStatus.remainingLockMinutes} more minute(s) due to too many failed attempts.`);
        return;
      }
    }
    setPinBusy(true);
    const remote = await verifyPortalPin(pin);
    if (remote.ok && remote.configured) {
      setPinBusy(false);
      if (remote.verified) {
        setUnlocked(true); setError(''); resetPinLockout(); onClearNotifications();
      } else {
        setError(remote.lockedUntil ? '🔒 Too many failed attempts. Try again later.' : 'Incorrect PIN.');
      }
      return;
    }
    setPinBusy(false);
    if (hostedPinRequired) {
      setError(remote.error || 'Hosted PIN verification is unavailable. Please try again when the account server is reachable.');
      return;
    }
    if (currentPin && pin === currentPin) {
      setUnlocked(true); setError(''); resetPinLockout(); onClearNotifications();
      void setPortalPin(pin);
      return;
    }
    const parentEmails = flattenParentEmails(emails);
    const wasLocked = recordFailedPinAttempt(parentEmails);
    if (wasLocked) setError('🔒 Too many failed attempts. Parent Zone is locked for 15 minutes.');
    else setError(`Incorrect PIN. ${loadGuardrailSettings().maxPinAttempts - checkPinLockout().failedAttempts} attempt(s) remaining.`);
  };
  const updatePin = async () => {
    const trimmed = newPin.trim();
    if (!/^\d{4,12}$/.test(trimmed)) { setPinMsg('PIN must contain 4 to 12 digits.'); return; }
    setPinBusy(true);
    const remote = await setPortalPin(trimmed);
    setPinBusy(false);
    if (!remote.ok) {
      setPinMsg(remote.error || 'PIN could not be updated on the family server.');
      return;
    }
    onPinChange(hostedPinRequired ? '' : trimmed);
    setNewPin('');
    setPinMsg('PIN updated securely for this profile! ✓');
    setTimeout(() => setPinMsg(''), 4000);
  };
  const resetPin = async () => {
    if (!accountEmail) { setError('No signed-in account email is available for PIN recovery.'); return; }
    setPinBusy(true);
    const result = await requestPortalPinReset(accountEmail);
    setPinBusy(false);
    setError(result.ok ? 'A recovery link was sent to the signed-in account email. After resetting the account password, return to Parent Zone → Settings to set a new portal PIN.' : (result.error || 'PIN recovery could not be started.'));
  };
  const report = () => { const text = `CONQUERER — PARENT SUMMARY\nDate: ${new Date().toLocaleDateString()}\nLevel: ${level} · ${xp} XP · ${streak} day streak\n\nSAFETY & WELLBEING ALERTS\n${notifications.map(alert => `[${alert.timestamp}] ${alert.moodEmoji} ${alert.note}`).join('\n') || 'No alerts yet.'}\n\nDiary entries are intentionally excluded from reports and sharing.`; const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' })); link.download = `Conquerer_Parent_Report_${new Date().toISOString().slice(0, 10)}.txt`; link.click(); };
  const share = () => window.open(`https://wa.me/?text=${encodeURIComponent(`Conquerer update: Level ${level}, ${xp} XP and a ${streak}-day learning streak! 🚀`)}`, '_blank');

  return (
    <div className="portal-overlay" role="dialog" aria-modal="true" aria-label="Parent Zone">
      <div className="glass-card parent-portal">
        <button className="icon-close" onClick={handleClose} aria-label="Close Parent Zone" title="Close"><X size={18}/></button>
        <header className="portal-header">
          <ShieldCheck size={29} color="#60a5fa"/>
          <div><h2>Parent Zone · Dad & Mom</h2><p className="muted">Schedule, progress, rewards, and safety management.</p></div>
        </header>
        {unlocked && <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '8px' }}><button type="button" className="text-button" onClick={() => { onOpenChildApp?.(); }} title="Open the child learning app"><Sparkles size={16}/> Open Child App</button><button type="button" className="text-button" onClick={() => { void onSignOut(); }} title="Sign out of your Supabase account"><LogOut size={16}/> Sign out</button></div>}

        {!unlocked ? (
          <form className="unlock-screen" onSubmit={unlock}>
            <Lock size={38} color="#fbbf24"/>
            <h3>Parent check-in</h3>
            <p className="muted">Enter the family PIN to access the dashboard.</p>
            <input value={pin} inputMode="numeric" type="password" onChange={event => setPin(event.target.value)} placeholder="PIN" aria-label="Parent PIN"/>
            {error && <p className="form-error">{error}</p>}
            <button className="btn-primary" disabled={pinBusy}>{pinBusy ? 'Checking…' : 'Unlock Parent Zone'}</button>
            <button type="button" className="text-button" onClick={() => { void resetPin(); }} disabled={pinBusy}>Forgot PIN? Send a recovery email</button>
            <p className="privacy-note">Diary access is read-only. It is never included in reports or shares.</p>
          </form>
        ) : (
          <>
            <nav className="portal-tabs">
              {([['overview', '📊 Overview'], ['schedule', '📅 Schedule'], ['content', '📚 Content'], ['store', '🎁 XP Store'], ['progress', '📈 Progress'], ['alerts', `🚨 Alerts${notifications.length ? ` (${notifications.length})` : ''}`], ['ai', '🤖 AI'], ['shine', '💜 Shine'], ['settings', '⚙️ Settings']] as [PortalTab, string][]).map(([id, label]) => (
                <button key={id} className={tab === id ? 'selected' : ''} onClick={() => setTab(id)} title={label}>{label}</button>
              ))}
            </nav>

            {tab === 'overview' && (
              <section>
                <div className="parent-stats">
                  <div title="Current learning level"><Award/><b>Level {level}</b><small>{xp} XP earned</small></div>
                  <div title="Consecutive days of activity"><Sparkles/><b>{streak} day streak</b><small>Keep exploring!</small></div>
                  <div title="Completed chores and tasks"><CheckCircle2/><b>{chores.filter(chore => chore.isCompleted).length} tasks done</b><small>Little wins count</small></div>
                </div>
                <div className="parent-actions">
                  <button className="btn-primary" onClick={share} title="Share progress via WhatsApp"><Share2 size={17}/>Share update</button>
                  <button className="btn-secondary" onClick={report} title="Download a text summary report"><Download size={17}/>Download report</button>
                </div>
                {(() => { const termInfo = getCurrentTermInfo(); const weekTheme = !termInfo.isHoliday ? getWeekTheme(termInfo.term, termInfo.week) : undefined; return weekTheme ? (
                  <div style={{ background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '14px', padding: '16px', marginTop: '16px' }}>
                    <h4 style={{ color: '#c4b5fd', margin: '0 0 8px', fontSize: '0.95rem' }}>📋 This Week's CAPS Objectives</h4>
                    <p style={{ color: '#f8fafc', fontWeight: 700, margin: '0 0 4px' }}>Week {termInfo.week}: {weekTheme.theme}</p>
                    <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0 0 10px' }}>Subjects: {weekTheme.subjects.join(', ')}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {weekTheme.objectives.map((obj, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', color: '#e2e8f0' }}>
                          <span style={{ color: '#a855f7', flexShrink: 0 }}>✓</span>
                          <span>{obj}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null; })()}
                {(() => { const termInfo = getCurrentTermInfo(); const atpEntries = !termInfo.isHoliday ? getATPWeek(termInfo.week) : []; return atpEntries.length > 0 ? (
                  <div style={{ background: 'rgba(20, 184, 166, 0.06)', border: '1px solid rgba(20, 184, 166, 0.2)', borderRadius: '14px', padding: '16px', marginTop: '16px' }}>
                    <h4 style={{ color: '#2dd4bf', margin: '0 0 12px', fontSize: '0.95rem' }}>📚 Detailed ATP — Term {termInfo.term}, Week {termInfo.week}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {atpEntries.map(entry => (
                        <div key={entry.subject} style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <b style={{ fontSize: '0.88rem', color: '#f8fafc' }}>{entry.subject}</b>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', background: 'rgba(99, 102, 241, 0.12)', padding: '2px 8px', borderRadius: '8px' }}>{entry.capsContentArea}</span>
                          </div>
                          <p style={{ fontSize: '0.85rem', color: '#e2e8f0', margin: '0 0 8px', fontWeight: 600 }}>{entry.topic}</p>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#a5b4fc' }}>Learning Outcomes:</p>
                            <ul style={{ margin: '0 0 8px', paddingLeft: '16px' }}>{entry.learningOutcomes.map((lo, i) => <li key={i} style={{ marginBottom: '2px' }}>{lo}</li>)}</ul>
                            <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#a5b4fc' }}>Activities:</p>
                            <ul style={{ margin: '0 0 6px', paddingLeft: '16px' }}>{entry.activities.map((a, i) => <li key={i} style={{ marginBottom: '2px' }}>{a}</li>)}</ul>
                            {entry.assessmentFocus && <p style={{ margin: 0, fontStyle: 'italic', color: '#fbbf24' }}>📝 Assessment: {entry.assessmentFocus}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null; })()}
                {/* Point Adjustment */}
                <div style={{ background: 'rgba(99, 102, 241, 0.06)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '14px', padding: '16px', marginTop: '16px' }}>
                  <h4 style={{ color: '#a5b4fc', margin: '0 0 10px', fontSize: '0.95rem' }}>± Adjust XP Points</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0 0 10px' }}>Give or take away points with a reason.</p>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input id="adj-amt" type="number" placeholder="Points" style={{ width: '80px', borderRadius: '10px', border: '1px solid rgba(71, 85, 105, 0.5)', background: 'rgba(15, 23, 42, 0.6)', padding: '8px', color: '#f8fafc', fontSize: '0.85rem' }} />
                    <input id="adj-reason" placeholder="Reason (optional)" style={{ flex: 1, borderRadius: '10px', border: '1px solid rgba(71, 85, 105, 0.5)', background: 'rgba(15, 23, 42, 0.6)', padding: '8px', color: '#f8fafc', fontSize: '0.85rem' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { const amt = parseInt((document.getElementById('adj-amt') as HTMLInputElement)?.value || '0'); const reason = (document.getElementById('adj-reason') as HTMLInputElement)?.value || 'Parent reward'; if (amt > 0) onAdjustXp(amt, reason); }} style={{ flex: 1, background: 'rgba(20, 184, 166, 0.15)', border: '1px solid rgba(20, 184, 166, 0.4)', borderRadius: '10px', padding: '8px', color: '#2dd4bf', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>+ Give Points</button>
                    <button onClick={() => { const amt = parseInt((document.getElementById('adj-amt') as HTMLInputElement)?.value || '0'); const reason = (document.getElementById('adj-reason') as HTMLInputElement)?.value || 'Parent discipline'; if (amt > 0) onAdjustXp(-amt, reason); }} style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '8px', color: '#fca5a5', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>- Take Away</button>
                  </div>
                </div>
                <div className="privacy-card"><ShieldCheck size={20}/><p><b>Diary is parent read-only.</b> Dad and Mom may read entries in the Progress tab, but cannot change, delete, export, or share them.</p></div>
              </section>
            )}

            {tab === 'schedule' && <ScheduleManager schedule={schedule} chores={chores} onScheduleChange={onScheduleChange} onChoresChange={onChoresChange}/>}

            {tab === 'content' && <ContentManager/>}

            {tab === 'store' && (
              <section>
                <div className="store-balance-note"><Sparkles size={18}/><b>Spendable balance: {xpBalance} XP</b><span>Level uses total XP earned, so purchases do not reduce progress.</span></div>
                <StoreManager items={storeItems} onItemsChange={onStoreItemsChange}/>
              </section>
            )}

            {tab === 'progress' && (
              <section className="progress-panel">
                <div className="progress-stats-row">
                  <div className="stat-card"><b>{xp}</b><small>Total XP earned</small></div>
                  <div className="stat-card"><b>Level {level}</b><small>Current level</small></div>
                  <div className="stat-card"><b>{diary.length}</b><small>Diary entries</small></div>
                  <div className="stat-card"><b>{chores.filter(c => c.isCompleted).length}/{chores.length}</b><small>Tasks completed</small></div>
                </div>
                {chores.filter(c => c.isCompleted && c.evidencePhotoUrl).length > 0 && <div className="evidence-gallery"><h4>📸 Photo evidence</h4><div className="evidence-grid">{chores.filter(c => c.isCompleted && c.evidencePhotoUrl).map(c => <div key={c.id} className="evidence-item"><img src={c.evidencePhotoUrl} alt={`Proof: ${c.title}`}/><span>{c.emoji} {c.title}</span><small>{c.completedAt ? new Date(c.completedAt).toLocaleDateString() : ''}</small></div>)}</div></div>}
                <LearningInsightsPanel />
                <ParentPerformanceDashboard />
                <p className="muted" style={{ fontSize: '0.8rem', margin: '18px 0 8px' }}>The older reward and Shine summaries below are kept for context. They are not used in the Academic Performance Score or confidence signal.</p>
                {/* Quest Map Understanding */}
                {(() => { try { const qs = JSON.parse(localStorage.getItem('explorer_quest_map_v1') || '{}'); const stars = qs.totalStars || 0; const tier = stars >= 60 ? 'Mastery' : stars >= 40 ? 'Secure' : stars >= 20 ? 'Developing' : 'Emerging'; const pct = Math.min(100, Math.round((stars / 30) * 100)); return (<div style={{ background: 'rgba(251, 191, 36, 0.06)', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}><h4 style={{ color: '#fbbf24', margin: '0 0 8px', fontSize: '0.92rem' }}>🗺️ Quest Map — Understanding Level</h4><div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}><div style={{ flex: 1, background: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px', height: '8px', overflow: 'hidden' }}><div style={{ background: '#fbbf24', height: '100%', width: pct + '%', borderRadius: '8px' }} /></div><span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem' }}>{stars} stars</span></div><p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>Understanding tier: <b style={{ color: '#fbbf24' }}>{tier}</b> ({pct}% — WCED equivalent available)</p></div>); } catch { return null; } })()}
                {/* Weekly Completion */}
                {(() => { try { const choresD = chores.filter(c => c.isCompleted).length; const total = chores.length; return (<div style={{ background: 'rgba(20, 184, 166, 0.06)', border: '1px solid rgba(20, 184, 166, 0.2)', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}><h4 style={{ color: '#2dd4bf', margin: '0 0 8px', fontSize: '0.92rem' }}>📊 Weekly Engagement</h4><div style={{ display: 'flex', gap: '10px' }}><div style={{ flex: 1, textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '10px', padding: '10px' }}><div style={{ color: '#2dd4bf', fontWeight: 800, fontSize: '1.1rem' }}>{choresD}/{total}</div><div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Tasks done</div></div><div style={{ flex: 1, textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '10px', padding: '10px' }}><div style={{ color: '#a78bfa', fontWeight: 800, fontSize: '1.1rem' }}>{diary.length}</div><div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Diary entries</div></div><div style={{ flex: 1, textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '10px', padding: '10px' }}><div style={{ color: '#fbbf24', fontWeight: 800, fontSize: '1.1rem' }}>{(() => { try { return Object.keys(JSON.parse(localStorage.getItem('explorer_shine_v1') || '{}').days || {}).length; } catch { return 0; } })()}</div><div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Shine days</div></div></div></div>); } catch { return null; } })()}
                <VibingProjectProgress />
                <DiaryReadOnly entries={diary}/>
              </section>
            )}

            {tab === 'alerts' && (
              <section className="alerts-panel">
                <h3><Bell size={19}/> Wellbeing & safety alerts</h3>
                {notifications.length ? notifications.map(alert => (
                  <article key={alert.id} className={alert.isUrgent ? 'alert urgent' : 'alert'}>
                    <span>{alert.moodEmoji}</span>
                    <div><b>{alert.note}</b><small>{alert.timestamp}</small></div>
                  </article>
                )) : <p className="empty-state">No alerts today.</p>}
              </section>
            )}

            {tab === 'ai' && <><LLMDashboard xp={xp} level={level} streak={streak} choresCompleted={chores.filter(c => c.isCompleted).length} totalChores={chores.length} diaryCount={diary.length} provider={llmProvider as 'gemini' | 'openai' | 'claude'} apiKey={llmApiKey} onConfigChange={onLlmConfigChange}/><NomiConversationPanel messages={nomiMessages}/></>}

            {tab === 'shine' && (
              <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc', fontSize: '1.05rem' }}><span>💜</span> Shine & Affirmations Settings</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '-8px 0 0' }}>Customise what Ufefe sees in her Weekly Shine tab. Your words of love appear directly to her.</p>
                <div style={{ background: 'rgba(236, 72, 153, 0.06)', border: '1px solid rgba(236, 72, 153, 0.25)', borderRadius: '14px', padding: '16px' }}>
                  <h4 style={{ color: '#f9a8d4', margin: '0 0 8px', fontSize: '0.92rem' }}>💌 Note From Mom (shows weekly)</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0 0 10px' }}>A short love note or encouragement Ufefe sees in her Shine tab. Change it every week!</p>
                  <textarea id="shine-mom-note" defaultValue={(() => { try { return JSON.parse(localStorage.getItem('explorer_shine_v1') || '{}').momNote || ''; } catch { return ''; } })()} placeholder="Write a note for Ufefe this week..." style={{ width: '100%', minHeight: '80px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(71, 85, 105, 0.5)', borderRadius: '12px', padding: '12px', color: '#f8fafc', fontSize: '0.88rem', lineHeight: 1.5, resize: 'vertical', fontFamily: 'inherit' }} />
                  <button onClick={() => { const val = (document.getElementById('shine-mom-note') as HTMLTextAreaElement)?.value || ''; try { const state = JSON.parse(localStorage.getItem('explorer_shine_v1') || '{}'); state.momNote = val; localStorage.setItem('explorer_shine_v1', JSON.stringify(state)); } catch {} alert('Mom Note saved! Ufefe will see it in her Shine tab.'); }} style={{ marginTop: '10px', background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>Save Mom Note</button>
                </div>
                <div style={{ background: 'rgba(251, 191, 36, 0.06)', border: '1px solid rgba(251, 191, 36, 0.25)', borderRadius: '14px', padding: '16px' }}>
                  <h4 style={{ color: '#fde68a', margin: '0 0 8px', fontSize: '0.92rem' }}>💕 Special Affirmation From Mommy (permanent)</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0 0 10px' }}>A lasting affirmation that always appears at the bottom of Ufefe's Shine page.</p>
                  <textarea id="shine-mommy-affirmation" defaultValue={(() => { try { return JSON.parse(localStorage.getItem('explorer_shine_v1') || '{}').mommyAffirmation || ''; } catch { return ''; } })()} placeholder="Write your permanent affirmation..." style={{ width: '100%', minHeight: '100px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(71, 85, 105, 0.5)', borderRadius: '12px', padding: '12px', color: '#f8fafc', fontSize: '0.88rem', lineHeight: 1.5, resize: 'vertical', fontFamily: 'inherit' }} />
                  <button onClick={() => { const val = (document.getElementById('shine-mommy-affirmation') as HTMLTextAreaElement)?.value || ''; try { const state = JSON.parse(localStorage.getItem('explorer_shine_v1') || '{}'); state.mommyAffirmation = val; localStorage.setItem('explorer_shine_v1', JSON.stringify(state)); } catch {} alert('Mommy Affirmation saved!'); }} style={{ marginTop: '10px', background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', color: '#1e1b4b', border: 'none', borderRadius: '10px', padding: '10px 18px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>Save Affirmation</button>
                </div>
                <div style={{ background: 'rgba(168, 85, 247, 0.06)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '14px', padding: '16px' }}>
                  <h4 style={{ color: '#c084fc', margin: '0 0 8px', fontSize: '0.92rem' }}>🌱 Growing Goal This Week</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0 0 10px' }}>Set a focus goal that Ufefe sees at the top of her Shine page.</p>
                  <input id="shine-growing-goal" defaultValue={(() => { try { return JSON.parse(localStorage.getItem('explorer_shine_v1') || '{}').growingGoal || ''; } catch { return ''; } })()} placeholder="This week's growing goal..." style={{ width: '100%', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(71, 85, 105, 0.5)', borderRadius: '10px', padding: '10px 14px', color: '#f8fafc', fontSize: '0.88rem' }} />
                  <button onClick={() => { const val = (document.getElementById('shine-growing-goal') as HTMLInputElement)?.value || ''; try { const state = JSON.parse(localStorage.getItem('explorer_shine_v1') || '{}'); state.growingGoal = val; localStorage.setItem('explorer_shine_v1', JSON.stringify(state)); } catch {} alert('Growing Goal saved!'); }} style={{ marginTop: '10px', background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>Save Goal</button>
                </div>
              </section>
            )}

            {tab === 'settings' && (
              <section className="settings-panel">
                <h3><Settings size={19}/> App settings</h3>

                <div className="settings-section">
                  <h4><Key size={16}/> Update Parent PIN</h4>
                  <p className="muted">Change the PIN required to access this dashboard.</p>
                  <div className="pin-update-row">
                    <input type="password" value={newPin} maxLength={12} onChange={e => setNewPin(e.target.value)} placeholder="New PIN (min 4 characters)" title="Enter new PIN"/>
                    <button type="button" className="btn-secondary" onClick={() => { void updatePin(); }} disabled={pinBusy} title="Save new PIN">Update PIN</button>
                  </div>
                  {pinMsg && <p className={pinMsg.includes('✓') ? 'form-success' : 'form-error'}>{pinMsg}</p>}
                </div>

                <div className="settings-section">
                  <h4><Mail size={16}/> Email alerts</h4>
                  <p className="muted">Add up to three addresses for each adult. Valid, non-duplicate addresses are saved to this family and included in future alert payloads; delivery requires a configured transactional provider.</p>
                  <div className="email-settings-grid">
                    {(['dad', 'mom'] as const).map(adult => (
                      <div key={adult}>
                        <strong>{adult === 'dad' ? "Dad's" : "Mom's"} email addresses</strong>
                        {Array.from({ length: 3 }, (_, index) => (
                          <label className="form-label" key={`${adult}-${index}`}><Mail size={14}/> {adult === 'dad' ? "Dad's" : "Mom's"} email {index + 1}
                            <input type="email" value={draftEmails[adult][index] || ''} onChange={event => { setDraftEmails(updateParentEmail(draftEmails, adult, index, event.target.value)); setEmailStatus(''); }} placeholder={index === 0 ? 'Required if alerts are wanted' : 'Optional'} title={`${adult === 'dad' ? "Dad's" : "Mom's"} email address ${index + 1}`}/>
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '16px' }}>
                    <strong>Child account email</strong>
                    <p className="muted" style={{ fontSize: '0.78rem' }}>This is a contact address only. It does not approve access or create a login; use Family invitations below to send an authorised welcome link.</p>
                    <label className="form-label"><Mail size={14}/> Child email address
                      <input type="email" value={draftEmails.childEmail} onChange={event => { setDraftEmails(updateChildEmail(draftEmails, event.target.value)); setEmailStatus(''); }} placeholder="child@example.com" title="Child account email"/>
                    </label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
                    <button type="button" className="btn-primary" onClick={() => { void saveEmails(); }} disabled={!emailDirty || emailSaving}>{emailSaving ? 'Saving…' : 'Save email changes'}</button>
                    <button type="button" className="btn-secondary" onClick={discardEmailChanges} disabled={!emailDirty || emailSaving}>Discard</button>
                    {emailStatus && <span className={emailStatus.includes('could not') || emailStatus.includes('before') ? 'form-error' : 'form-success'} role="status" aria-live="polite">{emailStatus}</span>}
                  </div>
                </div>

                <div className="settings-section">
                  <h4><ShieldCheck size={16}/> Family invitations</h4>
                  <p className="muted">Invite a parent or child separately from notification emails. The welcome link is single-use, expires after seven days, and only works after the invited Google account is verified.</p>
                  <div className="email-settings-grid">
                    <label className="form-label">Name
                      <input value={inviteName} onChange={event => { setInviteName(event.target.value); setInviteStatus(''); }} placeholder="Family member name" maxLength={80} />
                    </label>
                    <label className="form-label"><Mail size={14}/> Google email
                      <input type="email" value={inviteEmail} onChange={event => { setInviteEmail(event.target.value); setInviteStatus(''); }} placeholder="person@gmail.com" />
                    </label>
                    <label className="form-label">Role
                      <select value={inviteRole} onChange={event => { setInviteRole(event.target.value as FamilyInvitationRole); setInviteStatus(''); }}>
                        <option value="parent">Parent</option>
                        <option value="child">Child</option>
                      </select>
                    </label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
                    <button type="button" className="btn-primary" onClick={() => { void sendInvitation(); }} disabled={inviteBusy || !inviteName.trim() || !inviteEmail.trim()}>{inviteBusy ? 'Working…' : 'Send welcome invitation'}</button>
                    {inviteStatus && <span className={inviteStatus.includes('could not') || inviteStatus.includes('required') ? 'form-error' : 'form-success'} role="status" aria-live="polite">{inviteStatus}</span>}
                  </div>
                  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <strong>Invitation status</strong>
                    {invitationsLoading ? <p className="muted">Loading invitations…</p> : invitations.length ? invitations.map(invitation => (
                      <div key={invitation.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', padding: '10px', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '10px' }}>
                        <span style={{ color: '#e2e8f0', fontSize: '0.84rem' }}><strong>{invitation.displayName}</strong> · {invitation.role} · {invitation.email}<br/><small className="muted">{invitation.status} · expires {new Date(invitation.expiresAt).toLocaleString()}</small></span>
                        {invitation.status === 'pending' && <button type="button" className="btn-secondary" onClick={() => { void revokeInvitation(invitation.id); }} disabled={inviteBusy}>Revoke</button>}
                      </div>
                    )) : <p className="muted">No family invitations yet.</p>}
                  </div>
                </div>

                <div className="settings-section">
                  <h4>📬 Learning reports</h4>
                  <p className="muted">The server-generated daily recap and Saturday weekly strategy use only the first saved Dad and first saved Mom address. They include learning activity, school-result trends, current-grade gaps, upcoming work, goals, and a conservative content plan. No diary text is included.</p>
                  <p className="form-success" role="status">Reports are ready for scheduling when a primary Dad or Mom address is saved. A hosted scheduler must invoke <code>send-parent-reports</code>; the app tab does not send these recurring reports. Sender verification and hosted delivery must be confirmed separately.</p>
                </div>

                <div className="settings-section">
                  <h4>🛡️ Safety Guardrails</h4>
                  <p className="muted">Configure AI usage limits, session timeout, and PIN security. Changes are saved locally and synced to the family when Supabase is enabled.</p>

                  <label className="form-label">🕐 AI Available Hours (Start)
                    <select value={guardrailConfig.aiHoursStart} onChange={e => updateGuardrailConfig({ ...guardrailConfig, aiHoursStart: Number(e.target.value) })}>
                      {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}</option>)}
                    </select>
                  </label>
                  <label className="form-label">🕐 AI Available Hours (End)
                    <select value={guardrailConfig.aiHoursEnd} onChange={e => updateGuardrailConfig({ ...guardrailConfig, aiHoursEnd: Number(e.target.value) })}>
                      {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}</option>)}
                    </select>
                  </label>
                  <label className="form-label">💬 Daily Message Cap (all AI, 0 = unlimited)
                    <input type="number" min="0" max="500" value={guardrailConfig.dailyMessageCap} onChange={e => updateGuardrailConfig({ ...guardrailConfig, dailyMessageCap: Number(e.target.value) })} title="Max total AI requests per day"/>
                  </label>
                  <label className="form-label">🌟 Nomi Daily Cap
                    <input type="number" min="0" max="100" value={guardrailConfig.nomiDailyCap} onChange={e => updateGuardrailConfig({ ...guardrailConfig, nomiDailyCap: Number(e.target.value) })} title="Max Nomi messages per day"/>
                  </label>
                  <label className="form-label">📚 Homework AI Daily Cap
                    <input type="number" min="0" max="50" value={guardrailConfig.homeworkDailyCap} onChange={e => updateGuardrailConfig({ ...guardrailConfig, homeworkDailyCap: Number(e.target.value) })} title="Max homework AI requests per day"/>
                  </label>
                  <label className="form-label">🧑‍🧑‍🧒 Parent AI Daily Cap
                    <input type="number" min="0" max="50" value={guardrailConfig.parentDailyCap} onChange={e => updateGuardrailConfig({ ...guardrailConfig, parentDailyCap: Number(e.target.value) })} title="Max parent dashboard AI requests per day"/>
                  </label>
                  <label className="form-label">⏳ Minimum AI Pause (seconds)
                    <input type="number" min="0" max="60" value={guardrailConfig.minRequestIntervalSeconds} onChange={e => updateGuardrailConfig({ ...guardrailConfig, minRequestIntervalSeconds: Number(e.target.value) })} title="Minimum time between AI requests"/>
                  </label>
                  <label className="form-label">⏱️ Session Timeout (minutes, 0 = disabled)
                    <input type="number" min="0" max="120" value={guardrailConfig.sessionTimeoutMinutes} onChange={e => updateGuardrailConfig({ ...guardrailConfig, sessionTimeoutMinutes: Number(e.target.value) })} title="Inactivity timeout"/>
                  </label>
                  <label className="form-label">🔒 Max PIN Attempts Before Lockout
                    <input type="number" min="3" max="10" value={guardrailConfig.maxPinAttempts} onChange={e => updateGuardrailConfig({ ...guardrailConfig, maxPinAttempts: Number(e.target.value) })} title="Failed attempts before lockout"/>
                  </label>
                  <label className="form-label">🔒 Lockout Duration (minutes)
                    <input type="number" min="5" max="60" value={guardrailConfig.lockoutMinutes} onChange={e => updateGuardrailConfig({ ...guardrailConfig, lockoutMinutes: Number(e.target.value) })} title="How long lockout lasts"/>
                  </label>
                </div>

                <div className="settings-section">
                  <h4>🎵 Music Playlist</h4>
                  <p className="muted">Paste a Spotify playlist link. The child taps the 🎵 button to open it directly.</p>
                  <label className="form-label">Spotify playlist URL<input type="url" value={spotifyPlaylist} onChange={event => onSpotifyPlaylistChange(event.target.value)} placeholder="https://open.spotify.com/playlist/..." title="Spotify playlist link"/></label>
                  {spotifyPlaylist && <p className="form-success">✓ Playlist set — the 🎵 button will open this link.</p>}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
