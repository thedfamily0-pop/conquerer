import { useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { redeemFamilyInvitation } from '../services/familyInvitations';
import { hasPortalPinReauth } from '../services/portalPin';
import { supabase } from '../services/supabase';

interface Props { onAuthenticated: (user: User) => void; }

export const BOOTSTRAP_ACCOUNT_EMAIL = 'thedfamily0@gmail.com';

function getAuthRedirectUrl(): string {
  // Preserve the opaque invitation token across the Google OAuth redirect.
  return `${window.location.origin}${window.location.pathname}${window.location.search}`;
}

function getInvitationToken(): string | null {
  return new URLSearchParams(window.location.search).get('invite');
}

function clearInvitationToken(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('invite');
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

export function AuthGate({ onAuthenticated }: Props) {
  const [googleBusy, setGoogleBusy] = useState(false);
  const [message, setMessage] = useState('');
  const authorizingUser = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    const authorizeSession = async (user: User) => {
      if (authorizingUser.current === user.id) return;
      authorizingUser.current = user.id;
      const invitationToken = getInvitationToken();
      if (invitationToken) {
        const redemption = await redeemFamilyInvitation(invitationToken);
        if (!active) return;
        if (!redemption.ok) {
          authorizingUser.current = null;
          setGoogleBusy(false);
          setMessage(redemption.message || 'This invitation could not be accepted. Use the Google account that received the welcome email.');
          await supabase.auth.signOut();
          return;
        }
        clearInvitationToken();
      }
      const { error } = await supabase.rpc('ensure_family_setup', {
        p_display_name: 'Explorer', p_avatar: '🌟', p_nomi_name: 'Nomi',
      });
      if (!active) return;
      if (error) {
        authorizingUser.current = null;
        setGoogleBusy(false);
        setMessage(error.message.includes('not approved')
          ? 'This Google account is not approved. Open the welcome link sent by your family administrator, then continue with that Google account.'
          : 'This Google account could not be authorised for the family. Please use your approved Google account.');
        await supabase.auth.signOut();
        return;
      }
      setGoogleBusy(false);
      onAuthenticated(user);
    };

    void supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) void authorizeSession(data.session.user);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { authorizingUser.current = null; return; }
      void authorizeSession(session.user);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [onAuthenticated]);

  const signInWithGoogle = async () => {
    setGoogleBusy(true); setMessage('');
    const recoveringPortalPin = hasPortalPinReauth();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: getAuthRedirectUrl(), queryParams: recoveringPortalPin ? { prompt: 'login' } : undefined },
    });
    if (error) {
      setGoogleBusy(false);
      setMessage(error.message);
    }
  };

  return (
    <div className="setup-overlay">
      <section className="glass-card setup-panel" aria-labelledby="google-sign-in-title">
        <div className="setup-emoji">🛡️</div>
        <h1 id="google-sign-in-title">{hasPortalPinReauth() ? 'Confirm your Google account' : 'Welcome to Conquerer'}</h1>
        <p className="muted">{hasPortalPinReauth() ? 'Sign in again with your approved Google account to continue the secure PIN action. The short-lived recovery challenge stays only in this browser session.' : 'Continue with your approved Google account to keep your family learning space protected.'}</p>
        {message && <p className="form-error" role="alert">{message}</p>}
        <button type="button" className="btn-primary" disabled={googleBusy} onClick={signInWithGoogle}>
          {googleBusy ? 'Opening Google…' : 'Continue with Google'}
        </button>
        <p className="muted" style={{ fontSize: '0.78rem', marginTop: '12px' }}>
          The first family administrator signs in with {BOOTSTRAP_ACCOUNT_EMAIL}. Other family members must use their personal welcome invitation link and the invited Google account.
        </p>
      </section>
    </div>
  );
}
