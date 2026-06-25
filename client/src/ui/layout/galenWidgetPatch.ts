const VIEW_KEY = 'olympus.desk.v2.view';
const ROOT_FLAG = 'data-galen-widget-root';
const STORE_KEY = 'olympus.galen.widgets.v1';
const BOOT_KEY = '__olympusGalenWidgetReady';
const AI_VIEW = ['ol', 'lama'].join('');

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };
type Widget = { id: string; title: string; tasked: boolean };

function readWidgets(): Widget[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveWidgets(widgets: Widget[]) {
  localStorage.setItem(STORE_KEY, JSON.stringify(widgets));
}

function findContentRoot() {
  const spans = Array.from(document.querySelectorAll('span'));
  const label = spans.find((node) => node.textContent?.toUpperCase().includes('GALEN WINDOW') || node.textContent?.toUpperCase().includes('AI WINDOW'));
  const main = label?.closest('main');
  return main?.querySelector('.custom-scrollbar') as HTMLElement | null;
}

function render(root: HTMLElement) {
  root.setAttribute(ROOT_FLAG, 'true');
  let widgets = readWidgets();

  const draw = () => {
    saveWidgets(widgets);
    const openWidgets = widgets.filter((widget) => !widget.tasked);
    const taskedWidgets = widgets.filter((widget) => widget.tasked);
    root.innerHTML = `
      <div class="relative h-full min-h-[420px] overflow-hidden rounded border border-cyan-300/15 bg-[#020617] text-white">
        <div class="flex items-center justify-between border-b border-cyan-300/15 bg-black/55 px-3 py-2">
          <div>
            <div class="text-[10px] uppercase tracking-[0.24em] text-cyan-300">Galen AI Widget Workspace</div>
            <div class="text-[9px] uppercase tracking-[0.14em] text-white/35">Open Galen as widget windows. Close them or task them for later.</div>
          </div>
          <button data-galen-new="true" class="rounded border border-cyan-300/35 bg-cyan-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-cyan-100">New Galen Widget</button>
        </div>
        <div class="absolute inset-x-0 bottom-0 top-[48px] overflow-hidden">
          ${openWidgets.length === 0 ? '<div class="flex h-full items-center justify-center text-center text-white/35"><div><div class="text-[10px] uppercase tracking-[0.24em] text-cyan-300/70">No Galen Widget Open</div><div class="mt-2 text-xs uppercase tracking-[0.14em]">Create one or restore a tasked widget.</div></div></div>' : ''}
          ${openWidgets.map((widget, index) => `
            <section data-widget-id="${widget.id}" class="absolute rounded border border-cyan-300/25 bg-black shadow-[0_18px_50px_rgba(0,0,0,.65)]" style="left:${24 + index * 28}px;top:${22 + index * 24}px;width:560px;height:300px;">
              <div class="flex h-9 items-center justify-between border-b border-cyan-300/15 bg-[#05070b] px-3">
                <div><div class="text-[10px] uppercase tracking-[0.18em] text-cyan-300">${widget.title}</div><div class="text-[8px] uppercase tracking-[0.14em] text-white/35">Widget Window</div></div>
                <div class="flex gap-1"><button data-task-widget="${widget.id}" class="border border-white/10 px-2 py-0.5 text-[10px] text-white/55 hover:text-cyan-200">task</button><button data-close-widget="${widget.id}" class="border border-white/10 px-2 py-0.5 text-[10px] text-white/55 hover:text-red-200">×</button></div>
              </div>
              <div class="p-4 text-sm text-white/60">
                <div class="text-cyan-200">Galen</div>
                <p class="mt-2">Local model widget. Chat, command helpers, and task memory attach here next.</p>
                <textarea class="mt-4 h-24 w-full resize-none rounded border border-white/10 bg-white/[0.03] p-3 text-xs text-cyan-100 outline-none" placeholder="Ask Galen... task this widget to continue later."></textarea>
              </div>
            </section>`).join('')}
        </div>
        <div class="absolute bottom-2 left-3 right-3 flex gap-2">
          ${taskedWidgets.map((widget) => `<button data-restore-widget="${widget.id}" class="rounded border border-white/15 bg-black/70 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-cyan-200">${widget.title}</button>`).join('')}
        </div>
      </div>`;

    root.querySelector('[data-galen-new="true"]')?.addEventListener('click', () => {
      widgets = [...widgets, { id: `galen-${Date.now()}`, title: `Galen ${widgets.length + 1}`, tasked: false }];
      draw();
    });
    root.querySelectorAll('[data-task-widget]').forEach((node) => node.addEventListener('click', () => {
      const id = (node as HTMLElement).dataset.taskWidget;
      widgets = widgets.map((widget) => widget.id === id ? { ...widget, tasked: true } : widget);
      draw();
    }));
    root.querySelectorAll('[data-close-widget]').forEach((node) => node.addEventListener('click', () => {
      const id = (node as HTMLElement).dataset.closeWidget;
      widgets = widgets.filter((widget) => widget.id !== id);
      draw();
    }));
    root.querySelectorAll('[data-restore-widget]').forEach((node) => node.addEventListener('click', () => {
      const id = (node as HTMLElement).dataset.restoreWidget;
      widgets = widgets.map((widget) => widget.id === id ? { ...widget, tasked: false } : widget);
      draw();
    }));
  };
  draw();
}

function boot() {
  if (localStorage.getItem(VIEW_KEY) !== AI_VIEW) return;
  const root = findContentRoot();
  if (!root || root.getAttribute(ROOT_FLAG) === 'true') return;
  render(root);
}

if (typeof window !== 'undefined') {
  const scopedWindow = window as ScopedWindow;
  if (!scopedWindow[BOOT_KEY]) {
    scopedWindow[BOOT_KEY] = true;
    window.setInterval(boot, 500);
  }
}
