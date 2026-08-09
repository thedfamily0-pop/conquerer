import { supabase, hasSupabaseConfig } from './supabase';

interface VerifyPinRow { verified?: boolean; configured?: boolean; locked_until?: string | null; }
interface ChildResetRequestRow { request_id: string; child_display_name: string; requested_at: string; }

export interface PortalPinVerification {
  ok: boolean;
  verified: boolean;
  configured: boolean;
  lockedUntil?: string;
  error?: string;
}
export interface ChildPortalPinResetRequest { id: string; childDisplayName: string; requestedAt: string; }
export type PortalPinReauthIntent = 'parent' | 'child';

const REAUTH_TOKEN_KEY = 'conquerer_portal_pin_reauth_token_v1';
const REAUTH_INTENT_KEY = 'conquerer_portal_pin_reauth_intent_v1';
const result = (error: { message: string } | null): { ok: boolean; error?: string } => error ? { ok: false, error: error.message } : { ok: true };

function readSessionValue(key: string): string | null {
  try { return window.sessionStorage.getItem(key); } catch { return null; }
}
function writeSessionValue(key: string, value: string): boolean {
  try { window.sessionStorage.setItem(key, value); return true; } catch { return false; }
}
function clearReauthState(): void {
  try { window.sessionStorage.removeItem(REAUTH_TOKEN_KEY); window.sessionStorage.removeItem(REAUTH_INTENT_KEY); } catch { /* Session storage may be unavailable. */ }
}

export function getPortalPinReauthIntent(): PortalPinReauthIntent | null {
  const intent = readSessionValue(REAUTH_INTENT_KEY);
  return intent === 'parent' || intent === 'child' ? intent : null;
}
export function hasPortalPinReauth(): boolean { return Boolean(getPortalPinReauthIntent() && readSessionValue(REAUTH_TOKEN_KEY)); }

export async function verifyPortalPin(pin: string): Promise<PortalPinVerification> {
  if (!hasSupabaseConfig) return { ok: false, verified: false, configured: false, error: 'Hosted PIN verification is unavailable.' };
  const { data, error } = await supabase.rpc('verify_portal_pin', { p_pin: pin });
  if (error) return { ok: false, verified: false, configured: false, error: error.message };
  const row = (Array.isArray(data) ? data[0] : data) as VerifyPinRow | undefined;
  return { ok: true, verified: row?.verified === true, configured: row?.configured === true, lockedUntil: row?.locked_until || undefined };
}

export async function setPortalPin(pin: string): Promise<{ ok: boolean; error?: string }> {
  if (!hasSupabaseConfig) return { ok: false, error: 'Hosted PIN management is unavailable.' };
  const { error } = await supabase.rpc('set_portal_pin', { p_pin: pin });
  return result(error);
}

/** Starts a fresh Google OAuth login after the server has issued a 15-minute, hashed challenge. */
export async function beginPortalPinGoogleReauth(intent: PortalPinReauthIntent): Promise<{ ok: boolean; error?: string }> {
  if (!hasSupabaseConfig) return { ok: false, error: 'Hosted PIN recovery is unavailable.' };
  const { data, error } = await supabase.rpc('begin_my_parent_portal_pin_reset');
  if (error || typeof data !== 'string' || !/^[a-f0-9]{64}$/.test(data)) return { ok: false, error: error?.message || 'PIN recovery could not be started.' };
  if (!writeSessionValue(REAUTH_TOKEN_KEY, data) || !writeSessionValue(REAUTH_INTENT_KEY, intent)) return { ok: false, error: 'This browser cannot keep the short-lived recovery challenge. Enable session storage and try again.' };
  const signOut = await supabase.auth.signOut();
  if (signOut.error) { clearReauthState(); return { ok: false, error: signOut.error.message }; }
  const redirectTo = `${window.location.origin}${window.location.pathname}${window.location.search}`;
  const signIn = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo, queryParams: { prompt: 'login' } } });
  if (signIn.error) { clearReauthState(); return { ok: false, error: signIn.error.message }; }
  return { ok: true };
}

export async function resetParentPortalPinAfterGoogleReauth(pin: string): Promise<{ ok: boolean; error?: string }> {
  const token = readSessionValue(REAUTH_TOKEN_KEY);
  if (!hasSupabaseConfig || getPortalPinReauthIntent() !== 'parent' || !token) return { ok: false, error: 'Start PIN recovery again so Google can confirm your identity.' };
  const { error } = await supabase.rpc('reset_my_parent_portal_pin_after_google_reauth', { p_token: token, p_pin: pin });
  const outcome = result(error);
  if (outcome.ok) clearReauthState();
  return outcome;
}

export async function requestMyChildPortalPinReset(): Promise<{ ok: boolean; error?: string }> {
  if (!hasSupabaseConfig) return { ok: false, error: 'Hosted PIN recovery is unavailable.' };
  const { error } = await supabase.rpc('request_my_child_pin_reset');
  return result(error);
}

export async function listChildPortalPinResetRequests(): Promise<{ ok: boolean; requests: ChildPortalPinResetRequest[]; error?: string }> {
  if (!hasSupabaseConfig) return { ok: false, requests: [], error: 'Hosted PIN recovery is unavailable.' };
  const { data, error } = await supabase.rpc('list_child_pin_reset_requests');
  if (error) return { ok: false, requests: [], error: error.message };
  const requests = (Array.isArray(data) ? data : []).map(row => row as ChildResetRequestRow).filter(row => typeof row.request_id === 'string').map(row => ({ id: row.request_id, childDisplayName: row.child_display_name, requestedAt: row.requested_at }));
  return { ok: true, requests };
}

export async function cancelChildPortalPinResetRequest(requestId: string): Promise<{ ok: boolean; error?: string }> {
  if (!hasSupabaseConfig) return { ok: false, error: 'Hosted PIN recovery is unavailable.' };
  const { error } = await supabase.rpc('cancel_child_pin_reset_request', { p_request_id: requestId });
  return result(error);
}

export async function approveChildPortalPinResetAfterGoogleReauth(requestId: string, pin: string): Promise<{ ok: boolean; error?: string }> {
  const token = readSessionValue(REAUTH_TOKEN_KEY);
  if (!hasSupabaseConfig || getPortalPinReauthIntent() !== 'child' || !token) return { ok: false, error: 'Re-authenticate with Google before approving this child PIN reset.' };
  const { error } = await supabase.rpc('approve_child_pin_reset_after_google_reauth', { p_request_id: requestId, p_token: token, p_pin: pin });
  const outcome = result(error);
  if (outcome.ok) clearReauthState();
  return outcome;
}
