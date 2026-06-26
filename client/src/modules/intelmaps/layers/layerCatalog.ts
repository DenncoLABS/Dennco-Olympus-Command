import type { IntelLayerDefinition } from '../registry/types';

export const intelMapLayers: IntelLayerDefinition[] = [
  {
    id: 'aircraft-live',
    title: 'Aircraft Live',
    kind: 'entity',
    description: 'Reusable aircraft entity layer for saved maps and existing flight map views.',
    appIds: ['flights'],
    feedIds: ['flight-snapshot'],
    defaultEnabled: true,
    userConfigurable: true,
  },
  {
    id: 'weather-overlay',
    title: 'Weather Overlay',
    kind: 'weather',
    description: 'Reusable weather layer for map compositions.',
    appIds: ['flights', 'maritime', 'monitor'],
    feedIds: ['weather-feed'],
    defaultEnabled: false,
    userConfigurable: true,
  },
  {
    id: 'infrastructure-points',
    title: 'Infrastructure Points',
    kind: 'infrastructure',
    description: 'Reusable point layer for airports, stations, bases, ports, and other map facilities.',
    appIds: ['flights', 'maritime', 'monitor', 'dot'],
    defaultEnabled: true,
    userConfigurable: true,
  },
];

export function getIntelMapLayer(id: string) {
  return intelMapLayers.find((layer) => layer.id === id);
}
