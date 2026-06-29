import React, { useMemo, useState } from 'react';
import { useThemeStore } from '../../ui/theme/theme.store';
import { OlympusWorkspaceShell, type OlympusWorkspaceAction } from '../../ui/layout/OlympusWorkspaceShell';

type AppId = 'agent-dvr' | 'rc2' | 'freepbx' | 'gitlab' | 'nethserver8' | 'proxmox8';
type WinKind = 'generic' | 'nodes' | 'vms' | 'storage' | 'console' | 'web';
type Profile = { title: string; short: string; tools: string[]; note: string; urlKey: string };

type Surface = {
  title: string;
  kind: WinKind;
};

const SERVICE_KEY = 'olympus.service.selected';
const profiles: Record<AppId, Profile> = {
  'agent-dvr': { title: 'Agent DVR', short: 'DVR', tools: ['Cameras', 'Recordings', 'Alerts', 'Console'], note: 'Camera and surveillance workspace.', urlKey: 'olympus.service.agentDvr.url' },
  rc2: { title: 'RadioConsole2', short: 'RC2', tools: ['Console', 'Channels', 'Logs', 'Config'], note: 'Radio console workspace.', urlKey: 'olympus.service.rc2.url' },
  freepbx: { title: 'FreePBX', short: 'PBX', tools: ['Trunks', 'Extensions', 'Queues', 'Console'], note: 'PBX and telephony workspace.', urlKey: 'olympus.service.freepbx.url' },
  gitlab: { title: 'GitLab CE', short: 'GL', tools: ['Projects', 'Issues', 'Pipelines', 'Console'], note: 'Code hosting and DevOps workspace.', urlKey: 'olympus.service.gitlab.url' },
  nethserver8: { title: 'NethServer 8', short: 'NS8', tools: ['Cluster', 'Apps', 'Nodes', 'Console'], note: 'Native NethServer 8 GUI framed inside Olympus.', urlKey: 'olympus.service.ns8.url' },
  proxmox8: { title: 'Proxmox 8', short: 'PVE', tools: ['Nodes', 'VMs', 'Storage', 'Console'], note: 'Internal Chromium-rendered Proxmox screen served by Olympus.', urlKey: 'olympus.service.proxmox.url' },
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

function defaultServiceUrl(profile: Profile) {
  if (typeof window === 'undefined') return '';
  const host = window.location.hostname || '127.0.0.1';
  if (profile.short === 'PVE') return `https://${host}:8006`;
  if (profile.short === 'NS8') return `https://${host}`;
  return '';
}

export const ServiceWorkspace: React.FC = () => {
  const setActiveModule = useThemeStore((state) => state.setActiveModule);
  const [profile] = useState<Profile>(() => selectedProfile());
  const [surface, setSurface] = useState<Surface>(() => ({ title: `${selectedProfile().short} Overview`, kind: 'generic' }));
  const [url, setUrl] = useState(() => localStorage.getItem(profile.urlKey) || defaultServiceUrl(profile));
  const [reloadKey, setReloadKey] = useState(0);
  const isProxmox = profile.short === 'PVE';
  const isNethServer = profile.short === 'NS8';
  const isNativeFramed = isProxmox || isNethServer;

  const saveUrl = () => {
    localStorage.setItem(profile.urlKey, url.trim());
    setReloadKey((current) => current + 1);
  };

  const actions: OlympusWorkspaceAction[] = useMemo(() => [
    ...profile.tools.map((tool) => ({
      id: tool.toLowerCase().replace(/\s+/g, '-'),
      label: tool,
      active: surface.title === `${profile.short} ${tool}`,
      tone: surface.title === `${profile.short} ${tool}` ? 'primary' as const : 'default' as const,
      onClick: () => setSurface({ title: `${profile.short} ${tool}`, kind: kindForTool(tool) }),
    })),
    ...(isNativeFramed ? [{ id: 'native-gui', label: 'Native GUI', tone: 'success' as const, onClick: () => setSurface({ title: `${profile.short} Native GUI`, kind: 'web' as WinKind }) }] : []),
    { id: 'save-url', label: 'Save URL', tone: 'success' as const, onClick: saveUrl },
    { id: 'web', label: 'Open Web', tone: 'success' as const, onClick: () => setSurface({ title: `${profile.short} Web Console`, kind: 'web' }) },
    { id: 'reload', label: 'Reload', tone: 'primary' as const, onClick: () => setReloadKey((current) => current + 1) },
    { id: 'close', label: '× Close App', tone: 'danger' as const, onClick: () => setActiveModule('core') },
  ], [profile, surface.title, isNativeFramed, setActiveModule, url]);

  return (
    <OlympusWorkspaceShell
      title={`${profile.title} Workspace`}
      subtitle={`${profile.note} · shared Olympus app shell`}
      surfaceLabel={`${profile.short} Service Surface`}
      actions={actions}
    >
      <div className="flex h-full flex-col overflow-hidden bg-[#020617]">
        <div className="flex h-10 shrink-0 items-center justify-between gap-3 border-b border-cyan-300/15 bg-[#05070b]/90 px-3">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">{surface.title}</div>
            <div className="truncate text-[8px] uppercase tracking-[0.14em] text-white/35">Olympus {profile.short} frame · {labelForKind(surface.kind)}</div>
          </div>
          <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder={isProxmox ? 'https://proxmox-host:8006' : isNethServer ? 'https://nethserver-host' : 'Real console URL'} className="w-72 rounded border border-white/10 bg-black/55 px-2 py-1 text-[10px] text-cyan-100 outline-none focus:border-cyan-300/50" />
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <SurfaceBody key={`${surface.title}-${reloadKey}`} profile={profile} isNativeFramed={isNativeFramed} surface={surface} url={url || defaultServiceUrl(profile)} />
        </div>
      </div>
    </OlympusWorkspaceShell>
  );
};

function SurfaceBody({ profile, isNativeFramed, surface, url }: { profile: Profile; isNativeFramed: boolean; surface: Surface; url: string }) {
  if (isNativeFramed && surface.kind === 'web') return <NativeServiceGui profile={profile} kind={surface.kind} url={url} />;
  if (surface.kind === 'web' && url) return <iframe src={normalizeUrl(url)} className="h-full w-full border-0 bg-black" title={surface.title} />;
  return <ServicePanel profile={profile} surface={surface} url={url} />;
}

function ServicePanel({ profile, surface, url }: { profile: Profile; surface: Surface; url: string }) {
  return (
    <div className="h-full overflow-auto p-5 text-sm text-white/60 custom-scrollbar">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <section className="rounded border border-cyan-300/15 bg-white/[0.03] p-4">
          <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">{surface.title}</div>
          <div className="mt-3 text-lg font-bold uppercase tracking-[0.12em] text-white">{labelForKind(surface.kind)}</div>
          <p className="mt-3 leading-relaxed text-white/55">{profile.note} Native panels and service bindings attach to this shared workspace surface.</p>
        </section>
        <aside className="rounded border border-white/10 bg-black/35 p-4">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">Connection</div>
          <div className="mt-2 break-all font-mono text-cyan-100">{url || 'Not configured'}</div>
          <div className="mt-4 text-[10px] uppercase tracking-[0.14em] text-white/35">Olympus Behavior</div>
          <ul className="mt-2 space-y-2 text-xs text-white/50">
            <li>Runs inside the shared Olympus workspace shell.</li>
            <li>Toolbar actions switch the active service surface.</li>
            <li>Native web consoles stay inside the app workspace.</li>
            <li>No extra random floating GUI windows are created.</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}

function NativeServiceGui({ profile, kind, url }: { profile: Profile; kind: WinKind; url: string }) {
  const [reloadKey, setReloadKey] = useState(0);
  const serviceUrl = normalizeUrl(url || defaultServiceUrl(profile));
  const section = labelForKind(kind);
  const serviceName = profile.title;
  const imageUrl = profile.short === 'PVE' ? `/api/proxmox-lab/browser-screen?url=${encodeURIComponent(serviceUrl)}&r=${reloadKey}` : '';

  return (
    <div className="h-full bg-[#020617]">
      <div className="flex h-10 items-center justify-between border-b border-cyan-300/15 bg-black/70 px-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">Olympus {profile.short} Frame · {section}</div>
          <div className="text-[8px] uppercase tracking-[0.14em] text-white/35">{profile.short === 'PVE' ? 'Rendered by the Olympus internal system browser' : `Native ${serviceName} GUI inside an Olympus workspace`}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setReloadKey((current) => current + 1)} className="rounded border border-cyan-300/25 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-cyan-200">Reload</button>
          <button onClick={() => window.open(serviceUrl, '_blank', 'noopener,noreferrer')} className="rounded border border-white/15 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-white/60 hover:text-cyan-100">External</button>
        </div>
      </div>
      {profile.short === 'PVE' ? <div className="h-[calc(100%-40px)] overflow-auto bg-black"><img key={reloadKey} src={imageUrl} className="min-h-full w-full object-contain" alt="Internal Proxmox browser screen" /></div> : <iframe key={reloadKey} src={serviceUrl} className="h-[calc(100%-40px)] w-full border-0 bg-black" title={`Native ${serviceName} GUI`} />}
    </div>
  );
}
