import type { AircraftState } from '../../modules/flights/lib/flights.types';

// Snapshot metadata is used by the flight status bar and package rebuild validation.
export interface ProviderSnapshot {
  states: AircraftState[];
  timestamp: number;
  provider?: string;
  live?: boolean;
}

export interface FlightProvider {
  snapshot(regionIds?: string[]): Promise<ProviderSnapshot>;
  track(icao24: string): Promise<unknown>;
}
