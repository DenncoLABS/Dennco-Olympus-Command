import type { ActiveModule } from '../../theme/theme.store';

export type DeskViewId = 'core' | 'apps' | 'files' | 'architecture' | 'terminal' | 'ollama' | 'services' | 'packages' | 'intelmaps' | 'monitor' | 'cad' | 'admin' | 'settings' | string;
export type DeskPlacement = 'left' | 'center' | 'right';
export type DeskStatus = 'active' | 'planned' | 'protected' | 'hidden';
export type DeskAppSurface = 'desk' | 'dock' | 'apps' | 'widget' | 'system';

export type DeskAppDefinition = {
  id: string;
  label: string;
  icon: string;
  view: DeskViewId;
  module?: ActiveModule;
  group: string;
  description: string;
  status: DeskStatus;
  surfaces: DeskAppSurface[];
  order: number;
  protected?: boolean;
};

export type DockActionDefinition = {
  id: string;
  label: string;
  icon: string;
  action: 'logout' | 'open-url' | 'custom';
  group: string;
  order: number;
};

export type DeskRegistry = {
  apps: DeskAppDefinition[];
  actions: DockActionDefinition[];
};
