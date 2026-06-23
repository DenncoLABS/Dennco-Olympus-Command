export type RadarRegion = {
  id: string;
  label: string;
  shortLabel: string;
  lat: number;
  lon: number;
  radiusKm: number;
  scope: 'US' | 'GLOBAL';
  feedPoint: string;
};

export type AirportPin = {
  id: string;
  label: string;
  code: string;
  lat: number;
  lon: number;
  kind: 'civil' | 'military' | 'joint';
  regionId?: string;
};

export const radarRegions: RadarRegion[] = [
  { id: 'us-great-lakes', label: 'Great Lakes / Midwest', shortLabel: 'GL-MW', lat: 42.2162, lon: -83.3554, radiusKm: 463, scope: 'US', feedPoint: '42.2162,-83.3554,250' },
  { id: 'us-northeast', label: 'Northeast Corridor', shortLabel: 'NE', lat: 40.6413, lon: -73.7781, radiusKm: 463, scope: 'US', feedPoint: '40.6413,-73.7781,250' },
  { id: 'us-mid-atlantic', label: 'D.C. / Mid-Atlantic', shortLabel: 'DC-MA', lat: 38.9531, lon: -77.4565, radiusKm: 463, scope: 'US', feedPoint: '38.9531,-77.4565,250' },
  { id: 'us-southeast', label: 'Southeast / Atlanta', shortLabel: 'SE', lat: 33.6407, lon: -84.4277, radiusKm: 463, scope: 'US', feedPoint: '33.6407,-84.4277,250' },
  { id: 'us-florida', label: 'Florida / Caribbean Gateway', shortLabel: 'FL', lat: 25.7959, lon: -80.2870, radiusKm: 463, scope: 'US', feedPoint: '25.7959,-80.2870,250' },
  { id: 'us-gulf', label: 'Gulf Coast / Houston', shortLabel: 'GULF', lat: 29.9902, lon: -95.3368, radiusKm: 463, scope: 'US', feedPoint: '29.9902,-95.3368,250' },
  { id: 'us-texas-central', label: 'Texas / Central South', shortLabel: 'TX', lat: 32.8998, lon: -97.0403, radiusKm: 463, scope: 'US', feedPoint: '32.8998,-97.0403,250' },
  { id: 'us-central', label: 'Central Plains', shortLabel: 'CPLN', lat: 39.2976, lon: -94.7139, radiusKm: 463, scope: 'US', feedPoint: '39.2976,-94.7139,250' },
  { id: 'us-mountain', label: 'Rocky Mountain / Denver', shortLabel: 'RMD', lat: 39.8561, lon: -104.6737, radiusKm: 463, scope: 'US', feedPoint: '39.8561,-104.6737,250' },
  { id: 'us-southwest', label: 'Southwest / Los Angeles', shortLabel: 'SW', lat: 34.0522, lon: -118.2437, radiusKm: 463, scope: 'US', feedPoint: '34.0522,-118.2437,250' },
  { id: 'us-pacific', label: 'Pacific Coast / Bay Area', shortLabel: 'PAC', lat: 37.6213, lon: -122.3790, radiusKm: 463, scope: 'US', feedPoint: '37.6213,-122.3790,250' },
  { id: 'us-northwest', label: 'Pacific Northwest', shortLabel: 'PNW', lat: 47.4502, lon: -122.3088, radiusKm: 463, scope: 'US', feedPoint: '47.4502,-122.3088,250' },
  { id: 'eu-west', label: 'Western Europe', shortLabel: 'EU-W', lat: 51.4700, lon: -0.4543, radiusKm: 463, scope: 'GLOBAL', feedPoint: '51.4700,-0.4543,250' },
  { id: 'eu-central', label: 'Central Europe', shortLabel: 'EU-C', lat: 50.0379, lon: 8.5622, radiusKm: 463, scope: 'GLOBAL', feedPoint: '50.0379,8.5622,250' },
  { id: 'asia-japan', label: 'Japan / Tokyo', shortLabel: 'JPN', lat: 35.6762, lon: 139.6503, radiusKm: 463, scope: 'GLOBAL', feedPoint: '35.6762,139.6503,250' },
  { id: 'aus-east', label: 'Eastern Australia', shortLabel: 'AUS', lat: -33.8688, lon: 151.2093, radiusKm: 463, scope: 'GLOBAL', feedPoint: '-33.8688,151.2093,250' },
];

export const airportPins: AirportPin[] = [
  { id: 'dtw', label: 'Detroit Metro Wayne County', code: 'DTW', lat: 42.2162, lon: -83.3554, kind: 'civil', regionId: 'us-great-lakes' },
  { id: 'selfridge', label: 'Selfridge Air National Guard Base', code: 'MTC', lat: 42.6135, lon: -82.8369, kind: 'military', regionId: 'us-great-lakes' },
  { id: 'wright-patterson', label: 'Wright-Patterson Air Force Base', code: 'FFO', lat: 39.8261, lon: -84.0483, kind: 'military', regionId: 'us-great-lakes' },
  { id: 'ohare', label: "Chicago O'Hare", code: 'ORD', lat: 41.9742, lon: -87.9073, kind: 'civil', regionId: 'us-great-lakes' },
  { id: 'jfk', label: 'John F. Kennedy International', code: 'JFK', lat: 40.6413, lon: -73.7781, kind: 'civil', regionId: 'us-northeast' },
  { id: 'laguardia', label: 'LaGuardia', code: 'LGA', lat: 40.7769, lon: -73.8740, kind: 'civil', regionId: 'us-northeast' },
  { id: 'andrews', label: 'Joint Base Andrews', code: 'ADW', lat: 38.8108, lon: -76.8669, kind: 'joint', regionId: 'us-mid-atlantic' },
  { id: 'dulles', label: 'Washington Dulles', code: 'IAD', lat: 38.9531, lon: -77.4565, kind: 'civil', regionId: 'us-mid-atlantic' },
  { id: 'langley', label: 'Joint Base Langley-Eustis', code: 'LFI', lat: 37.0829, lon: -76.3605, kind: 'military', regionId: 'us-mid-atlantic' },
  { id: 'atlanta', label: 'Hartsfield-Jackson Atlanta', code: 'ATL', lat: 33.6407, lon: -84.4277, kind: 'civil', regionId: 'us-southeast' },
  { id: 'charleston-afb', label: 'Joint Base Charleston', code: 'CHS', lat: 32.8986, lon: -80.0405, kind: 'joint', regionId: 'us-southeast' },
  { id: 'miami', label: 'Miami International', code: 'MIA', lat: 25.7959, lon: -80.2870, kind: 'civil', regionId: 'us-florida' },
  { id: 'macdill', label: 'MacDill Air Force Base', code: 'MCF', lat: 27.8493, lon: -82.5212, kind: 'military', regionId: 'us-florida' },
  { id: 'houston', label: 'George Bush Intercontinental', code: 'IAH', lat: 29.9902, lon: -95.3368, kind: 'civil', regionId: 'us-gulf' },
  { id: 'barksdale', label: 'Barksdale Air Force Base', code: 'BAD', lat: 32.5018, lon: -93.6627, kind: 'military', regionId: 'us-gulf' },
  { id: 'dfw', label: 'Dallas/Fort Worth International', code: 'DFW', lat: 32.8998, lon: -97.0403, kind: 'civil', regionId: 'us-texas-central' },
  { id: 'lackland', label: 'Joint Base San Antonio-Lackland', code: 'SKF', lat: 29.3842, lon: -98.5811, kind: 'military', regionId: 'us-texas-central' },
  { id: 'kansas-city', label: 'Kansas City International', code: 'MCI', lat: 39.2976, lon: -94.7139, kind: 'civil', regionId: 'us-central' },
  { id: 'offutt', label: 'Offutt Air Force Base', code: 'OFF', lat: 41.1183, lon: -95.9125, kind: 'military', regionId: 'us-central' },
  { id: 'denver', label: 'Denver International', code: 'DEN', lat: 39.8561, lon: -104.6737, kind: 'civil', regionId: 'us-mountain' },
  { id: 'peterson', label: 'Peterson Space Force Base', code: 'COS', lat: 38.8230, lon: -104.6950, kind: 'military', regionId: 'us-mountain' },
  { id: 'lax', label: 'Los Angeles International', code: 'LAX', lat: 33.9416, lon: -118.4085, kind: 'civil', regionId: 'us-southwest' },
  { id: 'edwards', label: 'Edwards Air Force Base', code: 'EDW', lat: 34.9054, lon: -117.8837, kind: 'military', regionId: 'us-southwest' },
  { id: 'sfo', label: 'San Francisco International', code: 'SFO', lat: 37.6213, lon: -122.3790, kind: 'civil', regionId: 'us-pacific' },
  { id: 'travis', label: 'Travis Air Force Base', code: 'SUU', lat: 38.2627, lon: -121.9275, kind: 'military', regionId: 'us-pacific' },
  { id: 'seatac', label: 'Seattle-Tacoma International', code: 'SEA', lat: 47.4502, lon: -122.3088, kind: 'civil', regionId: 'us-northwest' },
  { id: 'joint-base-lewis-mcchord', label: 'Joint Base Lewis-McChord', code: 'TCM', lat: 47.1377, lon: -122.4765, kind: 'military', regionId: 'us-northwest' },
  { id: 'heathrow', label: 'London Heathrow', code: 'LHR', lat: 51.4700, lon: -0.4543, kind: 'civil', regionId: 'eu-west' },
  { id: 'frankfurt', label: 'Frankfurt Airport', code: 'FRA', lat: 50.0379, lon: 8.5622, kind: 'civil', regionId: 'eu-central' },
  { id: 'tokyo-haneda', label: 'Tokyo Haneda', code: 'HND', lat: 35.5494, lon: 139.7798, kind: 'civil', regionId: 'asia-japan' },
  { id: 'yokota', label: 'Yokota Air Base', code: 'OKO', lat: 35.7485, lon: 139.3485, kind: 'military', regionId: 'asia-japan' },
  { id: 'sydney', label: 'Sydney Kingsford Smith', code: 'SYD', lat: -33.9399, lon: 151.1753, kind: 'civil', regionId: 'aus-east' },
];

function destinationPoint(lat: number, lon: number, distanceKm: number, bearingDeg: number): [number, number] {
  const earthRadiusKm = 6371;
  const angular = distanceKm / earthRadiusKm;
  const bearing = (bearingDeg * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;

  const nextLat = Math.asin(
    Math.sin(latRad) * Math.cos(angular) + Math.cos(latRad) * Math.sin(angular) * Math.cos(bearing),
  );
  const nextLon =
    lonRad +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angular) * Math.cos(latRad),
      Math.cos(angular) - Math.sin(latRad) * Math.sin(nextLat),
    );

  return [((nextLon * 180) / Math.PI + 540) % 360 - 180, (nextLat * 180) / Math.PI];
}

function circlePolygon(region: RadarRegion, steps = 96) {
  const coordinates: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    coordinates.push(destinationPoint(region.lat, region.lon, region.radiusKm, (i / steps) * 360));
  }
  return coordinates;
}

export function radarRegionsToPointGeoJSON(activeIds: string[]) {
  const active = new Set(activeIds);
  return {
    type: 'FeatureCollection' as const,
    features: radarRegions.map((region) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [region.lon, region.lat] },
      properties: { ...region, active: active.has(region.id) },
    })),
  };
}

export function airportsToPointGeoJSON() {
  return {
    type: 'FeatureCollection' as const,
    features: airportPins.map((airport) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [airport.lon, airport.lat] },
      properties: airport,
    })),
  };
}

export function activeRadarZonesToGeoJSON(activeIds: string[]) {
  const active = new Set(activeIds);
  return {
    type: 'FeatureCollection' as const,
    features: radarRegions
      .filter((region) => active.has(region.id))
      .map((region) => ({
        type: 'Feature' as const,
        geometry: { type: 'Polygon' as const, coordinates: [circlePolygon(region)] },
        properties: { ...region },
      })),
  };
}

export function activeRadarSweepsToGeoJSON(activeIds: string[], tick: number) {
  const active = new Set(activeIds);
  const bearing = (tick / 35) % 360;
  return {
    type: 'FeatureCollection' as const,
    features: radarRegions
      .filter((region) => active.has(region.id))
      .map((region) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'LineString' as const,
          coordinates: [[region.lon, region.lat], destinationPoint(region.lat, region.lon, region.radiusKm, bearing)],
        },
        properties: { ...region, bearing },
      })),
  };
}

export function feedPointsForRegions(activeIds: string[]) {
  const active = new Set(activeIds);
  return radarRegions.filter((region) => active.has(region.id)).map((region) => region.feedPoint);
}
