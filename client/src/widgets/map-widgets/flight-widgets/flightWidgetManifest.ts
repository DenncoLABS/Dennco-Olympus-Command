export type FlightMapWidgetId =
  | 'flight-notifications'
  | 'aircraft-detail'
  | 'air-emergency-controls'
  | 'flight-layer-controls';

export interface FlightMapWidgetDefinition {
  id: FlightMapWidgetId;
  title: string;
  description: string;
  defaultDock: 'desk' | 'earth';
  status: 'planned' | 'staged' | 'active';
}

export const flightMapWidgetManifest: FlightMapWidgetDefinition[] = [
  {
    id: 'flight-notifications',
    title: 'Flight Notifications',
    description: 'Flight alert log and air-emergency notification queue. Rebuilt from the widget folder instead of the old floating panel.',
    defaultDock: 'desk',
    status: 'staged',
  },
  {
    id: 'aircraft-detail',
    title: 'Aircraft Detail',
    description: 'Selected aircraft details and telemetry panel.',
    defaultDock: 'earth',
    status: 'active',
  },
  {
    id: 'air-emergency-controls',
    title: 'Air Emergency Controls',
    description: 'Report, confirm, contact, and stand-down controls for selected aircraft emergencies.',
    defaultDock: 'earth',
    status: 'active',
  },
  {
    id: 'flight-layer-controls',
    title: 'Flight Layer Controls',
    description: 'Flight map layer controls and aviation infrastructure toggles.',
    defaultDock: 'desk',
    status: 'planned',
  },
];
