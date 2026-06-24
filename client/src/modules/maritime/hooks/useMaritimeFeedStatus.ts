import { useEffect, useState } from 'react';

export interface MaritimeFeedStatus {
  configured: boolean;
  isConnected: boolean;
  subscribed: boolean;
  readyState: number;
  lastError: string | null;
  lastMessageType: string | null;
  lastIgnoredReason: string | null;
  vesselCount: number;
  totalMessagesReceived: number;
  secondsSinceLastMessage: number | null;
}

export function useMaritimeFeedStatus() {
  const [status, setStatus] = useState<MaritimeFeedStatus | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '/api';
        const res = await fetch(`${API_URL}/maritime/status`);
        if (!res.ok) return;
        const next = (await res.json()) as MaritimeFeedStatus;
        if (!cancelled) setStatus(next);
      } catch (_err) {
        if (!cancelled) setStatus(null);
      }
    };

    void load();
    const timer = window.setInterval(() => void load(), 5000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return status;
}

export function maritimeFeedHealth(status: MaritimeFeedStatus | null, isError: boolean) {
  const red = 'bg-red-500/20 text-red-400 border border-red-500/30';
  const green = 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30';
  const amber = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';

  if (isError) return { label: 'API_ERROR', className: red, detail: 'Maritime snapshot route failed.' };
  if (!status) return { label: 'CHECKING', className: amber, detail: 'Checking AISStream diagnostics.' };
  if (!status.configured) return { label: 'NO_KEY', className: red, detail: 'AISStream key is not configured.' };
  if (!status.isConnected || !status.subscribed) return { label: 'INACTIVE', className: red, detail: status.lastError || 'AISStream is not connected/subscribed.' };
  if (status.totalMessagesReceived <= 0) return { label: 'INACTIVE', className: red, detail: 'AISStream is connected, but no AIS messages have been received yet.' };
  return { label: 'SECURE_ACTIVE', className: green, detail: `${status.vesselCount} vessels in main AIS cache.` };
}
