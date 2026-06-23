import type { FlightProvider, ProviderSnapshot } from './provider.types';

export class OpenSkyClient implements FlightProvider {
  async snapshot(regionIds: string[] = []): Promise<ProviderSnapshot> {
    const params = new URLSearchParams();
    params.set('regions', regionIds.join(','));
    const res = await fetch(`/api/flights/snapshot?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`OpenSky proxy error: ${res.status}`);
    }
    const data = await res.json();
    return {
      states: data.states || [],
      timestamp: data.timestamp || Date.now(),
      provider: data.provider,
      live: data.live,
    };
  }

  async track(icao24: string): Promise<unknown> {
    const res = await fetch(`/api/flights/track/${icao24}`);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`OpenSky track error: ${res.status}`);
    }
    return await res.json();
  }
}
