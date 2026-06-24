export type MonitorDeskWidgetId = 'map-layers' | 'rocket-alerts' | 'gulf-watch' | 'ai-synthesis' | 'live-intel-feed';

export interface MonitorDeskWidgetDefinition {
  id: MonitorDeskWidgetId;
  title: string;
  description: string;
  defaultDock: 'desk' | 'earth';
  savedFrom: 'monitor-dashboard-v1';
  futureUse: string;
}

export const monitorDeskWidgetManifest: MonitorDeskWidgetDefinition[] = [
  {
    id: 'map-layers',
    title: 'Map Layers',
    description: 'GPS interference, military bases, and monitor layer controls previously shown in the bottom Monitor dashboard.',
    defaultDock: 'desk',
    savedFrom: 'monitor-dashboard-v1',
    futureUse: 'Convert into a movable Desk widget that can be dragged onto the Earth screen when needed.',
  },
  {
    id: 'rocket-alerts',
    title: 'Rocket Alerts',
    description: 'RocketAlert live monitoring panel previously shown in the bottom Monitor dashboard.',
    defaultDock: 'desk',
    savedFrom: 'monitor-dashboard-v1',
    futureUse: 'Convert into a movable alert widget for regional threat monitoring.',
  },
  {
    id: 'gulf-watch',
    title: 'Gulf Watch',
    description: 'UAE and GCC watch panel previously shown in the bottom Monitor dashboard.',
    defaultDock: 'desk',
    savedFrom: 'monitor-dashboard-v1',
    futureUse: 'Convert into a movable regional watch widget.',
  },
  {
    id: 'ai-synthesis',
    title: 'AI Synthesis',
    description: 'AI synthesis and critical signal review panel previously shown in the bottom Monitor dashboard.',
    defaultDock: 'desk',
    savedFrom: 'monitor-dashboard-v1',
    futureUse: 'Convert into a Desk intelligence-analysis widget with optional Earth screen placement.',
  },
  {
    id: 'live-intel-feed',
    title: 'Live Intel Feed',
    description: 'Live OSINT feed list previously shown in the bottom Monitor dashboard.',
    defaultDock: 'desk',
    savedFrom: 'monitor-dashboard-v1',
    futureUse: 'Convert into a movable live-feed widget with saved size and position.',
  },
];
