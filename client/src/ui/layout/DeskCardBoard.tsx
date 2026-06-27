import React, { useEffect, useRef, useState } from 'react';

export type DeskCardDefinition = {
  id: string;
  title: string;
  description: string;
  futureUse: string;
};

type Position = { x: number; y: number };
type PositionMap = Record<string, Position>;
type PinMap = Record<string, boolean>;

type Props = {
  storagePrefix: string;
  cards: DeskCardDefinition[];
};

function defaultPosition(index: number): Position {
  return { x: 16 + (index % 3) * 288, y: 18 + Math.floor(index / 3) * 154 };
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? ({ ...fallback, ...JSON.parse(raw) } as T) : fallback;
  } catch {
    return fallback;
  }
}

function clamp(pos: Position, board: HTMLDivElement | null): Position {
  const maxX = Math.max(8, (board?.clientWidth ?? 900) - 280);
  const maxY = Math.max(8, (board?.clientHeight ?? 360) - 140);
  return { x: Math.max(8, Math.min(pos.x, maxX)), y: Math.max(8, Math.min(pos.y, maxY)) };
}

export const DeskCardBoard: React.FC<Props> = ({ storagePrefix, cards }) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; pointerId: number; dx: number; dy: number } | null>(null);
  const defaults = Object.fromEntries(cards.map((card, index) => [card.id, defaultPosition(index)]));
  const [positions, setPositions] = useState<PositionMap>(() => readJson(`${storagePrefix}.positions`, defaults));
  const [pins, setPins] = useState<PinMap>(() => readJson(`${storagePrefix}.pins`, {}));

  useEffect(() => localStorage.setItem(`${storagePrefix}.positions`, JSON.stringify(positions)), [positions, storagePrefix]);
  useEffect(() => localStorage.setItem(`${storagePrefix}.pins`, JSON.stringify(pins)), [pins, storagePrefix]);

  const begin = (event: React.PointerEvent<HTMLDivElement>, id: string) => {
    if ((event.target as HTMLElement).closest('button,a,input,select,textarea')) return;
    const pos = positions[id] || { x: 16, y: 18 };
    dragRef.current = { id, pointerId: event.pointerId, dx: event.clientX - pos.x, dy: event.clientY - pos.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const next = clamp({ x: event.clientX - drag.dx, y: event.clientY - drag.dy }, boardRef.current);
    setPositions((current) => ({ ...current, [drag.id]: next }));
  };

  const end = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* noop */ }
  };

  return (
    <div className="h-full min-h-[300px] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-cyan-300/15 pb-2">
        <div>
          <h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">Saved Desk Widgets</h3>
          <p className="mt-1 text-xs text-white/45">Drag cards around inside the Desk. Positions are saved locally.</p>
        </div>
        <button onClick={() => setPositions(defaults)} className="border border-white/10 px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-white/45 hover:border-cyan-300/50 hover:text-cyan-200">Reset layout</button>
      </div>
      <div ref={boardRef} className="relative mt-3 min-h-0 flex-1 overflow-hidden rounded border border-white/10 bg-black/35">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(rgba(34,211,238,0.22)_1px,transparent_1px)] bg-[size:22px_22px] pointer-events-none" />
        {cards.map((card, index) => {
          const pos = positions[card.id] || defaultPosition(index);
          const pinned = Boolean(pins[card.id]);
          return (
            <div key={card.id} className="absolute w-[268px] cursor-move select-none rounded border border-white/10 bg-[#020617]/95 shadow-[0_12px_28px_rgba(0,0,0,0.55)] hover:border-cyan-300/35" style={{ left: pos.x, top: pos.y }} onPointerDown={(event) => begin(event, card.id)} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
              <div className="border-b border-white/10 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-cyan-300">{card.title}</span>
                  <span className={pinned ? 'text-[8px] uppercase tracking-[0.12em] text-emerald-300' : 'text-[8px] uppercase tracking-[0.12em] text-white/25'}>{pinned ? 'Pinned' : 'Desk'}</span>
                </div>
              </div>
              <div className="space-y-2 px-3 py-3">
                <p className="text-[11px] leading-relaxed text-white/55">{card.description}</p>
                <p className="text-[9px] leading-relaxed text-white/30">{card.futureUse}</p>
              </div>
              <div className="flex border-t border-white/10 text-[9px] uppercase tracking-[0.12em]">
                <button onClick={() => setPins((current) => ({ ...current, [card.id]: !current[card.id] }))} className="flex-1 px-2 py-2 text-cyan-200/70 hover:bg-cyan-300/10 hover:text-cyan-100">{pinned ? 'Unpin' : 'Pin'}</button>
                <button onClick={() => setPositions((current) => ({ ...current, [card.id]: defaultPosition(index) }))} className="border-l border-white/10 px-2 py-2 text-white/35 hover:bg-white/10 hover:text-white/70">Reset</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
