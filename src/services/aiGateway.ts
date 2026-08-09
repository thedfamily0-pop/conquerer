import { supabase, hasSupabaseConfig } from './supabase';

export type GatewayChannel = 'nomi' | 'homework' | 'parent' | 'memory';
export type GatewayFailureKind = 'unauthenticated' | 'quota' | 'blocked' | 'safety' | 'forbidden' | 'unavailable';

export interface NomiGatewayRequest {
  channel: 'nomi';
  message: string;
  history: { role: 'user' | 'model'; text: string }[];
}

export interface HomeworkGatewayRequest {
  channel: 'homework';
  prompt: string;
}

export interface ParentGatewayRequest {
  channel: 'parent' | 'memory';
  prompt: string;
}

export type GatewayRequest = NomiGatewayRequest | HomeworkGatewayRequest | ParentGatewayRequest;

export type GatewayResult =
  | { ok: true; text: string; remaining?: number }
  | { ok: false; kind: GatewayFailureKind; message: string; retryAfterSeconds?: number };

interface GatewayResponse {
  text?: string;
  error?: string;
  code?: GatewayFailureKind;
  retryAfterSeconds?: number;
  remaining?: number;
}
interface ParentEmailAlertResponse { sent?: boolean; error?: string; details?: string; restrictedTestSender?: boolean; deliveredRecipientCount?: number; }

/** The gateway is enabled only when the deployment explicitly opts in. */
export function isAIGatewayEnabled(): boolean {
  return import.meta.env.VITE_AI_GATEWAY_ENABLED === 'true' && hasSupabaseConfig;
}

/** Direct browser Gemini requests are allowed only in a local development build. */
export function isDirectAIAllowed(): boolean {
  return import.meta.env.DEV && import.meta.env.VITE_ALLOW_DIRECT_AI === 'true';
}

function failureFromResponse(response?: GatewayResponse): GatewayResult {
  const kind = response?.code || 'unavailable';
  const defaults: Record<GatewayFailureKind, string> = {
    unauthenticated: 'Please sign in before using Nomi.',
    quota: 'Nomi is taking a short break. Please try again later.',
    blocked: 'That message cannot be sent here. Please leave out links or private details and try again.',
    safety: 'Your safety matters. Please tell a trusted grown-up near you what is happening right now.',
    forbidden: 'This AI feature is not available for this account.',
    unavailable: 'Nomi is temporarily unavailable. Please try again shortly.',
  };
  return {
    ok: false,
    kind,
    message: response?.error || defaults[kind],
    retryAfterSeconds: response?.retryAfterSeconds,
  };
}

async function responseFromError(error: unknown): Promise<GatewayResult> {
  const context = error as Error & { context?: unknown };
  if (context.context instanceof Response) {
    try {
      return failureFromResponse(await context.context.clone().json() as GatewayResponse);
    } catch {
      // Non-JSON gateway failures are treated as temporarily unavailable.
    }
  }
  return failureFromResponse();
}

/**
 * Call the authenticated, server-authoritative AI gateway. Production callers
 * receive an explicit result so UI never pretends a canned answer came from Gemini.
 */
export async function requestAIGateway(request: GatewayRequest): Promise<GatewayResult> {
  if (!isAIGatewayEnabled()) return failureFromResponse();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return failureFromResponse({ code: 'unauthenticated' });

  try {
    const { data, error } = await supabase.functions.invoke<GatewayResponse>('ai-chat', { body: request });
    if (error) return responseFromError(error);
    if (!data?.text) return failureFromResponse(data ?? undefined);
    return { ok: true, text: data.text.trim(), remaining: data.remaining };
  } catch {
    return failureFromResponse();
  }
}

export async function requestParentEmailAlert(payload: { to: string[]; subject: string; body: string }): Promise<boolean> {
  // Alerts use the authenticated Supabase function directly and must not depend
  // on whether the optional AI-chat gateway is enabled.
  if (!hasSupabaseConfig || !payload.subject || !payload.body) return false;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;
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
