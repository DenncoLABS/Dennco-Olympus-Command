import type { ActiveModule } from '../theme/theme.store';

export type OlympusWorkspaceRoute = {
  id: string;
  label: string;
  view: string;
  module: ActiveModule;
  group: 'core' | 'system' | 'operations';
};

export const olympusWorkspaceRoutes: OlympusWorkspaceRoute[] = [
  { id: 'core', label: 'Core', view: 'core', module: 'core', group: 'core' },
  { id: 'apps', label: 'Apps', view: 'apps', module: 'core', group: 'core' },
  { id: 'files', label: 'Files', view: 'files', module: 'core', group: 'core' },
  { id: 'architecture', label: 'Architecture', view: 'architecture', module: 'core', group: 'core' },
  { id: 'terminal', label: 'Terminal', view: 'terminal', module: 'core', group: 'core' },
  { id: 'ollama', label: 'Ollama', view: 'ollama', module: 'core', group: 'core' },
  { id: 'packages', label: 'Packages', view: 'packages', module: 'core', group: 'system' },
  { id: 'settings', label: 'Settings', view: 'settings', module: 'core', group: 'system' },
  { id: 'services', label: 'Services', view: 'services', module: 'svc', group: 'system' },
  { id: 'zabbix', label: 'Zabbix', view: 'zbx', module: 'zbx', group: 'system' },
  { id: 'labnode', label: 'Lab Node', view: 'labnode', module: 'labnode', group: 'system' },
  { id: 'admin', label: 'Admin', view: 'admin', module: 'admin', group: 'system' },
  { id: 'intelmaps', label: 'Intel Maps', view: 'intelmaps', module: 'intelmaps', group: 'operations' },
  { id: 'monitor', label: 'Monitor', view: 'monitor', module: 'monitor', group: 'operations' },
  { id: 'cad', label: 'CAD', view: 'cad', module: 'cad', group: 'operations' },
];

export function getWorkspaceRoute(idOrViewOrLabel: string) {
  const key = idOrViewOrLabel.trim().toLowerCase();
  return olympusWorkspaceRoutes.find((route) => (
    route.id.toLowerCase() === key ||
    route.view.toLowerCase() === key ||
    route.label.toLowerCase() === key
  ));
}

export function getWorkspaceRouteForModule(module: ActiveModule) {
  return olympusWorkspaceRoutes.find((route) => route.module === module);
}

export function isCoreDeskRoute(idOrViewOrLabel: string) {
  return getWorkspaceRoute(idOrViewOrLabel)?.module === 'core';
}
