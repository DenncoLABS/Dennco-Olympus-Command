export type AirportPin = {
  id: string;
  code: string;
  name: string;
  kind: 'airport' | 'airbase';
  lat: number;
  lon: number;
};

export type RadarRegionPin = {
  id: string;
  label: string;
  shortLabel: string;
  lat: number;
  lon: number;
  radiusNm: number;
  scope: 'US' | 'International';
};

export const AIRPORT_PINS: AirportPin[] = [
  { id: 'kjfk', code: 'JFK', name: 'John F. Kennedy International', kind: 'airport', lat: 40.6413, lon: -73.7781 },
  { id: 'klga', code: 'LGA', name: 'LaGuardia', kind: 'airport', lat: 40.7769, lon: -73.874 },
  { id: 'kewr', code: 'EWR', name: 'Newark Liberty International', kind: 'airport', lat: 40.6895, lon: -74.1745 },
  { id: 'kiad', code: 'IAD', name: 'Washington Dulles International', kind: 'airport', lat: 38.9531, lon: -77.4565 },
  { id: 'kdca', code: 'DCA', name: 'Ronald Reagan Washington National', kind: 'airport', lat: 38.8512, lon: -77.0402 },
  { id: 'kord', code: 'ORD', name: 'Chicago O’Hare International', kind: 'airport', lat: 41.9742, lon: -87.9073 },
  { id: 'katl', code: 'ATL', name: 'Hartsfield-Jackson Atlanta International', kind: 'airport', lat: 33.6407, lon: -84.4277 },
  { id: 'kdfw', code: 'DFW', name: 'Dallas/Fort Worth International', kind: 'airport', lat: 32.8998, lon: -97.0403 },
  { id: 'kiah', code: 'IAH', name: 'George Bush Intercontinental', kind: 'airport', lat: 29.9902, lon: -95.3368 },
  { id: 'kden', code: 'DEN', name: 'Denver International', kind: 'airport', lat: 39.8561, lon: -104.6737 },
  { id: 'klax', code: 'LAX', name: 'Los Angeles International', kind: 'airport', lat: 33.9416, lon: -118.4085 },
  { id: 'ksfo', code: 'SFO', name: 'San Francisco International', kind: 'airport', lat: 37.6213, lon: -122.379 },
  { id: 'ksea', code: 'SEA', name: 'Seattle-Tacoma International', kind: 'airport', lat: 47.4502, lon: -122.3088 },
  { id: 'kmia', code: 'MIA', name: 'Miami International', kind: 'airport', lat: 25.7959, lon: -80.287 },
  { id: 'kdtw', code: 'DTW', name: 'Detroit Metro Wayne County', kind: 'airport', lat: 42.2162, lon: -83.3554 },
  { id: 'kgrr', code: 'GRR', name: 'Gerald R. Ford International', kind: 'airport', lat: 42.8808, lon: -85.5228 },
  { id: 'kmkg', code: 'MKG', name: 'Muskegon County', kind: 'airport', lat: 43.1695, lon: -86.2382 },
  { id: 'ktpa', code: 'TPA', name: 'Tampa International', kind: 'airport', lat: 27.9755, lon: -82.5332 },
  { id: 'kclt', code: 'CLT', name: 'Charlotte Douglas International', kind: 'airport', lat: 35.214, lon: -80.9431 },
  { id: 'egll', code: 'LHR', name: 'London Heathrow', kind: 'airport', lat: 51.47, lon: -0.4543 },
  { id: 'lfpg', code: 'CDG', name: 'Paris Charles de Gaulle', kind: 'airport', lat: 49.0097, lon: 2.5479 },
  { id: 'eddf', code: 'FRA', name: 'Frankfurt Airport', kind: 'airport', lat: 50.0379, lon: 8.5622 },
  { id: 'rjtt', code: 'HND', name: 'Tokyo Haneda', kind: 'airport', lat: 35.5494, lon: 139.7798 },
  { id: 'yssy', code: 'SYD', name: 'Sydney Kingsford Smith', kind: 'airport', lat: -33.9399, lon: 151.1753 },
  { id: 'kand', code: 'ADW', name: 'Joint Base Andrews', kind: 'airbase', lat: 38.8108, lon: -76.867 },
  { id: 'kdov', code: 'DOV', name: 'Dover Air Force Base', kind: 'airbase', lat: 39.1295, lon: -75.466 },
  { id: 'kwri', code: 'WRI', name: 'Joint Base McGuire-Dix-Lakehurst', kind: 'airbase', lat: 40.0156, lon: -74.5917 },
  { id: 'kffo', code: 'FFO', name: 'Wright-Patterson Air Force Base', kind: 'airbase', lat: 39.8261, lon: -84.0483 },
  { id: 'kngr', code: 'NGA', name: 'Selfridge Air National Guard Base', kind: 'airbase', lat: 42.6083, lon: -82.8355 },
  { id: 'koff', code: 'OFF', name: 'Offutt Air Force Base', kind: 'airbase', lat: 41.1183, lon: -95.9125 },
  { id: 'ktik', code: 'TIK', name: 'Tinker Air Force Base', kind: 'airbase', lat: 35.4147, lon: -97.3866 },
  { id: 'ksuu', code: 'SUU', name: 'Travis Air Force Base', kind: 'airbase', lat: 38.2627, lon: -121.9275 },
  { id: 'klsv', code: 'LSV', name: 'Nellis Air Force Base', kind: 'airbase', lat: 36.2362, lon: -115.0343 },
  { id: 'klfi', code: 'LFI', name: 'Joint Base Langley-Eustis', kind: 'airbase', lat: 37.0829, lon: -76.3605 },
  { id: 'kchs', code: 'CHS', name: 'Joint Base Charleston', kind: 'airbase', lat: 32.8986, lon: -80.0405 },
  { id: 'khst', code: 'HST', name: 'Homestead Air Reserve Base', kind: 'airbase', lat: 25.4886, lon: -80.3836 },
  { id: 'kpam', code: 'PAM', name: 'Tyndall Air Force Base', kind: 'airbase', lat: 30.0696, lon: -85.5754 },
  { id: 'kdnk', code: 'DNA', name: 'Cannon Air Force Base', kind: 'airbase', lat: 34.3828, lon: -103.3221 },
  { id: 'kbab', code: 'BAB', name: 'Beale Air Force Base', kind: 'airbase', lat: 39.1361, lon: -121.4366 },
  { id: 'kedt', code: 'EDW', name: 'Edwards Air Force Base', kind: 'airbase', lat: 34.9054, lon: -117.8837 },
  { id: 'kdlh', code: 'DLF', name: 'Laughlin Air Force Base', kind: 'airbase', lat: 29.3595, lon: -100.7779 },
  { id: 'kffb', code: 'FBG', name: 'Fort Bragg / Simmons Army Airfield', kind: 'airbase', lat: 35.1318, lon: -78.9367 },
  { id: 'phik', code: 'HIK', name: 'Joint Base Pearl Harbor-Hickam', kind: 'airbase', lat: 21.3187, lon: -157.9225 },
  { id: 'pafb', code: 'EDF', name: 'Joint Base Elmendorf-Richardson', kind: 'airbase', lat: 61.251, lon: -149.8065 },
  { id: 'egun', code: 'MHZ', name: 'RAF Mildenhall', kind: 'airbase', lat: 52.3619, lon: 0.4864 },
  { id: 'egul', code: 'LKZ', name: 'RAF Lakenheath', kind: 'airbase', lat: 52.4093, lon: 0.561 },
  { id: 'rjty', code: 'OKO', name: 'Yokota Air Base', kind: 'airbase', lat: 35.7485, lon: 139.3485 },
  { id: 'rjoa', code: 'DNA', name: 'Kadena Air Base', kind: 'airbase', lat: 26.3556, lon: 127.7676 },
];

export const RADAR_REGIONS: RadarRegionPin[] = [
  { id: 'northeast', label: 'Northeast Corridor', shortLabel: 'NE', lat: 40.8, lon: -74.2, radiusNm: 250, scope: 'US' },
  { id: 'mid-atlantic', label: 'Mid-Atlantic / DC', shortLabel: 'DC', lat: 38.9, lon: -77.2, radiusNm: 250, scope: 'US' },
  { id: 'southeast', label: 'Southeast Atlanta', shortLabel: 'SE', lat: 33.6, lon: -84.4, radiusNm: 250, scope: 'US' },
  { id: 'florida', label: 'Florida Peninsula', shortLabel: 'FL', lat: 27.7, lon: -81.7, radiusNm: 250, scope: 'US' },
  { id: 'great-lakes', label: 'Great Lakes / Detroit-Chicago', shortLabel: 'GL', lat: 42.7, lon: -84.9, radiusNm: 250, scope: 'US' },
  { id: 'texas-gulf', label: 'Texas / Gulf Coast', shortLabel: 'TX', lat: 31.3, lon: -97.0, radiusNm: 250, scope: 'US' },
  { id: 'central', label: 'Central Plains', shortLabel: 'CP', lat: 39.1, lon: -95.7, radiusNm: 250, scope: 'US' },
  { id: 'rockies', label: 'Rocky Mountain Corridor', shortLabel: 'RM', lat: 39.8, lon: -104.7, radiusNm: 250, scope: 'US' },
  { id: 'southwest', label: 'Southwest / Los Angeles', shortLabel: 'SW', lat: 34.0, lon: -118.2, radiusNm: 250, scope: 'US' },
  { id: 'pacific-nw', label: 'Pacific Northwest', shortLabel: 'PNW', lat: 47.5, lon: -122.3, radiusNm: 250, scope: 'US' },
  { id: 'alaska', label: 'Alaska Anchorage', shortLabel: 'AK', lat: 61.2, lon: -149.9, radiusNm: 250, scope: 'US' },
  { id: 'hawaii', label: 'Hawaii / Pacific', shortLabel: 'HI', lat: 21.3, lon: -157.9, radiusNm: 250, scope: 'US' },
  { id: 'uk-ireland', label: 'United Kingdom / Ireland', shortLabel: 'UK', lat: 52.0, lon: -1.5, radiusNm: 250, scope: 'International' },
  { id: 'western-europe', label: 'Western Europe', shortLabel: 'EUW', lat: 49.8, lon: 5.5, radiusNm: 250, scope: 'International' },
  { id: 'japan-korea', label: 'Japan / Korea', shortLabel: 'JPN', lat: 35.7, lon: 139.7, radiusNm: 250, scope: 'International' },
  { id: 'australia-east', label: 'Australia East Coast', shortLabel: 'AUS', lat: -33.9, lon: 151.2, radiusNm: 250, scope: 'International' },
];

export const DEFAULT_ACTIVE_RADAR_REGION_IDS = ['northeast', 'great-lakes', 'southeast', 'texas-gulf', 'southwest', 'pacific-nw'];

export function airportPinsGeoJSON() {
  return {
    type: 'FeatureCollection' as const,
    features: AIRPORT_PINS.map((pin) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [pin.lon, pin.lat] },
      properties: pin,
    })),
  };
}

export function radarPinsGeoJSON(activeIds: string[] = []) {
  return {
    type: 'FeatureCollection' as const,
    features: RADAR_REGIONS.map((region) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [region.lon, region.lat] },
      properties: { ...region, active: activeIds.includes(region.id) },
    })),
  };
}

function destinationPoint(lon: number, lat: number, bearingDeg: number, distanceNm: number): [number, number] {
  const earthRadiusNm = 3440.065;
  const angularDistance = distanceNm / earthRadiusNm;
  const bearing = (bearingDeg * Math.PI) / 180;
  const lat1 = (lat * Math.PI) / 180;
  const lon1 = (lon * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing),
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2),
    );

  return [((lon2 * 180) / Math.PI + 540) % 360 - 180, (lat2 * 180) / Math.PI];
}

export function activeRadarZonesGeoJSON(activeIds: string[]) {
  const active = RADAR_REGIONS.filter((region) => activeIds.includes(region.id));
  return {
    type: 'FeatureCollection' as const,
    features: active.map((region) => {
      const coordinates = Array.from({ length: 97 }, (_, index) =>
        destinationPoint(region.lon, region.lat, (index / 96) * 360, region.radiusNm),
      );
      return {
        type: 'Feature' as const,
        geometry: { type: 'Polygon' as const, coordinates: [[...coordinates, coordinates[0]]] },
        properties: region,
      };
    }),
  };
}

export function activeRadarSweepsGeoJSON(activeIds: string[], sweepDeg: number) {
  const active = RADAR_REGIONS.filter((region) => activeIds.includes(region.id));
  return {
    type: 'FeatureCollection' as const,
    features: active.map((region) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: [[region.lon, region.lat], destinationPoint(region.lon, region.lat, sweepDeg, region.radiusNm)],
      },
      properties: region,
    })),
  };
}
