export type DotMapWidgetId =
  | 'dot-notifications'
  | 'traffic-updates'
  | 'traffic-cameras'
  | 'road-flow-status';

export interface DotMapWidgetDefinition {
  id: DotMapWidgetId;
  title: string;
  description: string;
  defaultDock: 'desk' | 'earth';
  status: 'planned' | 'staged' | 'active';
}

export const dotMapWidgetManifest: DotMapWidgetDefinition[] = [
  {
    id: 'dot-notifications',
    title: 'DOT Notifications',
    description: 'DOT traffic and camera notifications rebuilt from the widget folder instead of the old side panel.',
    defaultDock: 'desk',
    status: 'staged',
  },
  {
    id: 'traffic-updates',
    title: 'Traffic Updates',
    description: 'Live road incidents, congestion events, closures, and source status.',
    defaultDock: 'desk',
    status: 'staged',
  },
  {
    id: 'traffic-cameras',
    title: 'Traffic Cameras',
    description: 'Public CCTV and DOT camera list, preview, and selected-camera details.',
    defaultDock: 'desk',
    status: 'staged',
  },
  {
    id: 'road-flow-status',
    title: 'Road Flow Status',
    description: 'Animated road-flow and refresh diagnostics for the DOT map.',
    defaultDock: 'earth',
    status: 'active',
  },
];
