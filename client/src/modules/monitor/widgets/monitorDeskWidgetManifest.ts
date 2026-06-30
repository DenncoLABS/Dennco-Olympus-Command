export type MonitorDeskWidgetId =
  | 'map-layers'
  | 'rocket-alerts'
  | 'gulf-watch'
  | 'ai-synthesis'
  | 'live-intel-feed'
  | 'aircraft-database'
  | 'global-notifications'
  | 'flight-notifications'
  | 'maritime-notifications'
  | 'dot-traffic-notifications'
  | 'dot-cctv';

export type DeskWidgetSource =
  | 'monitor-dashboard-v1'
  | 'aircraft-database-v1'
  | 'global-notification-system-v1'
  | 'flight-notification-system-v1'
  | 'maritime-notification-system-v1'
  | 'dot-notification-system-v1'
  | 'dot-cctv-system-v1';

export interface MonitorDeskWidgetDefinition {
  id: MonitorDeskWidgetId;
  title: string;
  description: string;
  defaultDock: 'desk' | 'earth';
  savedFrom: DeskWidgetSource;
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
  {
    id: 'aircraft-database',
    title: 'Aircraft Database',
    description: 'Aircraft lookup and local aircraft-database status widget moved under Dock > Monitor > Widgets instead of living as its own Dock button.',
    defaultDock: 'desk',
    savedFrom: 'aircraft-database-v1',
    futureUse: 'Keep aircraft database lookup with Monitor widgets and connect it to selected aircraft detail workflows.',
  },
  {
    id: 'global-notifications',
    title: 'Global Notifications',
    description: 'Cross-domain notification window for flight, maritime, monitor, DOT, CAD, and system events.',
    defaultDock: 'desk',
    savedFrom: 'global-notification-system-v1',
    futureUse: 'Convert into a movable notification center widget that can be docked in Desk or placed on the Earth screen.',
  },
  {
    id: 'flight-notifications',
    title: 'Flight Notifications',
    description: 'Flight emergency and aircraft-event notification log, including alert lifecycle actions and aircraft selection links.',
    defaultDock: 'desk',
    savedFrom: 'flight-notification-system-v1',
    futureUse: 'Convert into a movable flight alert widget with saved placement and optional Earth-screen pinning.',
  },
  {
    id: 'maritime-notifications',
    title: 'Maritime Notifications',
    description: 'Maritime incident, Mayday, vessel status, and AIS-related notification surface.',
    defaultDock: 'desk',
    savedFrom: 'maritime-notification-system-v1',
    futureUse: 'Convert into a movable maritime alert widget with vessel linking and map placement.',
  },
  {
    id: 'dot-traffic-notifications',
    title: 'Live DOT Traffic Notifications',
    description: 'DOT road-event, live traffic, closure, congestion, and road-flow notification surface.',
    defaultDock: 'desk',
    savedFrom: 'dot-notification-system-v1',
    futureUse: 'Convert into a movable traffic alert widget that can follow selected road corridors or camera clusters.',
  },
  {
    id: 'dot-cctv',
    title: 'DOT CCTV',
    description: 'Public traffic-camera and CCTV viewing widget for the DOT map feed layer.',
    defaultDock: 'desk',
    savedFrom: 'dot-cctv-system-v1',
    futureUse: 'Convert into a movable camera viewer widget with selected-camera preview and Earth screen placement.',
  },
];
