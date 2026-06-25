import React, { useState } from 'react';
import { useThemeStore } from '../../ui/theme/theme.store';

type Win = { id: string; title: string; x: number; y: number; z: number };

export const ZbxWorkspace: React.FC = () => {
  const setActiveModule = useThemeStore((state) => state.setActiveModule);
  const [wins, setWins] = useState<Win[]>([]);
  const [nextZ, setNextZ] = useState(2);
  const open = (title: string) => {
    const z = nextZ + 1;
    setNextZ(z + 1);
    setWins((current) => [...current, { id: `${title}-${Date.now()}`, title, x: 30 + current.length * 28, y: 76 + current.length * 22, z }]);
  };
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#020617] font-mono text-white">
      <div className="absolute left-4 right-4 top-4 z-[20] flex items-center justify-between rounded border border-cyan-300/20 bg-black/70 px-3 py-2 backdrop-blur">
        <div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-cyan-300">ZBX Workspace</div>
          <div className="text-[9px] uppercase tracking-[0.16em] text-white/40">App workspace · opens windows on the active Tile screen</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => open('ZBX Dashboard')} className="rounded border border-cyan-300/35 bg-cyan-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-cyan-100">Dashboard</button>
          <button onClick={() => open('ZBX Hosts')} className="rounded border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-white/60">Hosts</button>
          <button onClick={() => open('ZBX Graphs')} className="rounded border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-white/60">Graphs</button>
          <button onClick={() => setActiveModule('core')} className="rounded border border-red-400/40 bg-red-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-red-200">× Close App</button>
        </div>
      </div>
      <div className="absolute inset-0 pt-16">
        {wins.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-white/35"><div className="text-center"><div className="text-[10px] uppercase tracking-[0.28em] text-cyan-300/70">ZBX Workspace</div><div className="mt-2 text-sm uppercase tracking-[0.16em]">No Window Open</div></div></div>}
        {wins.map((win) => <section key={win.id} className="absolute h-[420px] w-[720px] rounded border border-cyan-300/20 bg-black shadow-[0_24px_60px_rgba(0,0,0,0.86)]" style={{ left: win.x, top: win.y, zIndex: win.z }}>
          <div className="flex h-9 items-center justify-between border-b border-cyan-300/15 bg-[#05070b]/95 px-3"><div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">{win.title}</div><button onClick={() => setWins((current) => current.filter((item) => item.id !== win.id))} className="border border-white/10 px-2 py-0.5 text-white/55">×</button></div>
          <div className="p-5 text-sm text-white/60">{win.title} app surface. API panels attach here next.</div>
        </section>)}
      </div>
    </div>
  );
};
