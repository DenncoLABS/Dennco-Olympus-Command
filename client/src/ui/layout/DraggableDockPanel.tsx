import React, { useEffect, useRef, useState, type ReactNode } from 'react';

export type DockAnchor = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

type DockPosition = { x: number; y: number };

interface DraggableDockPanelProps {
  storageKey: string;
  title: string;
  subtitle?: string;
  defaultPosition?: DockPosition;
  width?: number;
  minHeight?: number;
  onClose?: () => void;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

function readPosition(storageKey: string, fallback: DockPosition, width: number, minHeight: number): DockPosition {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return clampPosition(fallback, width, minHeight);
    const parsed = JSON.parse(raw) as DockPosition;
    if (!Number.isFinite(parsed.x) || !Number.isFinite(parsed.y)) return clampPosition(fallback, width, minHeight);
    return clampPosition(parsed, width, minHeight);
  } catch {
    return clampPosition(fallback, width, minHeight);
  }
}

function clampPosition(position: DockPosition, width: number, minHeight: number): DockPosition {
  const maxX = Math.max(8, window.innerWidth - width - 8);
  const maxY = Math.max(64, window.innerHeight - minHeight - 40);
  return {
    x: Math.max(8, Math.min(position.x, maxX)),
    y: Math.max(56, Math.min(position.y, maxY)),
  };
}

function anchorPosition(anchor: DockAnchor, width: number, minHeight: number): DockPosition {
  const margin = 16;
  const headerOffset = 70;
  switch (anchor) {
    case 'top-left':
      return { x: margin, y: headerOffset };
    case 'top-right':
      return { x: window.innerWidth - width - margin, y: headerOffset };
    case 'bottom-left':
      return { x: margin, y: window.innerHeight - minHeight - margin - 32 };
    case 'bottom-right':
      return { x: window.innerWidth - width - margin, y: window.innerHeight - minHeight - margin - 32 };
  }
}

export const DraggableDockPanel: React.FC<DraggableDockPanelProps> = ({
  storageKey,
  title,
  subtitle = 'Drag to dock anywhere on the map',
  defaultPosition = { x: 16, y: 72 },
  width = 384,
  minHeight = 300,
  onClose,
  className = '',
  bodyClassName = '',
  children,
}) => {
  const [position, setPosition] = useState<DockPosition>(() => readPosition(storageKey, defaultPosition, width, minHeight));
  const positionRef = useRef(position);
  const dragRef = useRef<{ pointerId: number; dx: number; dy: number } | null>(null);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    const handleResize = () => {
      const next = clampPosition(positionRef.current, width, minHeight);
      positionRef.current = next;
      setPosition(next);
      localStorage.setItem(storageKey, JSON.stringify(next));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [minHeight, storageKey, width]);

  const beginDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('button,a,input,select,textarea')) return;
    dragRef.current = { pointerId: event.pointerId, dx: event.clientX - positionRef.current.x, dy: event.clientY - positionRef.current.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const next = clampPosition({ x: event.clientX - drag.dx, y: event.clientY - drag.dy }, width, minHeight);
    positionRef.current = next;
    setPosition(next);
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    const next = clampPosition(positionRef.current, width, minHeight);
    positionRef.current = next;
    setPosition(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Browser may release capture before pointerup.
    }
  };

  const dock = (anchor: DockAnchor) => {
    const next = clampPosition(anchorPosition(anchor, width, minHeight), width, minHeight);
    positionRef.current = next;
    setPosition(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  return (
    <div
      className={`absolute z-30 flex flex-col font-mono text-sm tech-panel shadow-[0_18px_38px_rgba(0,0,0,0.82)] pointer-events-auto ${className}`}
      style={{ left: `${position.x}px`, top: `${position.y}px`, width: `${width}px`, maxHeight: 'calc(100vh - 92px)' }}
    >
      <div
        className="tech-panel-header cursor-move p-3 border-b border-intel-accent/25"
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] text-intel-accent tracking-[0.2em] font-bold uppercase drop-shadow-[0_0_5px_var(--color-intel-accent)]">
              {title}
            </div>
            <div className="mt-1 text-[9px] uppercase tracking-[0.14em] text-intel-text/60">{subtitle}</div>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-intel-accent hover:text-intel-text-light hover:drop-shadow-[0_0_8px_var(--color-intel-accent)] transition-all font-mono">
              [X]
            </button>
          )}
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1 text-[8px] uppercase tracking-[0.12em] text-white/45">
          <button type="button" onClick={() => dock('top-left')} className="border border-white/10 px-1 py-1 hover:border-intel-accent/60 hover:text-intel-accent">TL</button>
          <button type="button" onClick={() => dock('top-right')} className="border border-white/10 px-1 py-1 hover:border-intel-accent/60 hover:text-intel-accent">TR</button>
          <button type="button" onClick={() => dock('bottom-left')} className="border border-white/10 px-1 py-1 hover:border-intel-accent/60 hover:text-intel-accent">BL</button>
          <button type="button" onClick={() => dock('bottom-right')} className="border border-white/10 px-1 py-1 hover:border-intel-accent/60 hover:text-intel-accent">BR</button>
        </div>
      </div>
      <div className={`flex-1 overflow-y-auto custom-scrollbar ${bodyClassName}`}>{children}</div>
    </div>
  );
};
