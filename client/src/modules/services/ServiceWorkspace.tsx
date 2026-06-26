import React, { useState } from 'react';
import { useThemeStore } from '../../ui/theme/theme.store';

type AppId = 'agent-dvr' | 'rc2' | 'freepbx' | 'gitlab' | 'nethserver8' | 'proxmox8';
type WinKind = 'generic' | 'nodes' | 'vms' | 'storage' | 'console' | 'web';
type Win = { id: string; title: string; kind: WinKind; x: number; y: number; z: number };
type Profile = { title: string; short: string; tools: string[]; note: string; urlKey: string };

const SERVICE_KEY = 'olympus.service.selected';
const profiles: Record<AppId, Profile> = {
  'agent-dvr': { title: 'Agent DVR', short: 'DVR', tools: ['Cameras', 'Recordings', 'Alerts', 'Console'], note: 'Camera and surveillance workspace.', urlKey: 'olympus.service.agentDvr.url' },
  rc2: { title: 'RadioConsole2', short: 'RC2', tools: ['Console', 'Channels', 'Logs', 'Config'], note: 'Radio console workspace.', urlKey: 'olympus.service.rc2.url' },
  freepbx: { title: 'FreePBX', short: 'PBX', tools: ['Trunks', 'Extensions', 'Queues', 'Console'], note: 'PBX and telephony workspace.', urlKey: 'olympus.service.freepbx.url' },
  gitlab: { title: 'GitLab CE', short: 'GL', tools: ['Projects', 'Issues', 'Pipelines', 'Console'], note: 'Code hosting and DevOps workspace.', urlKey: 'olympus.service.gitlab.url' },
  nethserver8: { title: 'NethServer 8', short: 'NS8', tools: ['Cluster', 'Apps', 'Nodes', 'Console'], note: 'Native NethServer 8 GUI framed inside Olympus.', urlKey: 'olympus.service.ns8.url' },
  proxmox8: { title: 'Proxmox 8', short: 'PVE', tools: ['Nodes', 'VMs', 'Storage', 'Console'], note: 'Native Proxmox 8 GUI framed inside Olympus.', urlKey: 'olympus.service.proxmox.url' },
};

function selectedProfile(): Profile {
  const selected = localStorage.getItem(SERVICE_KEY) as AppId | null;
  if (selected && profiles[selected]) return profiles[selected];
  return profiles['agent-dvr'];
}

function kindForTool(tool: string): WinKind {
  if (tool === 'Nodes') return 'nodes';
  if (tool === 'VMs') return 'vms';
  if (tool === 'Storage') return 'storage';
  if (tool === 'Console') return 'console';
  return 'generic';
}

function labelForKind(kind: WinKind) {
  if (kind === 'nodes') return 'Nodes';
  if (kind === 'vms') return 'Virtual Environment';
  if (kind === 'storage') return 'Storage';
  if (kind === 'console') return 'Console';
  if (kind === 'web') return 'Web Console';
  return 'Workspace';
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export const ServiceWorkspace: React.FC = () => {
  const setActiveModule = useThemeStore((state) => state.setActiveModule);
  const [profile] = useState<Profile>(() => selectedProfile());
  const [wins, setWins] = useState<Win[]>([]);
  const [z, setZ] = useState(4);
  const [url, setUrl] = useState(() => localStorage.getItem(profile.urlKey) || '');
  const isProxmox = profile.short === 'PVE';
  const isNethServer = profile.short === 'NS8';
  const isNativeFramed = isProxmox || isNethServer;

  const open = (title: string, kind: WinKind = 'generic') => {
    const nextZ = z + 1;
    setZ(nextZ + 1);
    setWins((current) => [
      ...current,
      { id: `${title}-${Date.now()}`, title, kind, x: 30 + current.length * 28, y: 76 + current.length * 22, z: nextZ },
    ]);
  };

  const saveUrl = () => localStorage.setItem(profile.urlKey, url.trim());
  const closeWin = (id: string) => setWins((current) => current.filter((item) => item.id !== id));

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#020617] font-mono text-white">
      <div className="absolute left-4 right-4 top-4 z-[20] flex items-center justify-between rounded border border-cyan-300/20 bg-black/70 px-3 py-2 backdrop-blur">
        <div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-cyan-300">{profile.title} Workspace</div>
          <div className="text-[9px] uppercase tracking-[0.16em] text-white/40">{profile.note} · app windows open on the active Tile screen</div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {profile.tools.map((tool) => (
            <button key={tool} onClick={() => open(`${profile.short} ${tool}`, kindForTool(tool))} className="rounded border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-cyan-100">
              {tool}
            </button>
          ))}
          {isNativeFramed ? (
            <button onClick={() => open(`${profile.short} Native GUI`, 'web')} className="rounded border border-emerald-300/35 bg-emerald-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-emerald-100">Native GUI</button>
          ) : null}
          <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder={isProxmox ? 'https://proxmox-host:8006' : isNethServer ? 'https://nethserver-host' : 'Real console URL'} className="w-64 rounded border border-white/10 bg-black/55 px-2 py-1 text-[10px] text-cyan-100 outline-none focus:border-cyan-300/50" />
          <button onClick={saveUrl} className="rounded border border-emerald-300/35 bg-emerald-300/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-emerald-100">Save URL</button>
          <button onClick={() => open(`${profile.short} Web Console`, 'web')} className="rounded border border-emerald-300/35 bg-emerald-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-emerald-100">Open Web</button>
          <button onClick={() => setActiveModule('core')} className="rounded border border-red-400/40 bg-red-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-red-200">× Close App</button>
        </div>
      </div>
      <div className="absolute inset-0 pt-16">
        {wins.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-white/35">
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-[0.28em] text-cyan-300/70">{profile.title} Workspace</div>
              <div className="mt-2 text-sm uppercase tracking-[0.16em]">No Window Open</div>
            </div>
          </div>
        ) : null}
        {wins.map((win) => (
          <section key={win.id} className="absolute h-[620px] w-[1040px] overflow-hidden rounded border border-cyan-300/20 bg-black shadow-[0_24px_60px_rgba(0,0,0,0.86)]" style={{ left: win.x, top: win.y, zIndex: win.z }}>
            <div className="flex h-9 items-center justify-between border-b border-cyan-300/15 bg-[#05070b]/95 px-3">
              <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">{win.title}</div>
              <button onClick={() => closeWin(win.id)} className="border border-white/10 px-2 py-0.5 text-white/55">×</button>
            </div>
            <WindowBody profile={profile} isNativeFramed={isNativeFramed} win={win} url={url} />
          </section>
        ))}
      </div>
    </div>
  );
};

function WindowBody({ profile, isNativeFramed, win, url }: { profile: Profile; isNativeFramed: boolean; win: Win; url: string }) {
  if (isNativeFramed) return <NativeServiceGui profile={profile} kind={win.kind} url={url} />;
  if (win.kind === 'web' && url) return <iframe src={normalizeUrl(url)} className="h-[calc(100%-36px)] w-full border-0 bg-black" title={win.title} />;
  return <div className="p-5 text-sm text-white/60">{win.title} app surface. Native panels and service bindings attach here.</div>;
}

function NativeServiceGui({ profile, kind, url }: { profile: Profile; kind: WinKind; url: string }) {
  const [reloadKey, setReloadKey] = useState(0);
  const serviceUrl = normalizeUrl(url);
  const section = labelForKind(kind);
  const serviceName = profile.title;

  if (!serviceUrl) {
    return (
      <div className="flex h-[calc(100%-36px)] items-center justify-center p-8 text-center">
        <div className="max-w-xl rounded border border-cyan-300/20 bg-white/[0.03] p-6">
          <div className="text-[10px] uppercase tracking-[0.24em] text-cyan-300">Native {serviceName} GUI</div>
          <div className="mt-3 text-sm leading-relaxed text-white/60">Enter the real {serviceName} web address in the toolbar, then press Save URL and reopen this window.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100%-36px)] bg-[#020617]">
      <div className="flex h-10 items-center justify-between border-b border-cyan-300/15 bg-black/70 px-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">Olympus {profile.short} Frame · {section}</div>
          <div className="text-[8px] uppercase tracking-[0.14em] text-white/35">Native {serviceName} GUI inside an Olympus workspace window</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setReloadKey((current) => current + 1)} className="rounded border border-cyan-300/25 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-cyan-200">Reload</button>
          <button onClick={() => window.open(serviceUrl, '_blank', 'noopener,noreferrer')} className="rounded border border-white/15 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-white/60 hover:text-cyan-100">External</button>
        </div>
      </div>
      <iframe key={reloadKey} src={serviceUrl} className="h-[calc(100%-40px)] w-full border-0 bg-black" title={`Native ${serviceName} GUI`} />
    </div>
  );
}
