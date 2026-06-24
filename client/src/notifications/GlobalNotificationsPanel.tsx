import React, { useEffect, useRef, useState } from 'react';
import { useGlobalNotificationsStore } from './globalNotifications.store';

const STORAGE_KEY = 'olympus.globalNotifications.widgetPosition.v1';

type WidgetPosition = { x: number; y: number };

const domainLabel: Record<string, string> = {
  flight: 'FLIGHT',
  maritime: 'MARITIME',
  monitor: 'MONITOR',
  dot: 'DOT',
  cad: 'CAD',
  system: 'SYSTEM',
};

function defaultPosition(): WidgetPosition {
  return { x: Math.max(window.innerWidth - 392, 24), y: 112 };
}

function clampPosition(position: WidgetPosition): WidgetPosition {
  const width = 360;
  const height = 250;
  return {
    x: Math.max(8, Math.min(position.x, window.innerWidth - width - 8)),
    y: Math.max(48, Math.min(position.y, window.innerHeight - height - 8)),
  };
}

function readStoredPosition(): WidgetPosition {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPosition();
    const parsed = JSON.parse(raw) as WidgetPosition;
    if (!Number.isFinite(parsed.x) || !Number.isFinite(parsed.y)) return defaultPosition();
    return clampPosition(parsed);
  } catch {
    return defaultPosition();
  }
}

function writeStoredPosition(position: WidgetPosition) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clampPosition(position)));
}

function anchorPosition(anchor: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'): WidgetPosition {
  const margin = 16;
  const width = 360;
  const height = 260;
  switch (anchor) {
    case 'top-left':
      return { x: margin, y: 92 };
    case 'bottom-left':
      return { x: margin, y: window.innerHeight - height - margin };
    case 'bottom-right':
      return { x: window.innerWidth - width - margin, y: window.innerHeight - height - margin };
    case 'top-right':
    default:
      return { x: window.innerWidth - width - margin, y: 92 };
  }
}

export const GlobalNotificationsPanel: React.FC = () => {
  const notifications = useGlobalNotificationsStore((state) => state.notifications);
  const clearNotifications = useGlobalNotificationsStore((state) => state.clearNotifications);
  const latest = notifications[0];
  const [position, setPosition] = useState<WidgetPosition>(() => readStoredPosition());
  const dragState = useRef<{ pointerId: number; dx: number; dy: number } | null>(null);

  useEffect(() => {
    const handleResize = () => setPosition((current) => {
      const next = clampPosition(current);
      writeStoredPosition(next);
      return next;
    });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const beginDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button')) return;
    dragState.current = {
      pointerId: event.pointerId,
      dx: event.clientX - position.x,
      dy: event.clientY - position.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const current = dragState.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const next = clampPosition({ x: event.clientX - current.dx, y: event.clientY - current.dy });
    setPosition(next);
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const current = dragState.current;
    if (!current || current.pointerId !== event.pointerId) return;
    dragState.current = null;
    const next = clampPosition(position);
    setPosition(next);
    writeStoredPosition(next);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // pointer capture may already be released by the browser
    }
  };

  const anchor = (nextAnchor: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => {
    const next = clampPosition(anchorPosition(nextAnchor));
    setPosition(next);
    writeStoredPosition(next);
  };

  return (
    <div
      className="pointer-events-auto fixed z-[80] w-[360px] font-mono select-none"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onPointerDown={beginDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
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
      <div className="border border-cyan-400/25 bg-black/65 backdrop-blur shadow-[0_0_20px_rgba(34,211,238,0.12)]">
        <div className="cursor-move border-b border-white/10 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">Global Notifications</div>
              <div className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/30">Drag to dock anywhere on the map</div>
            </div>
            <button onClick={clearNotifications} className="text-[9px] uppercase tracking-[0.16em] text-white/35 hover:text-white">Clear</button>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1 text-[8px] uppercase tracking-[0.12em] text-white/35">
            <button onClick={() => anchor('top-left')} className="border border-white/10 px-1 py-1 hover:border-cyan-300/50 hover:text-cyan-200">TL</button>
            <button onClick={() => anchor('top-right')} className="border border-white/10 px-1 py-1 hover:border-cyan-300/50 hover:text-cyan-200">TR</button>
            <button onClick={() => anchor('bottom-left')} className="border border-white/10 px-1 py-1 hover:border-cyan-300/50 hover:text-cyan-200">BL</button>
            <button onClick={() => anchor('bottom-right')} className="border border-white/10 px-1 py-1 hover:border-cyan-300/50 hover:text-cyan-200">BR</button>
          </div>
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
