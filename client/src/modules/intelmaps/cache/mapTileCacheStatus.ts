import { isMapTileCacheEnabled, MAP_TILE_CACHE_NAME } from './mapTileCachePolicy';

export type MapTileCacheStatus = {
  supported: boolean;
  enabled: boolean;
  cacheName: string;
  entries: number;
  mode: 'unsupported' | 'disabled' | 'direct-cache';
};

export async function getMapTileCacheStatus(): Promise<MapTileCacheStatus> {
  const supported = typeof window !== 'undefined' && 'caches' in window;
  const enabled = isMapTileCacheEnabled();

  if (!supported) {
    return {
      supported,
      enabled: false,
      cacheName: MAP_TILE_CACHE_NAME,
      entries: 0,
      mode: 'unsupported',
    };
  }

  const cache = await caches.open(MAP_TILE_CACHE_NAME);
  const entries = (await cache.keys()).length;

  return {
    supported,
    enabled,
    cacheName: MAP_TILE_CACHE_NAME,
    entries,
    mode: enabled ? 'direct-cache' : 'disabled',
  };
}
