import { hasSupabaseConfig, supabase } from './supabase';

export type FamilyLlmProvider = 'gemini' | 'openai' | 'claude';

interface FamilyLlmSettingsRow {
  provider: FamilyLlmProvider;
  model: string | null;
  system_prompt: string;
  api_key_configured: boolean;
  updated_at: string | null;
}

export interface FamilyLlmSettings {
  provider: FamilyLlmProvider;
  model: string;
  systemPrompt: string;
  apiKeyConfigured: boolean;
  updatedAt: string | null;
}

const DEFAULT_SETTINGS: FamilyLlmSettings = {
  provider: 'gemini',
  model: '',
  systemPrompt: '',
  apiKeyConfigured: false,
  updatedAt: null,
};

function toSettings(value: unknown): FamilyLlmSettings | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Partial<FamilyLlmSettingsRow>;
  if (row.provider !== 'gemini' && row.provider !== 'openai' && row.provider !== 'claude') return null;
  return {
    provider: row.provider,
    model: typeof row.model === 'string' ? row.model : '',
    systemPrompt: typeof row.system_prompt === 'string' ? row.system_prompt : '',
    apiKeyConfigured: row.api_key_configured === true,
    updatedAt: typeof row.updated_at === 'string' ? row.updated_at : null,
  };
}

export async function getFamilyLlmSettings(): Promise<{ ok: boolean; settings?: FamilyLlmSettings; error?: string }> {
  if (!hasSupabaseConfig) return { ok: false, error: 'Hosted LLM settings are unavailable in offline mode.' };
  const { data, error } = await supabase.rpc('get_my_family_llm_provider_settings');
  if (error) return { ok: false, error: error.message };
  const settings = toSettings(Array.isArray(data) ? data[0] : data) || DEFAULT_SETTINGS;
  return { ok: true, settings };
}

export async function saveFamilyLlmSettings(input: {
  provider: FamilyLlmProvider;
  model: string;
  systemPrompt: string;
  apiKey?: string;
}): Promise<{ ok: boolean; settings?: FamilyLlmSettings; error?: string }> {
  if (!hasSupabaseConfig) return { ok: false, error: 'Hosted LLM settings are unavailable in offline mode.' };
  const { data, error } = await supabase.rpc('save_my_family_llm_provider_settings', {
    p_provider: input.provider,
    p_model: input.model.trim() || null,
    p_system_prompt: input.systemPrompt.trim(),
    p_api_key: input.apiKey?.trim() || null,
  });
  if (error) return { ok: false, error: error.message };
  const settings = toSettings(Array.isArray(data) ? data[0] : data);
  return settings ? { ok: true, settings } : { ok: false, error: 'The LLM settings could not be saved.' };
}
