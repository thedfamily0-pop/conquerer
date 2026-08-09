import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validEmails(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((item): item is string => typeof item === 'string').map(item => item.trim().toLowerCase()).filter(item => EMAIL_PATTERN.test(item)))]
    : [];
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const authHeader = request.headers.get('Authorization');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const resendKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('RESEND_FROM_EMAIL');
  if (!authHeader || !supabaseUrl || !anonKey || !serviceRoleKey || !resendKey || !from) return json({ error: 'Email service is not configured.' }, 503);

  const client = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const { data: { user } } = await client.auth.getUser(token);
  if (!user) return json({ error: 'Authentication required.' }, 401);

  // Parents and approved child users may trigger a family alert. The family
  // membership row, not an email string, is the authorization boundary.
  const { data: membership } = await client.from('family_members').select('family_id,role').eq('user_id', user.id).limit(1).maybeSingle();
  if (!membership?.family_id) return json({ error: 'Approved family membership required.' }, 403);
  const admin = createClient(supabaseUrl, serviceRoleKey);
  const { data: contactSettings } = await admin.from('family_contact_settings').select('dad_emails,mom_emails').eq('family_id', membership.family_id).maybeSingle();
  const configuredRecipients = new Set([...validEmails(contactSettings?.dad_emails), ...validEmails(contactSettings?.mom_emails)]);

  const payload = await request.json() as { to?: unknown; subject?: unknown; body?: unknown };
  const requestedRecipients = validEmails(payload.to).slice(0, 6);
  const recipients = requestedRecipients.length
    ? requestedRecipients.filter(recipient => configuredRecipients.has(recipient))
    : [...configuredRecipients];
  const subject = typeof payload.subject === 'string' ? payload.subject.slice(0, 180) : '';
  const body = typeof payload.body === 'string' ? payload.body.slice(0, 10000) : '';
  if (!subject || !body) return json({ error: 'A subject and body are required.' }, 400);
  if (!recipients.length) {
    console.warn('[send-parent-alert] No configured recipients are available', { requestedCount: requestedRecipients.length, configuredCount: configuredRecipients.size });
    return json({ error: 'No requested recipient is configured for this family.', details: 'Save the Dad or Mom alert addresses in Parent Zone → Settings before sending alerts.' }, 422);
  }

  // Resend's shared test sender only permits delivery to the Resend account email.
  // Keep the restriction server-side so the browser can never bypass it or expose a key.
  const isResendTestSender = from.trim().toLowerCase() === 'onboarding@resend.dev';
  const configuredTestRecipient = Deno.env.get('RESEND_TEST_RECIPIENT')?.trim().toLowerCase() || '';
  const testRecipient = EMAIL_PATTERN.test(configuredTestRecipient) ? configuredTestRecipient : '';
  const deliveryRecipients = isResendTestSender
    ? (testRecipient && configuredRecipients.has(testRecipient) ? [testRecipient] : [])
    : recipients;
  if (!deliveryRecipients.length) {
    const details = isResendTestSender
      ? 'The Resend test sender requires RESEND_TEST_RECIPIENT to be a configured family recipient and the Resend account email. Verify a sending domain before sending to other addresses.'
      : 'No deliverable recipients remained after validation.';
    console.warn('[send-parent-alert] No deliverable recipients', { isResendTestSender, recipientCount: recipients.length });
    return json({ error: 'No deliverable parent email recipient.', details }, 422);
  }
  if (isResendTestSender && deliveryRecipients.length < recipients.length) {
    console.info('[send-parent-alert] Resend test sender restricted delivery to its configured account recipient', { recipientCount: deliveryRecipients.length });
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
