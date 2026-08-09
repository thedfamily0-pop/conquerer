import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Channel = 'nomi' | 'homework' | 'parent' | 'memory';
interface RequestBody {
  channel: Channel;
  message?: string;
  history?: { role: 'user' | 'model'; text: string }[];
  systemPrompt?: string;
  prompt?: string;
  provider?: 'gemini';
}

const blockedResponseWords = ['porn', 'nude', 'genital', 'kill yourself', 'harm yourself', 'strip club'];
const injectionPattern = /ignore\s+(all\s+)?(previous|prior|above|your)\s+(instructions|rules|prompts)|system\s*prompt\s*:|jailbreak|do\s+anything\s+now/i;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

function validText(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}
serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const geminiKey = Deno.env.get('GEMINI_API_KEY');
  if (!token || !supabaseUrl || !anonKey || !serviceRoleKey || !geminiKey) return json({ error: 'AI service is not configured.' }, 503);

  const authClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: { user }, error: userError } = await authClient.auth.getUser(token);
  if (userError || !user) return json({ error: 'Sign-in required.' }, 401);

  let body: RequestBody;
  try { body = await request.json() as RequestBody; } catch { return json({ error: 'Invalid request.' }, 400); }
  const channels: Channel[] = ['nomi', 'homework', 'parent', 'memory'];
  if (!channels.includes(body.channel) || body.provider && body.provider !== 'gemini') return json({ error: 'Unsupported AI request.' }, 400);
  const input = body.message || body.prompt || '';
  if (!validText(input, 12000) || injectionPattern.test(input)) return json({ error: 'That request cannot be sent to the AI.' }, 400);

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const { data: quota, error: quotaError } = await admin.rpc('consume_ai_quota', { p_user_id: user.id, p_channel: body.channel }).single();
  if (quotaError || !quota) return json({ error: 'Unable to check the AI limit.' }, 503);
  if (!quota.allowed) {
    const status = quota.reason === 'cooldown' ? 429 : quota.reason === 'outside_hours' || quota.reason.includes('cap') ? 429 : 403;
    return json({ error: quota.reason, retryAfterSeconds: quota.retry_after_seconds }, status);
  }

  const contents = body.channel === 'nomi'
    ? [...(body.history || []).slice(-10).map(item => ({ role: item.role, parts: [{ text: item.text.slice(0, 4000) }] })), { role: 'user', parts: [{ text: input }] }]
    : [{ role: 'user', parts: [{ text: body.prompt?.slice(0, 12000) || input }] }];
  const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${Deno.env.get('GEMINI_MODEL') || 'gemini-1.5-flash'}:generateContent?key=${encodeURIComponent(geminiKey)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: body.systemPrompt ? { parts: [{ text: body.systemPrompt.slice(0, 12000) }] } : undefined,
      contents,
      generationConfig: { maxOutputTokens: body.channel === 'parent' ? 600 : 300, temperature: body.channel === 'nomi' ? 0.9 : 0.4 },
    }),
  });
  if (!upstream.ok) return json({ error: 'The AI provider is temporarily unavailable.' }, 502);
  const result = await upstream.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!validText(text, 20000)) return json({ error: 'The AI returned no usable answer.' }, 502);
  if (blockedResponseWords.some(word => text.toLowerCase().includes(word))) return json({ error: 'The AI response failed its safety check.' }, 502);
  return json({ text });
});
