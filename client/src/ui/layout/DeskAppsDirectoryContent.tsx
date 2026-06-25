import React, { useEffect, useMemo, useState } from 'react';

const NASA_CATALOG_URL = 'https://raw.githubusercontent.com/nasa/Open-Source-Catalog/master/catalog.json';
const NASA_LOCAL_KEY = 'olympus.apps.directory.nasaCodeCatalog';

type NasaCodeApp = {
  Software?: string;
  Description?: string;
  Categories?: string[];
  Languages?: string[];
  'NASA Center'?: string;
  'Public Code Repo'?: string;
  'External Link'?: string;
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

export const DeskAppsDirectoryContent: React.FC = () => {
  const [query, setQuery] = useState('');
  const [catalog, setCatalog] = useState<ReturnType<typeof normalize>[]>([]);
  const [status, setStatus] = useState('NASA Code catalog not loaded');

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
      setStatus(`Loaded ${normalized.length} NASA Code apps into this Apps folder`);
    } catch (error) {
      setStatus(`NASA Code load failed. ${String(error)}`);
    }
  };

  const filteredNasa = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return catalog.slice(0, 18);
    return catalog.filter((app) => [app.title, app.description, app.center, app.categories.join(' '), app.languages.join(' ')].join(' ').toLowerCase().includes(needle)).slice(0, 30);
  }, [catalog, query]);

  return (
    <>
      <section className="mt-5">
        <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">Infrastructure Apps</div>
        <div className="mt-2 grid grid-cols-2 gap-3 xl:grid-cols-3">
          {infrastructureApps.map((app) => (
            <article key={app.id} className="border border-white/10 bg-white/[0.03] p-3 hover:border-cyan-300/35">
              <div className="flex items-center gap-2"><span className="rounded bg-cyan-300/10 px-2 py-1 text-[9px] text-cyan-200">{app.icon}</span><span className="font-bold text-white">{app.label}</span></div>
              <p className="mt-2 text-xs text-white/45">{app.role}</p>
              <div className="mt-2 text-[9px] uppercase tracking-[0.12em] text-cyan-300">Port: {app.port}</div>
              <code className="mt-2 block break-all rounded bg-black/35 p-2 text-[10px] text-white/55">{app.install}</code>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">NASA Code Apps</div>
            <div className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/35">{status}</div>
          </div>
          <button onClick={loadCatalog} className="border border-cyan-300/25 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-cyan-200 hover:bg-cyan-300/10">Install / Refresh NASA</button>
        </div>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search NASA software, center, language, category..." className="mt-3 w-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-cyan-100 outline-none focus:border-cyan-300/50" />
        <div className="mt-2 grid grid-cols-1 gap-2 xl:grid-cols-2">
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
      </section>
    </>
  );
};
