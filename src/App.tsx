import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import confetti from 'canvas-confetti';
import { Compass, Sparkles, Code2 } from 'lucide-react';
import { Navbar } from './components/Navbar'; import { WellbeingCheckin, type ParentNotification, type CheckinContext, isCheckinNeeded, markCheckinDone, isBedtimeWindow } from './components/WellbeingCheckin'; import { HomeworkAssistant } from './components/HomeworkAssistant'; import { PracticeZone } from './components/PracticeZone'; import { ReadingCompanion } from './components/ReadingCompanion'; import { ParentPortal } from './components/ParentPortal'; import { BadgesModal } from './components/BadgesModal'; import { MobileBottomNav, type AppTab } from './components/MobileBottomNav'; import { TodayView } from './components/TodayView'; import { DiaryJournal } from './components/DiaryJournal'; import { NomiCompanion } from './components/NomiCompanion'; import { ProfileCustomizer } from './components/ProfileCustomizer'; import { XPStore } from './components/XPStore'; import { XPTracker } from './components/XPTracker'; import { SetupWizard } from './components/SetupWizard'; import { TermBanner } from './components/TermBanner'; import { VibingZone } from './components/VibingZone'; import { QuestMap } from './components/QuestMap'; import { WeeklyShine } from './components/WeeklyShine';
import { loadChores, loadDiary, loadNomiHistory, loadSchedule, saveChores, saveDiary, saveNomiHistory, saveSchedule, type ChoreTask, type DiaryEntry, type NomiMessage, type ScheduleItem } from './data/scheduleData'; import { loadProfile, saveProfile, type LearnerProfile } from './data/profileData'; import { loadStoreState, saveStoreState, type PurchaseResult, type StoreState } from './data/storeData'; import { loadXpTransactions, saveXpTransactions, appendXpTransaction, createXpTransaction, type XpTransaction, type XpTransactionKind } from './services/xpEconomy'; import { registerEmailCallback, registerToastCallback, requestNotificationPermission, setParentEmails, showToast, startReminderEngine, type AppToast } from './services/notificationService'; import { playSound } from './services/audioService';
import { initSync, SUPABASE_SYNC_ENABLED, syncChores, syncDiary, syncNomiMessages, syncParentAlert, syncSchedule, syncStoreState, syncUsageEvent } from './services/syncEngine';
import { supabase } from './services/supabase';
import { sendParentEmailAlert } from './services/childSafetyScanner';
import { AuthGate } from './components/AuthGate';
import { VocabBook } from './components/VocabBook';
import { startSessionTimer, touchSession } from './services/guardrails/sessionManager';
import { checkDeviceAccess, buildNewDeviceAlert } from './services/guardrails/deviceFingerprint';
import { recordMoodCheckin, checkMoodStreak, checkUsageAnomalies, analyzeDiarySentiment, recordUsageEvent, buildMoodStreakAlert, buildUsageAnomalyAlert, buildSentimentAlert } from './services/guardrails/wellbeingMonitor';
import { flattenParentEmails, loadParentEmailSettings, saveParentEmailSettings, type ParentEmailSettings } from './services/parentEmailSettings';
import { seedTerm4Content } from './data/term4SeedContent';
seedTerm4Content(); // Seed ATP-aligned practice questions on first load

function mergeRemoteDiary(local: DiaryEntry[], remote: DiaryEntry[]): DiaryEntry[] {
  if (!local.length) return remote;
  const localDates = new Set(local.map(entry => entry.date));
  return [...remote.filter(entry => !localDates.has(entry.date)), ...local].sort((a, b) => b.date.localeCompare(a.date));
}
function mergeRemoteMessages(local: NomiMessage[], remote: NomiMessage[]): NomiMessage[] {
  const seen = new Set(local.map(message => `${message.timestamp}|${message.role}|${message.content}`));
  return [...remote.filter(message => !seen.has(`${message.timestamp}|${message.role}|${message.content}`)), ...local].slice(-50);
}

function getInitialParentPin(): string {
  try {
    const stored = localStorage.getItem('explorer_parent_pin_v1');
    if (stored) return stored;
    const generated = String(Math.floor(100000 + Math.random() * 900000));
    localStorage.setItem('explorer_parent_pin_v1', generated);
    return generated;
  } catch { return ''; }
}

export function App() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const onAuthenticated = useCallback((user: User) => setAuthUser(user), []);
  const handleSignOut = useCallback(async () => {
    if (SUPABASE_SYNC_ENABLED) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        showToast('Could not sign out. Please try again.', '⚠️', 'safety');
        return;
      }
    }
    setAuthUser(null);
    setPortalOpen(false);
  }, []);
  const [streak] = useState(3); const [soundEnabled, setSoundEnabled] = useState(true); const [activeTab, setActiveTab] = useState<AppTab>('today'); const [learnTab, setLearnTab] = useState<'homework' | 'practice' | 'vibing'>('homework'); const [portalOpen, setPortalOpen] = useState(false); const [badgesOpen, setBadgesOpen] = useState(false); const [profileOpen, setProfileOpen] = useState(false); const [vocabOpen, setVocabOpen] = useState(false); const [vocabInitial, setVocabInitial] = useState<{ word?: string; meaning?: string }>({});
  const [profile, setProfile] = useState<LearnerProfile>(loadProfile); const [schedule, setSchedule] = useState<ScheduleItem[]>(loadSchedule); const [chores, setChores] = useState<ChoreTask[]>(loadChores); const [diary, setDiary] = useState<DiaryEntry[]>(loadDiary); const [storeState, setStoreState] = useState<StoreState>(loadStoreState); const [xpTransactions, setXpTransactions] = useState<XpTransaction[]>(() => loadXpTransactions(storeState.wallet.balance)); const [xpTrackerOpen, setXpTrackerOpen] = useState(false); const [nomiMessages, setNomiMessages] = useState<NomiMessage[]>(loadNomiHistory); const [toasts, setToasts] = useState<AppToast[]>([]); const [emails, setEmails] = useState<ParentEmailSettings>(loadParentEmailSettings);
  const [parentPin, setParentPin] = useState(getInitialParentPin);
  const [llmConfig, setLlmConfig] = useState(() => { try { const stored = JSON.parse(localStorage.getItem('explorer_llm_config_v1') || 'null'); return { provider: stored?.provider || 'gemini', apiKey: stored?.apiKey || '' }; } catch { return { provider: 'gemini', apiKey: '' }; } });
  const [spotifyPlaylist, setSpotifyPlaylist] = useState(() => localStorage.getItem('explorer_spotify_playlist_v1') || '');
  const [checkinModal, setCheckinModal] = useState<CheckinContext | null>(null);
  const [musicOpen, setMusicOpen] = useState(false);
  const [sessionLocked, setSessionLocked] = useState(false);
  const [sessionPin, setSessionPin] = useState('');
  useEffect(() => { localStorage.setItem('explorer_llm_config_v1', JSON.stringify(llmConfig)); }, [llmConfig]);
  useEffect(() => { localStorage.setItem('explorer_spotify_playlist_v1', spotifyPlaylist); }, [spotifyPlaylist]);
  const [notifications, setNotifications] = useState<ParentNotification[]>(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const initial: ParentNotification = { id: 'init-1', timestamp: '08:30 AM', createdAt: new Date().toISOString(), mood: 'happy', moodEmoji: '😊', note: 'Learner checked in as Happy!', isUrgent: false };
    try {
      const saved: unknown = JSON.parse(localStorage.getItem('explorer_parent_alerts_v1') || '[]');
      if (Array.isArray(saved)) return saved.filter((alert): alert is ParentNotification => Boolean(alert && typeof alert === 'object' && new Date((alert as ParentNotification).createdAt || 0).getTime() > cutoff));
    } catch { /* use the current-session placeholder */ }
    return [initial];
  }); const [unreadAlertCount, setUnreadAlertCount] = useState(1); const wallet = storeState.wallet; const level = Math.floor(wallet.lifetimeEarned / 50) + 1;
  useEffect(() => {
    if (!SUPABASE_SYNC_ENABLED || !authUser) return;
    let active = true;
    void initSync(profile).then(result => {
      if (!active || !result.remote) return;
      if (result.remote.schedule.length) setSchedule(result.remote.schedule);
      if (result.remote.chores.length) setChores(result.remote.chores);
      setDiary(current => mergeRemoteDiary(current, result.remote!.diary));
      setNomiMessages(current => mergeRemoteMessages(current, result.remote!.nomiMessages));
    });
    return () => { active = false; };
    // The auth/session and setup transitions intentionally initialise sync once each.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, profile.setupDone]);
  useEffect(() => saveProfile(profile), [profile]);
  useEffect(() => { saveSchedule(schedule); void syncSchedule(schedule); }, [schedule]);
  useEffect(() => { saveChores(chores); void syncChores(chores); }, [chores]);
  useEffect(() => { saveDiary(diary); void syncDiary(diary); }, [diary]);
  useEffect(() => saveStoreState(storeState), [storeState]);
  useEffect(() => saveXpTransactions(xpTransactions), [xpTransactions]);
  useEffect(() => { void syncStoreState(storeState); }, [storeState]);
  useEffect(() => { saveNomiHistory(nomiMessages); void syncNomiMessages(nomiMessages); }, [nomiMessages]);
  useEffect(() => { localStorage.setItem('explorer_parent_pin_v1', parentPin); }, [parentPin]);
  useEffect(() => { saveParentEmailSettings(emails); setParentEmails(flattenParentEmails(emails)); }, [emails]);
  useEffect(() => { localStorage.setItem('explorer_parent_alerts_v1', JSON.stringify(notifications.filter(alert => !alert.createdAt || Date.now() - new Date(alert.createdAt).getTime() <= 24 * 60 * 60 * 1000))); }, [notifications]);
  useEffect(() => { registerToastCallback(toast => { setToasts(current => [...current, toast]); window.setTimeout(() => setToasts(current => current.filter(item => item.id !== toast.id)), 5000); }); registerEmailCallback(payload => { sendParentEmailAlert(payload); }); return startReminderEngine(() => schedule); }, [schedule]);
  // Session timeout — auto-lock (show a gentle message)
  useEffect(() => {
    const cleanup = startSessionTimer(() => {
      setSessionLocked(true);
      setSessionPin('');
      showToast('💤 Time for a break! The app locked due to inactivity.', '🔒', 'safety');
    });
    return cleanup;
  }, []);
  // Secure parent alerts require an authenticated session when hosted sync is enabled.
  // Keep these monitors mounted for offline mode, but do not call the Edge Function from AuthGate.
  // Device fingerprint check on mount
  useEffect(() => {
    if (SUPABASE_SYNC_ENABLED && !authUser) return;
    const parentEmailsList = flattenParentEmails(emails);
    const { isNewDevice, deviceInfo } = checkDeviceAccess();
    if (isNewDevice && parentEmailsList.length > 0) {
      const alert = buildNewDeviceAlert(deviceInfo, parentEmailsList);
      sendParentEmailAlert(alert);
    }
  }, [authUser, emails]);
  // Usage anomaly check (runs every 5 minutes)
  useEffect(() => {
    if (SUPABASE_SYNC_ENABLED && !authUser) return;
    const interval = setInterval(() => {
      const parentEmailsList = flattenParentEmails(emails);
      if (parentEmailsList.length === 0) return;
      const anomalies = checkUsageAnomalies();
      if (anomalies.length > 0) {
        const alert = buildUsageAnomalyAlert(anomalies, parentEmailsList);
        sendParentEmailAlert(alert);
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [authUser, emails]);
  // Diary sentiment check (runs when diary changes)
  useEffect(() => {
    if (SUPABASE_SYNC_ENABLED && !authUser) return;
    if (diary.length < 3) return;
    const parentEmailsList = flattenParentEmails(emails);
    if (parentEmailsList.length === 0) return;
    const sentiment = analyzeDiarySentiment(diary, 7);
    if (sentiment.trend === 'declining' && sentiment.dayCount >= 3) {
      const alert = buildSentimentAlert(sentiment, parentEmailsList);
      sendParentEmailAlert(alert);
    }
  }, [authUser, diary, emails]);
  // Record app open for usage monitoring
  useEffect(() => { recordUsageEvent('app_open'); void syncUsageEvent('app_open'); }, []);
  // Morning check-in on app load (once per day)
  useEffect(() => {
    if (isCheckinNeeded('morning')) {
      // Small delay so the app loads first
      const timer = setTimeout(() => setCheckinModal('morning'), 800);
      return () => clearTimeout(timer);
    }
  }, []);
  // Bedtime check-in trigger (7 PM+ if not already done)
  useEffect(() => {
    if (isBedtimeWindow() && isCheckinNeeded('bedtime')) {
      const timer = setTimeout(() => setCheckinModal('bedtime'), 1500);
      return () => clearTimeout(timer);
    }
  }, []);
  const recordXpTransaction = (delta: number, kind: XpTransactionKind, source: string, reason?: string, sourceId?: string) => { if (!Number.isSafeInteger(delta) || delta === 0) return; setXpTransactions(current => appendXpTransaction(current, createXpTransaction({ delta, kind, source, reason, sourceId }))); };
  const earnXp = (amount: number, source = 'Learning activity', reason = 'Completed a learning activity') => { const points = Math.trunc(amount); if (!Number.isSafeInteger(points) || points <= 0) return; setStoreState(current => ({ ...current, wallet: { balance: current.wallet.balance + points, lifetimeEarned: current.wallet.lifetimeEarned + points } })); recordXpTransaction(points, 'earn', source, reason); };
  const adjustXp = (amount: number, reason: string) => { const requested = Math.trunc(amount); const actual = requested < 0 ? -Math.min(Math.abs(requested), wallet.balance) : requested; if (!Number.isSafeInteger(actual) || actual === 0) return; setStoreState(current => ({ ...current, wallet: { balance: current.wallet.balance + actual, lifetimeEarned: current.wallet.lifetimeEarned + Math.max(actual, 0) } })); recordXpTransaction(actual, 'parent-adjustment', 'Parent adjustment', reason); };
  const alertParent = (alert: ParentNotification) => { const savedAlert = { ...alert, createdAt: alert.createdAt || new Date().toISOString() }; setNotifications(current => [savedAlert, ...current].filter(item => !item.createdAt || Date.now() - new Date(item.createdAt).getTime() <= 24 * 60 * 60 * 1000)); setUnreadAlertCount(current => current + 1); recordMoodCheckin(savedAlert.mood); void syncParentAlert(savedAlert); const parentEmailsList = flattenParentEmails(emails); const streak = checkMoodStreak(); if (streak && parentEmailsList.length > 0) { const streakAlert = buildMoodStreakAlert(streak, parentEmailsList); sendParentEmailAlert(streakAlert); } };
  const purchase = (itemId: string): PurchaseResult => { const outcome: { result: PurchaseResult } = { result: { ok: false, reason: 'unavailable' } }; setStoreState(current => { const item = current.items.find(entry => entry.id === itemId); if (!item || !item.isAvailable) { outcome.result = { ok: false, reason: 'unavailable' }; return current; } if (item.stock !== null && item.stock < 1) { outcome.result = { ok: false, reason: 'sold-out' }; return current; } if (current.wallet.balance < item.xpCost) { outcome.result = { ok: false, reason: 'insufficient-xp' }; return current; } outcome.result = { ok: true, item }; return { ...current, wallet: { ...current.wallet, balance: current.wallet.balance - item.xpCost }, items: current.items.map(entry => entry.id === item.id && entry.stock !== null ? { ...entry, stock: entry.stock - 1, updatedAt: new Date().toISOString() } : entry), purchases: [{ id: `purchase_${Date.now()}`, itemId: item.id, itemName: item.name, xpCost: item.xpCost, imageDataUrl: item.imageDataUrl, purchasedAt: new Date().toISOString() }, ...current.purchases].slice(0, 100) }; }); if (outcome.result.ok) { recordXpTransaction(-outcome.result.item.xpCost, 'purchase', 'XP Store', `Bought ${outcome.result.item.name}`, outcome.result.item.id); showToast(`Reward unlocked: ${outcome.result.item.name}!`, '🎁', 'achievement'); confetti({ particleCount: 90, spread: 65, origin: { y: .7 }, colors: ['#fbbf24', '#14b8a6', '#a855f7'] }); } return outcome.result; };
  const completeChore = (id: string, photo?: string) => { const chore = chores.find(item => item.id === id); if (!chore || chore.isCompleted) return; setChores(current => current.map(item => item.id === id ? { ...item, isCompleted: true, completedAt: new Date().toISOString(), evidencePhotoUrl: photo || item.evidencePhotoUrl } : item)); earnXp(chore.xpReward, 'Chore', `Completed ${chore.title}`); showToast(`Lovely work! You earned ${chore.xpReward} XP.`, chore.emoji, 'chore'); confetti({ particleCount: 55, spread: 55, origin: { y: .7 }, colors: ['#fbbf24', '#14b8a6', '#a855f7'] }); };
  const selectTab = (tab: AppTab) => { setActiveTab(tab); if (soundEnabled) playSound.pop(); }; const askNotifications = async () => { const allowed = await requestNotificationPermission(); showToast(allowed ? 'Reminders are switched on! 🔔' : 'No worries — in-app reminders will still show here.', allowed ? '🔔' : '💬'); };
  if (SUPABASE_SYNC_ENABLED && !authUser) return <AuthGate onAuthenticated={onAuthenticated}/>;
  if (!profile.setupDone) return <SetupWizard onComplete={result => { setProfile(current => ({ ...current, displayName: result.displayName || current.displayName, avatar: result.avatar || current.avatar, nomiName: result.nomiName, setupDone: true })); if (result.parentPin) setParentPin(result.parentPin); }}/>;
  const spotifyEmbedId = spotifyPlaylist.match(/playlist\/([a-zA-Z0-9]+)/)?.[1] || '';
  const parentEmailList = flattenParentEmails(emails);
  const triggerCheckin = (ctx: CheckinContext) => { if (isCheckinNeeded(ctx)) setCheckinModal(ctx); };
  const closeCheckinModal = () => { if (checkinModal) markCheckinDone(checkinModal); setCheckinModal(null); };

  return <div className={`app-shell skin-${profile.skin} background-${profile.background}`}><main className="app-content"><Navbar xp={wallet.balance} level={level} streak={streak} soundEnabled={soundEnabled} onToggleSound={() => setSoundEnabled(value => !value)} onSignOut={handleSignOut} onOpenParentPortal={() => setPortalOpen(true)} onOpenBadges={() => setBadgesOpen(true)} onOpenXpTracker={() => setXpTrackerOpen(true)} displayName={profile.displayName} profilePhoto={profile.photoDataUrl} avatar={profile.avatar}/><TermBanner />{activeTab === 'today' && <TodayView schedule={schedule} chores={chores} displayName={profile.displayName} onCompleteChore={completeChore} onOpenDiary={() => selectTab('diary')} onOpenProfile={() => setProfileOpen(true)} onRequestNotifications={askNotifications}/>} {activeTab === 'diary' && <DiaryJournal entries={diary} onChange={setDiary} displayName={profile.displayName}/>} {activeTab === 'store' && <XPStore balance={wallet.balance} items={storeState.items} purchases={storeState.purchases} onPurchase={purchase} onConfirmPurchase={() => window.prompt('A parent must enter the family PIN to confirm this purchase:') === parentPin}/>} {activeTab === 'nomi' && <NomiCompanion displayName={profile.displayName} nomiName={profile.nomiName} messages={nomiMessages} onChange={setNomiMessages} onEarnXp={amount => earnXp(amount, 'Nomi', 'Completed five Nomi exchanges')} apiKey={llmConfig.provider === 'gemini' ? llmConfig.apiKey : undefined} onSafetyAlert={() => alertParent({ id: `nomi_${Date.now()}`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), mood: 'urgent', moodEmoji: '🚨', note: 'Nomi asked for an immediate parent check-in.', isUrgent: true })}/>} {activeTab === 'reading' && <ReadingCompanion onEarnXp={amount => { earnXp(amount, 'Reading quiz', 'Completed a reading comprehension quiz'); triggerCheckin('after-reading'); }} soundEnabled={soundEnabled}/>} {activeTab === 'quest' && <QuestMap onEarnXp={amount => { earnXp(amount, 'Quest checkpoint', 'Showed understanding in a Quest checkpoint'); triggerCheckin('after-quest'); }} soundEnabled={soundEnabled} displayName={profile.displayName}/>} {activeTab === 'shine' && <WeeklyShine />} {activeTab === 'learn' && <><section className="learn-hero glass-card"><div><span className="eyebrow">Learning lab</span><h2>Ready to explore, {profile.displayName}?</h2><p>Choose a mission, ask for a clue, and earn shiny XP.</p></div><div className="learn-tabs"><button className={learnTab === 'homework' ? 'selected' : ''} onClick={() => setLearnTab('homework')}><Sparkles size={17}/>AI Homework</button><button className={learnTab === 'practice' ? 'selected' : ''} onClick={() => setLearnTab('practice')}><Compass size={17}/>Practice</button><button className={learnTab === 'vibing' ? 'selected' : ''} onClick={() => setLearnTab('vibing')}><Code2 size={17}/>Vibing 💻</button></div></section><WellbeingCheckin onCheckinComplete={(_mood, bonus) => earnXp(bonus, 'Wellbeing check-in', 'Completed a feelings check-in')} onNewParentAlert={alertParent} soundEnabled={soundEnabled} parentEmails={parentEmailList}/>{learnTab === 'homework' ? <HomeworkAssistant onCompleteHomeworkStep={amount => { earnXp(amount, 'Homework', 'Completed a homework step'); triggerCheckin('after-homework'); }} soundEnabled={soundEnabled} apiKey={llmConfig.apiKey}/> : learnTab === 'practice' ? <PracticeZone onEarnXp={amount => earnXp(amount, 'Practice answer', 'Answered a practice question')} soundEnabled={soundEnabled}/> : <VibingZone onEarnXp={amount => earnXp(amount, 'Vibing lesson', 'Completed a coding lesson or milestone')}/>}</>}<footer>Conquerer · A daily learning companion made with care for {profile.displayName}.</footer></main><button className="spotify-fab" onClick={() => setMusicOpen(!musicOpen)} title={spotifyEmbedId ? 'Play my music' : 'No playlist set'} aria-label="Toggle music player">🎵</button>{musicOpen && spotifyEmbedId && <div className="spotify-embed"><button className="spotify-embed-close" onClick={() => setMusicOpen(false)} aria-label="Close player">×</button><iframe src={`https://open.spotify.com/embed/playlist/${spotifyEmbedId}?utm_source=generator&theme=0`} width="100%" height="352" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" title="Spotify playlist"/></div>}{musicOpen && !spotifyEmbedId && <div className="spotify-embed"><button className="spotify-embed-close" onClick={() => setMusicOpen(false)} aria-label="Close">×</button><p className="muted" style={{padding:'20px',textAlign:'center'}}>No playlist set yet. Ask Dad or Mom to add one in Parent Zone → Settings.</p></div>}{activeTab !== 'nomi' && <button className="nomi-fab" onClick={() => selectTab('nomi')} title={`Chat with ${profile.nomiName}`} aria-label={`Open ${profile.nomiName}`}>{profile.photoDataUrl ? <img src={profile.photoDataUrl} alt="" className="nomi-fab-img"/> : <span>{profile.avatar}</span>}</button>}<MobileBottomNav activeTab={activeTab} onSelectTab={selectTab} onOpenParentPortal={() => setPortalOpen(true)} unreadAlertCount={unreadAlertCount} nomiName={profile.nomiName}/><div className="toast-stack">{toasts.map(toast => <div className={`app-toast ${toast.type}`} key={toast.id}><span>{toast.emoji}</span><p>{toast.message}</p><button onClick={() => setToasts(current => current.filter(item => item.id !== toast.id))}>×</button></div>)}</div><ParentPortal isOpen={portalOpen} onClose={() => setPortalOpen(false)} xp={wallet.lifetimeEarned} xpBalance={wallet.balance} level={level} streak={streak} notifications={notifications} onClearNotifications={() => setUnreadAlertCount(0)} schedule={schedule} chores={chores} diary={diary} nomiMessages={nomiMessages} storeItems={storeState.items} onScheduleChange={setSchedule} onChoresChange={setChores} onStoreItemsChange={items => setStoreState(current => ({ ...current, items }))} emails={emails} onEmailsChange={setEmails} currentPin={parentPin} onPinChange={setParentPin} llmProvider={llmConfig.provider} llmApiKey={llmConfig.apiKey} onLlmConfigChange={(provider, apiKey) => setLlmConfig({ provider, apiKey })} spotifyPlaylist={spotifyPlaylist} onSpotifyPlaylistChange={setSpotifyPlaylist} onSignOut={handleSignOut} onAdjustXp={(amount, reason) => { adjustXp(amount, reason); showToast(`${amount > 0 ? '+' : ''}${amount} XP: ${reason}`, amount > 0 ? '💎' : '⚠️', amount > 0 ? 'achievement' : 'safety'); }}/><BadgesModal isOpen={badgesOpen} onClose={() => setBadgesOpen(false)} xp={wallet.lifetimeEarned} level={level}/><XPTracker isOpen={xpTrackerOpen} onClose={() => setXpTrackerOpen(false)} balance={wallet.balance} transactions={xpTransactions}/>{profileOpen && <ProfileCustomizer profile={profile} onChange={setProfile} onClose={() => setProfileOpen(false)}/>}<button className="vocab-fab" onClick={() => { setVocabInitial({}); setVocabOpen(true); }} title="My Vocab Book" aria-label="Open vocab book">📖</button><VocabBook isOpen={vocabOpen} onClose={() => setVocabOpen(false)} initialWord={vocabInitial.word} initialMeaning={vocabInitial.meaning}/>{checkinModal && <WellbeingCheckin isModal context={checkinModal} onDismiss={closeCheckinModal} onCheckinComplete={(_mood, bonus) => { earnXp(bonus, 'Wellbeing check-in', 'Completed a feelings check-in'); markCheckinDone(checkinModal); }} onNewParentAlert={alertParent} soundEnabled={soundEnabled} parentEmails={parentEmailList}/>} {sessionLocked && <div className="setup-overlay" role="dialog" aria-modal="true"><form className="glass-card setup-panel" onSubmit={event => { event.preventDefault(); if (sessionPin === parentPin) { setSessionLocked(false); setSessionPin(''); touchSession(); } }}><div className="setup-emoji">🔒</div><h2>Conquerer is taking a break</h2><p className="muted">A parent can enter the family PIN to unlock the app.</p><input type="password" inputMode="numeric" value={sessionPin} onChange={event => setSessionPin(event.target.value)} placeholder="Family PIN" aria-label="Family PIN" autoFocus/><button className="btn-primary">Unlock app</button></form></div>}</div>;
}
export default App;
