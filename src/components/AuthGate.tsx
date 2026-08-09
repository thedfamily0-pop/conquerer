import { useEffect, useState, type FormEvent } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface Props { onAuthenticated: (user: User) => void; }

export function AuthGate({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) onAuthenticated(data.session.user);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) onAuthenticated(session.user);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [onAuthenticated]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true); setMessage('');
    const result = mode === 'sign-in'
      ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
      : await supabase.auth.signUp({ email: email.trim(), password });
    setBusy(false);
    if (result.error) { setMessage(result.error.message); return; }
    if (!result.data.session) setMessage('Check your email to confirm your account, then come back here.');
  };

  return (
    <div className="setup-overlay">
      <form className="glass-card setup-panel" onSubmit={submit}>
        <div className="setup-emoji">🛡️</div>
        <h1>{mode === 'sign-in' ? 'Welcome back!' : 'Create your family account'}</h1>
        <p className="muted">Sign in so your family data and AI safety limits stay protected.</p>
        <label className="form-label">Parent email<input type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} /></label>
        <label className="form-label">Password<input type="password" required minLength={6} autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} value={password} onChange={event => setPassword(event.target.value)} /></label>
        {message && <p className="form-error">{message}</p>}
        <button className="btn-primary" disabled={busy}>{busy ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}</button>
        <button type="button" className="text-button" onClick={() => { setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); setMessage(''); }}>
          {mode === 'sign-in' ? 'Need an account? Create one' : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>
  );
}
