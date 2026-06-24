import React from 'react';
import { useGlobalNotificationsStore } from './globalNotifications.store';

const domainLabel: Record<string, string> = {
  flight: 'FLIGHT',
  maritime: 'MARITIME',
  monitor: 'MONITOR',
  dot: 'DOT',
  cad: 'CAD',
  system: 'SYSTEM',
};

export const GlobalNotificationsPanel: React.FC = () => {
  const notifications = useGlobalNotificationsStore((state) => state.notifications);
  const clearNotifications = useGlobalNotificationsStore((state) => state.clearNotifications);
  const latest = notifications[0];

  return (
    <div className="pointer-events-auto fixed right-4 top-28 z-[80] w-[360px] font-mono">
      {latest && (
        <div className="mb-2 border border-red-500/60 bg-red-950/35 p-3 text-red-100 shadow-[0_0_22px_rgba(239,68,68,0.28)]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase tracking-[0.22em] text-red-200">Global Notifications</span>
            <span className="text-[9px] text-white/40">{new Date(latest.timestamp).toLocaleTimeString()}</span>
          </div>
          <div className="mt-1 text-xs uppercase tracking-[0.18em] text-white/50">{domainLabel[latest.domain] || latest.domain}</div>
          <div className="mt-1 text-sm font-bold uppercase tracking-[0.08em]">{latest.title}</div>
          <div className="mt-1 text-xs text-red-100/75">{latest.details}</div>
        </div>
      )}
      <div className="border border-cyan-400/25 bg-black/55 backdrop-blur">
        <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
          <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">Global Notifications</div>
          <button onClick={clearNotifications} className="text-[9px] uppercase tracking-[0.16em] text-white/35 hover:text-white">Clear</button>
        </div>
        <div className="max-h-44 overflow-auto">
          {notifications.length === 0 ? (
            <div className="px-3 py-3 text-[11px] text-white/35">No global notifications yet.</div>
          ) : (
            notifications.map((item) => (
              <div key={item.id} className="border-b border-white/8 px-3 py-2 text-[11px] text-white/65">
                <div className="flex items-center justify-between gap-2">
                  <span className={item.severity === 'critical' ? 'text-red-200 uppercase tracking-[0.14em]' : 'text-cyan-200 uppercase tracking-[0.14em]'}>{domainLabel[item.domain] || item.domain}</span>
                  <span className="text-white/35">{new Date(item.timestamp).toLocaleString()}</span>
                </div>
                <div className="mt-1 text-white/80">{item.title}</div>
                <div className="mt-1 text-white/45">{item.details}</div>
                {item.reportedBy && <div className="mt-1 text-white/30">Reported by {item.reportedBy}</div>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
