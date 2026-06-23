import type { AircraftState } from '../../modules/flights/lib/flights.types';

export interface ProviderSnapshot {
  states: AircraftState[];
  timestamp: number;
  provider?: string;
  live?: boolean;
}

export interface FlightProvider {
  snapshot(): Promise<ProviderSnapshot>;
  track(icao24: string): Promise<unknown>;
}
