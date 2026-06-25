import React, { useEffect, useState } from 'react';
import { useThemeStore } from '../../ui/theme/theme.store';

type AppId = 'agent-dvr' | 'rc2' | 'freepbx' | 'gitlab' | 'nethserver8' | 'proxmox8';
type WinKind = 'generic' | 'nodes' | 'vms' | 'storage' | 'console' | 'web';
type Win = { id: string; title: string; kind: WinKind; x: number; y: number; z: number };
type LabObject = { type: 'qm' | 'ct'; id: string; name: string; stage: string; ready: boolean; overlay: string; updated: string; values: Record<string, string> };

const SERVICE_KEY = 'olympus.service.selected';
const profiles: Record<AppId, { title: string; short: string; tools: string[]; note: string; urlKey: string }> = {
  'agent-dvr': { title: 'Agent DVR', short: 'DVR', tools: ['Cameras', 'Recordings', 'Alerts', 'Console'], note: 'Camera and surveillance workspace.', urlKey: 'olympus.service.agentDvr.url' },
  rc2: { title: 'RadioConsole2', short: 'RC2', tools: ['Console', 'Channels', 'Logs', 'Config'], note: 'Radio console workspace.', urlKey: 'olympus.service.rc2.url' },
  freepbx: { title: 'FreePBX', short: 'PBX', tools: ['Trunks', 'Extensions', 'Queues', 'Console'], note: 'PBX and telephony workspace.', urlKey: 'olympus.service.freepbx.url' },
  gitlab: { title: 'GitLab CE', short: 'GL', tools: ['Projects', 'Issues', 'Pipelines', 'Console'], note: 'Code hosting and DevOps workspace.', urlKey: 'olympus.service.gitlab.url' },
  nethserver8: { title: 'NethServer 8', short: 'NS8', tools: ['Cluster', 'Apps', 'Nodes', 'Console'], note: 'Cluster and service administration workspace.', urlKey: 'olympus.service.ns8.url' },
  proxmox8: { title: 'Proxmox 8 Lab', short: 'PVE', tools: ['Nodes', 'VMs', 'Storage', 'Console'], note: 'Olympus-owned simulated QM/LXC lab environment.', urlKey: 'olympus.service.proxmox.url' },
};

function selectedProfile() {
  const raw = localStorage.getItem(SERVICE_KEY) as AppId | null;
  return profiles[raw || 'agent-dvr'] || profiles['agent-dvr'];
}
function kindForTool(tool: string): WinKind {
  if (tool === 'Nodes') return 'nodes';
  if (tool === 'VMs') return 'vms';
  if (tool === 'Storage') return 'storage';
  if (tool === 'Console') return 'console';
  return 'generic';
}

export const ServiceWorkspace: React.FC = () => {
  const setActiveModule = useThemeStore((state) => state.setActiveModule);
  const [profile] = useState(() => selectedProfile());
  const [wins, setWins] = useState<Win[]>([]);
  const [z, setZ] = useState(4);
  const [url, setUrl] = useState(() => localStorage.getItem(profile.urlKey) || '');
  const open = (title: string, kind: WinKind = 'generic') => {
    const nextZ = z + 1;
    setZ(nextZ + 1);
    setWins((current) => [...current, { id: `${title}-${Date.now()}`, title, kind, x: 30 + current.length * 28, y: 76 + current.length * 22, z: nextZ }]);
  };
  const saveUrl = () => localStorage.setItem(profile.urlKey, url.trim());
  const isProxmox = profile.short === 'PVE';
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#020617] font-mono text-white">
      <div className="absolute left-4 right-4 top-4 z-[20] flex items-center justify-between rounded border border-cyan-300/20 bg-black/70 px-3 py-2 backdrop-blur">
        <div><div className="text-[10px] uppercase tracking-[0.28em] text-cyan-300">{profile.title} Workspace</div><div className="text-[9px] uppercase tracking-[0.16em] text-white/40">{profile.note} · app windows open on the active Tile screen</div></div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {profile.tools.map((tool) => <button key={tool} onClick={() => open(`${profile.short} ${tool}`, kindForTool(tool))} className="rounded border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-cyan-100">{tool}</button>)}
          {isProxmox && <button onClick={() => open('PVE New Lab VM', 'vms')} className="rounded border border-emerald-300/35 bg-emerald-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-emerald-100">New Lab VM</button>}
          <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Real console URL" className="w-64 rounded border border-white/10 bg-black/55 px-2 py-1 text-[10px] text-cyan-100 outline-none focus:border-cyan-300/50" />
          <button onClick={saveUrl} className="rounded border border-emerald-300/35 bg-emerald-300/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-emerald-100">Save URL</button>
          <button onClick={() => open(`${profile.short} Web Console`, 'web')} className="rounded border border-emerald-300/35 bg-emerald-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-emerald-100">Open Web</button>
          <button onClick={() => setActiveModule('core')} className="rounded border border-red-400/40 bg-red-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-red-200">× Close App</button>
        </div>
      </div>
      <div className="absolute inset-0 pt-16">
        {wins.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-white/35"><div className="text-center"><div className="text-[10px] uppercase tracking-[0.28em] text-cyan-300/70">{profile.title} Workspace</div><div className="mt-2 text-sm uppercase tracking-[0.16em]">No Window Open</div></div></div>}
        {wins.map((win) => <section key={win.id} className="absolute h-[520px] w-[860px] overflow-hidden rounded border border-cyan-300/20 bg-black shadow-[0_24px_60px_rgba(0,0,0,0.86)]" style={{ left: win.x, top: win.y, zIndex: win.z }}>
          <div className="flex h-9 items-center justify-between border-b border-cyan-300/15 bg-[#05070b]/95 px-3"><div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">{win.title}</div><button onClick={() => setWins((current) => current.filter((item) => item.id !== win.id))} className="border border-white/10 px-2 py-0.5 text-white/55">×</button></div>
          {isProxmox ? <ProxmoxLabPanel kind={win.kind} /> : win.kind === 'web' && url ? <iframe src={url} className="h-[calc(100%-36px)] w-full border-0 bg-black" title={win.title} /> : <div className="p-5 text-sm text-white/60">{win.title} app surface. Native panels and service bindings attach here.</div>}
        </section>)}
      </div>
    </div>
  );
};

function ProxmoxLabPanel({ kind }: { kind: WinKind }) {
  const [objects, setObjects] = useState<LabObject[]>([]);
  const [root, setRoot] = useState('');
  const [newId, setNewId] = useState('100');
  const [newName, setNewName] = useState('lab-vm');
  const [newType, setNewType] = useState<'qm' | 'ct'>('qm');
  const [message, setMessage] = useState('');
  const load = () => fetch('/api/proxmox-lab/objects').then((r) => r.json()).then((data) => { setObjects(data.objects || []); setRoot(data.root || ''); }).catch((error) => setMessage(String(error)));
  useEffect(() => { load(); }, []);
  const createObject = () => fetch('/api/proxmox-lab/objects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: newType, id: newId, name: newName }) }).then((r) => r.json()).then(() => { setMessage(`created ${newType}-${newId}`); load(); }).catch((error) => setMessage(String(error)));
  const markReady = (obj: LabObject) => fetch(`/api/proxmox-lab/objects/${obj.type}/${obj.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage: 'ready', ready: 'true' }) }).then(() => load());

  if (kind === 'console') return <div className="h-[calc(100%-36px)] overflow-auto p-5 text-xs text-white/60"><div className="text-[10px] uppercase tracking-[0.24em] text-cyan-300">Lab Console</div><pre className="mt-3 rounded border border-white/10 bg-white/[0.03] p-3">sudo /opt/dennco/olympus-command/scripts/olympus-proxmox-lab.sh init{`\n`}sudo /opt/dennco/olympus-command/scripts/olympus-proxmox-lab.sh import-qm 100 lab-vm{`\n`}sudo /opt/dennco/olympus-command/scripts/olympus-proxmox-lab.sh list</pre></div>;
  if (kind === 'storage') return <div className="h-[calc(100%-36px)] overflow-auto p-5 text-sm text-white/60"><div className="text-[10px] uppercase tracking-[0.24em] text-cyan-300">Lab Storage</div><div className="mt-4 grid gap-3 md:grid-cols-2"><Status label="Root" value={root || '/var/lib/dennco/olympus-lab-node/proxmox'} /><Status label="Objects" value="objects/qm-id.env and objects/ct-id.env" /><Status label="Overlays" value="overlays/type-id/rootfs and overlays/type-id/config" /><Status label="Mode" value="simulated QM/LXC, not live production files" /></div></div>;
  if (kind === 'nodes') return <div className="h-[calc(100%-36px)] overflow-auto p-5 text-sm text-white/60"><div className="text-[10px] uppercase tracking-[0.24em] text-cyan-300">Lab Nodes</div><div className="mt-4 grid gap-3 md:grid-cols-3"><Status label="olympus-lab" value="simulated Proxmox lab node" /><Status label="production" value="manual-gated source" /><Status label="promotion" value="review plan before migration" /></div></div>;
  return <div className="h-[calc(100%-36px)] overflow-auto p-5"><div className="flex items-center justify-between"><div><div className="text-[10px] uppercase tracking-[0.24em] text-cyan-300">Virtual Environment</div><div className="text-xs text-white/40">Editable simulated QM/LXC objects under Olympus lab root.</div></div><button onClick={load} className="rounded border border-cyan-300/30 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-cyan-200">Refresh</button></div><div className="mt-4 grid gap-2 md:grid-cols-[90px_1fr_1fr_auto]"><select value={newType} onChange={(e) => setNewType(e.target.value as 'qm' | 'ct')} className="rounded border border-white/10 bg-black/40 px-2 py-2 text-xs text-cyan-100"><option value="qm">QM</option><option value="ct">CT</option></select><input value={newId} onChange={(e) => setNewId(e.target.value)} className="rounded border border-white/10 bg-black/40 px-2 py-2 text-xs text-cyan-100" placeholder="ID" /><input value={newName} onChange={(e) => setNewName(e.target.value)} className="rounded border border-white/10 bg-black/40 px-2 py-2 text-xs text-cyan-100" placeholder="Name" /><button onClick={createObject} className="rounded border border-emerald-300/35 bg-emerald-300/10 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-emerald-100">Create</button></div>{message && <div className="mt-2 text-xs text-cyan-200">{message}</div>}<div className="mt-4 grid gap-3">{objects.map((obj) => <div key={`${obj.type}-${obj.id}`} className="rounded border border-white/10 bg-white/[0.03] p-3"><div className="flex items-center justify-between"><div><div className="text-sm font-bold text-white">{obj.type.toUpperCase()} {obj.id} · {obj.name}</div><div className="mt-1 text-xs text-white/40">{obj.overlay}</div></div><div className="flex gap-2"><span className="rounded border border-cyan-300/20 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-cyan-200">{obj.stage}</span><button onClick={() => markReady(obj)} className="rounded border border-emerald-300/30 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-emerald-200">Ready</button></div></div></div>))}</div></div>;
}

function Status({ label, value }: { label: string; value: string }) { return <div className="border border-white/10 bg-white/[0.03] p-3"><div className="text-[10px] uppercase tracking-[0.18em] text-white/35">{label}</div><div className="mt-1 break-all font-mono text-white">{value}</div></div>; }
