import { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import confetti from 'canvas-confetti';
import { Compass, Sparkles, Code2 } from 'lucide-react';
import { Navbar } from './components/Navbar'; import { WellbeingCheckin, type ParentNotification, type CheckinContext, isCheckinNeeded, markCheckinDone, isBedtimeWindow } from './components/WellbeingCheckin'; import { HomeworkAssistant } from './components/HomeworkAssistant'; import { PracticeZone } from './components/PracticeZone'; import { ReadingCompanion } from './components/ReadingCompanion'; import { ParentPortal } from './components/ParentPortal'; import { BadgesModal } from './components/BadgesModal'; import { MobileBottomNav, type AppTab } from './components/MobileBottomNav'; import { TodayView } from './components/TodayView'; import { DiaryJournal } from './components/DiaryJournal'; import { NomiCompanion } from './components/NomiCompanion'; import { ProfileCustomizer } from './components/ProfileCustomizer'; import { XPStore } from './components/XPStore'; import { XPTracker } from './components/XPTracker'; import { SetupWizard } from './components/SetupWizard'; import { TermBanner } from './components/TermBanner'; import { VibingZone } from './components/VibingZone'; import { QuestMap } from './components/QuestMap'; import { WeeklyShine } from './components/WeeklyShine';
import { loadChores, loadDiary, loadNomiHistory, loadSchedule, saveChores, saveDiary, saveNomiHistory, saveSchedule, type ChoreTask, type DiaryEntry, type NomiMessage, type ScheduleItem } from './data/scheduleData'; import { loadProfile, saveProfile, type LearnerProfile } from './data/profileData'; import { loadStoreState, saveStoreState, type PurchaseResult, type StoreState } from './data/storeData'; import { loadXpTransactions, saveXpTransactions, appendXpTransaction, createXpTransaction, claimLearningXp, type XpTransaction, type XpTransactionKind } from './services/xpEconomy'; import { registerEmailCallback, registerToastCallback, requestNotificationPermission, setParentEmails, showToast, startReminderEngine, type AppToast } from './services/notificationService'; import { playSound } from './services/audioService';
import { initSync, getFamilyId, refreshRemoteState, SUPABASE_SYNC_ENABLED, syncActiveSession, syncChores, syncDiary, syncNomiMessages, syncParentAlert, syncPerformanceEvents, syncSchedule, syncStoreState, syncUsageEvent, type FamilyRole, type RemoteState } from './services/syncEngine';
import { supabase, hasSupabaseConfig } from './services/supabase';
import { isAIGatewayEnabled } from './services/aiGateway';
import { verifyPortalPin } from './services/portalPin';
import { listFamilyInvitations, revokeFamilyInvitation, sendFamilyInvitation, type FamilyInvitation, type FamilyInvitationRole } from './services/familyInvitations';
import { getPerformanceEvents, getLearningStreak } from './services/performanceData';
import { sendParentEmailAlert } from './services/childSafetyScanner';
import { AuthGate } from './components/AuthGate';
import { VocabBook } from './components/VocabBook';
import { startSessionTimer, touchSession } from './services/guardrails/sessionManager';
import { checkDeviceAccess, buildNewDeviceAlert } from './services/guardrails/deviceFingerprint';
import { recordMoodCheckin, checkMoodStreak, checkUsageAnomalies, analyzeDiarySentiment, recordUsageEvent, buildMoodStreakAlert, buildUsageAnomalyAlert, buildSentimentAlert } from './services/guardrails/wellbeingMonitor';
import { flattenParentEmails, loadFamilyEmailSettings, loadParentEmailSettings, normalizeParentEmailSettings, saveFamilyEmailSettings, saveParentEmailSettings, type ParentEmailSettings } from './services/parentEmailSettings';
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

function mergeRemoteStore(local: StoreState, remote: { wallet: StoreState['wallet'] | null; items: StoreState['items']; purchases: StoreState['purchases'] }): StoreState {
  const remoteItemIds = new Set(remote.items.map(item => item.id));
  const remotePurchaseIds = new Set(remote.purchases.map(purchase => purchase.id));
  return {
    wallet: remote.wallet || local.wallet,
    items: [...remote.items, ...local.items.filter(item => !remoteItemIds.has(item.id))],
    purchases: [...remote.purchases, ...local.purchases.filter(purchase => !remotePurchaseIds.has(purchase.id))].slice(0, 100),
  };
}

function getInitialParentPin(scope = 'offline'): string {
  try {
    const scopedKey = scope === 'offline' ? 'explorer_parent_pin_v1' : `explorer_portal_pin_${scope}_v1`;
    const stored = localStorage.getItem(scopedKey);
    if (stored) return stored;
    const legacy = scope !== 'offline' ? localStorage.getItem('explorer_parent_pin_v1') : null;
    if (legacy) { localStorage.setItem(scopedKey, legacy); return legacy; }
    const generated = String(Math.floor(100000 + Math.random() * 900000));
    localStorage.setItem(scopedKey, generated);
    return generated;
  } catch { return ''; }
}

export function App() {
  const secureBackendEnabled = SUPABASE_SYNC_ENABLED || isAIGatewayEnabled();
  const hostedPinMode = SUPABASE_SYNC_ENABLED && hasSupabaseConfig;
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [accessRole, setAccessRole] = useState<FamilyRole | null>(null);
  const [parentViewingChildApp, setParentViewingChildApp] = useState(false);
  const onAuthenticated = useCallback((user: User) => setAuthUser(user), []);
  const handleSignOut = useCallback(async () => {
    if (secureBackendEnabled) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        showToast('Could not sign out. Please try again.', '⚠️', 'safety');
        return;
      }
    }
    setAuthUser(null);
    setAccessRole(null);
    setFamilyId(null);
    setFamilyInvitations([]);
    setParentViewingChildApp(false);
    setPortalOpen(false);
  }, [secureBackendEnabled]);
  const streak = getLearningStreak(getPerformanceEvents()); const [soundEnabled, setSoundEnabled] = useState(true); const [activeTab, setActiveTab] = useState<AppTab>('today'); const [learnTab, setLearnTab] = useState<'homework' | 'practice' | 'vibing'>('homework'); const [portalOpen, setPortalOpen] = useState(false); const [badgesOpen, setBadgesOpen] = useState(false); const [profileOpen, setProfileOpen] = useState(false); const [vocabOpen, setVocabOpen] = useState(false); const [vocabInitial, setVocabInitial] = useState<{ word?: string; meaning?: string }>({});
  const [profile, setProfile] = useState<LearnerProfile>(loadProfile); const [schedule, setSchedule] = useState<ScheduleItem[]>(loadSchedule); const [chores, setChores] = useState<ChoreTask[]>(loadChores); const [diary, setDiary] = useState<DiaryEntry[]>(loadDiary); const [storeState, setStoreState] = useState<StoreState>(loadStoreState); const [xpTransactions, setXpTransactions] = useState<XpTransaction[]>(() => loadXpTransactions(storeState.wallet.balance)); const [xpTrackerOpen, setXpTrackerOpen] = useState(false); const [nomiMessages, setNomiMessages] = useState<NomiMessage[]>(loadNomiHistory); const [toasts, setToasts] = useState<AppToast[]>([]); const [emails, setEmails] = useState<ParentEmailSettings>(loadParentEmailSettings);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const periodicSyncInFlight = useRef(false);
  const diaryRef = useRef(diary);
  const nomiMessagesRef = useRef(nomiMessages);
  useEffect(() => { diaryRef.current = diary; }, [diary]);
  useEffect(() => { nomiMessagesRef.current = nomiMessages; }, [nomiMessages]);
  const applyRemoteState = useCallback((remote: RemoteState) => {
    if (remote.schedule.length) setSchedule(remote.schedule);
    if (remote.chores.length) setChores(remote.chores);
    if (remote.store) setStoreState(current => mergeRemoteStore(current, remote.store!));
    setDiary(current => mergeRemoteDiary(current, remote.diary));
    setNomiMessages(current => mergeRemoteMessages(current, remote.nomiMessages));
  }, []);
  const [familyEmailSettingsReady, setFamilyEmailSettingsReady] = useState(!SUPABASE_SYNC_ENABLED);
  const [familyInvitations, setFamilyInvitations] = useState<FamilyInvitation[]>([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const refreshFamilyInvitations = useCallback(async () => {
    if (!SUPABASE_SYNC_ENABLED || !familyId || accessRole !== 'parent') {
      setFamilyInvitations([]);
      return;
    }
    setInvitationsLoading(true);
    const result = await listFamilyInvitations();
    setInvitationsLoading(false);
    if (result.ok) setFamilyInvitations(result.invitations);
  }, [accessRole, familyId]);
  const sendFamilyInvite = useCallback(async (input: { email: string; displayName: string; role: FamilyInvitationRole }) => {
    const result = await sendFamilyInvitation(input);
    if (result.ok) await refreshFamilyInvitations();
    return result;
  }, [refreshFamilyInvitations]);
  const revokeFamilyInvite = useCallback(async (invitationId: string) => {
    const result = await revokeFamilyInvitation(invitationId);
    if (result.ok) await refreshFamilyInvitations();
    return result;
  }, [refreshFamilyInvitations]);
  const [parentPin, setParentPin] = useState(() => hostedPinMode ? '' : getInitialParentPin());
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
    setFamilyEmailSettingsReady(false);
    void initSync(profile).then(async result => {
      if (!active || !result.remote) return;
      setAccessRole(result.role);
      if (result.role === 'child' && result.profile) setProfile(current => ({ ...current, displayName: result.profile!.displayName, avatar: result.profile!.avatar, nomiName: result.profile!.nomiName, setupDone: true }));
      if (result.role === 'parent') { setParentViewingChildApp(false); setPortalOpen(true); }
      applyRemoteState(result.remote);
      const currentFamilyId = getFamilyId();
      if (!currentFamilyId) { setFamilyEmailSettingsReady(true); return; }
      setFamilyId(currentFamilyId);
      if (result.role === 'child') {
        setFamilyEmailSettingsReady(true);
        return;
      }
      const remoteContacts = await loadFamilyEmailSettings(currentFamilyId);
      if (!active) return;
      if (!remoteContacts.ok) return;
      if (remoteContacts.value) {
        setEmails(remoteContacts.value);
      } else {
        const seeded = await saveFamilyEmailSettings(currentFamilyId, emails);
        if (!seeded.ok) return;
      }
      if (active) {
        setFamilyId(currentFamilyId);
        setFamilyEmailSettingsReady(true);
      }
    });
    return () => { active = false; };
    // The auth/session and setup transitions intentionally initialise sync once each.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, profile.setupDone]);
  useEffect(() => { void refreshFamilyInvitations(); }, [refreshFamilyInvitations]);
  useEffect(() => saveProfile(profile), [profile]);
  useEffect(() => { saveSchedule(schedule); void syncSchedule(schedule); }, [schedule]);
  useEffect(() => { saveChores(chores); void syncChores(chores); }, [chores]);
  useEffect(() => { saveDiary(diary); void syncDiary(diary); }, [diary]);
  useEffect(() => saveStoreState(storeState), [storeState]);
  useEffect(() => saveXpTransactions(xpTransactions), [xpTransactions]);
  useEffect(() => { void syncStoreState(storeState); }, [storeState]);
  useEffect(() => { saveNomiHistory(nomiMessages); void syncNomiMessages(nomiMessages); }, [nomiMessages]);
  useEffect(() => {
    if (!SUPABASE_SYNC_ENABLED || !authUser) return;
    const sync = () => { void syncPerformanceEvents(getPerformanceEvents()); };
    sync();
    window.addEventListener('conquerer-performance-updated', sync);
    return () => window.removeEventListener('conquerer-performance-updated', sync);
  }, [authUser]);
  useEffect(() => {
    if (!SUPABASE_SYNC_ENABLED || !authUser || !accessRole) return;
    let active = true;
    const syncEveryFifteenMinutes = async () => {
      if (!active || document.visibilityState !== 'visible' || !navigator.onLine || periodicSyncInFlight.current) return;
      periodicSyncInFlight.current = true;
      try {
        if (accessRole === 'child') {
          await syncActiveSession({ diary: diaryRef.current, nomiMessages: nomiMessagesRef.current, performanceEvents: getPerformanceEvents() });
        }
        const remote = await refreshRemoteState();
        if (active && remote) applyRemoteState(remote);
      } finally {
        periodicSyncInFlight.current = false;
      }
    };
    const resumeSync = () => { void syncEveryFifteenMinutes(); };
    void syncEveryFifteenMinutes();
    const interval = window.setInterval(resumeSync, 15 * 60 * 1000);
    window.addEventListener('online', resumeSync);
    window.addEventListener('focus', resumeSync);
    document.addEventListener('visibilitychange', resumeSync);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener('online', resumeSync);
      window.removeEventListener('focus', resumeSync);
      document.removeEventListener('visibilitychange', resumeSync);
    };
  }, [accessRole, applyRemoteState, authUser]);
  useEffect(() => {
    if (authUser) setParentPin(hostedPinMode ? '' : getInitialParentPin(authUser.id));
  }, [authUser, hostedPinMode]);
  useEffect(() => {
    if (hostedPinMode) {
      localStorage.removeItem('explorer_parent_pin_v1');
      if (authUser) localStorage.removeItem(`explorer_portal_pin_${authUser.id}_v1`);
      return;
    }
    localStorage.setItem(authUser ? `explorer_portal_pin_${authUser.id}_v1` : 'explorer_parent_pin_v1', parentPin);
  }, [authUser, hostedPinMode, parentPin]);
  useEffect(() => {
    setParentEmails(flattenParentEmails(emails));
  }, [emails]);
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
    if (secureBackendEnabled && !authUser) return;
    const parentEmailsList = flattenParentEmails(emails);
    const { isNewDevice, deviceInfo } = checkDeviceAccess();
    if (isNewDevice) {
      const alert = buildNewDeviceAlert(deviceInfo, parentEmailsList);
      sendParentEmailAlert(alert);
    }
  }, [authUser, emails, secureBackendEnabled]);
  // Usage anomaly check (runs every 5 minutes)
  useEffect(() => {
    if (secureBackendEnabled && !authUser) return;
    const interval = setInterval(() => {
      const parentEmailsList = flattenParentEmails(emails);
      const anomalies = checkUsageAnomalies();
      if (anomalies.length > 0) {
        const alert = buildUsageAnomalyAlert(anomalies, parentEmailsList);
        sendParentEmailAlert(alert);
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [authUser, emails, secureBackendEnabled]);
  // Diary sentiment check (runs when diary changes)
  useEffect(() => {
    if (secureBackendEnabled && !authUser) return;
    if (diary.length < 3) return;
    const parentEmailsList = flattenParentEmails(emails);
    const sentiment = analyzeDiarySentiment(diary, 7);
    if (sentiment.trend === 'declining' && sentiment.dayCount >= 3) {
      const alert = buildSentimentAlert(sentiment, parentEmailsList);
      sendParentEmailAlert(alert);
    }
  }, [authUser, diary, emails, secureBackendEnabled]);
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
  type XpAwardCategory = 'learning' | 'ad-hoc';
  const earnXp = async (amount: number, source = 'Learning activity', reason = 'Completed a learning activity', category: XpAwardCategory = 'learning', activityKey?: string): Promise<number> => {
    const points = Math.trunc(amount);
    if (!Number.isSafeInteger(points) || points <= 0) return 0;
    const claim = category === 'learning' ? await claimLearningXp(points, source, reason, activityKey) : { requested: points, awarded: points, total: 0, remaining: 0, hosted: false };
    if (claim.error) { showToast(claim.error, '⚠️', 'safety'); return 0; }
    const awarded = claim.awarded;
    if (awarded <= 0) {
      showToast("You've reached today's 100 learning XP cap. You can keep exploring and earn more tomorrow!", '🌟', 'achievement');
      return 0;
    }
    setStoreState(current => claim.hosted && claim.balance !== undefined && claim.lifetimeEarned !== undefined
      ? { ...current, wallet: { balance: claim.balance, lifetimeEarned: claim.lifetimeEarned } }
      : { ...current, wallet: { balance: current.wallet.balance + awarded, lifetimeEarned: current.wallet.lifetimeEarned + awarded } });
    recordXpTransaction(awarded, 'earn', source, awarded < points ? `${reason} (${awarded} of ${points} XP awarded today)` : reason);
    if (awarded < points) showToast(`You earned ${awarded} XP. Today's learning cap has ${claim.remaining} XP left.`, '🌟', 'achievement');
    return awarded;
  };
  const adjustXp = (amount: number, reason: string) => { const requested = Math.trunc(amount); const actual = requested < 0 ? -Math.min(Math.abs(requested), wallet.balance) : requested; if (!Number.isSafeInteger(actual) || actual === 0) return; setStoreState(current => ({ ...current, wallet: { balance: current.wallet.balance + actual, lifetimeEarned: current.wallet.lifetimeEarned + Math.max(actual, 0) } })); recordXpTransaction(actual, 'parent-adjustment', 'Parent adjustment', reason); };
  const alertParent = (alert: ParentNotification) => { const savedAlert = { ...alert, createdAt: alert.createdAt || new Date().toISOString() }; setNotifications(current => [savedAlert, ...current].filter(item => !item.createdAt || Date.now() - new Date(item.createdAt).getTime() <= 24 * 60 * 60 * 1000)); setUnreadAlertCount(current => current + 1); recordMoodCheckin(savedAlert.mood); void syncParentAlert(savedAlert); const parentEmailsList = flattenParentEmails(emails); const streak = checkMoodStreak(); if (streak) { const streakAlert = buildMoodStreakAlert(streak, parentEmailsList); sendParentEmailAlert(streakAlert); } };
  const purchase = (itemId: string): PurchaseResult => { const outcome: { result: PurchaseResult } = { result: { ok: false, reason: 'unavailable' } }; setStoreState(current => { const item = current.items.find(entry => entry.id === itemId); if (!item || !item.isAvailable) { outcome.result = { ok: false, reason: 'unavailable' }; return current; } if (item.stock !== null && item.stock < 1) { outcome.result = { ok: false, reason: 'sold-out' }; return current; } if (current.wallet.balance < item.xpCost) { outcome.result = { ok: false, reason: 'insufficient-xp' }; return current; } outcome.result = { ok: true, item }; return { ...current, wallet: { ...current.wallet, balance: current.wallet.balance - item.xpCost }, items: current.items.map(entry => entry.id === item.id && entry.stock !== null ? { ...entry, stock: entry.stock - 1, updatedAt: new Date().toISOString() } : entry), purchases: [{ id: `purchase_${Date.now()}`, itemId: item.id, itemName: item.name, xpCost: item.xpCost, imageDataUrl: item.imageDataUrl, purchasedAt: new Date().toISOString() }, ...current.purchases].slice(0, 100) }; }); if (outcome.result.ok) { recordXpTransaction(-outcome.result.item.xpCost, 'purchase', 'XP Store', `Bought ${outcome.result.item.name}`, outcome.result.item.id); showToast(`Reward unlocked: ${outcome.result.item.name}!`, '🎁', 'achievement'); confetti({ particleCount: 90, spread: 65, origin: { y: .7 }, colors: ['#fbbf24', '#14b8a6', '#a855f7'] }); } return outcome.result; };
  const completeChore = (id: string, photo?: string) => { const chore = chores.find(item => item.id === id); if (!chore || chore.isCompleted) return; setChores(current => current.map(item => item.id === id ? { ...item, isCompleted: true, completedAt: new Date().toISOString(), evidencePhotoUrl: photo || item.evidencePhotoUrl } : item)); earnXp(chore.xpReward, 'Chore', `Completed ${chore.title}`, 'ad-hoc'); showToast(`Lovely work! You earned ${chore.xpReward} XP.`, chore.emoji, 'chore'); confetti({ particleCount: 55, spread: 55, origin: { y: .7 }, colors: ['#fbbf24', '#14b8a6', '#a855f7'] }); };
  const saveEmails = useCallback(async (next: ParentEmailSettings): Promise<{ ok: boolean; message?: string }> => {
    const normalized = normalizeParentEmailSettings(next);
    if (SUPABASE_SYNC_ENABLED) {
      if (!familyId || !familyEmailSettingsReady) return { ok: false, message: 'Family settings are still loading. Please try again in a moment.' };
      const result = await saveFamilyEmailSettings(familyId, normalized);
      if (!result.ok) return { ok: false, message: 'error' in result ? result.error : 'Email settings could not be saved.' };
    }
    saveParentEmailSettings(normalized);
    setEmails(normalized);
    setParentEmails(flattenParentEmails(normalized));
    return { ok: true, message: 'Email settings saved successfully.' };
  }, [familyId, familyEmailSettingsReady]);
  const confirmPortalPin = async (): Promise<boolean> => {
    const entered = window.prompt('Enter your personal portal PIN to confirm this purchase:');
    if (entered === null) return false;
    const remote = await verifyPortalPin(entered);
    if (remote.ok && remote.configured) return remote.verified;
    if (hostedPinMode) return false;
    return Boolean(parentPin) && entered === parentPin;
  };
  const selectTab = (tab: AppTab) => { setActiveTab(tab); if (soundEnabled) playSound.pop(); }; const askNotifications = async () => { const allowed = await requestNotificationPermission(); showToast(allowed ? 'Reminders are switched on! 🔔' : 'No worries — in-app reminders will still show here.', allowed ? '🔔' : '💬'); };
  if (secureBackendEnabled && !authUser) return <AuthGate onAuthenticated={onAuthenticated}/>;
  if (!profile.setupDone && accessRole === null) return <SetupWizard onComplete={result => { setProfile(current => ({ ...current, displayName: result.displayName || current.displayName, avatar: result.avatar || current.avatar, nomiName: result.nomiName, setupDone: true })); if (result.parentPin) setParentPin(result.parentPin); }}/>;
  const spotifyEmbedId = spotifyPlaylist.match(/playlist\/([a-zA-Z0-9]+)/)?.[1] || '';
  const parentEmailList = flattenParentEmails(emails);
  const canAccessParentZone = !SUPABASE_SYNC_ENABLED || accessRole === 'parent';
  const openParentPortal = () => { setParentViewingChildApp(false); setPortalOpen(true); };
  const triggerCheckin = (ctx: CheckinContext) => { if (isCheckinNeeded(ctx)) setCheckinModal(ctx); };
  const closeCheckinModal = () => { if (checkinModal) markCheckinDone(checkinModal); setCheckinModal(null); };

  return <div className={`app-shell skin-${profile.skin} background-${profile.background}`}><main className="app-content"><Navbar xp={wallet.balance} level={level} streak={streak} soundEnabled={soundEnabled} onToggleSound={() => setSoundEnabled(value => !value)} onSignOut={handleSignOut} onOpenParentPortal={openParentPortal} onOpenBadges={() => setBadgesOpen(true)} onOpenXpTracker={() => setXpTrackerOpen(true)} displayName={profile.displayName} profilePhoto={profile.photoDataUrl} avatar={profile.avatar} canAccessParentZone={canAccessParentZone}/><TermBanner />{activeTab === 'today' && <TodayView schedule={schedule} chores={chores} displayName={profile.displayName} onCompleteChore={completeChore} onOpenDiary={() => selectTab('diary')} onOpenProfile={() => setProfileOpen(true)} onRequestNotifications={askNotifications}/>} {activeTab === 'diary' && <DiaryJournal entries={diary} onChange={setDiary} displayName={profile.displayName}/>} {activeTab === 'store' && <XPStore balance={wallet.balance} items={storeState.items} purchases={storeState.purchases} onPurchase={purchase} onConfirmPurchase={confirmPortalPin}/>} {activeTab === 'nomi' && <NomiCompanion displayName={profile.displayName} nomiName={profile.nomiName} messages={nomiMessages} onChange={setNomiMessages} parentEmails={parentEmailList} onEarnXp={(amount, activityKey) => earnXp(amount, 'Nomi', 'Completed five Nomi exchanges', 'learning', activityKey)} apiKey={llmConfig.provider === 'gemini' ? llmConfig.apiKey : undefined} onSafetyAlert={() => alertParent({ id: `nomi_${Date.now()}`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), mood: 'urgent', moodEmoji: '🚨', note: 'Nomi asked for an immediate parent check-in.', isUrgent: true })}/>} {activeTab === 'reading' && <ReadingCompanion onEarnXp={(amount, activityKey) => { earnXp(amount, 'Reading quiz', 'Completed a reading comprehension quiz', 'learning', activityKey); triggerCheckin('after-reading'); }} soundEnabled={soundEnabled}/>} {activeTab === 'quest' && <QuestMap onEarnXp={(amount, activityKey) => { earnXp(amount, 'Quest checkpoint', 'Showed understanding in a Quest checkpoint', 'learning', activityKey); triggerCheckin('after-quest'); }} soundEnabled={soundEnabled} displayName={profile.displayName}/>} {activeTab === 'shine' && <WeeklyShine />} {activeTab === 'learn' && <><section className="learn-hero glass-card"><div><span className="eyebrow">Learning lab</span><h2>Ready to explore, {profile.displayName}?</h2><p>Choose a mission, ask for a clue, and earn shiny XP.</p></div><div className="learn-tabs"><button className={learnTab === 'homework' ? 'selected' : ''} onClick={() => setLearnTab('homework')}><Sparkles size={17}/>AI Homework</button><button className={learnTab === 'practice' ? 'selected' : ''} onClick={() => setLearnTab('practice')}><Compass size={17}/>Practice</button><button className={learnTab === 'vibing' ? 'selected' : ''} onClick={() => setLearnTab('vibing')}><Code2 size={17}/>Vibing 💻</button></div></section><WellbeingCheckin onCheckinComplete={(_mood, bonus, activityKey) => earnXp(bonus, 'Wellbeing check-in', 'Completed a feelings check-in', 'learning', activityKey)} onNewParentAlert={alertParent} soundEnabled={soundEnabled} parentEmails={parentEmailList}/>{learnTab === 'homework' ? <HomeworkAssistant onCompleteHomeworkStep={(amount, activityKey) => { earnXp(amount, 'Homework', 'Completed a homework step', 'learning', activityKey); triggerCheckin('after-homework'); }} soundEnabled={soundEnabled} apiKey={llmConfig.apiKey}/> : learnTab === 'practice' ? <PracticeZone onEarnXp={(amount, activityKey) => earnXp(amount, 'Practice answer', 'Answered a practice question', 'learning', activityKey)} soundEnabled={soundEnabled}/> : <VibingZone onEarnXp={(amount, activityKey) => earnXp(amount, 'Vibing lesson', 'Completed a coding lesson or milestone', 'learning', activityKey)}/>}</>}<footer>Conquerer · A daily learning companion made with care for {profile.displayName}.</footer></main><button className="spotify-fab" onClick={() => setMusicOpen(!musicOpen)} title={spotifyEmbedId ? 'Play my music' : 'No playlist set'} aria-label="Toggle music player">🎵</button>{musicOpen && spotifyEmbedId && <div className="spotify-embed"><button className="spotify-embed-close" onClick={() => setMusicOpen(false)} aria-label="Close player">×</button><iframe src={`https://open.spotify.com/embed/playlist/${spotifyEmbedId}?utm_source=generator&theme=0`} width="100%" height="352" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" title="Spotify playlist"/></div>}{musicOpen && !spotifyEmbedId && <div className="spotify-embed"><button className="spotify-embed-close" onClick={() => setMusicOpen(false)} aria-label="Close">×</button><p className="muted" style={{padding:'20px',textAlign:'center'}}>No playlist set yet. Your playlist can be added in Settings.</p></div>}{activeTab !== 'nomi' && <button className="nomi-fab" onClick={() => selectTab('nomi')} title={`Chat with ${profile.nomiName}`} aria-label={`Open ${profile.nomiName}`}>{profile.photoDataUrl ? <img src={profile.photoDataUrl} alt="" className="nomi-fab-img"/> : <span>{profile.avatar}</span>}</button>}<MobileBottomNav activeTab={activeTab} onSelectTab={selectTab} onOpenParentPortal={openParentPortal} unreadAlertCount={unreadAlertCount} nomiName={profile.nomiName} canAccessParentZone={canAccessParentZone}/><div className="toast-stack">{toasts.map(toast => <div className={`app-toast ${toast.type}`} key={toast.id}><span>{toast.emoji}</span><p>{toast.message}</p><button onClick={() => setToasts(current => current.filter(item => item.id !== toast.id))}>×</button></div>)}</div>{canAccessParentZone && <ParentPortal isOpen={canAccessParentZone && portalOpen && !parentViewingChildApp} onClose={() => setPortalOpen(false)} xp={wallet.lifetimeEarned} xpBalance={wallet.balance} level={level} streak={streak} notifications={notifications} onClearNotifications={() => setUnreadAlertCount(0)} schedule={schedule} chores={chores} diary={diary} nomiMessages={nomiMessages} storeItems={storeState.items} onScheduleChange={setSchedule} onChoresChange={setChores} onStoreItemsChange={items => setStoreState(current => ({ ...current, items }))} emails={emails} onSaveEmails={saveEmails} invitations={familyInvitations} invitationsLoading={invitationsLoading} onSendInvitation={sendFamilyInvite} onRevokeInvitation={revokeFamilyInvite} onOpenChildApp={() => { setParentViewingChildApp(true); setPortalOpen(false); }} currentPin={parentPin} hostedPinRequired={hostedPinMode} onPinChange={setParentPin} llmProvider={llmConfig.provider} llmApiKey={llmConfig.apiKey} onLlmConfigChange={(provider, apiKey) => setLlmConfig({ provider, apiKey })} spotifyPlaylist={spotifyPlaylist} onSpotifyPlaylistChange={setSpotifyPlaylist} onSignOut={handleSignOut} onAdjustXp={(amount, reason) => { adjustXp(amount, reason); showToast(`${amount > 0 ? '+' : ''}${amount} XP: ${reason}`, amount > 0 ? '💎' : '⚠️', amount > 0 ? 'achievement' : 'safety'); }}/>}<BadgesModal isOpen={badgesOpen} onClose={() => setBadgesOpen(false)} xp={wallet.lifetimeEarned} level={level}/><XPTracker isOpen={xpTrackerOpen} onClose={() => setXpTrackerOpen(false)} balance={wallet.balance} transactions={xpTransactions}/>{profileOpen && <ProfileCustomizer profile={profile} onChange={setProfile} onClose={() => setProfileOpen(false)} portalPin={parentPin} onPortalPinChange={setParentPin} hostedPinRequired={hostedPinMode}/>}<button className="vocab-fab" onClick={() => { setVocabInitial({}); setVocabOpen(true); }} title="My Vocab Book" aria-label="Open vocab book">📖</button><VocabBook isOpen={vocabOpen} onClose={() => setVocabOpen(false)} initialWord={vocabInitial.word} initialMeaning={vocabInitial.meaning}/>{checkinModal && <WellbeingCheckin isModal context={checkinModal} onDismiss={closeCheckinModal} onCheckinComplete={(_mood, bonus, activityKey) => { earnXp(bonus, 'Wellbeing check-in', 'Completed a feelings check-in', 'learning', activityKey); markCheckinDone(checkinModal); }} onNewParentAlert={alertParent} soundEnabled={soundEnabled} parentEmails={parentEmailList}/>} {sessionLocked && <div className="setup-overlay" role="dialog" aria-modal="true"><form className="glass-card setup-panel" onSubmit={async event => { event.preventDefault(); const remote = await verifyPortalPin(sessionPin); const verified = remote.ok && remote.configured && remote.verified; if (verified) { setSessionLocked(false); setSessionPin(''); touchSession(); } else showToast('That PIN did not unlock the app. Please try again.', '🔒', 'safety'); }}><div className="setup-emoji">🔒</div><h2>Conquerer is taking a break</h2><p className="muted">Conquerer is taking a break. Enter your personal portal PIN to continue.</p><input type="password" inputMode="numeric" value={sessionPin} onChange={event => setSessionPin(event.target.value)} placeholder="Personal portal PIN" aria-label="Personal portal PIN" autoFocus/><button className="btn-primary">Unlock app</button></form></div>}</div>;
}
export default App;
