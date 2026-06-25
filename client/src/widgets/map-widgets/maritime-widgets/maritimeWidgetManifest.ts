export type MaritimeMapWidgetId =
  | 'maritime-notifications'
  | 'vessel-detail'
  | 'mayday-controls'
  | 'maritime-layer-controls';

export interface MaritimeMapWidgetDefinition {
  id: MaritimeMapWidgetId;
  title: string;
  description: string;
  defaultDock: 'desk' | 'earth';
  status: 'planned' | 'staged' | 'active';
}

export const maritimeMapWidgetManifest: MaritimeMapWidgetDefinition[] = [
  {
    id: 'maritime-notifications',
    title: 'Maritime Notifications',
    description: 'Mayday, distress, static-source, and vessel-notification queue rebuilt as a map widget.',
    defaultDock: 'desk',
    status: 'staged',
  },
  {
    id: 'vessel-detail',
    title: 'Vessel Detail',
    description: 'Selected vessel details, route history, and data folder panel.',
    defaultDock: 'earth',
    status: 'active',
  },
  {
    id: 'mayday-controls',
    title: 'Mayday Controls',
    description: 'Distress workflow controls for selected maritime incidents.',
    defaultDock: 'earth',
    status: 'planned',
  },
  {
    id: 'maritime-layer-controls',
    title: 'Maritime Layer Controls',
    description: 'AIS, base station, port, locks, and vessel layer controls.',
    defaultDock: 'desk',
    status: 'planned',
  },
];
