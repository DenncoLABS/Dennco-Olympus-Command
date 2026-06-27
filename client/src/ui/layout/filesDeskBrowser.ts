const VIEW_KEY = 'olympus.desk.v2.view';
const BOOT_KEY = '__olympusFilesDeskBrowserReady';
const ROOT_FLAG = 'data-olympus-files-browser';

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };

type FileEntry = {
  name: string;
  path: string;
  type: 'directory' | 'file' | 'other';
  size: number;
  modified: string;
};

function findFilesContentRoot() {
  const headings = Array.from(document.querySelectorAll('span'));
  const heading = headings.find((node) => node.textContent?.trim().toUpperCase() === 'FILES WINDOW');
  const main = heading?.closest('main');
  return main?.querySelector('.custom-scrollbar') as HTMLElement | null;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\'': '&#39;', '"': '&quot;' }[char] || char));
}

function formatSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) return '—';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

async function listPath(targetPath: string) {
  const response = await fetch(`/api/files/list?path=${encodeURIComponent(targetPath)}`);
  if (!response.ok) throw new Error(`Unable to list ${targetPath}`);
  return response.json() as Promise<{ path: string; parent: string; entries: FileEntry[] }>;
}

async function readFile(targetPath: string) {
  const response = await fetch(`/api/files/read?path=${encodeURIComponent(targetPath)}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unable to preview file.' }));
    throw new Error(error.error || 'Unable to preview file.');
  }
  return response.json() as Promise<{ path: string; content: string; size: number; modified: string }>;
}

function renderShell(root: HTMLElement) {
  root.setAttribute(ROOT_FLAG, 'true');
  root.classList.remove('p-4');
  root.innerHTML = `
    <div class="flex h-full min-h-[520px] flex-col overflow-hidden rounded border border-cyan-300/15 bg-[#020617]" data-files-browser-root="true">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-300/15 bg-black/45 px-3 py-2 backdrop-blur">
        <div>
          <h3 class="text-cyan-200 uppercase tracking-[0.18em] text-sm">GNOME Files Workspace</h3>
          <p class="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/35">Themed Olympus file browser · machine filesystem explorer</p>
        </div>
        <div class="flex min-w-0 flex-1 items-center justify-end gap-2">
          <button data-files-home="true" class="rounded border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white/60 hover:border-cyan-300/40 hover:text-cyan-200">Root</button>
          <button data-files-olympus="true" class="rounded border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white/60 hover:border-cyan-300/40 hover:text-cyan-200">Olympus</button>
          <button data-files-var="true" class="rounded border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white/60 hover:border-cyan-300/40 hover:text-cyan-200">State</button>
          <input data-files-path="true" value="/" class="min-w-[220px] flex-1 rounded border border-white/10 bg-black/55 px-2 py-1 text-xs text-cyan-100 outline-none focus:border-cyan-300/50" />
          <button data-files-go="true" class="rounded border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-cyan-200 hover:bg-cyan-300/15">Go</button>
          <button data-files-up="true" class="rounded border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white/55 hover:border-cyan-300/40 hover:text-cyan-200">Up</button>
        </div>
      </div>
      <div class="grid min-h-0 flex-1 grid-cols-[260px_minmax(320px,1fr)_minmax(320px,0.95fr)] gap-0 overflow-hidden">
        <aside class="border-r border-cyan-300/10 bg-black/35 p-3">
          <div class="text-[10px] uppercase tracking-[0.18em] text-cyan-300">Places</div>
          <div class="mt-3 space-y-2 text-xs">
            <button data-open-path="/" class="block w-full rounded border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-white/65 hover:border-cyan-300/35 hover:text-cyan-100">▣ Root filesystem</button>
            <button data-open-path="/opt/dennco/olympus-command" class="block w-full rounded border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-white/65 hover:border-cyan-300/35 hover:text-cyan-100">▤ Olympus app</button>
            <button data-open-path="/var/lib/dennco" class="block w-full rounded border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-white/65 hover:border-cyan-300/35 hover:text-cyan-100">◫ Dennco state</button>
            <button data-open-path="/etc/dennco" class="block w-full rounded border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-white/65 hover:border-cyan-300/35 hover:text-cyan-100">⚙ Dennco config</button>
            <button data-open-path="/home" class="block w-full rounded border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-white/65 hover:border-cyan-300/35 hover:text-cyan-100">⌂ Home</button>
          </div>
          <div class="mt-5 rounded border border-cyan-300/10 bg-cyan-300/[0.04] p-3 text-[10px] leading-relaxed text-white/40">Files opens inside the Desk workspace. It does not launch a duplicate Olympus GUI or external browser surface.</div>
        </aside>
        <div class="min-h-0 overflow-hidden border-r border-cyan-300/10 bg-black/20">
          <div class="flex h-9 items-center justify-between border-b border-white/10 bg-white/[0.025] px-3">
            <span class="text-[10px] uppercase tracking-[0.18em] text-cyan-300">Folder Contents</span>
            <span data-files-count="true" class="text-[9px] uppercase tracking-[0.14em] text-white/35">—</span>
          </div>
          <div class="h-[calc(100%-36px)] overflow-auto custom-scrollbar" data-files-list="true"></div>
        </div>
        <div class="min-h-0 overflow-hidden bg-[#020617]">
          <div class="flex h-9 items-center justify-between border-b border-white/10 bg-white/[0.025] px-3">
            <span class="text-[10px] uppercase tracking-[0.18em] text-cyan-300">Preview</span>
            <span data-files-preview-path="true" class="max-w-[240px] truncate text-[9px] uppercase tracking-[0.14em] text-white/35">No file selected</span>
          </div>
          <pre class="h-[calc(100%-36px)] overflow-auto p-3 text-xs leading-relaxed text-white/65 custom-scrollbar" data-files-preview="true">Select a text file to preview it.</pre>
        </div>
      </div>
    </div>
  `;
}

function renderEntries(root: HTMLElement, currentPath: string, parent: string, entries: FileEntry[]) {
  const input = root.querySelector('[data-files-path="true"]') as HTMLInputElement | null;
  const list = root.querySelector('[data-files-list="true"]') as HTMLElement | null;
  const count = root.querySelector('[data-files-count="true"]') as HTMLElement | null;
  if (input) input.value = currentPath;
  if (count) count.textContent = `${entries.length} items`;
  if (!list) return;

  list.innerHTML = `
    <button data-open-path="${escapeHtml(parent)}" class="block w-full border-b border-white/10 px-3 py-2 text-left text-xs text-cyan-200 hover:bg-cyan-300/10">../</button>
    ${entries.map((entry) => `
      <button data-open-path="${escapeHtml(entry.path)}" data-open-type="${entry.type}" class="block w-full border-b border-white/5 px-3 py-2 text-left hover:bg-white/[0.04]">
        <div class="flex items-center justify-between gap-2">
          <span class="min-w-0 truncate text-xs ${entry.type === 'directory' ? 'text-cyan-200' : 'text-white/75'}">${entry.type === 'directory' ? '▣' : entry.type === 'file' ? '□' : '◇'} ${escapeHtml(entry.name)}</span>
          <span class="shrink-0 text-[9px] uppercase tracking-[0.12em] text-white/30">${entry.type}</span>
        </div>
        <div class="mt-1 flex items-center justify-between gap-2 text-[9px] text-white/30">
          <span>${formatSize(entry.size)}</span>
          <span class="truncate">${entry.modified ? escapeHtml(entry.modified) : ''}</span>
        </div>
      </button>
    `).join('')}
  `;
}

async function openPath(root: HTMLElement, targetPath: string, kind?: string) {
  const preview = root.querySelector('[data-files-preview="true"]') as HTMLElement | null;
  const previewPath = root.querySelector('[data-files-preview-path="true"]') as HTMLElement | null;
  try {
    if (kind === 'file') {
      const file = await readFile(targetPath);
      if (preview) preview.textContent = file.content;
      if (previewPath) previewPath.textContent = file.path;
      return;
    }
    const data = await listPath(targetPath);
    renderEntries(root, data.path, data.parent, data.entries);
    if (preview) preview.textContent = `Directory: ${data.path}\nEntries: ${data.entries.length}`;
    if (previewPath) previewPath.textContent = data.path;
  } catch (error) {
    if (preview) preview.textContent = String(error);
    if (previewPath) previewPath.textContent = 'Error';
  }
}

function wire(root: HTMLElement) {
  root.querySelector('[data-files-go="true"]')?.addEventListener('click', () => {
    const input = root.querySelector('[data-files-path="true"]') as HTMLInputElement | null;
    openPath(root, input?.value || '/');
  });
  root.querySelector('[data-files-up="true"]')?.addEventListener('click', () => {
    const up = root.querySelector('[data-open-path]') as HTMLElement | null;
    openPath(root, up?.dataset.openPath || '/');
  });
  root.querySelector('[data-files-home="true"]')?.addEventListener('click', () => openPath(root, '/'));
  root.querySelector('[data-files-olympus="true"]')?.addEventListener('click', () => openPath(root, '/opt/dennco/olympus-command'));
  root.querySelector('[data-files-var="true"]')?.addEventListener('click', () => openPath(root, '/var/lib/dennco'));
  root.querySelector('[data-files-path="true"]')?.addEventListener('keydown', (event) => {
    if ((event as KeyboardEvent).key !== 'Enter') return;
    const input = root.querySelector('[data-files-path="true"]') as HTMLInputElement | null;
    openPath(root, input?.value || '/');
  });
  root.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const button = target.closest('[data-open-path]') as HTMLElement | null;
    if (!button) return;
    openPath(root, button.dataset.openPath || '/', button.dataset.openType);
  });
}

function inject() {
  if (localStorage.getItem(VIEW_KEY) !== 'files') return;
  const root = findFilesContentRoot();
  if (!root || root.getAttribute(ROOT_FLAG) === 'true') return;
  renderShell(root);
  wire(root);
  openPath(root, '/');
}

if (typeof window !== 'undefined') {
  const scopedWindow = window as ScopedWindow;
  if (!scopedWindow[BOOT_KEY]) {
    scopedWindow[BOOT_KEY] = true;
    window.setInterval(inject, 500);
  }
}
