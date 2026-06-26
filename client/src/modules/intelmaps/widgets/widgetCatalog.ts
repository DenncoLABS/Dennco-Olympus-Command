import type { IntelWidgetDefinition } from '../registry/types';

export const intelMapWidgets: IntelWidgetDefinition[] = [
  {
    id: 'aircraft-database',
    title: 'Aircraft Database',
    description: 'Movable aircraft database browser widget that can return to the Olympus Dock.',
    placement: 'map',
    appIds: ['flights'],
    defaultOpen: true,
    returnsToDock: true,
  },
  {
    id: 'flight-target-detail',
    title: 'Flight Target Detail',
    description: 'Selected aircraft detail and interaction panel.',
    placement: 'map',
    appIds: ['flights'],
    defaultOpen: false,
    returnsToDock: false,
  },
  {
    id: 'map-layer-control',
    title: 'Map Layer Control',
    description: 'Base layer, projection, and overlay control widget.',
    placement: 'map',
    appIds: ['flights', 'maritime', 'monitor', 'dot', 'cyber'],
    defaultOpen: true,
    returnsToDock: false,
  },
];

export function getIntelMapWidget(id: string) {
  return intelMapWidgets.find((widget) => widget.id === id);
}
