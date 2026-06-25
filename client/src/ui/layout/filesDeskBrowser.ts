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
  root.innerHTML = `
    <div class="flex h-full min-h-[520px] flex-col" data-files-browser-root="true">
      <div class="flex items-center justify-between gap-3 border-b border-cyan-300/15 pb-3">
        <div>
          <h3 class="text-cyan-200 uppercase tracking-[0.18em] text-sm">GNOME Files Browser</h3>
          <p class="mt-2 text-xs text-white/50">Browse the machine filesystem from inside the Olympus Files window.</p>
        </div>
        <div class="flex items-center gap-2">
          <input data-files-path="true" value="/" class="w-[460px] border border-white/10 bg-black/55 px-2 py-1 text-xs text-cyan-100 outline-none focus:border-cyan-300/50" />
          <button data-files-go="true" class="border border-cyan-300/25 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-cyan-200 hover:bg-cyan-300/10">Go</button>
          <button data-files-up="true" class="border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white/55 hover:border-cyan-300/40 hover:text-cyan-200">Up</button>
        </div>
      </div>
      <div class="mt-3 grid min-h-0 flex-1 grid-cols-[360px_1fr] gap-3 overflow-hidden">
        <div class="overflow-auto rounded border border-cyan-300/15 bg-black/35" data-files-list="true"></div>
        <pre class="overflow-auto rounded border border-white/10 bg-[#020617] p-3 text-xs leading-relaxed text-white/65" data-files-preview="true">Select a text file to preview it.</pre>
      </div>
    </div>
  `;
}

function renderEntries(root: HTMLElement, currentPath: string, parent: string, entries: FileEntry[]) {
  const input = root.querySelector('[data-files-path="true"]') as HTMLInputElement | null;
  const list = root.querySelector('[data-files-list="true"]') as HTMLElement | null;
  if (input) input.value = currentPath;
  if (!list) return;

  list.innerHTML = `
    <button data-open-path="${escapeHtml(parent)}" class="block w-full border-b border-white/10 px-3 py-2 text-left text-xs text-cyan-200 hover:bg-cyan-300/10">../</button>
    ${entries.map((entry) => `
      <button data-open-path="${escapeHtml(entry.path)}" data-open-type="${entry.type}" class="block w-full border-b border-white/5 px-3 py-2 text-left hover:bg-white/[0.04]">
        <div class="flex items-center justify-between gap-2"><span class="text-xs ${entry.type === 'directory' ? 'text-cyan-200' : 'text-white/75'}">${entry.type === 'directory' ? '▣' : '□'} ${escapeHtml(entry.name)}</span><span class="text-[9px] uppercase tracking-[0.12em] text-white/30">${entry.type}</span></div>
        <div class="mt-1 text-[9px] text-white/30">${entry.size.toLocaleString()} bytes ${entry.modified ? ' · ' + escapeHtml(entry.modified) : ''}</div>
      </button>
    `).join('')}
  `;
}

async function openPath(root: HTMLElement, targetPath: string, kind?: string) {
  const preview = root.querySelector('[data-files-preview="true"]') as HTMLElement | null;
  try {
    if (kind === 'file') {
      const file = await readFile(targetPath);
      if (preview) preview.textContent = file.content;
      return;
    }
    const data = await listPath(targetPath);
    renderEntries(root, data.path, data.parent, data.entries);
    if (preview) preview.textContent = `Directory: ${data.path}\nEntries: ${data.entries.length}`;
  } catch (error) {
    if (preview) preview.textContent = String(error);
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
