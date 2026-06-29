import { openOlympusWorkspace } from './openOlympusWorkspace';
import { getWorkspaceRoute } from './workspaceRoutes';

const BOOT_KEY = '__olympusWorkspaceLauncherPatchReady';

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };

function textForElement(element: HTMLElement) {
  const button = element.closest('button') as HTMLElement | null;
  const article = element.closest('article') as HTMLElement | null;
  return `${button?.getAttribute('title') || ''} ${button?.textContent || ''} ${article?.textContent || ''}`.replace(/\s+/g, ' ').trim();
}

function routeForClick(element: HTMLElement) {
  const text = textForElement(element);
  return getWorkspaceRoute(text);
}

function isWorkspaceLauncherClick(element: HTMLElement) {
  return Boolean(
    element.closest('.olympus-dock-widget') ||
    element.closest('.olympus-dock-widget-lane') ||
    element.closest('[aria-label="Draggable Olympus Dock widgets"]') ||
    element.closest('article'),
  );
}

function handleClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null;
  if (!target || !isWorkspaceLauncherClick(target)) return;
  const route = routeForClick(target);
  if (!route) return;

  event.preventDefault();
  event.stopPropagation();
  openOlympusWorkspace(route.id, { source: 'launcher-bridge' });
}

if (typeof window !== 'undefined') {
  const scopedWindow = window as ScopedWindow;
  if (!scopedWindow[BOOT_KEY]) {
    scopedWindow[BOOT_KEY] = true;
    window.addEventListener('click', handleClick, true);
  }
}
