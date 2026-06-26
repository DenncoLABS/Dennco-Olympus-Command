import React from 'react';

export type DockWidgetButtonItem = {
  id: string;
  label: string;
  icon: string;
  action?: string;
};

export function DockWidgetButton({ item, active, draggedDockIdRef, onMove, onOpen }: { item: DockWidgetButtonItem; active: boolean; draggedDockIdRef: React.MutableRefObject<string | null>; onMove: (sourceId: string, targetId: string) => void; onOpen: (item: DockWidgetButtonItem) => void }) {
  return (
    <div
      className="olympus-dock-widget"
      draggable
      onDragStart={(event) => {
        draggedDockIdRef.current = item.id;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', item.id);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
      }}
      onDrop={(event) => {
        event.preventDefault();
        const sourceId = draggedDockIdRef.current || event.dataTransfer.getData('text/plain');
        onMove(sourceId, item.id);
        draggedDockIdRef.current = null;
      }}
      onDragEnd={() => {
        draggedDockIdRef.current = null;
      }}
    >
      <button
        type="button"
        data-dock-logout={item.action === 'logout' ? 'true' : undefined}
        onClick={() => onOpen(item)}
        className={`group flex flex-col items-center justify-center rounded-xl border transition-all ${active ? 'border-cyan-300/60 bg-cyan-400/15 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.25)]' : 'border-white/10 bg-white/[0.03] text-white/55 hover:border-cyan-300/40 hover:bg-cyan-400/10 hover:text-cyan-100'}`}
        title={item.label}
      >
        <span className="dock-widget-icon leading-none">{item.icon}</span>
        <span className="dock-widget-label">{item.label}</span>
      </button>
    </div>
  );
}
