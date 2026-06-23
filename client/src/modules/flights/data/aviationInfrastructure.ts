export type AirportPin = {
  id: string;
  code: string;
  name: string;
  kind: 'airport';
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
  scope: 'US' | 'Canada' | 'International';
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
];

export const RADAR_REGIONS: RadarRegionPin[] = [
  { id: 'northeast', label: 'Northeast Corridor', shortLabel: 'NE', lat: 40.8, lon: -74.2, radiusNm: 250, scope: 'US' },
  { id: 'new-england', label: 'New England', shortLabel: 'NENG', lat: 42.3, lon: -71.0, radiusNm: 250, scope: 'US' },
  { id: 'mid-atlantic', label: 'Mid-Atlantic / DC', shortLabel: 'DC', lat: 38.9, lon: -77.2, radiusNm: 250, scope: 'US' },
  { id: 'carolinas', label: 'Carolinas', shortLabel: 'CAR', lat: 35.2, lon: -80.9, radiusNm: 250, scope: 'US' },
  { id: 'southeast', label: 'Southeast Atlanta', shortLabel: 'SE', lat: 33.6, lon: -84.4, radiusNm: 250, scope: 'US' },
  { id: 'florida', label: 'Florida Peninsula', shortLabel: 'FL', lat: 27.7, lon: -81.7, radiusNm: 250, scope: 'US' },
  { id: 'great-lakes', label: 'Great Lakes / Detroit-Chicago', shortLabel: 'GL', lat: 42.7, lon: -84.9, radiusNm: 250, scope: 'US' },
  { id: 'upper-midwest', label: 'Upper Midwest', shortLabel: 'UMW', lat: 44.9, lon: -93.2, radiusNm: 250, scope: 'US' },
  { id: 'central-plains', label: 'Central Plains', shortLabel: 'CP', lat: 39.1, lon: -95.7, radiusNm: 250, scope: 'US' },
  { id: 'lower-plains', label: 'Lower Plains / Oklahoma', shortLabel: 'LP', lat: 35.5, lon: -97.5, radiusNm: 250, scope: 'US' },
  { id: 'texas-gulf', label: 'Texas / Gulf Coast', shortLabel: 'TX', lat: 31.3, lon: -97.0, radiusNm: 250, scope: 'US' },
  { id: 'south-texas', label: 'South Texas', shortLabel: 'STX', lat: 29.4, lon: -98.5, radiusNm: 250, scope: 'US' },
  { id: 'rockies', label: 'Rocky Mountain Corridor', shortLabel: 'RM', lat: 39.8, lon: -104.7, radiusNm: 250, scope: 'US' },
  { id: 'northern-rockies', label: 'Northern Rockies', shortLabel: 'NRM', lat: 45.8, lon: -108.5, radiusNm: 250, scope: 'US' },
  { id: 'southwest', label: 'Southwest / Los Angeles', shortLabel: 'SW', lat: 34.0, lon: -118.2, radiusNm: 250, scope: 'US' },
  { id: 'desert-southwest', label: 'Desert Southwest / Phoenix', shortLabel: 'DSW', lat: 33.4, lon: -112.1, radiusNm: 250, scope: 'US' },
  { id: 'bay-area', label: 'Bay Area / Northern California', shortLabel: 'BAY', lat: 37.6, lon: -122.3, radiusNm: 250, scope: 'US' },
  { id: 'pacific-nw', label: 'Pacific Northwest', shortLabel: 'PNW', lat: 47.5, lon: -122.3, radiusNm: 250, scope: 'US' },
  { id: 'alaska', label: 'Alaska Anchorage', shortLabel: 'AK', lat: 61.2, lon: -149.9, radiusNm: 250, scope: 'US' },
  { id: 'hawaii', label: 'Hawaii / Pacific', shortLabel: 'HI', lat: 21.3, lon: -157.9, radiusNm: 250, scope: 'US' },
  { id: 'bc-vancouver', label: 'British Columbia / Vancouver', shortLabel: 'BC', lat: 49.2, lon: -123.1, radiusNm: 250, scope: 'Canada' },
  { id: 'alberta-prairie', label: 'Alberta / Prairie West', shortLabel: 'AB', lat: 51.0, lon: -114.1, radiusNm: 250, scope: 'Canada' },
  { id: 'manitoba-ontario', label: 'Manitoba / Ontario West', shortLabel: 'MB', lat: 49.9, lon: -97.1, radiusNm: 250, scope: 'Canada' },
  { id: 'ontario-quebec', label: 'Ontario / Quebec Corridor', shortLabel: 'ON', lat: 43.7, lon: -79.6, radiusNm: 250, scope: 'Canada' },
  { id: 'atlantic-canada', label: 'Atlantic Canada', shortLabel: 'ATL-C', lat: 44.9, lon: -63.5, radiusNm: 250, scope: 'Canada' },
  { id: 'uk-ireland', label: 'United Kingdom / Ireland', shortLabel: 'UK', lat: 52.0, lon: -1.5, radiusNm: 250, scope: 'International' },
  { id: 'western-europe', label: 'Western Europe', shortLabel: 'EUW', lat: 49.8, lon: 5.5, radiusNm: 250, scope: 'International' },
  { id: 'japan-korea', label: 'Japan / Korea', shortLabel: 'JPN', lat: 35.7, lon: 139.7, radiusNm: 250, scope: 'International' },
  { id: 'australia-east', label: 'Australia East Coast', shortLabel: 'AUS', lat: -33.9, lon: 151.2, radiusNm: 250, scope: 'International' },
];

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

function circleFeature(region: RadarRegionPin, radiusNm: number) {
  const coordinates = Array.from({ length: 97 }, (_, index) =>
    destinationPoint(region.lon, region.lat, (index / 96) * 360, Math.max(1, radiusNm)),
  );
  return {
    type: 'Feature' as const,
    geometry: { type: 'Polygon' as const, coordinates: [[...coordinates, coordinates[0]]] },
    properties: region,
  };
}

export function activeRadarZonesGeoJSON(activeIds: string[]) {
  const active = RADAR_REGIONS.filter((region) => activeIds.includes(region.id));
  return {
    type: 'FeatureCollection' as const,
    features: active.map((region) => circleFeature(region, region.radiusNm)),
  };
}

export function activeRadarPulseGeoJSON(activeIds: string[], sweepDeg: number) {
  const active = RADAR_REGIONS.filter((region) => activeIds.includes(region.id));
  const radiusFactor = 0.15 + 0.85 * ((sweepDeg % 360) / 360);
  return {
    type: 'FeatureCollection' as const,
    features: active.map((region) => circleFeature(region, region.radiusNm * radiusFactor)),
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
