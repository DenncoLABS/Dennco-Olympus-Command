import React from 'react';
import { DockWidgetButton, type DockWidgetButtonItem } from './DockWidgetButton';

export type OlympusDockPlacement = 'left' | 'center' | 'right';

export function OlympusDockRow({ dock, items, activeId, draggedDockIdRef, onMove, onOpen, children }: { dock: OlympusDockPlacement; items: DockWidgetButtonItem[]; activeId?: string; draggedDockIdRef: React.MutableRefObject<string | null>; onMove: (sourceId: string, targetId: string) => void; onOpen: (item: DockWidgetButtonItem) => void; children?: React.ReactNode }) {
  const dockClass = dock === 'left' ? 'justify-start' : dock === 'right' ? 'justify-end' : 'justify-center';
  return (
    <>
      <div className={`olympus-dock-row flex border-t border-cyan-300/15 bg-black/65 px-3 py-2 ${dockClass}`}>
        <div className="olympus-dock-track flex max-w-full items-end gap-2 overflow-visible rounded-2xl border border-cyan-300/20 bg-white/[0.03] px-3 py-2 shadow-[0_0_24px_rgba(34,211,238,0.12)]">
          <div className="olympus-dock-label mr-2 hidden min-w-[110px] flex-col items-start border-r border-white/10 pr-3 md:flex">
            <span className="text-[9px] uppercase tracking-[0.22em] text-cyan-300">Olympus Dock</span>
            <span className="text-[8px] uppercase tracking-[0.16em] text-white/35">Launcher</span>
          </div>
          <div className="olympus-dock-widget-lane" aria-label="Draggable Olympus Dock widgets">
            {items.map((item) => (
              <DockWidgetButton
                key={item.id}
                item={item}
                active={activeId === item.id}
                draggedDockIdRef={draggedDockIdRef}
                onMove={onMove}
                onOpen={onOpen}
              />
            ))}
          </div>
        </div>
      </div>
      {children}
    </>
  );
}
