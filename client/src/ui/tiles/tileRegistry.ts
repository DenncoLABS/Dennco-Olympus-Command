export type TileKind = 'app' | 'group' | 'widget';
export type TileLayout = 'single' | 'split' | 'quad';

export type TileRegistryItem = {
  id: string;
  appId: string;
  label: string;
  kind: TileKind;
  layout: TileLayout;
  description: string;
  children?: string[];
};

export const tileRegistry: TileRegistryItem[] = [
  {
    id: 'intelmaps-flight',
    appId: 'intelmaps',
    label: 'Flight Map',
    kind: 'app',
    layout: 'single',
    description: 'Aircraft and aviation infrastructure tile runtime.'
  },
  {
    id: 'intelmaps-maritime',
    appId: 'intelmaps',
    label: 'Maritime Map',
    kind: 'app',
    layout: 'single',
    description: 'AIS vessel and maritime infrastructure tile runtime.'
  },
  {
    id: 'intelmaps-dot',
    appId: 'intelmaps',
    label: 'DOT Map',
    kind: 'app',
    layout: 'single',
    description: 'Traffic and roadway operations tile runtime.'
  },
  {
    id: 'intelmaps-monitor',
    appId: 'intelmaps',
    label: 'Monitor Map',
    kind: 'app',
    layout: 'single',
    description: 'Monitoring and alert intelligence tile runtime.'
  },
  {
    id: 'intelmaps-quad',
    appId: 'intelmaps',
    label: 'Intel Maps Quad',
    kind: 'group',
    layout: 'quad',
    description: 'Four-tile Intel Maps proof group.',
    children: ['intelmaps-flight', 'intelmaps-maritime', 'intelmaps-dot', 'intelmaps-monitor']
  }
];

export function getTileRegistryItem(id: string) {
  return tileRegistry.find((item) => item.id === id);
}

export function getTilesForApp(appId: string) {
  return tileRegistry.filter((item) => item.appId === appId);
}
