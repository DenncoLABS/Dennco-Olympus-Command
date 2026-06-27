import React, { useMemo, useState } from 'react';
import { useThemeStore } from '../../ui/theme/theme.store';

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
  const setActiveModule = useThemeStore((state) => state.setActiveModule);
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

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#020617] font-mono text-white">
      <div className="absolute left-4 right-4 top-4 z-[20] flex flex-wrap items-center justify-between gap-3 rounded border border-cyan-300/20 bg-black/70 px-3 py-2 backdrop-blur">
        <div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-cyan-300">Zabbix Workspace</div>
          <div className="text-[9px] uppercase tracking-[0.16em] text-white/40">Monitoring app workspace · toolbar first · GUI surface inside Olympus</div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {panels.map((panel) => (
            <button
              key={panel.id}
              onClick={() => setActivePanel(panel.id)}
              className={`rounded border px-3 py-1 text-[10px] uppercase tracking-[0.14em] transition ${activePanel === panel.id ? 'border-cyan-300/55 bg-cyan-300/15 text-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.18)]' : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-cyan-300/35 hover:text-cyan-100'}`}
            >
              {panel.title}
            </button>
          ))}
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="http://zabbix-host/zabbix"
            className="w-64 rounded border border-white/10 bg-black/55 px-2 py-1 text-[10px] text-cyan-100 outline-none focus:border-cyan-300/50"
          />
          <button onClick={saveUrl} className="rounded border border-emerald-300/35 bg-emerald-300/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-emerald-100">Save URL</button>
          <button onClick={() => setReloadKey((current) => current + 1)} className="rounded border border-cyan-300/25 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-cyan-200">Reload</button>
          <button onClick={() => normalizedUrl && window.open(normalizedUrl, '_blank', 'noopener,noreferrer')} className="rounded border border-white/15 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-white/60 hover:text-cyan-100">External</button>
          <button onClick={() => setActiveModule('core')} className="rounded border border-red-400/40 bg-red-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-red-200">× Close App</button>
        </div>
      </div>

      <div className="absolute inset-x-4 bottom-4 top-20 overflow-hidden rounded border border-cyan-300/20 bg-black/45 shadow-[0_24px_60px_rgba(0,0,0,0.72)]">
        <div className="flex h-10 items-center justify-between border-b border-cyan-300/15 bg-[#05070b]/90 px-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">{active.title}</div>
            <div className="text-[8px] uppercase tracking-[0.14em] text-white/35">{active.description}</div>
          </div>
          <div className="text-[9px] uppercase tracking-[0.14em] text-white/35">ZBX Workspace Surface</div>
        </div>

        <div className="h-[calc(100%-40px)] overflow-hidden bg-[#020617]">
          {activePanel === 'web' ? (
            <ZabbixWebSurface key={reloadKey} url={normalizedUrl} blocksSelfEmbed={blocksSelfEmbed} />
          ) : (
            <ZabbixPanel panel={active} url={normalizedUrl} onOpenWeb={() => setActivePanel('web')} />
          )}
        </div>
      </div>
    </div>
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
            <li>Toolbar stays at the top of the app.</li>
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
