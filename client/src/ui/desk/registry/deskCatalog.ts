import type { DeskAppDefinition, DockActionDefinition } from './deskTypes';

export const deskAppCatalog: DeskAppDefinition[] = [
  { id: 'core', label: 'Core', icon: 'Ω', view: 'core', group: 'OS', status: 'active', description: 'Olympus Core system overview and shell plan.', surfaces: ['desk', 'dock', 'apps'], order: 10 },
  { id: 'apps', label: 'Apps', icon: '▦', view: 'apps', group: 'OS', status: 'active', description: 'App browser and launcher for Olympus modules.', surfaces: ['desk', 'dock'], order: 20 },
  { id: 'files', label: 'Files', icon: '▣', view: 'files', group: 'OS', status: 'active', description: 'Files surface for Olympus storage areas.', surfaces: ['desk', 'dock', 'apps'], order: 30 },
  { id: 'architecture', label: 'Architecture', icon: '⌬', view: 'architecture', group: 'OS', status: 'active', description: 'Visual system architecture map.', surfaces: ['desk', 'dock', 'apps'], order: 40 },
  { id: 'terminal', label: 'Terminal', icon: '⌁', view: 'terminal', group: 'OS', status: 'active', description: 'Controlled command workspace placeholder.', surfaces: ['desk', 'dock', 'apps'], order: 50 },
  { id: 'ollama', label: 'Ollama', icon: '◈', view: 'ollama', group: 'OS', status: 'active', description: 'Local Olympus OS AI runtime.', surfaces: ['desk', 'dock', 'apps'], order: 60 },
  { id: 'services', label: 'Services', icon: '◫', view: 'services', group: 'System', status: 'planned', description: 'Service status and integrations surface.', surfaces: ['desk', 'dock', 'apps'], order: 70 },
  { id: 'packages', label: 'Packages', icon: '⬡', view: 'packages', group: 'System', status: 'planned', description: 'Package and version management surface.', surfaces: ['desk', 'dock', 'apps'], order: 80 },
  { id: 'intelmaps', label: 'Intel Maps', icon: '▤', view: 'intelmaps', module: 'intelmaps', group: 'Operational', status: 'active', description: 'Intel Maps workspace launcher.', surfaces: ['desk', 'dock', 'apps'], order: 90 },
  { id: 'monitor', label: 'Monitor', icon: '◉', view: 'monitor', module: 'monitor', group: 'Operational', status: 'active', description: 'Monitor Desk widgets and intelligence cards.', surfaces: ['desk', 'dock', 'apps'], order: 100 },
  { id: 'cad', label: 'CAD', icon: '☷', view: 'cad', module: 'cad', group: 'Operational', status: 'active', description: 'Dispatch, units, personnel, logs, and reports.', surfaces: ['desk', 'dock', 'apps'], order: 110 },
  { id: 'admin', label: 'Admin', icon: '⚙', view: 'admin', module: 'admin', group: 'System', status: 'protected', description: 'Runtime settings, branding, keys, and feature toggles.', surfaces: ['desk', 'dock', 'apps'], order: 120, protected: true },
  { id: 'settings', label: 'Settings', icon: '◎', view: 'settings', group: 'OS', status: 'planned', description: 'Desk, Dock, and shell settings.', surfaces: ['desk', 'dock', 'apps'], order: 130 },
];

export const dockActionCatalog: DockActionDefinition[] = [
  { id: 'logout', label: 'Logout', icon: '⏻', action: 'logout', group: 'Session', order: 900 },
];

export function getDeskApp(id: string) {
  return deskAppCatalog.find((app) => app.id === id || app.view === id);
}

export function getDockApps() {
  return deskAppCatalog.filter((app) => app.surfaces.includes('dock')).sort((a, b) => a.order - b.order);
}

export function getAppsBrowserItems() {
  return deskAppCatalog.filter((app) => app.surfaces.includes('apps')).sort((a, b) => a.order - b.order);
}
