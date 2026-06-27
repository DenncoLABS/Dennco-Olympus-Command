import { useThemeStore, type ActiveModule } from '../theme/theme.store';

const BOOT_KEY = '__olympusWorkspaceLauncherPatchReady';
const VIEW_KEY = 'olympus.desk.v2.view';

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };

type WorkspaceRoute = {
  label: string;
  view: string;
  module: ActiveModule;
};

const workspaceRoutes: WorkspaceRoute[] = [
  { label: 'Zabbix', view: 'zbx', module: 'zbx' },
  { label: 'Services', view: 'services', module: 'svc' },
  { label: 'Lab Node', view: 'labnode', module: 'labnode' },
  { label: 'CAD', view: 'cad', module: 'cad' },
  { label: 'Admin', view: 'admin', module: 'admin' },
  { label: 'Intel Maps', view: 'intelmaps', module: 'intelmaps' },
  { label: 'Core', view: 'core', module: 'core' },
  { label: 'Apps', view: 'apps', module: 'core' },
  { label: 'Files', view: 'files', module: 'core' },
  { label: 'Architecture', view: 'architecture', module: 'core' },
  { label: 'Terminal', view: 'terminal', module: 'core' },
  { label: 'Ollama', view: 'ollama', module: 'core' },
  { label: 'Packages', view: 'packages', module: 'core' },
  { label: 'Settings', view: 'settings', module: 'core' },
];

function textForElement(element: HTMLElement) {
  const button = element.closest('button') as HTMLElement | null;
  const article = element.closest('article') as HTMLElement | null;
  return `${button?.getAttribute('title') || ''} ${button?.textContent || ''} ${article?.textContent || ''}`.replace(/\s+/g, ' ').trim();
}

function routeForClick(element: HTMLElement) {
  const text = textForElement(element).toLowerCase();
  return workspaceRoutes.find((route) => text.includes(route.label.toLowerCase()));
}

function isWorkspaceLauncherClick(element: HTMLElement) {
  return Boolean(
    element.closest('.olympus-dock-widget') ||
    element.closest('.olympus-dock-widget-lane') ||
    element.closest('[aria-label="Draggable Olympus Dock widgets"]') ||
    element.closest('article'),
  );
}

function openWorkspace(route: WorkspaceRoute) {
  localStorage.setItem(VIEW_KEY, route.view);
  useThemeStore.getState().setActiveModule(route.module);
  window.dispatchEvent(new CustomEvent('olympus:workspace-launch', { detail: route }));
}

function handleClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null;
  if (!target || !isWorkspaceLauncherClick(target)) return;
  const route = routeForClick(target);
  if (!route) return;

  event.preventDefault();
  event.stopPropagation();
  openWorkspace(route);
}

if (typeof window !== 'undefined') {
  const scopedWindow = window as ScopedWindow;
  if (!scopedWindow[BOOT_KEY]) {
    scopedWindow[BOOT_KEY] = true;
    window.addEventListener('click', handleClick, true);
  }
}
