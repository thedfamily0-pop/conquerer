import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type InvitationRole = 'parent' | 'child';
type InvitationAction = 'create' | 'revoke';

function corsHeaders(request: Request): HeadersInit {
  const appOrigin = Deno.env.get('APP_ORIGIN') || '';
  const requestOrigin = request.headers.get('Origin') || '';
  return {
    'Access-Control-Allow-Origin': appOrigin && requestOrigin === appOrigin ? appOrigin : 'null',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

function json(request: Request, body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(request), 'Content-Type': 'application/json' } });
}

function asRole(value: unknown): InvitationRole | null {
  return value === 'parent' || value === 'child' ? value : null;
}

Deno.serve(async request => {
  const appOrigin = Deno.env.get('APP_ORIGIN') || '';
  const appUrl = Deno.env.get('APP_URL') || '';
  const requestOrigin = request.headers.get('Origin') || '';
  if (!appOrigin || !appUrl || (requestOrigin && requestOrigin !== appOrigin)) return json(request, { error: 'Invitation service origin is not configured.' }, 403);
  let invitationBaseUrl: URL;
  try {
    const configuredOrigin = new URL(appOrigin);
    invitationBaseUrl = new URL(appUrl);
    if (configuredOrigin.origin !== appOrigin || invitationBaseUrl.origin !== appOrigin) throw new Error('Invalid invitation URL configuration');
  } catch {
    return json(request, { error: 'Invitation service URL configuration is invalid.' }, 503);
  }
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request) });
  if (request.method !== 'POST') return json(request, { error: 'Method not allowed.' }, 405);

  const authHeader = request.headers.get('Authorization') || '';
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const resendKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('RESEND_WELCOME_FROM_EMAIL');
  if (!authHeader || !supabaseUrl || !anonKey || !serviceRoleKey || !resendKey || !from) return json(request, { error: 'Invitation service is not configured.' }, 503);

  const client = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const { data: { user } } = await client.auth.getUser(token);
  if (!user) return json(request, { error: 'Authentication required.' }, 401);

  const { data: membership } = await client.from('family_members').select('family_id,role').eq('user_id', user.id).limit(1).maybeSingle();
  if (!membership?.family_id || membership.role !== 'parent') return json(request, { error: 'Approved parent membership required.' }, 403);

  let body: { action?: unknown; email?: unknown; displayName?: unknown; role?: unknown; invitationId?: unknown };
  try { body = await request.json(); } catch { return json(request, { error: 'A JSON request body is required.' }, 400); }
  const action = body.action as InvitationAction;
  if (action !== 'create' && action !== 'revoke') return json(request, { error: 'Unsupported invitation action.' }, 400);

  if (action === 'revoke') {
    if (typeof body.invitationId !== 'string') return json(request, { error: 'Invitation ID is required.' }, 400);
    const { data, error } = await client.rpc('revoke_family_invitation', { p_invitation_id: body.invitationId });
    if (error || !data) return json(request, { error: error?.message || 'Invitation could not be revoked.' }, 403);
    return json(request, { message: 'Invitation revoked.' });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const displayName = typeof body.displayName === 'string' ? body.displayName.trim() : '';
  const role = asRole(body.role);
  if (!EMAIL_PATTERN.test(email) || !displayName || !role) return json(request, { error: 'A valid email, name, and role are required.' }, 400);

  const { data: createdRows, error: createError } = await client.rpc('create_family_invitation', {
    p_email: email,
    p_display_name: displayName,
    p_role: role,
  });
  const created = Array.isArray(createdRows) ? createdRows[0] : createdRows;
  if (createError || !created || typeof created.invitation_id !== 'string' || typeof created.invitation_token !== 'string') {
    return json(request, { error: createError?.message || 'Invitation could not be created.' }, 403);
  }

  const inviteUrl = new URL(invitationBaseUrl.toString());
  inviteUrl.searchParams.set('invite', created.invitation_token);
  const recipientLabel = role === 'child' ? 'the child experience' : 'Parent Zone';
  const subject = 'You are invited to join Conquerer';
  const text = `Hello ${displayName},

You have been invited to join a Conquerer family as a ${role}. Open this link, then continue with the Google account that received this invitation:

${inviteUrl.toString()}

After Google verifies your account, you will be given access to ${recipientLabel}. This invitation expires on ${new Date(created.invitation_expires_at).toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}.

If you were not expecting this invitation, you can ignore this email.`;
  const admin = createClient(supabaseUrl, serviceRoleKey);
  const resend = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [email], subject, text }),
  });
  const providerMessage = await resend.text();
  if (!resend.ok) {
    await admin.from('family_invitations').update({ delivery_error: providerMessage.slice(0, 500), updated_at: new Date().toISOString() }).eq('id', created.invitation_id);
    console.error('[send-family-invitation] Provider rejected invitation', { status: resend.status, invitationId: created.invitation_id });
    return json(request, { error: 'The invitation was created, but the email provider rejected delivery. You can correct the email and send a new invitation.' }, 502);
  }
  await admin.from('family_invitations').update({ sent_at: new Date().toISOString(), delivery_error: null, updated_at: new Date().toISOString() }).eq('id', created.invitation_id);
  return json(request, { message: 'Welcome invitation sent.' });
});
