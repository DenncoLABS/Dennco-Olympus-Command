import React from 'react';

export type DeskHatchState = 'latched' | 'opening' | 'open' | 'closing';

export function DeskHatchButton({ hatch, onToggle, onStartResize, onMoveResize, onStopResize }: { hatch: DeskHatchState; onToggle: () => void; onStartResize: (event: React.PointerEvent<HTMLButtonElement>) => void; onMoveResize: (event: React.PointerEvent<HTMLButtonElement>) => void; onStopResize: (event: React.PointerEvent<HTMLButtonElement>) => void }) {
  const label = hatch === 'latched' ? 'Power Hatch · Latched' : hatch === 'opening' ? 'Power Hatch · Unlatching' : hatch === 'closing' ? 'Power Hatch · Closing' : 'Power Hatch · Open';
  return (
    <button
      type="button"
      title="Click to operate powered Desk hatch. Drag to manually position."
      className="olympus-hatch-latch absolute left-1/2 top-0 z-20 h-4 w-64 -translate-x-1/2 cursor-ns-resize rounded-b border-x border-b border-cyan-300/25 bg-cyan-300/10 text-center text-[8px] uppercase tracking-[0.24em] text-cyan-200/65"
      onClick={onToggle}
      onDoubleClick={onToggle}
      onPointerDown={onStartResize}
      onPointerMove={onMoveResize}
      onPointerUp={onStopResize}
      onPointerCancel={onStopResize}
    >
      {label}
    </button>
  );
}
