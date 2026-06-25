import React, { useState } from 'react';
import { useThemeStore } from '../../ui/theme/theme.store';

type Stage = 'import' | 'edit' | 'test' | 'ready';
type LabWindow = { id: string; title: string; stage: Stage; x: number; y: number; z: number };

const WINDOW_KEY = 'olympus.labnode.windows.v1';

function readWindows(): LabWindow[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(WINDOW_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const LabNodeWorkspace: React.FC = () => {
  const setActiveModule = useThemeStore((state) => state.setActiveModule);
  const [windows, setWindows] = useState<LabWindow[]>(() => readWindows());
  const [z, setZ] = useState(10);
  const saveWindows = (next: LabWindow[]) => { setWindows(next); localStorage.setItem(WINDOW_KEY, JSON.stringify(next)); };
  const openStage = (stage: Stage) => { const nextZ = z + 1; setZ(nextZ + 1); saveWindows([...windows, { id: `${stage}-${Date.now()}`, title: `Lab ${stage}`, stage, x: 34 + windows.length * 28, y: 78 + windows.length * 24, z: nextZ }]); };
  const closeWindow = (id: string) => saveWindows(windows.filter((win) => win.id !== id));

  return <div className="absolute inset-0 overflow-hidden bg-[#020617] font-mono text-white">
    <div className="absolute left-4 right-4 top-4 z-[20] rounded border border-cyan-300/20 bg-black/75 p-3 shadow-[0_18px_50px_rgba(0,0,0,.55)] backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div><div className="text-[10px] uppercase tracking-[0.28em] text-cyan-300">Proxmox 8 + NethServer 8 Lab Node</div><div className="text-[9px] uppercase tracking-[0.16em] text-white/40">Lab workflow for importing, changing, testing, and releasing systems.</div></div>
        <div className="flex flex-wrap items-center justify-end gap-2"><button onClick={() => openStage('import')} className="rounded border border-cyan-300/35 bg-cyan-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-cyan-100">New Lab Job</button><button onClick={() => openStage('edit')} className="rounded border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-white/60">Edit</button><button onClick={() => openStage('test')} className="rounded border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-white/60">Test</button><button onClick={() => openStage('ready')} className="rounded border border-emerald-300/35 bg-emerald-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-emerald-100">Ready</button><button onClick={() => setActiveModule('core')} className="rounded border border-red-400/40 bg-red-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-red-200">× Close Lab</button></div>
      </div>
    </div>
    <div className="absolute inset-0 pt-[96px]">
      {windows.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-center text-white/35"><div><div className="text-[10px] uppercase tracking-[0.28em] text-cyan-300/70">No Lab Job Open</div><div className="mt-2 text-sm uppercase tracking-[0.16em]">Create a lab job from the toolbar.</div></div></div>}
      {windows.map((win) => <section key={win.id} className="absolute h-[420px] w-[720px] overflow-hidden rounded border border-cyan-300/20 bg-black shadow-[0_24px_60px_rgba(0,0,0,0.86)]" style={{ left: win.x, top: win.y, zIndex: win.z }}><div className="flex h-9 items-center justify-between border-b border-cyan-300/15 bg-[#05070b]/95 px-3"><div><div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">{win.title}</div><div className="text-[8px] uppercase tracking-[0.14em] text-white/35">LAB JOB · {win.stage}</div></div><button onClick={() => closeWindow(win.id)} className="border border-white/10 px-2 py-0.5 text-[10px] text-white/55 hover:text-red-200">×</button></div><div className="p-5 text-sm leading-relaxed text-white/60"><div className="text-cyan-200 uppercase tracking-[0.16em]">{win.stage}</div><p className="mt-3">Use this lab window to track a Proxmox 8 or NethServer 8 system while it is imported into the lab, changed, tested, and prepared for release.</p></div></section>)}
    </div>
  </div>;
};
