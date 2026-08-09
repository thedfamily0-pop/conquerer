import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-conquerer-quota-alert-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type QuotaAlertClaim = {
  id: string;
  family_id: string;
  usage_date: string;
  quota_scope: 'daily' | 'nomi' | 'homework';
  channel: 'nomi' | 'homework';
  used_request_count: number;
  effective_cap: number;
  delivery_status: 'pending' | 'processing' | 'sent' | 'failed';
};

function validEmails(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((item): item is string => typeof item === 'string').map(item => item.trim().toLowerCase()).filter(item => EMAIL_PATTERN.test(item)))]
    : [];
}

async function updateQuotaClaim(admin: ReturnType<typeof createClient>, id: string, status: 'sent' | 'failed', error?: string, providerMessageId?: string): Promise<void> {
  const { error: updateError } = await admin.from('ai_quota_alert_claims').update({
    delivery_status: status,
    delivery_error: error?.slice(0, 500) || null,
    provider_message_id: providerMessageId || null,
    delivered_at: status === 'sent' ? new Date().toISOString() : null,
  }).eq('id', id);
  if (updateError) console.error('[send-parent-alert] Could not update quota alert delivery state', { claimId: id, status, message: updateError.message });
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const resendKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('RESEND_ALERTS_FROM_EMAIL');
  const internalToken = Deno.env.get('AI_QUOTA_ALERT_INTERNAL_TOKEN') || '';
  const suppliedInternalToken = request.headers.get('x-conquerer-quota-alert-token') || '';
  const internalQuotaAlert = Boolean(internalToken && suppliedInternalToken && suppliedInternalToken === internalToken);
  if (!supabaseUrl || !serviceRoleKey || !resendKey || !from || (!internalQuotaAlert && !anonKey)) return json({ error: 'Email service is not configured.' }, 503);

  const admin = createClient(supabaseUrl, serviceRoleKey);
  let familyId = '';
  let quotaClaim: QuotaAlertClaim | null = null;
  let requestedRecipients: string[] = [];
  let subject = '';
  let body = '';

  if (internalQuotaAlert) {
    let payload: { kind?: unknown; claimId?: unknown };
    try { payload = await request.json() as { kind?: unknown; claimId?: unknown }; } catch { return json({ error: 'Invalid internal alert request.' }, 400); }
    if (payload.kind === 'retry_child_ai_quota_alerts') {
      const { data: retryableClaims, error } = await admin.from('ai_quota_alert_claims')
        .select('id')
        .in('delivery_status', ['pending', 'failed'])
        .order('created_at')
        .limit(50);
      if (error) return json({ error: 'Quota alert retry queue could not be loaded.' }, 500);
      let accepted = 0;
      let failed = 0;
      for (const claim of retryableClaims || []) {
        try {
          const retry = await fetch(`${supabaseUrl}/functions/v1/send-parent-alert`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${serviceRoleKey}`,
              'x-conquerer-quota-alert-token': internalToken,
            },
            body: JSON.stringify({ kind: 'child_ai_quota_95', claimId: claim.id }),
          });
          if (retry.ok) accepted++;
          else failed++;
        } catch {
          failed++;
        }
      }
      return json({ retryable: (retryableClaims || []).length, accepted, failed });
    }
    if (payload.kind !== 'child_ai_quota_95' || typeof payload.claimId !== 'string' || !UUID_PATTERN.test(payload.claimId)) return json({ error: 'Invalid internal alert request.' }, 400);
    const { data: claimed, error } = await admin.from('ai_quota_alert_claims')
      .update({ delivery_status: 'processing', delivery_error: null, delivery_attempted_at: new Date().toISOString() })
      .eq('id', payload.claimId)
      .in('delivery_status', ['pending', 'failed'])
      .select('id,family_id,usage_date,quota_scope,channel,used_request_count,effective_cap,delivery_status')
      .maybeSingle();
    if (error) return json({ error: 'Quota alert claim could not be reserved.' }, 500);
    if (!claimed) return json({ accepted: true, alreadyProcessed: true });
    quotaClaim = claimed as QuotaAlertClaim;
    familyId = quotaClaim.family_id;
    const allowanceLabel = quotaClaim.quota_scope === 'daily' ? 'total child AI' : `${quotaClaim.quota_scope === 'nomi' ? 'Nomi' : 'homework'} AI`;
    subject = 'Conquerer: child AI allowance is almost used';
    body = `Your child has used ${quotaClaim.used_request_count} of ${quotaClaim.effective_cap} ${allowanceLabel} requests today (${quotaClaim.usage_date}, Africa/Johannesburg).\n\nSign in to Conquerer → Parent Zone → Settings → Today’s child AI allowance to increase today’s limit if you choose. This temporary allowance resets automatically at midnight in Africa/Johannesburg.`;
  } else {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !anonKey) return json({ error: 'Authentication required.' }, 401);
    const client = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const { data: { user } } = await client.auth.getUser(token);
    if (!user) return json({ error: 'Authentication required.' }, 401);
    const { data: membership } = await client.from('family_members').select('family_id').eq('user_id', user.id).limit(1).maybeSingle();
    if (!membership?.family_id) return json({ error: 'Approved family membership required.' }, 403);
    familyId = membership.family_id;
    let payload: { to?: unknown; subject?: unknown; body?: unknown };
    try { payload = await request.json() as { to?: unknown; subject?: unknown; body?: unknown }; } catch { return json({ error: 'Invalid request.' }, 400); }
    requestedRecipients = validEmails(payload.to).slice(0, 6);
    subject = typeof payload.subject === 'string' ? payload.subject.slice(0, 180) : '';
    body = typeof payload.body === 'string' ? payload.body.slice(0, 10000) : '';
    if (!subject || !body) return json({ error: 'A subject and body are required.' }, 400);
  }

  const { data: contactSettings, error: contactSettingsError } = await admin.from('family_contact_settings').select('dad_emails,mom_emails').eq('family_id', familyId).maybeSingle();
  if (contactSettingsError) {
    const details = 'Parent contact settings could not be loaded.';
    if (quotaClaim) await updateQuotaClaim(admin, quotaClaim.id, 'failed', details);
    console.error('[send-parent-alert] Parent contact query failed', { internalQuotaAlert, message: contactSettingsError.message });
    return json({ error: details }, 500);
  }
  const configuredRecipients = new Set([...validEmails(contactSettings?.dad_emails), ...validEmails(contactSettings?.mom_emails)]);
  const recipients = requestedRecipients.length
    ? requestedRecipients.filter(recipient => configuredRecipients.has(recipient))
    : [...configuredRecipients];
  if (!recipients.length) {
    const details = 'No configured parent email recipient is available.';
    if (quotaClaim) await updateQuotaClaim(admin, quotaClaim.id, 'failed', details);
    console.warn('[send-parent-alert] No configured recipients are available', { internalQuotaAlert, configuredCount: configuredRecipients.size });
    return json({ error: 'No deliverable parent email recipient.', details }, 422);
  }

  // Resend's shared test sender only permits delivery to the configured account email.
  const isResendTestSender = from.trim().toLowerCase() === 'onboarding@resend.dev';
  const configuredTestRecipient = Deno.env.get('RESEND_TEST_RECIPIENT')?.trim().toLowerCase() || '';
  const testRecipient = EMAIL_PATTERN.test(configuredTestRecipient) ? configuredTestRecipient : '';
  const deliveryRecipients = isResendTestSender
    ? (testRecipient && configuredRecipients.has(testRecipient) ? [testRecipient] : [])
    : recipients;
  if (!deliveryRecipients.length) {
    const details = isResendTestSender
      ? 'The Resend test sender requires RESEND_TEST_RECIPIENT to be a configured family recipient and the Resend account email.'
      : 'No deliverable recipients remained after validation.';
    if (quotaClaim) await updateQuotaClaim(admin, quotaClaim.id, 'failed', details);
    console.warn('[send-parent-alert] No deliverable recipients', { internalQuotaAlert, isResendTestSender, recipientCount: recipients.length });
    return json({ error: 'No deliverable parent email recipient.', details }, 422);
  }

  const resend = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: deliveryRecipients, subject, text: body }),
  });
  const providerResponse = await resend.text();
  if (!resend.ok) {
    let details = providerResponse.trim().slice(0, 500);
    try {
      const parsed = JSON.parse(providerResponse) as { message?: unknown };
      if (typeof parsed.message === 'string') details = parsed.message.slice(0, 500);
    } catch { /* Keep the bounded provider response. */ }
    if (quotaClaim) await updateQuotaClaim(admin, quotaClaim.id, 'failed', details || 'The provider returned no further details.');
    console.error('[send-parent-alert] Resend rejected the alert', { status: resend.status, internalQuotaAlert, recipientCount: deliveryRecipients.length });
    return json({ error: 'Transactional email provider rejected the alert.', details: details || 'The provider returned no further details.' }, 502);
  }

  let providerMessageId: string | undefined;
  try {
    const parsed = JSON.parse(providerResponse) as { id?: unknown };
    if (typeof parsed.id === 'string') providerMessageId = parsed.id;
  } catch { /* A provider success may have no JSON body. */ }
  if (quotaClaim) await updateQuotaClaim(admin, quotaClaim.id, 'sent', undefined, providerMessageId);
  return json({ sent: true, restrictedTestSender: isResendTestSender, deliveredRecipientCount: deliveryRecipients.length });
});
