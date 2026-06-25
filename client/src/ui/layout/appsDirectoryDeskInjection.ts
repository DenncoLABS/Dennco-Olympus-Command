const VIEW_KEY = 'olympus.desk.v2.view';
const ROOT_ID = 'olympus-apps-directory-inline';
const NASA_CATALOG_URL = 'https://raw.githubusercontent.com/nasa/Open-Source-Catalog/master/catalog.json';
const NASA_LOCAL_KEY = 'olympus.apps.directory.nasaCodeCatalog';
const ZABBIX_GUI_URL_KEY = 'olympus.apps.zabbix.guiUrl';
const BOOT_KEY = '__olympusAppsDirectoryDeskInjectionReady';

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };

type CatalogApp = {
  id: string;
  icon: string;
  title: string;
  description: string;
  group: string;
  action?: string;
  url?: string;
};

type NasaEntry = {
  Software?: string;
  Description?: string;
  Categories?: string[];
  Languages?: string[];
  'NASA Center'?: string;
  'Public Code Repo'?: string;
  'External Link'?: string;
};

const osApps: CatalogApp[] = [
  { id: 'core', icon: 'Ω', title: 'Core', description: 'Olympus Core system overview and shell status.', group: 'OS', action: 'core' },
  { id: 'files', icon: '▣', title: 'Files', description: 'GNOME-style file browser inside Olympus.', group: 'OS', action: 'files' },
  { id: 'architecture', icon: '⌬', title: 'Architecture', description: 'System architecture viewer.', group: 'OS', action: 'architecture' },
  { id: 'terminal', icon: '⌁', title: 'Terminal', description: 'Terminal workspace surface.', group: 'OS', action: 'terminal' },
  { id: 'ollama', icon: '◈', title: 'Ollama', description: 'Local Olympus OS AI runtime.', group: 'OS', action: 'ollama' },
  { id: 'settings', icon: '◎', title: 'Settings', description: 'Desk, Dock, and shell settings.', group: 'OS', action: 'settings' },
];

const infraApps: CatalogApp[] = [
  { id: 'zabbix', icon: 'ZBX', title: 'Zabbix', description: 'Monitoring server and agent integration.', group: 'Infrastructure', url: '/zabbix/' },
  { id: 'agent-dvr', icon: 'DVR', title: 'Agent DVR', description: 'Camera and surveillance console.', group: 'Infrastructure' },
  { id: 'rc2', icon: 'RC2', title: 'RadioConsole2', description: 'Radio console integration surface.', group: 'Infrastructure' },
  { id: 'freepbx', icon: 'PBX', title: 'FreePBX', description: 'Open-source PBX and telephony management.', group: 'Infrastructure' },
  { id: 'gitlab', icon: 'GL', title: 'GitLab CE', description: 'Code hosting and DevOps platform.', group: 'Infrastructure' },
  { id: 'nethserver8', icon: 'NS8', title: 'NethServer 8', description: 'Cluster and container service administration.', group: 'Infrastructure' },
  { id: 'proxmox8', icon: 'PVE', title: 'Proxmox 8', description: 'Virtualization and node management console.', group: 'Infrastructure' },
];

function normalize(entry: NasaEntry, index: number): CatalogApp {
  const title = entry.Software || `NASA Code App ${index + 1}`;
  return {
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || `nasa-code-${index + 1}`,
    icon: 'NASA',
    title,
    description: entry.Description || 'NASA open source software catalog app.',
    group: entry['NASA Center'] || 'NASA Code',
    url: entry['Public Code Repo'] || entry['External Link'] || 'https://code.nasa.gov/',
  };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\'': '&#39;', '"': '&quot;' }[char] || char));
}

function findAppsBrowserRoot() {
  const headings = Array.from(document.querySelectorAll('h3'));
  const heading = headings.find((node) => node.textContent?.trim().toUpperCase() === 'APPS BROWSER');
  return heading?.parentElement as HTMLElement | null;
}

function appCard(app: CatalogApp) {
  return `<article data-app-card="true" data-app-id="${escapeHtml(app.id)}" class="group min-w-[138px] max-w-[160px] rounded-lg border border-white/10 bg-white/[0.035] p-3 text-center shadow-[0_10px_30px_rgba(0,0,0,.25)] transition hover:-translate-y-0.5 hover:border-cyan-300/45 hover:bg-cyan-300/10"><button data-open-app="${escapeHtml(app.id)}" class="block w-full"><div class="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-cyan-300/20 to-blue-500/10 text-sm font-bold text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,.14)]">${escapeHtml(app.icon)}</div><div class="mt-2 truncate text-sm font-bold text-white">${escapeHtml(app.title)}</div><div class="mt-1 line-clamp-2 min-h-[30px] text-[10px] leading-relaxed text-white/45">${escapeHtml(app.description)}</div></button></article>`;
}

function row(title: string, apps: CatalogApp[]) {
  return `<section class="mt-5"><div class="mb-2 flex items-center justify-between"><h4 class="text-lg font-bold tracking-tight text-white">${escapeHtml(title)}</h4><span class="text-[10px] uppercase tracking-[0.14em] text-cyan-300/60">${apps.length} apps</span></div><div class="flex gap-3 overflow-x-auto pb-2">${apps.map(appCard).join('')}</div></section>`;
}

function installCommand(app: CatalogApp) {
  if (app.id === 'zabbix') return 'sudo /opt/dennco/olympus-command/scripts/install-infrastructure-apps.sh zabbix';
  if (app.id === 'agent-dvr') return 'sudo /opt/dennco/olympus-command/scripts/install-infrastructure-apps.sh agent-dvr';
  if (app.id === 'rc2') return 'sudo /opt/dennco/olympus-command/scripts/install-infrastructure-apps.sh rc2';
  if (app.id === 'freepbx') return 'sudo /opt/dennco/olympus-command/scripts/install-infrastructure-apps.sh freepbx';
  if (app.id === 'gitlab') return 'sudo /opt/dennco/olympus-command/scripts/install-infrastructure-apps.sh gitlab';
  if (app.id === 'nethserver8') return 'sudo /opt/dennco/olympus-command/scripts/install-infrastructure-apps.sh nethserver8';
  if (app.id === 'proxmox8') return 'sudo /opt/dennco/olympus-command/scripts/install-infrastructure-apps.sh proxmox8';
  return '';
}

function renderAppWindow(root: HTMLElement, app: CatalogApp) {
  const cmd = installCommand(app);
  const frame = app.url ? `<iframe data-app-frame="true" src="${escapeHtml(app.url)}" class="mt-3 min-h-0 flex-1 rounded border border-cyan-300/20 bg-black" title="${escapeHtml(app.title)}"></iframe>` : '';
  root.innerHTML = `
    <div class="flex h-full min-h-[540px] flex-col">
      <div class="flex items-center justify-between gap-3 border-b border-cyan-300/15 pb-3">
        <div class="flex items-center gap-3"><div class="grid h-14 w-14 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-sm font-bold text-cyan-100">${escapeHtml(app.icon)}</div><div><h3 class="text-cyan-200 uppercase tracking-[0.18em] text-sm">${escapeHtml(app.title)}</h3><p class="mt-1 text-xs text-white/50">${escapeHtml(app.description)}</p></div></div>
        <div class="flex items-center gap-2">${app.url ? `<a href="${escapeHtml(app.url)}" target="_blank" rel="noreferrer" class="border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white/55 hover:border-cyan-300/40 hover:text-cyan-200">Open Tab</a>` : ''}<button data-back-apps="true" class="border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white/55 hover:border-cyan-300/40 hover:text-cyan-200">Back to Apps</button></div>
      </div>
      <div class="mt-3 grid gap-3 md:grid-cols-3">
        <div class="border border-white/10 bg-white/[0.03] p-3"><div class="text-[10px] uppercase tracking-[0.18em] text-white/35">Group</div><div class="mt-1 font-mono text-white">${escapeHtml(app.group)}</div><div class="mt-2 text-[9px] uppercase tracking-[0.14em] text-cyan-300">app window</div></div>
        <div class="border border-white/10 bg-white/[0.03] p-3"><div class="text-[10px] uppercase tracking-[0.18em] text-white/35">Launch Mode</div><div class="mt-1 font-mono text-white">Olympus app surface</div><div class="mt-2 text-[9px] uppercase tracking-[0.14em] text-cyan-300">maps-style</div></div>
        <div class="border border-white/10 bg-white/[0.03] p-3"><div class="text-[10px] uppercase tracking-[0.18em] text-white/35">Install</div><code class="mt-1 block break-all text-white/70">${escapeHtml(cmd || 'Built into Olympus app directory')}</code></div>
      </div>
      ${frame || `<div class="mt-3 flex min-h-0 flex-1 items-center justify-center rounded border border-cyan-300/15 bg-black/35 text-center text-xs uppercase tracking-[0.18em] text-white/40">${escapeHtml(app.title)} app workspace</div>`}
    </div>
  `;
  root.querySelector('[data-back-apps="true"]')?.addEventListener('click', () => renderStore(root));
}

function getCatalog(): CatalogApp[] {
  try {
    const cached = JSON.parse(localStorage.getItem(NASA_LOCAL_KEY) || '[]');
    return Array.isArray(cached) ? cached : [];
  } catch {
    return [];
  }
}

async function refreshNasa(root: HTMLElement) {
  const status = root.querySelector('[data-store-status="true"]') as HTMLElement | null;
  if (status) status.textContent = 'Loading NASA Code catalog...';
  try {
    const response = await fetch(NASA_CATALOG_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json() as NasaEntry[];
    const normalized = Array.isArray(data) ? data.map(normalize) : [];
    localStorage.setItem(NASA_LOCAL_KEY, JSON.stringify(normalized));
    renderStore(root, '', normalized);
  } catch (error) {
    if (status) status.textContent = `NASA Code load failed. ${String(error)}`;
  }
}

function renderStore(root: HTMLElement, query = '', nasa = getCatalog()) {
  root.dataset.olympusAppStore = 'true';
  const needle = query.trim().toLowerCase();
  const all = [...osApps, ...infraApps, ...nasa];
  const filtered = needle ? all.filter((app) => [app.title, app.description, app.group].join(' ').toLowerCase().includes(needle)) : all;
  const featured = filtered.filter((app) => app.group === 'OS');
  const infra = filtered.filter((app) => app.group === 'Infrastructure');
  const nasaApps = filtered.filter((app) => app.group !== 'OS' && app.group !== 'Infrastructure');

  root.innerHTML = `
    <div class="grid h-full min-h-[540px] grid-cols-[72px_1fr] overflow-hidden rounded bg-[#05070b] text-white">
      <aside class="flex flex-col items-center gap-3 border-r border-cyan-300/12 bg-white/[0.025] px-2 py-4"><div class="grid h-9 w-9 place-items-center rounded bg-cyan-300/15 text-cyan-200">▦</div><div class="grid h-9 w-9 place-items-center rounded bg-white/[0.04] text-white/55">⬡</div><div class="grid h-9 w-9 place-items-center rounded bg-white/[0.04] text-white/55">NASA</div><div class="grid h-9 w-9 place-items-center rounded bg-white/[0.04] text-white/55">⚙</div></aside>
      <main class="min-w-0 overflow-auto p-5">
        <div class="flex items-center gap-4"><h3 class="text-2xl font-bold tracking-tight text-white">App Store</h3><div class="relative flex-1"><span class="absolute left-3 top-2 text-cyan-300/70">⌕</span><input data-app-search="true" value="${escapeHtml(query)}" placeholder="Search apps..." class="w-full rounded border border-white/10 bg-white/[0.06] px-9 py-2 text-sm text-cyan-100 outline-none focus:border-cyan-300/50" /></div><button data-refresh-nasa="true" class="rounded border border-cyan-300/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-cyan-200 hover:bg-cyan-300/10">Refresh NASA</button></div>
        <div data-store-status="true" class="mt-2 text-[9px] uppercase tracking-[0.14em] text-white/35">${nasa.length ? `NASA Code catalog: ${nasa.length} apps` : 'NASA Code catalog not loaded'}</div>
        ${row('All', filtered.slice(0, 18))}
        ${row('Recently Added', [...infra, ...featured].slice(0, 12))}
        ${row('NASA Code', nasaApps.slice(0, 18))}
      </main>
    </div>
  `;

  root.querySelector('[data-app-search="true"]')?.addEventListener('input', (event) => {
    renderStore(root, (event.target as HTMLInputElement).value, nasa);
  });
  root.querySelector('[data-refresh-nasa="true"]')?.addEventListener('click', () => refreshNasa(root));
  root.querySelectorAll('[data-open-app]').forEach((node) => node.addEventListener('click', () => {
    const id = (node as HTMLElement).dataset.openApp || '';
    const app = all.find((item) => item.id === id);
    if (app) renderAppWindow(root, app);
  }));
}

function inject() {
  if (localStorage.getItem(VIEW_KEY) !== 'apps') return;
  const root = findAppsBrowserRoot();
  if (!root || root.dataset.olympusAppStore === 'true') return;
  renderStore(root);
}

if (typeof window !== 'undefined') {
  const scopedWindow = window as ScopedWindow;
  if (!scopedWindow[BOOT_KEY]) {
    scopedWindow[BOOT_KEY] = true;
    window.setInterval(inject, 500);
  }
}
