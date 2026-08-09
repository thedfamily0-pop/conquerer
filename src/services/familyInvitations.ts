import { hasSupabaseConfig, supabase } from './supabase';

export type FamilyInvitationRole = 'parent' | 'child';
export type FamilyInvitationStatus = 'pending' | 'accepted' | 'revoked' | 'expired';

export interface FamilyInvitation {
  id: string;
  email: string;
  displayName: string;
  role: FamilyInvitationRole;
  status: FamilyInvitationStatus;
  expiresAt: string;
  createdAt: string;
  sentAt: string | null;
}

interface InvitationRow {
  id: string;
  invited_email: string;
  display_name: string;
  role: FamilyInvitationRole;
  status: FamilyInvitationStatus;
  expires_at: string;
  created_at: string;
  sent_at: string | null;
}

export interface FamilyInvitationResult {
  ok: boolean;
  message?: string;
}

function messageFrom(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export async function listFamilyInvitations(): Promise<{ ok: true; invitations: FamilyInvitation[] } | { ok: false; error: string }> {
  if (!hasSupabaseConfig) return { ok: false, error: 'Family invitations need hosted Supabase access.' };
  const { data, error } = await supabase.rpc('list_family_invitations');
  if (error) return { ok: false, error: messageFrom(error, 'Could not load family invitations.') };
  const invitations = ((data || []) as InvitationRow[]).map(row => ({
    id: row.id,
    email: row.invited_email,
    displayName: row.display_name,
    role: row.role,
    status: row.status,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    sentAt: row.sent_at,
  }));
  return { ok: true, invitations };
}

async function invokeInvitationAction(body: Record<string, unknown>): Promise<FamilyInvitationResult> {
  if (!hasSupabaseConfig) return { ok: false, message: 'Family invitations need hosted Supabase access.' };
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { ok: false, message: 'Sign in with your administrator Google account first.' };
  const { data, error } = await supabase.functions.invoke<{ error?: string; message?: string }>('send-family-invitation', { body });
  if (error) return { ok: false, message: messageFrom(error, 'The invitation service is unavailable.') };
  if (data?.error) return { ok: false, message: data.error };
  return { ok: true, message: data?.message };
}

export async function sendFamilyInvitation(input: { email: string; displayName: string; role: FamilyInvitationRole }): Promise<FamilyInvitationResult> {
  return invokeInvitationAction({ action: 'create', email: input.email.trim().toLowerCase(), displayName: input.displayName.trim(), role: input.role });
}

export async function revokeFamilyInvitation(invitationId: string): Promise<FamilyInvitationResult> {
  return invokeInvitationAction({ action: 'revoke', invitationId });
}

/** Redeems the opaque token returned in an invitation URL after Google OAuth. */
export async function redeemFamilyInvitation(token: string): Promise<FamilyInvitationResult> {
  if (!hasSupabaseConfig) return { ok: false, message: 'Family invitations need hosted Supabase access.' };
  const { error } = await supabase.rpc('redeem_family_invitation', { p_token: token });
  return error
    ? { ok: false, message: messageFrom(error, 'This invitation could not be accepted.') }
    : { ok: true, message: 'Invitation accepted.' };
}
