import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

const VIEW_KEY = 'olympus.desk.v2.view';
const NASA_CATALOG_URL = 'https://raw.githubusercontent.com/nasa/Open-Source-Catalog/master/catalog.json';
const NASA_LOCAL_KEY = 'olympus.apps.directory.nasaCodeCatalog';

type NasaCodeApp = {
  Software?: string;
  Description?: string;
  Categories?: string[];
  License?: string[];
  Languages?: string[];
  'NASA Center'?: string;
  'Public Code Repo'?: string;
  'External Link'?: string;
  Update_Date?: string;
};

const infrastructureApps = [
  { id: 'zabbix', label: 'Zabbix', icon: 'ZBX', role: 'Monitoring server and agent integration', port: '10050 / 10051', install: 'sudo /opt/dennco/olympus-command/scripts/install-infrastructure-apps.sh zabbix' },
  { id: 'agent-dvr', label: 'Agent DVR', icon: 'DVR', role: 'Open-source camera and surveillance console', port: '8090', install: 'sudo /opt/dennco/olympus-command/scripts/install-infrastructure-apps.sh agent-dvr' },
  { id: 'rc2', label: 'RadioConsole2', icon: 'RC2', role: 'Radio console app placeholder and integration surface', port: 'local', install: 'sudo /opt/dennco/olympus-command/scripts/install-infrastructure-apps.sh rc2' },
  { id: 'freepbx', label: 'FreePBX', icon: 'PBX', role: 'Open-source PBX and telephony management', port: '80 / 443', install: 'sudo /opt/dennco/olympus-command/scripts/install-infrastructure-apps.sh freepbx' },
  { id: 'gitlab', label: 'GitLab CE', icon: 'GL', role: 'Open-source GitLab Community Edition code hosting and DevOps platform', port: '80 / 443 / 22', install: 'sudo /opt/dennco/olympus-command/scripts/install-infrastructure-apps.sh gitlab' },
  { id: 'nethserver8', label: 'NethServer 8', icon: 'NS8', role: 'Cluster and container service administration', port: '9090', install: 'sudo /opt/dennco/olympus-command/scripts/install-infrastructure-apps.sh nethserver8' },
  { id: 'proxmox8', label: 'Proxmox 8', icon: 'PVE', role: 'Virtualization and node management console', port: '8006', install: 'sudo /opt/dennco/olympus-command/scripts/install-infrastructure-apps.sh proxmox8' },
];

function normalize(entry: NasaCodeApp, index: number) {
  const title = entry.Software || `NASA Code App ${index + 1}`;
  return {
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || `nasa-code-${index + 1}`,
    title,
    description: entry.Description || 'NASA open source software catalog app.',
    center: entry['NASA Center'] || 'NASA',
    categories: Array.isArray(entry.Categories) ? entry.Categories : [],
    languages: Array.isArray(entry.Languages) ? entry.Languages : [],
    repo: entry['Public Code Repo'] || entry['External Link'] || 'https://code.nasa.gov/',
  };
}

export const AppsDirectoryOverlay: React.FC = () => {
  const [visible, setVisible] = useState(() => localStorage.getItem(VIEW_KEY) === 'apps');
  const [query, setQuery] = useState('');
  const [catalog, setCatalog] = useState<ReturnType<typeof normalize>[]>([]);
  const [status, setStatus] = useState('NASA Code catalog not loaded');
  const [activeInfra, setActiveInfra] = useState<string | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => setVisible(localStorage.getItem(VIEW_KEY) === 'apps'), 250);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(NASA_LOCAL_KEY) || '[]');
      if (Array.isArray(cached) && cached.length > 0) {
        setCatalog(cached);
        setStatus(`Cached NASA Code directory: ${cached.length} apps`);
      }
    } catch {
      return;
    }
  }, []);

  const loadCatalog = async () => {
    setStatus('Loading NASA Code catalog...');
    try {
      const response = await fetch(NASA_CATALOG_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json() as NasaCodeApp[];
      const normalized = Array.isArray(data) ? data.map(normalize) : [];
      setCatalog(normalized);
      localStorage.setItem(NASA_LOCAL_KEY, JSON.stringify(normalized));
      setStatus(`Loaded ${normalized.length} NASA Code apps into Apps Browser`);
    } catch (error) {
      setStatus(`NASA Code load failed. ${String(error)}`);
    }
  };

  const activeInfraApp = infrastructureApps.find((app) => app.id === activeInfra) || null;
  const filteredNasa = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return catalog.slice(0, 25);
    return catalog.filter((app) => [app.title, app.description, app.center, app.categories.join(' '), app.languages.join(' ')].join(' ').toLowerCase().includes(needle)).slice(0, 40);
  }, [catalog, query]);

  if (!visible) return null;

  const panel = (
    <section className="fixed right-5 top-[112px] z-[4685] flex h-[68vh] w-[780px] flex-col overflow-hidden rounded border border-cyan-300/25 bg-black/94 font-mono text-white shadow-[0_24px_90px_rgba(0,0,0,0.82)] backdrop-blur">
      <div className="flex items-center justify-between border-b border-cyan-300/15 px-4 py-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-cyan-300">Apps Browser Directory</div>
          <div className="text-lg font-bold uppercase tracking-[0.14em] text-white">Infrastructure + NASA Code Apps</div>
        </div>
        <div className="text-[9px] uppercase tracking-[0.14em] text-white/35">Under Apps</div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[310px_1fr] overflow-hidden">
        <aside className="overflow-auto border-r border-cyan-300/15 p-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-300">Infrastructure Apps</div>
          <div className="mt-2 grid gap-2">
            {infrastructureApps.map((app) => (
              <button key={app.id} onClick={() => setActiveInfra((current) => current === app.id ? null : app.id)} className={`rounded border p-2 text-left transition ${activeInfra === app.id ? 'border-cyan-300/60 bg-cyan-300/12' : 'border-white/10 bg-white/[0.03] hover:border-cyan-300/35'}`}>
                <div className="flex items-center gap-2"><span className="rounded bg-cyan-300/10 px-2 py-1 text-[9px] text-cyan-200">{app.icon}</span><span className="text-sm font-bold text-white">{app.label}</span></div>
                <div className="mt-1 text-[10px] leading-relaxed text-white/45">{app.role}</div>
              </button>
            ))}
          </div>
          {activeInfraApp && (
            <div className="mt-3 rounded border border-cyan-300/20 bg-black/55 p-3 text-[10px] leading-relaxed text-white/55">
              <div className="text-cyan-300">{activeInfraApp.label}</div>
              <div className="mt-1">Port: {activeInfraApp.port}</div>
              <code className="mt-2 block break-all rounded bg-white/[0.04] p-2 normal-case tracking-normal text-white/75">{activeInfraApp.install}</code>
            </div>
          )}
        </aside>

        <main className="flex min-h-0 flex-col overflow-hidden p-3">
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search NASA software, center, language, category..." className="border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-cyan-100 outline-none focus:border-cyan-300/50" />
            <button onClick={loadCatalog} className="rounded border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-cyan-100 hover:bg-cyan-300/15">Install / Refresh NASA</button>
          </div>
          <div className="mt-2 text-[9px] uppercase tracking-[0.14em] text-white/40">{status}</div>
          <div className="mt-3 min-h-0 flex-1 overflow-auto">
            <div className="grid gap-2">
              {filteredNasa.map((app) => (
                <article key={app.id} className="rounded border border-white/10 bg-white/[0.025] p-3 hover:border-cyan-300/30">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold text-white">{app.title}</div>
                      <div className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/50">{app.description}</div>
                    </div>
                    <a href={app.repo} target="_blank" rel="noreferrer" className="shrink-0 rounded border border-cyan-300/20 px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-cyan-200 hover:bg-cyan-300/10">Open</a>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1 text-[8px] uppercase tracking-[0.12em] text-white/35">
                    <span className="rounded bg-cyan-300/10 px-2 py-1 text-cyan-200">{app.center}</span>
                    {app.languages.slice(0, 3).map((item) => <span key={item} className="rounded bg-white/5 px-2 py-1">{item}</span>)}
                    {app.categories.slice(0, 4).map((item) => <span key={item} className="rounded bg-white/5 px-2 py-1">{item}</span>)}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </main>
      </div>
    </section>
  );

  return typeof document !== 'undefined' ? createPortal(panel, document.body) : null;
};
