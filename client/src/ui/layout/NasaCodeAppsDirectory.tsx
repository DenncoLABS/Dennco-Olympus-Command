import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

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

const NASA_CATALOG_URL = 'https://raw.githubusercontent.com/nasa/Open-Source-Catalog/master/catalog.json';
const LOCAL_KEY = 'olympus.apps.directory.nasaCodeCatalog';

function normalize(entry: NasaCodeApp, index: number) {
  const title = entry.Software || `NASA Code App ${index + 1}`;
  return {
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || `nasa-code-${index + 1}`,
    title,
    description: entry.Description || 'NASA open source software catalog app.',
    center: entry['NASA Center'] || 'NASA',
    categories: Array.isArray(entry.Categories) ? entry.Categories : [],
    license: Array.isArray(entry.License) ? entry.License : [],
    languages: Array.isArray(entry.Languages) ? entry.Languages : [],
    repo: entry['Public Code Repo'] || entry['External Link'] || 'https://code.nasa.gov/',
    updated: entry.Update_Date || '',
  };
}

export const NasaCodeAppsDirectory: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [catalog, setCatalog] = useState<ReturnType<typeof normalize>[]>([]);
  const [status, setStatus] = useState('NASA Code catalog not loaded');

  const loadCatalog = async () => {
    setStatus('Loading NASA Code catalog...');
    try {
      const response = await fetch(NASA_CATALOG_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json() as NasaCodeApp[];
      const normalized = Array.isArray(data) ? data.map(normalize) : [];
      setCatalog(normalized);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(normalized));
      setStatus(`Loaded ${normalized.length} NASA Code apps into Apps Directory`);
    } catch (error) {
      try {
        const cached = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
        setCatalog(Array.isArray(cached) ? cached : []);
        setStatus(`Using cached NASA Code directory. ${String(error)}`);
      } catch {
        setStatus(`NASA Code catalog load failed. ${String(error)}`);
      }
    }
  };

  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
      if (Array.isArray(cached) && cached.length > 0) {
        setCatalog(cached);
        setStatus(`Cached NASA Code directory: ${cached.length} apps`);
      }
    } catch {
      return;
    }
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return catalog.slice(0, 80);
    return catalog.filter((app) => [app.title, app.description, app.center, app.categories.join(' '), app.languages.join(' ')].join(' ').toLowerCase().includes(needle)).slice(0, 120);
  }, [catalog, query]);

  const panel = (
    <>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="fixed right-5 top-[68px] z-[4690] rounded border border-cyan-300/25 bg-black/80 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.14)] hover:bg-cyan-300/10"
      >
        Apps Directory · NASA Code
      </button>

      {open && (
        <section className="fixed right-5 top-[112px] z-[4695] flex h-[68vh] w-[760px] flex-col overflow-hidden rounded border border-cyan-300/25 bg-black/95 font-mono text-white shadow-[0_24px_90px_rgba(0,0,0,0.82)] backdrop-blur">
          <div className="flex items-center justify-between border-b border-cyan-300/15 px-4 py-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-cyan-300">Apps Directory</div>
              <div className="text-lg font-bold uppercase tracking-[0.14em] text-white">NASA Code Open Source Apps</div>
            </div>
            <button onClick={() => setOpen(false)} className="border border-white/10 px-2 py-1 text-white/55 hover:text-red-200">×</button>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-2 border-b border-white/10 p-3">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search NASA software, center, language, category..." className="border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-cyan-100 outline-none focus:border-cyan-300/50" />
            <button onClick={loadCatalog} className="rounded border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-cyan-100 hover:bg-cyan-300/15">Install / Refresh All</button>
          </div>
          <div className="border-b border-white/10 px-4 py-2 text-[9px] uppercase tracking-[0.14em] text-white/40">{status}</div>
          <div className="min-h-0 flex-1 overflow-auto p-3">
            <div className="grid gap-2">
              {filtered.map((app) => (
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
        </section>
      )}
    </>
  );

  return typeof document !== 'undefined' ? createPortal(panel, document.body) : null;
};
