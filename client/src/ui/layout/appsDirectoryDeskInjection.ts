const VIEW_KEY = 'olympus.desk.v2.view';
const ROOT_ID = 'olympus-apps-directory-inline';
const NASA_CATALOG_URL = 'https://raw.githubusercontent.com/nasa/Open-Source-Catalog/master/catalog.json';
const NASA_LOCAL_KEY = 'olympus.apps.directory.nasaCodeCatalog';
const ZABBIX_GUI_URL_KEY = 'olympus.apps.zabbix.guiUrl';
const BOOT_KEY = '__olympusAppsDirectoryDeskInjectionReady';

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };

type NasaEntry = {
  Software?: string;
  Description?: string;
  Categories?: string[];
  Languages?: string[];
  'NASA Center'?: string;
  'Public Code Repo'?: string;
  'External Link'?: string;
};

const infraApps = [
  ['zabbix', 'ZBX', 'Zabbix', 'Monitoring server and agent integration', 'sudo /opt/dennco/olympus-command/scripts/install-infrastructure-apps.sh zabbix'],
  ['agent-dvr', 'DVR', 'Agent DVR', 'Open-source camera and surveillance console', 'sudo /opt/dennco/olympus-command/scripts/install-infrastructure-apps.sh agent-dvr'],
  ['rc2', 'RC2', 'RadioConsole2', 'Radio console app placeholder and integration surface', 'sudo /opt/dennco/olympus-command/scripts/install-infrastructure-apps.sh rc2'],
  ['freepbx', 'PBX', 'FreePBX', 'Open-source PBX and telephony management', 'sudo /opt/dennco/olympus-command/scripts/install-infrastructure-apps.sh freepbx'],
  ['gitlab', 'GL', 'GitLab CE', 'Open-source GitLab Community Edition code hosting and DevOps platform', 'sudo /opt/dennco/olympus-command/scripts/install-infrastructure-apps.sh gitlab'],
  ['nethserver8', 'NS8', 'NethServer 8', 'Cluster and container service administration', 'sudo /opt/dennco/olympus-command/scripts/install-infrastructure-apps.sh nethserver8'],
  ['proxmox8', 'PVE', 'Proxmox 8', 'Virtualization and node management console', 'sudo /opt/dennco/olympus-command/scripts/install-infrastructure-apps.sh proxmox8'],
];

function normalize(entry: NasaEntry, index: number) {
  const title = entry.Software || `NASA Code App ${index + 1}`;
  return {
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || `nasa-code-${index + 1}`,
    title,
    description: entry.Description || 'NASA open source software catalog app.',
    center: entry['NASA Center'] || 'NASA',
    repo: entry['Public Code Repo'] || entry['External Link'] || 'https://code.nasa.gov/',
  };
}

function findAppsBrowserRoot() {
  const headings = Array.from(document.querySelectorAll('h3'));
  const heading = headings.find((node) => node.textContent?.trim().toUpperCase() === 'APPS BROWSER');
  return heading?.parentElement || null;
}

function findDeskContentRoot() {
  const headings = Array.from(document.querySelectorAll('span'));
  const heading = headings.find((node) => node.textContent?.trim().toUpperCase() === 'APPS WINDOW');
  const main = heading?.closest('main');
  return main?.querySelector('.custom-scrollbar') as HTMLElement | null;
}

function card(id: string, icon: string, title: string, text: string, command: string) {
  return `<article class="border border-white/10 bg-white/[0.03] p-3 hover:border-cyan-300/35"><div class="flex items-center gap-2"><span class="rounded bg-cyan-300/10 px-2 py-1 text-[9px] text-cyan-200">${icon}</span><span class="font-bold text-white">${title}</span></div><p class="mt-2 text-xs text-white/45">${text}</p><code class="mt-2 block break-all rounded bg-black/35 p-2 text-[10px] text-white/55">${command}</code><button data-infra-open="${id}" class="mt-2 border border-cyan-300/25 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-cyan-200 hover:bg-cyan-300/10">Open</button></article>`;
}

function zabbixGuiUrl() {
  return localStorage.getItem(ZABBIX_GUI_URL_KEY) || '/zabbix/';
}

function zabbixWindow() {
  const url = zabbixGuiUrl();
  return `
    <div data-zabbix-app-window="true" class="flex h-full min-h-[520px] flex-col">
      <div class="flex items-center justify-between gap-3 border-b border-cyan-300/15 pb-3">
        <div>
          <h3 class="text-cyan-200 uppercase tracking-[0.18em] text-sm">Zabbix GUI</h3>
          <p class="mt-2 text-xs text-white/50">Embedded Zabbix web console running as an Olympus app window.</p>
        </div>
        <div class="flex items-center gap-2">
          <input data-zabbix-url="true" value="${url}" class="w-64 border border-white/10 bg-black/55 px-2 py-1 text-[10px] text-cyan-100 outline-none focus:border-cyan-300/50" />
          <button data-zabbix-load="true" class="border border-cyan-300/25 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-cyan-200 hover:bg-cyan-300/10">Load</button>
          <a href="${url}" target="_blank" rel="noreferrer" class="border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white/55 hover:border-cyan-300/40 hover:text-cyan-200">Open Tab</a>
          <button data-zabbix-back="true" class="border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white/55 hover:border-cyan-300/40 hover:text-cyan-200">Back</button>
        </div>
      </div>
      <div class="mt-3 flex items-center gap-4 text-[10px] uppercase tracking-[0.14em] text-white/40">
        <span>Default GUI path: <b class="text-cyan-300">/zabbix/</b></span>
        <span>Agent: <b data-zabbix-agent="true" class="text-cyan-300">checking...</b></span>
        <span>Install: <b class="text-cyan-300">install-infrastructure-apps.sh zabbix</b></span>
      </div>
      <iframe data-zabbix-frame="true" src="${url}" class="mt-3 min-h-0 flex-1 rounded border border-cyan-300/20 bg-black" title="Zabbix GUI"></iframe>
    </div>
  `;
}

async function loadZabbixStatus() {
  const agent = document.querySelector('[data-zabbix-agent="true"]');
  if (!agent) return;
  try {
    const response = await fetch('/api/zabbix/status');
    const data = await response.json();
    agent.textContent = `${data.agentState || 'unknown'} / ${data.enabled || 'unknown'}`;
  } catch {
    agent.textContent = 'status unavailable';
  }
}

function wireZabbixWindow(content: HTMLElement) {
  const input = content.querySelector('[data-zabbix-url="true"]') as HTMLInputElement | null;
  const frame = content.querySelector('[data-zabbix-frame="true"]') as HTMLIFrameElement | null;
  const load = content.querySelector('[data-zabbix-load="true"]');
  load?.addEventListener('click', () => {
    const nextUrl = input?.value?.trim() || '/zabbix/';
    localStorage.setItem(ZABBIX_GUI_URL_KEY, nextUrl);
    if (frame) frame.src = nextUrl;
  });
  content.querySelector('[data-zabbix-back="true"]')?.addEventListener('click', () => {
    content.innerHTML = '';
    const old = document.getElementById(ROOT_ID);
    if (old) old.remove();
    inject();
  });
}

function renderZabbixApp() {
  const content = findDeskContentRoot();
  if (!content) return;
  content.innerHTML = zabbixWindow();
  wireZabbixWindow(content);
  loadZabbixStatus();
}

function nasaCard(entry: ReturnType<typeof normalize>) {
  return `<article class="rounded border border-white/10 bg-white/[0.025] p-3 hover:border-cyan-300/30"><div class="flex items-start justify-between gap-4"><div><div class="text-sm font-bold text-white">${entry.title}</div><div class="mt-1 line-clamp-2 text-xs leading-relaxed text-white/50">${entry.description}</div></div><a href="${entry.repo}" target="_blank" rel="noreferrer" class="shrink-0 rounded border border-cyan-300/20 px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-cyan-200 hover:bg-cyan-300/10">Open</a></div><div class="mt-2 text-[8px] uppercase tracking-[0.12em] text-cyan-200">${entry.center}</div></article>`;
}

function renderNasa(root: HTMLElement, entries: ReturnType<typeof normalize>[]) {
  const box = root.querySelector('[data-nasa-results="true"]');
  if (!box) return;
  box.innerHTML = entries.slice(0, 24).map(nasaCard).join('') || '<div class="text-xs text-white/35">No NASA apps loaded yet.</div>';
}

function inject() {
  if (localStorage.getItem(VIEW_KEY) !== 'apps') return;
  if (document.getElementById(ROOT_ID)) return;
  const root = findAppsBrowserRoot();
  if (!root) return;

  const section = document.createElement('section');
  section.id = ROOT_ID;
  section.className = 'mt-5';
  section.innerHTML = `
    <div class="text-[10px] uppercase tracking-[0.18em] text-white/35">Infrastructure Apps</div>
    <div class="mt-2 grid grid-cols-2 gap-3 xl:grid-cols-3">${infraApps.map((app) => card(app[0], app[1], app[2], app[3], app[4])).join('')}</div>
    <div class="mt-5 flex items-center justify-between gap-3"><div><div class="text-[10px] uppercase tracking-[0.18em] text-white/35">NASA Code Apps</div><div data-nasa-status="true" class="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/35">NASA Code catalog not loaded</div></div><button data-nasa-load="true" class="border border-cyan-300/25 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-cyan-200 hover:bg-cyan-300/10">Install / Refresh NASA</button></div>
    <div data-nasa-results="true" class="mt-2 grid grid-cols-1 gap-2 xl:grid-cols-2"></div>
  `;
  root.appendChild(section);

  section.querySelector('[data-infra-open="zabbix"]')?.addEventListener('click', renderZabbixApp);

  const status = section.querySelector('[data-nasa-status="true"]') as HTMLElement | null;
  const cached = JSON.parse(localStorage.getItem(NASA_LOCAL_KEY) || '[]');
  if (Array.isArray(cached) && cached.length) {
    if (status) status.textContent = `Cached NASA Code directory: ${cached.length} apps`;
    renderNasa(section, cached);
  }

  section.querySelector('[data-nasa-load="true"]')?.addEventListener('click', async () => {
    if (status) status.textContent = 'Loading NASA Code catalog...';
    try {
      const response = await fetch(NASA_CATALOG_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json() as NasaEntry[];
      const normalized = Array.isArray(data) ? data.map(normalize) : [];
      localStorage.setItem(NASA_LOCAL_KEY, JSON.stringify(normalized));
      if (status) status.textContent = `Loaded ${normalized.length} NASA Code apps into this Apps folder`;
      renderNasa(section, normalized);
    } catch (error) {
      if (status) status.textContent = `NASA Code load failed. ${String(error)}`;
    }
  });
}

if (typeof window !== 'undefined') {
  const scopedWindow = window as ScopedWindow;
  if (!scopedWindow[BOOT_KEY]) {
    scopedWindow[BOOT_KEY] = true;
    window.setInterval(inject, 500);
  }
}
