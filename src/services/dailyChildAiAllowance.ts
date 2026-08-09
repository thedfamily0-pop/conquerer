import { hasSupabaseConfig, supabase } from './supabase';

interface DailyAllowanceRow {
  child_user_id: string | null;
  usage_date: string;
  used_request_count: number;
  base_daily_message_cap: number;
  base_nomi_daily_cap: number;
  base_homework_daily_cap: number;
  effective_daily_message_cap: number;
  effective_nomi_daily_cap: number;
  effective_homework_daily_cap: number;
  override_active: boolean;
}

export interface DailyChildAiAllowance {
  childUserId: string | null;
  date: string;
  usedRequestCount: number;
  baseDailyMessageCap: number;
  baseNomiDailyCap: number;
  baseHomeworkDailyCap: number;
  effectiveDailyMessageCap: number;
  effectiveNomiDailyCap: number;
  effectiveHomeworkDailyCap: number;
  overrideActive: boolean;
}

function toAllowance(value: unknown): DailyChildAiAllowance | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Partial<DailyAllowanceRow>;
  if (typeof row.usage_date !== 'string') return null;
  return {
    childUserId: typeof row.child_user_id === 'string' ? row.child_user_id : null,
    date: row.usage_date,
    usedRequestCount: Number(row.used_request_count) || 0,
    baseDailyMessageCap: Number(row.base_daily_message_cap) || 0,
    baseNomiDailyCap: Number(row.base_nomi_daily_cap) || 0,
    baseHomeworkDailyCap: Number(row.base_homework_daily_cap) || 0,
    effectiveDailyMessageCap: Number(row.effective_daily_message_cap) || 0,
    effectiveNomiDailyCap: Number(row.effective_nomi_daily_cap) || 0,
    effectiveHomeworkDailyCap: Number(row.effective_homework_daily_cap) || 0,
    overrideActive: row.override_active === true,
  };
}

export async function getDailyChildAiAllowance(): Promise<{ ok: boolean; allowance?: DailyChildAiAllowance; error?: string }> {
  if (!hasSupabaseConfig) return { ok: false, error: 'Hosted child AI allowances are unavailable in offline mode.' };
  const { data, error } = await supabase.rpc('get_my_child_ai_daily_quota_status');
  if (error) return { ok: false, error: error.message };
  const allowance = toAllowance(Array.isArray(data) ? data[0] : data);
  return allowance ? { ok: true, allowance } : { ok: false, error: 'Today’s child AI allowance could not be loaded.' };
}

export async function increaseDailyChildAiAllowance(input: {
  dailyMessageCap?: number;
  nomiDailyCap?: number;
  homeworkDailyCap?: number;
}): Promise<{ ok: boolean; error?: string }> {
  if (!hasSupabaseConfig) return { ok: false, error: 'Hosted child AI allowances are unavailable in offline mode.' };
  const { error } = await supabase.rpc('set_my_child_ai_daily_quota_override', {
    p_daily_message_cap: input.dailyMessageCap ?? null,
    p_nomi_daily_cap: input.nomiDailyCap ?? null,
    p_homework_daily_cap: input.homeworkDailyCap ?? null,
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}
