import { supabase, hasSupabaseConfig } from './supabase';

interface VerifyPinRow { verified?: boolean; configured?: boolean; locked_until?: string | null; }

export interface PortalPinVerification {
  ok: boolean;
  verified: boolean;
  configured: boolean;
  lockedUntil?: string;
  error?: string;
}

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
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function requestPortalPinReset(email: string): Promise<{ ok: boolean; error?: string }> {
  if (!hasSupabaseConfig || !email.trim()) return { ok: false, error: 'Use the signed-in account email to request a reset.' };
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}${window.location.pathname}` });
  return error ? { ok: false, error: error.message } : { ok: true };
}
