import { createClient } from '@supabase/supabase-js';

const configuredUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
const configuredAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
export const hasSupabaseConfig = Boolean(configuredUrl && configuredAnonKey);

// A disabled placeholder keeps imports safe in offline builds. It is never queried because availability is false without real env values.
const SUPABASE_URL = configuredUrl || 'https://offline.invalid';
const SUPABASE_ANON_KEY = configuredAnonKey || 'offline-placeholder-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'explorer_auth_v1',
  },
});

export async function isSupabaseAvailable(): Promise<boolean> {
  if (!hasSupabaseConfig) return false;
  try {
    const { error } = await supabase.auth.getSession();
    return !error;
  } catch {
    return false;
  }
}
