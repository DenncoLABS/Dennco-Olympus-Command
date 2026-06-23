import React, { useState, type ReactNode } from 'react';
import { useRuntimeSettings } from './runtimeSettings';

const STORAGE_KEY = 'olympus-admin-session';

function hasSession() {
  return localStorage.getItem(STORAGE_KEY) === 'active';
}

export const LoginGate: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { settings } = useRuntimeSettings();
  const [isLoggedIn, setIsLoggedIn] = useState(hasSession());
  const [username, setUsername] = useState('admin');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, accessCode }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(body.error || 'Login failed.');
        return;
      }

      localStorage.setItem(STORAGE_KEY, 'active');
      setIsLoggedIn(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoggedIn) return <>{children}</>;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-md border border-cyan-400/30 bg-slate-950/90 p-8 shadow-[0_0_40px_rgba(0,229,255,0.14)]">
        <div className="mb-8">
          <div className="text-xs tracking-[0.35em] text-cyan-300/70 uppercase mb-2">Secure Console</div>
          <h1 className="text-3xl font-mono font-bold tracking-[0.18em] uppercase">{settings.branding.shortName}</h1>
          <p className="text-sm text-white/50 mt-3">Protected access for {settings.branding.productName}</p>
        </div>

        <label className="block text-xs uppercase tracking-[0.22em] text-white/50 mb-2">Admin user</label>
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="w-full mb-5 bg-black border border-white/20 px-4 py-3 font-mono text-sm outline-none focus:border-cyan-300"
          autoComplete="username"
        />

        <label className="block text-xs uppercase tracking-[0.22em] text-white/50 mb-2">Access code</label>
        <input
          value={accessCode}
          onChange={(event) => setAccessCode(event.target.value)}
          className="w-full mb-5 bg-black border border-white/20 px-4 py-3 font-mono text-sm outline-none focus:border-cyan-300"
          type="password"
          autoComplete="current-password"
        />

        {error && <div className="mb-5 border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">{error}</div>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full border border-cyan-300 bg-cyan-300/10 px-4 py-3 font-mono text-sm uppercase tracking-[0.25em] text-cyan-200 hover:bg-cyan-300/20 disabled:opacity-50"
        >
          {isSubmitting ? 'Checking…' : 'Enter Command'}
        </button>

        <div className="mt-6 text-xs text-white/35 leading-relaxed">
          Auth provider: {settings.auth.provider}
          {settings.auth.nethserver8Enabled ? ' · NethServer 8 directory enabled' : ''}
        </div>
      </form>
    </div>
  );
};

export function logoutAdmin() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}
