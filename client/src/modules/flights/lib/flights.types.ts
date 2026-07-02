export interface AircraftAsset {
  assetId: string;
  assetType: 'aircraft';
  folderPath: string;
  databasePath: string;
  label: string;
  details: {
    icao24: string;
    registration?: string;
    manufacturerName?: string;
    model?: string;
    operator?: string;
    typecode?: string;
    built?: string;
  };
  data: {
    identity: Record<string, unknown>;
    telemetry: Record<string, unknown> | null;
    history: unknown[];
    documents: unknown[];
    notes: unknown[];
  };
}

export interface AircraftState {
  icao24: string;
  callsign: string | null;
  lat: number;
  lon: number;
  baroAltitude: number | null;
  geoAltitude: number | null;
  velocity: number | null;
  heading: number | null;
  onGround: boolean;
  lastContact: number;
  originCountry: string | null;
  verticalRate: number | null;
  squawk: string | null;
  spi: boolean;
  positionSource: number;
  category: number;
  registration?: string;
  manufacturerName?: string;
  model?: string;
  operator?: string;
  typecode?: string;
  built?: string;
  enrichmentSource?: string;
  enrichmentConfidence?: number;
  enrichmentUpdatedAt?: number;
  needsEnrichment?: boolean;
  asset?: AircraftAsset;

  // Extended telemetry from ADSB.lol
  mach?: number;
  true_heading?: number;
  mag_heading?: number;
  oat?: number;
  tat?: number;
  roll?: number;
  ias?: number;
  tas?: number;
  wd?: number;
  ws?: number;
  nav_altitude_mcp?: number;
  nav_heading?: number;
  nav_qnh?: number;
  nav_modes?: string[];
  rc?: number;
  rssi?: number;
  emergency?: string;
}
