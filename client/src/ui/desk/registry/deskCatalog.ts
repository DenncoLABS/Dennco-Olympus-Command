import type { DeskAppDefinition, DockActionDefinition, DeskSectionId } from './deskTypes';

export const standardDeskSections: DeskSectionId[] = [
  'overview',
  'status',
  'tools',
  'deploy',
  'layouts',
  'widgets',
  'global-widgets',
  'sub-app-widgets',
  'collaboration',
  'notes',
  'automations',
  'integrations',
  'related-apps',
  'settings',
  'permissions',
  'activity',
];

export const deskAppCatalog: DeskAppDefinition[] = [
  { id: 'core', label: 'Core', icon: 'Ω', view: 'core', group: 'OS', status: 'active', description: 'Olympus Core system overview and shell plan.', surfaces: ['desk', 'dock', 'apps'], order: 10, deskSections: standardDeskSections },
  { id: 'apps', label: 'Apps', icon: '▦', view: 'apps', group: 'OS', status: 'active', description: 'App browser and launcher for Olympus modules.', surfaces: ['desk', 'dock'], order: 20, deskSections: standardDeskSections },
  { id: 'files', label: 'Files', icon: '▣', view: 'files', group: 'OS', status: 'active', description: 'Files surface for Olympus storage areas.', surfaces: ['desk', 'dock', 'apps'], order: 30, deskSections: standardDeskSections },
  { id: 'architecture', label: 'Architecture', icon: '⌬', view: 'architecture', group: 'OS', status: 'active', description: 'Visual system architecture map.', surfaces: ['desk', 'dock', 'apps'], order: 40, deskSections: standardDeskSections },
  { id: 'terminal', label: 'Terminal', icon: '⌁', view: 'terminal', group: 'OS', status: 'active', description: 'Controlled command workspace placeholder.', surfaces: ['desk', 'dock', 'apps'], order: 50, deskSections: standardDeskSections },
  { id: 'ollama', label: 'Ollama', icon: '◈', view: 'ollama', group: 'OS', status: 'active', description: 'Local Olympus OS AI runtime.', surfaces: ['desk', 'dock', 'apps'], order: 60, deskSections: standardDeskSections },
  { id: 'services', label: 'Services', icon: '◫', view: 'services', module: 'svc', group: 'System', status: 'active', description: 'Service app workspace for Proxmox, NethServer, PBX, DVR, and related consoles.', surfaces: ['desk', 'dock', 'apps'], order: 70, deskSections: standardDeskSections },
  { id: 'packages', label: 'Packages', icon: '⬡', view: 'packages', group: 'System', status: 'planned', description: 'Package and version management surface.', surfaces: ['desk', 'dock', 'apps'], order: 80, deskSections: standardDeskSections },
  { id: 'zabbix', label: 'Zabbix', icon: '⬢', view: 'zbx', module: 'zbx', group: 'System', status: 'active', description: 'Zabbix monitoring workspace with toolbar and embedded GUI surface.', surfaces: ['desk', 'dock', 'apps'], order: 85, deskSections: standardDeskSections },
  {
    id: 'intelmaps',
    label: 'Intel Maps',
    icon: '▤',
    view: 'intelmaps',
    module: 'intelmaps',
    group: 'Operational',
    status: 'active',
    description: 'Intel Maps management surface for Flight, Maritime, DOT, and Monitor map tiles.',
    surfaces: ['desk', 'dock', 'apps'],
    order: 90,
    deskSections: standardDeskSections,
    subApps: [
      { id: 'flight-map', label: 'Flight Map', icon: '✈', description: 'Aircraft, airports, airspace layers, and aviation alerts.', status: 'active' },
      { id: 'maritime-map', label: 'Maritime Map', icon: '⚓', description: 'Vessels, ports, AIS layers, and maritime alerting.', status: 'active' },
      { id: 'dot-map', label: 'DOT Map', icon: '◆', description: 'Road, traffic, CCTV, and transportation intelligence.', status: 'active' },
      { id: 'monitor-map', label: 'Monitor Map', icon: '◉', description: 'Global monitoring, events, thermal, seismic, and feed synthesis.', status: 'active' },
    ],
    tiles: [
      { id: 'intel-overview', label: 'Intel Maps App Surface', description: 'Deploy the main Intel Maps app surface into TileSpace.', scope: 'app', defaultLayout: 'single' },
      { id: 'flight-map', label: 'Flight Map', description: 'Deploy Flight Map as a sub-app tile.', scope: 'sub-app', defaultLayout: 'single', subAppId: 'flight-map' },
      { id: 'maritime-map', label: 'Maritime Map', description: 'Deploy Maritime Map as a sub-app tile.', scope: 'sub-app', defaultLayout: 'single', subAppId: 'maritime-map' },
      { id: 'dot-map', label: 'DOT Map', description: 'Deploy DOT Map as a sub-app tile.', scope: 'sub-app', defaultLayout: 'single', subAppId: 'dot-map' },
      { id: 'monitor-map', label: 'Monitor Map', description: 'Deploy Monitor Map as a sub-app tile.', scope: 'sub-app', defaultLayout: 'single', subAppId: 'monitor-map' },
      { id: 'intel-quad', label: 'Deploy Quad', description: 'Deploy Flight, Maritime, DOT, and Monitor as a four-tile Intel Maps group.', scope: 'app-group', defaultLayout: 'quad', deployAsGroup: true, groupTileIds: ['flight-map', 'maritime-map', 'dot-map', 'monitor-map'] },
    ],
    widgets: [
      { id: 'global-search', label: 'Global Search', description: 'Search across active Intel Maps tiles and map objects.', scope: 'app' },
      { id: 'layer-manager', label: 'Layer Manager', description: 'Coordinate common map layers across Intel Maps tiles.', scope: 'app-group' },
      { id: 'alert-feed', label: 'Alert Feed', description: 'Placeholder alert feed for Intel Maps activity.', scope: 'app' },
      { id: 'ai-summary', label: 'AI Summary', description: 'Placeholder synthesis widget for future assistant summaries.', scope: 'app' },
      { id: 'aircraft-detail', label: 'Aircraft Detail', description: 'Selected aircraft context inside Flight Map.', scope: 'sub-app', subAppId: 'flight-map' },
      { id: 'airport-detail', label: 'Airport Detail', description: 'Selected airport context inside Flight Map.', scope: 'sub-app', subAppId: 'flight-map' },
      { id: 'flight-filter', label: 'Flight Filter', description: 'Filter aircraft and aviation layers inside Flight Map.', scope: 'sub-app', subAppId: 'flight-map' },
      { id: 'vessel-detail', label: 'Vessel Detail', description: 'Selected vessel context inside Maritime Map.', scope: 'sub-app', subAppId: 'maritime-map' },
      { id: 'port-detail', label: 'Port Detail', description: 'Selected port context inside Maritime Map.', scope: 'sub-app', subAppId: 'maritime-map' },
      { id: 'ais-filter', label: 'AIS Filter', description: 'Filter AIS vessels and maritime layers inside Maritime Map.', scope: 'sub-app', subAppId: 'maritime-map' },
    ],
    focusTemplates: [
      { id: 'intel-quad-watch', label: 'Quad Map Watch', description: 'Four sub-app tiles for Flight, Maritime, DOT, and Monitor.', layout: 'quad', tileIds: ['flight-map', 'maritime-map', 'dot-map', 'monitor-map'], widgetIds: ['global-search', 'layer-manager', 'alert-feed', 'ai-summary'] },
    ],
    relatedAppIds: ['monitor', 'cad', 'services'],
  },
  { id: 'monitor', label: 'Monitor', icon: '◉', view: 'monitor', module: 'monitor', group: 'Operational', status: 'active', description: 'Monitor Desk widgets and intelligence cards.', surfaces: ['desk', 'dock', 'apps'], order: 100, deskSections: standardDeskSections },
  { id: 'cad', label: 'CAD', icon: '☷', view: 'cad', module: 'cad', group: 'Operational', status: 'active', description: 'Dispatch, units, personnel, logs, and reports.', surfaces: ['desk', 'dock', 'apps'], order: 110, deskSections: standardDeskSections },
  { id: 'labnode', label: 'Lab Node', icon: '◬', view: 'labnode', module: 'labnode', group: 'System', status: 'active', description: 'Lab node workspace for infrastructure nodes and test systems.', surfaces: ['desk', 'dock', 'apps'], order: 115, deskSections: standardDeskSections },
  { id: 'admin', label: 'Admin', icon: '⚙', view: 'admin', module: 'admin', group: 'System', status: 'protected', description: 'Runtime settings, branding, keys, and feature toggles.', surfaces: ['desk', 'dock', 'apps'], order: 120, protected: true, deskSections: standardDeskSections },
  { id: 'settings', label: 'Settings', icon: '◎', view: 'settings', group: 'OS', status: 'planned', description: 'Desk, Dock, and shell settings.', surfaces: ['desk', 'dock', 'apps'], order: 130, deskSections: standardDeskSections },
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
