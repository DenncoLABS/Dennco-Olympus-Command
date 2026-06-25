export type CyberMapWidgetId =
  | 'global-notifications'
  | 'live-intel-feed'
  | 'ai-synthesis'
  | 'rocket-alerts'
  | 'gulf-watch';

export interface CyberMapWidgetDefinition {
  id: CyberMapWidgetId;
  title: string;
  description: string;
  defaultDock: 'desk' | 'earth';
  status: 'planned' | 'staged' | 'active';
}

export const cyberMapWidgetManifest: CyberMapWidgetDefinition[] = [
  {
    id: 'global-notifications',
    title: 'Global Notifications',
    description: 'Global notifications rebuilt as a widget instead of a live mounted overlay.',
    defaultDock: 'desk',
    status: 'staged',
  },
  {
    id: 'live-intel-feed',
    title: 'Live Intel Feed',
    description: 'Live public-source intelligence feed staged as a Desk widget.',
    defaultDock: 'desk',
    status: 'staged',
  },
  {
    id: 'ai-synthesis',
    title: 'AI Synthesis',
    description: 'AI brief generation and critical signal synthesis staged as a Desk widget.',
    defaultDock: 'desk',
    status: 'staged',
  },
  {
    id: 'rocket-alerts',
    title: 'Rocket Alerts',
    description: 'Rocket and UAV alert panel staged as a movable map widget.',
    defaultDock: 'desk',
    status: 'staged',
  },
  {
    id: 'gulf-watch',
    title: 'Gulf Watch',
    description: 'Gulf and GCC watch panel staged as a regional intelligence widget.',
    defaultDock: 'desk',
    status: 'staged',
  },
];
