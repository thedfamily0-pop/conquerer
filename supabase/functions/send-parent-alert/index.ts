import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const authHeader = request.headers.get('Authorization');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const resendKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('RESEND_FROM_EMAIL');
  if (!authHeader || !supabaseUrl || !anonKey || !resendKey || !from) return json({ error: 'Email service is not configured.' }, 503);

  const client = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const { data: { user } } = await client.auth.getUser(token);
  if (!user) return json({ error: 'Authentication required.' }, 401);
  const { data: parent } = await client.from('profiles').select('id').eq('user_id', user.id).eq('role', 'parent').maybeSingle();
  if (!parent) return json({ error: 'Parent authorisation required.' }, 403);

  const payload = await request.json() as { to?: unknown; subject?: unknown; body?: unknown };
  const recipients = Array.isArray(payload.to) ? [...new Set(payload.to.filter((value): value is string => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)).slice(0, 6))] : [];
  const subject = typeof payload.subject === 'string' ? payload.subject.slice(0, 180) : '';
  const body = typeof payload.body === 'string' ? payload.body.slice(0, 10000) : '';
  if (!recipients.length || !subject || !body) return json({ error: 'A valid recipient, subject, and body are required.' }, 400);

  const resend = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to: recipients, subject, text: body }) });
  if (!resend.ok) return json({ error: 'Transactional email provider rejected the alert.' }, 502);
  return json({ sent: true });
});
