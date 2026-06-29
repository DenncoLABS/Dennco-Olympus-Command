import React, { useMemo, useState } from 'react';
import { OlympusWorkspaceShell, type OlympusWorkspaceAction } from '../../ui/layout/OlympusWorkspaceShell';

type PanelId = 'overview' | 'dashboard' | 'hosts' | 'graphs' | 'web';

type Panel = {
  id: PanelId;
  title: string;
  description: string;
};

const ZBX_URL_KEY = 'olympus.zbx.url';

const panels: Panel[] = [
  { id: 'overview', title: 'Overview', description: 'Zabbix monitoring workspace overview and connection status.' },
  { id: 'dashboard', title: 'Dashboard', description: 'Monitoring dashboards, health summary, and active problem rollups.' },
  { id: 'hosts', title: 'Hosts', description: 'Managed hosts, agents, templates, and monitored infrastructure.' },
  { id: 'graphs', title: 'Graphs', description: 'Telemetry graphs and time-series monitoring surfaces.' },
  { id: 'web', title: 'Zabbix GUI', description: 'Embedded Zabbix web console inside the Olympus workspace.' },
];

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `http://${trimmed}`;
}

function defaultZabbixUrl() {
  if (typeof window === 'undefined') return '';
  const host = window.location.hostname || '127.0.0.1';
  return `http://${host}/zabbix`;
}

function isOlympusSelfUrl(value: string) {
  if (typeof window === 'undefined') return false;
  try {
    const target = new URL(normalizeUrl(value), window.location.href);
    return target.origin === window.location.origin;
  } catch {
    return false;
  }
}

export const ZbxWorkspace: React.FC = () => {
  const [activePanel, setActivePanel] = useState<PanelId>('web');
  const [url, setUrl] = useState(() => localStorage.getItem(ZBX_URL_KEY) || defaultZabbixUrl());
  const [reloadKey, setReloadKey] = useState(0);
  const active = useMemo(() => panels.find((panel) => panel.id === activePanel) || panels[0], [activePanel]);
  const normalizedUrl = normalizeUrl(url);
  const blocksSelfEmbed = normalizedUrl ? isOlympusSelfUrl(normalizedUrl) : false;

  const saveUrl = () => {
    localStorage.setItem(ZBX_URL_KEY, url.trim());
    setReloadKey((current) => current + 1);
  };

  const actions: OlympusWorkspaceAction[] = [
    ...panels.map((panel) => ({
      id: panel.id,
      label: panel.title,
      active: activePanel === panel.id,
      tone: activePanel === panel.id ? 'primary' as const : 'default' as const,
      onClick: () => setActivePanel(panel.id),
    })),
    { id: 'save-url', label: 'Save URL', tone: 'success', onClick: saveUrl },
    { id: 'reload', label: 'Reload', tone: 'primary', onClick: () => setReloadKey((current) => current + 1) },
    { id: 'external', label: 'External', onClick: () => normalizedUrl && window.open(normalizedUrl, '_blank', 'noopener,noreferrer') },
  ];

  return (
    <OlympusWorkspaceShell
      title="Zabbix Workspace"
      subtitle="Monitoring app workspace · toolbar first · GUI surface inside Olympus"
      surfaceLabel="ZBX Workspace Surface"
      actions={actions}
      showDefaultClose
    >
      <div className="flex h-full flex-col overflow-hidden bg-[#020617]">
        <div className="flex h-10 shrink-0 items-center justify-between gap-3 border-b border-cyan-300/15 bg-[#05070b]/90 px-3">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">{active.title}</div>
            <div className="truncate text-[8px] uppercase tracking-[0.14em] text-white/35">{active.description}</div>
          </div>
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="http://zabbix-host/zabbix"
            className="w-72 rounded border border-white/10 bg-black/55 px-2 py-1 text-[10px] text-cyan-100 outline-none focus:border-cyan-300/50"
          />
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          {activePanel === 'web' ? (
            <ZabbixWebSurface key={reloadKey} url={normalizedUrl} blocksSelfEmbed={blocksSelfEmbed} />
          ) : (
            <ZabbixPanel panel={active} url={normalizedUrl} onOpenWeb={() => setActivePanel('web')} />
          )}
        </div>
      </div>
    </OlympusWorkspaceShell>
  );
};

function ZabbixWebSurface({ url, blocksSelfEmbed }: { url: string; blocksSelfEmbed: boolean }) {
  if (!url) {
    return <EmptyState title="No Zabbix URL" text="Set the Zabbix URL in the toolbar, then save it. Example: http://zabbix-host/zabbix" />;
  }

  if (blocksSelfEmbed) {
    return <EmptyState title="Blocked Self Embed" text="This URL points back to Olympus, which would nest the main interface inside the Zabbix app. Set the actual Zabbix URL instead." />;
  }

  return <iframe src={url} className="h-full w-full border-0 bg-black" title="Zabbix GUI" />;
}

function ZabbixPanel({ panel, url, onOpenWeb }: { panel: Panel; url: string; onOpenWeb: () => void }) {
  return (
    <div className="h-full overflow-auto p-5 text-sm text-white/60 custom-scrollbar">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <section className="rounded border border-cyan-300/15 bg-white/[0.03] p-4">
          <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">{panel.title}</div>
          <div className="mt-3 text-lg font-bold uppercase tracking-[0.12em] text-white">Zabbix {panel.title}</div>
          <p className="mt-3 leading-relaxed text-white/55">{panel.description}</p>
          <button onClick={onOpenWeb} className="mt-5 rounded border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-cyan-100">Open Zabbix GUI Surface</button>
        </section>
        <aside className="rounded border border-white/10 bg-black/35 p-4">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">Connection</div>
          <div className="mt-2 break-all font-mono text-cyan-100">{url || 'Not configured'}</div>
          <div className="mt-4 text-[10px] uppercase tracking-[0.14em] text-white/35">Olympus Behavior</div>
          <ul className="mt-2 space-y-2 text-xs text-white/50">
            <li>Runs as a workspace like Intel Maps.</li>
            <li>Uses the shared Olympus workspace shell.</li>
            <li>Web GUI opens inside this app surface.</li>
            <li>Olympus self-embedding is blocked to prevent duplicate main interface nesting.</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex h-full items-center justify-center p-6 text-center text-white/45">
      <div className="max-w-xl rounded border border-white/10 bg-black/45 p-6">
        <div className="text-[10px] uppercase tracking-[0.24em] text-cyan-300">{title}</div>
        <p className="mt-3 text-sm leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
