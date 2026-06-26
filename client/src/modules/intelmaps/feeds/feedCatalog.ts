import type { IntelFeedDefinition } from '../registry/types';

export const intelMapFeeds: IntelFeedDefinition[] = [
  {
    id: 'flight-snapshot',
    title: 'Flight Snapshot',
    kind: 'rest',
    description: 'Shared flight entity feed used by maps that opt into aviation layers.',
    route: '/api/flights/snapshot',
    cachePolicy: 'last-good',
    sharedAcrossMaps: true,
  },
  {
    id: 'aircraft-database',
    title: 'Aircraft Database',
    kind: 'rest',
    description: 'Aircraft database search and lookup feed for map widgets and tools.',
    route: '/api/flights/aircraft-db',
    cachePolicy: 'persistent',
    sharedAcrossMaps: true,
  },
  {
    id: 'weather-feed',
    title: 'Weather Feed',
    kind: 'computed',
    description: 'Weather overlay feed abstraction for reusable map layers.',
    cachePolicy: 'session',
    sharedAcrossMaps: true,
  },
];

export function getIntelMapFeed(id: string) {
  return intelMapFeeds.find((feed) => feed.id === id);
}
