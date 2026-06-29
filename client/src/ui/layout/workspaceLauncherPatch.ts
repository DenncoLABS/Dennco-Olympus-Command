import { openOlympusWorkspace } from './openOlympusWorkspace';
import { getWorkspaceRoute } from './workspaceRoutes';

const BOOT_KEY = '__olympusWorkspaceLauncherPatchReady';

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };

function routeForLauncher(element: HTMLElement) {
  const button = element.closest('button') as HTMLElement | null;
  const dockWidget = element.closest('.olympus-dock-widget') as HTMLElement | null;

  if (dockWidget) {
    const title = button?.getAttribute('title') || button?.textContent || dockWidget.textContent || '';
    return getWorkspaceRoute(title.replace(/\s+/g, ' ').trim());
  }

  if (!button) return undefined;
  if (button.textContent?.trim().toLowerCase() !== 'open') return undefined;

  const article = button.closest('article') as HTMLElement | null;
  if (!article) return undefined;

  const heading = article.querySelector('.font-bold, [data-olympus-app-label]') as HTMLElement | null;
  const label = heading?.textContent || article.textContent || '';
  return getWorkspaceRoute(label.replace(/\s+/g, ' ').trim());
}

function handleClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null;
  if (!target) return;

  const route = routeForLauncher(target);
  if (!route) return;
  if (route.module === 'core') return;

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
