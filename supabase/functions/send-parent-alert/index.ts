import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
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

  // Resend's shared test sender only permits delivery to the Resend account email.
  // Keep the restriction server-side so the browser can never bypass it or expose a key.
  const isResendTestSender = from.trim().toLowerCase() === 'onboarding@resend.dev';
  const configuredTestRecipient = Deno.env.get('RESEND_TEST_RECIPIENT')?.trim().toLowerCase() || '';
  const testRecipient = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(configuredTestRecipient) ? configuredTestRecipient : '';
  const deliveryRecipients = isResendTestSender ? (testRecipient ? [testRecipient] : []) : recipients;
  if (!deliveryRecipients.length) {
    const details = isResendTestSender
      ? 'The Resend test sender requires RESEND_TEST_RECIPIENT to contain the Resend account email. Verify a sending domain before sending to other addresses.'
      : 'No deliverable recipients remained after validation.';
    console.warn('[send-parent-alert] No deliverable recipients', { isResendTestSender, recipientCount: recipients.length });
    return json({ error: 'No deliverable parent email recipient.', details }, 422);
  }
  if (isResendTestSender && deliveryRecipients.length < recipients.length) {
    console.info('[send-parent-alert] Resend test sender restricted delivery to its configured account email', { recipientCount: deliveryRecipients.length });
  }

  const resend = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to: deliveryRecipients, subject, text: body }) });
  const providerResponse = await resend.text();
  if (!resend.ok) {
    let details = providerResponse.trim().slice(0, 500);
    try {
      const parsed = JSON.parse(providerResponse) as { message?: unknown };
      if (typeof parsed.message === 'string') details = parsed.message.slice(0, 500);
    } catch {
      // Keep the bounded raw response when the provider does not return JSON.
    }
    console.error('[send-parent-alert] Resend rejected the alert', { status: resend.status, details, recipientCount: deliveryRecipients.length, subject });
    return json({ error: 'Transactional email provider rejected the alert.', details: details || 'The provider returned no further details.' }, 502);
  }
  return json({ sent: true, restrictedTestSender: isResendTestSender, deliveredRecipientCount: deliveryRecipients.length });
});
