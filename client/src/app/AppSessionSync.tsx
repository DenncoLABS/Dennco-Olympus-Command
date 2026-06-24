import { useEffect, useRef } from 'react';
import { useThemeStore, type OlympusShellSessionState } from '../ui/theme/theme.store';

function saveSession(session: OlympusShellSessionState) {
  return fetch('/api/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(session),
  }).catch(() => undefined);
}

export function AppSessionSync() {
  const hydrated = useRef(false);
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/session')
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (cancelled || !payload?.session) return;
        useThemeStore.getState().hydrateShellSession(payload.session);
      })
      .finally(() => {
        hydrated.current = true;
      });

    const unsubscribe = useThemeStore.subscribe(() => {
      if (!hydrated.current) return;
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        saveTimer.current = null;
        void saveSession(useThemeStore.getState().getShellSession());
      }, 450);
    });

    return () => {
      cancelled = true;
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      unsubscribe();
    };
  }, []);

  return null;
}
