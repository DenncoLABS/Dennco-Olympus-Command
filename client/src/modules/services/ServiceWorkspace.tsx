import React, { useState } from 'react';
import { useThemeStore } from '../../ui/theme/theme.store';

type AppId = 'agent-dvr' | 'rc2' | 'freepbx' | 'gitlab' | 'nethserver8' | 'proxmox8';
type Win = { id: string; title: string; x: number; y: number; z: number };

const SERVICE_KEY = 'olympus.service.selected';

const profiles: Record<AppId, { title: string; short: string; tools: string[]; note: string; urlKey: string }> = {
  'agent-dvr': { title: 'Agent DVR', short: 'DVR', tools: ['Cameras', 'Recordings', 'Alerts', 'Console'], note: 'Camera and surveillance workspace.', urlKey: 'olympus.service.agentDvr.url' },
  rc2: { title: 'RadioConsole2', short: 'RC2', tools: ['Console', 'Channels', 'Logs', 'Config'], note: 'Radio console workspace.', urlKey: 'olympus.service.rc2.url' },
  freepbx: { title: 'FreePBX', short: 'PBX', tools: ['Trunks', 'Extensions', 'Queues', 'Console'], note: 'PBX and telephony workspace.', urlKey: 'olympus.service.freepbx.url' },
  gitlab: { title: 'GitLab CE', short: 'GL', tools: ['Projects', 'Issues', 'Pipelines', 'Console'], note: 'Code hosting and DevOps workspace.', urlKey: 'olympus.service.gitlab.url' },
  nethserver8: { title: 'NethServer 8', short: 'NS8', tools: ['Cluster', 'Apps', 'Nodes', 'Console'], note: 'Cluster and service administration workspace.', urlKey: 'olympus.service.ns8.url' },
  proxmox8: { title: 'Proxmox 8', short: 'PVE', tools: ['Nodes', 'VMs', 'Storage', 'Console'], note: 'Virtualization management workspace.', urlKey: 'olympus.service.proxmox.url' },
};

function selectedProfile() {
  const raw = localStorage.getItem(SERVICE_KEY) as AppId | null;
  return profiles[raw || 'agent-dvr'] || profiles['agent-dvr'];
}

export const ServiceWorkspace: React.FC = () => {
  const setActiveModule = useThemeStore((state) => state.setActiveModule);
  const [profile] = useState(() => selectedProfile());
  const [wins, setWins] = useState<Win[]>([]);
  const [z, setZ] = useState(4);
  const [url, setUrl] = useState(() => localStorage.getItem(profile.urlKey) || '');
  const open = (title: string) => {
    const nextZ = z + 1;
    setZ(nextZ + 1);
    setWins((current) => [...current, { id: `${title}-${Date.now()}`, title, x: 30 + current.length * 28, y: 76 + current.length * 22, z: nextZ }]);
  };
  const saveUrl = () => localStorage.setItem(profile.urlKey, url.trim());
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#020617] font-mono text-white">
      <div className="absolute left-4 right-4 top-4 z-[20] flex items-center justify-between rounded border border-cyan-300/20 bg-black/70 px-3 py-2 backdrop-blur">
        <div><div className="text-[10px] uppercase tracking-[0.28em] text-cyan-300">{profile.title} Workspace</div><div className="text-[9px] uppercase tracking-[0.16em] text-white/40">{profile.note} · app windows open on the active Tile screen</div></div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {profile.tools.map((tool) => <button key={tool} onClick={() => open(`${profile.short} ${tool}`)} className="rounded border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-cyan-100">{tool}</button>)}
          <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Real console URL" className="w-64 rounded border border-white/10 bg-black/55 px-2 py-1 text-[10px] text-cyan-100 outline-none focus:border-cyan-300/50" />
          <button onClick={saveUrl} className="rounded border border-emerald-300/35 bg-emerald-300/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-emerald-100">Save URL</button>
          <button onClick={() => open(`${profile.short} Web Console`)} className="rounded border border-emerald-300/35 bg-emerald-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-emerald-100">Open Web</button>
          <button onClick={() => setActiveModule('core')} className="rounded border border-red-400/40 bg-red-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-red-200">× Close App</button>
        </div>
      </div>
      <div className="absolute inset-0 pt-16">
        {wins.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-white/35"><div className="text-center"><div className="text-[10px] uppercase tracking-[0.28em] text-cyan-300/70">{profile.title} Workspace</div><div className="mt-2 text-sm uppercase tracking-[0.16em]">No Window Open</div></div></div>}
        {wins.map((win) => <section key={win.id} className="absolute h-[420px] w-[720px] overflow-hidden rounded border border-cyan-300/20 bg-black shadow-[0_24px_60px_rgba(0,0,0,0.86)]" style={{ left: win.x, top: win.y, zIndex: win.z }}>
          <div className="flex h-9 items-center justify-between border-b border-cyan-300/15 bg-[#05070b]/95 px-3"><div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">{win.title}</div><button onClick={() => setWins((current) => current.filter((item) => item.id !== win.id))} className="border border-white/10 px-2 py-0.5 text-white/55">×</button></div>
          {win.title.includes('Web Console') && url ? <iframe src={url} className="h-[calc(100%-36px)] w-full border-0 bg-black" title={win.title} /> : <div className="p-5 text-sm text-white/60">{win.title} app surface. Native panels and service bindings attach here.</div>}
        </section>)}
      </div>
    </div>
  );
};
