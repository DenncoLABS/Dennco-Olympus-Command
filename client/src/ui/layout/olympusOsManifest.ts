export type OlympusOsToolId = 'core' | 'files' | 'architecture' | 'terminal' | 'services' | 'packages' | 'gnome' | 'settings';

export interface OlympusOsTool {
  id: OlympusOsToolId;
  title: string;
  icon: string;
  description: string;
  stage: 'active' | 'planned';
  pathHint?: string;
}

export const olympusOsTools: OlympusOsTool[] = [
  {
    id: 'core',
    title: 'Core',
    icon: 'Ω',
    description: 'Central Olympus Core control surface for local services, modules, and command apps.',
    stage: 'active',
    pathHint: '/opt/dennco/olympus-command',
  },
  {
    id: 'files',
    title: 'Files',
    icon: '▣',
    description: 'Controlled file selection surface for Olympus application, config, and data paths.',
    stage: 'planned',
    pathHint: '/opt/dennco /etc/dennco /var/lib/dennco',
  },
  {
    id: 'architecture',
    title: 'Architecture',
    icon: '⌬',
    description: 'Visual architecture map for client modules, server routes, services, and package layers.',
    stage: 'active',
  },
  {
    id: 'terminal',
    title: 'Terminal',
    icon: '⌁',
    description: 'Controlled terminal surface for later backend-approved command actions.',
    stage: 'planned',
  },
  {
    id: 'services',
    title: 'Services',
    icon: '⚡',
    description: 'Service center for Olympus systemd units, local CAD, core services, and data daemons.',
    stage: 'planned',
    pathHint: 'systemctl status dennco-olympus-command olympus-cad',
  },
  {
    id: 'packages',
    title: 'Packages',
    icon: '▤',
    description: 'APT/package view for installed Olympus build, update status, and repo health.',
    stage: 'planned',
    pathHint: 'dpkg -l | grep dennco-olympus-command',
  },
  {
    id: 'gnome',
    title: 'GNOME',
    icon: '◌',
    description: 'GNOME desktop integration, launcher, autostart, and appliance-session readiness.',
    stage: 'active',
    pathHint: '/usr/share/applications/olympus-command.desktop',
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: '◎',
    description: 'Desk, Dock, runtime branding, and local user preferences.',
    stage: 'active',
  },
];
