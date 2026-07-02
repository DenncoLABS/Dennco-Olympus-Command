import type { ActiveModule } from '../../theme/theme.store';

export type DeskViewId = 'core' | 'apps' | 'files' | 'architecture' | 'terminal' | 'ollama' | 'services' | 'packages' | 'intelmaps' | 'monitor' | 'cad' | 'admin' | 'settings' | string;
export type DeskPlacement = 'left' | 'center' | 'right';
export type DeskStatus = 'active' | 'planned' | 'protected' | 'hidden';
export type DeskAppSurface = 'desk' | 'dock' | 'apps' | 'widget' | 'system';
export type DeskWidgetScope = 'system' | 'app' | 'app-group' | 'sub-app' | 'tile';
export type DeskTileLayout = 'single' | 'split' | 'tri' | 'quad' | 'custom';

export type SubAppDefinition = {
  id: string;
  label: string;
  description: string;
};

export type DeskTileDefinition = {
  id: string;
  label: string;
  description: string;
  scope: DeskWidgetScope;
  defaultLayout?: DeskTileLayout;
  subAppId?: string;
};

export type DeskWidgetDefinition = {
  id: string;
  label: string;
  description: string;
  scope: DeskWidgetScope;
  subAppId?: string;
};

export type DeskFocusTemplateDefinition = {
  id: string;
  label: string;
  description: string;
  layout: DeskTileLayout;
};

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
  deskSections?: string[];
  subApps?: SubAppDefinition[];
  tiles?: DeskTileDefinition[];
  widgets?: DeskWidgetDefinition[];
  focusTemplates?: DeskFocusTemplateDefinition[];
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
