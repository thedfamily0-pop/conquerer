import { supabase, hasSupabaseConfig } from './supabase';

export type GatewayChannel = 'nomi' | 'homework' | 'parent' | 'memory';

export interface GatewayRequest {
  channel: GatewayChannel;
  message?: string;
  history?: { role: 'user' | 'model'; text: string }[];
  systemPrompt?: string;
  prompt?: string;
  provider?: 'gemini';
}

interface GatewayResponse { text?: string; error?: string; details?: string; }
interface ParentEmailAlertResponse { sent?: boolean; error?: string; details?: string; restrictedTestSender?: boolean; deliveredRecipientCount?: number; }

/** The gateway is enabled only when the deployment explicitly opts in. */
export function isAIGatewayEnabled(): boolean {
  return import.meta.env.VITE_AI_GATEWAY_ENABLED === 'true' && hasSupabaseConfig;
}

/** Direct browser calls are development/demo-only and should never be enabled for production. */
export function isDirectAIAllowed(): boolean {
  return import.meta.env.VITE_ALLOW_DIRECT_AI === 'true';
}

/**
 * Call the authenticated Supabase Edge Function. A null result means the app
 * should use its offline response bank; no browser API key is needed.
 */
export async function requestAIGateway(request: GatewayRequest): Promise<string | null> {
  if (!isAIGatewayEnabled()) return null;

  const { data, error } = await supabase.functions.invoke<GatewayResponse>('ai-chat', {
    body: request,
  });
  if (error) throw new Error(error.message || 'The AI gateway is unavailable.');
  if (!data?.text) throw new Error(data?.error || 'The AI gateway returned no response.');
  return data.text.trim();
}

export async function requestParentEmailAlert(payload: { to: string[]; subject: string; body: string }): Promise<boolean> {
  if (!isAIGatewayEnabled() || payload.to.length === 0) return false;
  const { data, error } = await supabase.functions.invoke<ParentEmailAlertResponse>('send-parent-alert', { body: payload });
  if (error) {
    const functionError = error as Error & { context?: unknown };
    let providerDetail = '';
    if (functionError.context instanceof Response) {
      try {
        const responseBody = await functionError.context.clone().json() as ParentEmailAlertResponse;
        providerDetail = responseBody.details || responseBody.error || '';
      } catch {
        // The function may return a non-JSON gateway error.
      }
    }
    throw new Error(providerDetail || functionError.message || 'The parent alert service is unavailable.');
  }
  if (data?.restrictedTestSender) {
    console.info(`📧 Resend test sender delivered the alert to ${data.deliveredRecipientCount || 1} authorised account recipient only.`);
  }
  if (data?.sent !== true) throw new Error(data?.details || data?.error || 'The parent alert was not accepted.');
  return true;
}
