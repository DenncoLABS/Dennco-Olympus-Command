export type MaritimePortPin = {
  id: string;
  name: string;
  kind: 'commercial-port' | 'civilian-port';
  lat: number;
  lon: number;
};

export type MaritimeInstallationPin = {
  id: string;
  name: string;
  kind: 'coast-guard' | 'navy-base';
  lat: number;
  lon: number;
};

export type MaritimeNode = {
  id: string;
  label: string;
  shortLabel: string;
  lat: number;
  lon: number;
  radiusNm: number;
  scope: 'US' | 'Canada' | 'International';
};

export const MARITIME_PORTS: MaritimePortPin[] = [
  { id: 'port-ny-nj', name: 'Port of New York and New Jersey', kind: 'commercial-port', lat: 40.6681, lon: -74.0451 },
  { id: 'port-boston', name: 'Port of Boston', kind: 'commercial-port', lat: 42.35, lon: -71.05 },
  { id: 'port-norfolk', name: 'Port of Virginia / Norfolk', kind: 'commercial-port', lat: 36.85, lon: -76.29 },
  { id: 'port-charleston', name: 'Port of Charleston', kind: 'commercial-port', lat: 32.78, lon: -79.93 },
  { id: 'port-savannah', name: 'Port of Savannah', kind: 'commercial-port', lat: 32.08, lon: -81.1 },
  { id: 'port-miami', name: 'PortMiami', kind: 'commercial-port', lat: 25.778, lon: -80.177 },
  { id: 'port-everglades', name: 'Port Everglades', kind: 'commercial-port', lat: 26.09, lon: -80.12 },
  { id: 'port-tampa', name: 'Port Tampa Bay', kind: 'commercial-port', lat: 27.94, lon: -82.44 },
  { id: 'port-mobile', name: 'Port of Mobile', kind: 'commercial-port', lat: 30.69, lon: -88.04 },
  { id: 'port-new-orleans', name: 'Port of New Orleans', kind: 'commercial-port', lat: 29.94, lon: -90.06 },
  { id: 'port-houston', name: 'Port Houston', kind: 'commercial-port', lat: 29.73, lon: -95.27 },
  { id: 'port-corpus', name: 'Port of Corpus Christi', kind: 'commercial-port', lat: 27.8, lon: -97.4 },
  { id: 'port-la-lb', name: 'Ports of Los Angeles / Long Beach', kind: 'commercial-port', lat: 33.74, lon: -118.25 },
  { id: 'port-oakland', name: 'Port of Oakland', kind: 'commercial-port', lat: 37.8, lon: -122.29 },
  { id: 'port-seattle-tacoma', name: 'Northwest Seaport Alliance', kind: 'commercial-port', lat: 47.59, lon: -122.35 },
  { id: 'port-anchorage', name: 'Port of Alaska / Anchorage', kind: 'commercial-port', lat: 61.23, lon: -149.89 },
  { id: 'port-honolulu', name: 'Honolulu Harbor', kind: 'commercial-port', lat: 21.31, lon: -157.87 },
  { id: 'port-detroit', name: 'Port of Detroit', kind: 'commercial-port', lat: 42.33, lon: -83.03 },
  { id: 'port-cleveland', name: 'Port of Cleveland', kind: 'commercial-port', lat: 41.5, lon: -81.7 },
  { id: 'port-duluth', name: 'Port of Duluth-Superior', kind: 'commercial-port', lat: 46.78, lon: -92.1 },
  { id: 'port-vancouver', name: 'Port of Vancouver', kind: 'commercial-port', lat: 49.29, lon: -123.1 },
  { id: 'port-montreal', name: 'Port of Montreal', kind: 'commercial-port', lat: 45.5, lon: -73.55 },
  { id: 'port-halifax', name: 'Port of Halifax', kind: 'commercial-port', lat: 44.64, lon: -63.57 },
  { id: 'port-prince-rupert', name: 'Port of Prince Rupert', kind: 'commercial-port', lat: 54.32, lon: -130.32 },
];

export const MARITIME_INSTALLATIONS: MaritimeInstallationPin[] = [
  { id: 'uscg-boston', name: 'USCG Base Boston', kind: 'coast-guard', lat: 42.36, lon: -71.05 },
  { id: 'uscg-new-york', name: 'USCG Sector New York', kind: 'coast-guard', lat: 40.64, lon: -74.07 },
  { id: 'uscg-delaware-bay', name: 'USCG Sector Delaware Bay', kind: 'coast-guard', lat: 39.95, lon: -75.14 },
  { id: 'uscg-hampton-roads', name: 'USCG Sector Virginia', kind: 'coast-guard', lat: 36.87, lon: -76.3 },
  { id: 'uscg-charleston', name: 'USCG Sector Charleston', kind: 'coast-guard', lat: 32.78, lon: -79.92 },
  { id: 'uscg-miami', name: 'USCG Sector Miami', kind: 'coast-guard', lat: 25.77, lon: -80.16 },
  { id: 'uscg-st-pete', name: 'USCG Sector St. Petersburg', kind: 'coast-guard', lat: 27.76, lon: -82.63 },
  { id: 'uscg-mobile', name: 'USCG Sector Mobile', kind: 'coast-guard', lat: 30.69, lon: -88.04 },
  { id: 'uscg-new-orleans', name: 'USCG Sector New Orleans', kind: 'coast-guard', lat: 29.94, lon: -90.06 },
  { id: 'uscg-houston', name: 'USCG Sector Houston-Galveston', kind: 'coast-guard', lat: 29.73, lon: -95.27 },
  { id: 'uscg-los-angeles', name: 'USCG Sector Los Angeles-Long Beach', kind: 'coast-guard', lat: 33.74, lon: -118.25 },
  { id: 'uscg-san-francisco', name: 'USCG Sector San Francisco', kind: 'coast-guard', lat: 37.8, lon: -122.39 },
  { id: 'uscg-puget-sound', name: 'USCG Sector Puget Sound', kind: 'coast-guard', lat: 47.6, lon: -122.34 },
  { id: 'uscg-detroit', name: 'USCG Sector Detroit', kind: 'coast-guard', lat: 42.33, lon: -83.03 },
  { id: 'navsta-norfolk', name: 'Naval Station Norfolk', kind: 'navy-base', lat: 36.95, lon: -76.32 },
  { id: 'jblc-little-creek', name: 'Joint Expeditionary Base Little Creek-Fort Story', kind: 'navy-base', lat: 36.92, lon: -76.15 },
  { id: 'navsub-new-london', name: 'Naval Submarine Base New London', kind: 'navy-base', lat: 41.38, lon: -72.09 },
  { id: 'navsta-mayport', name: 'Naval Station Mayport', kind: 'navy-base', lat: 30.39, lon: -81.43 },
  { id: 'navsta-key-west', name: 'Naval Air Station Key West', kind: 'navy-base', lat: 24.58, lon: -81.68 },
  { id: 'navbase-san-diego', name: 'Naval Base San Diego', kind: 'navy-base', lat: 32.68, lon: -117.12 },
  { id: 'navbase-coronado', name: 'Naval Base Coronado', kind: 'navy-base', lat: 32.68, lon: -117.17 },
  { id: 'navbase-kitsap', name: 'Naval Base Kitsap', kind: 'navy-base', lat: 47.72, lon: -122.71 },
  { id: 'navbase-everett', name: 'Naval Station Everett', kind: 'navy-base', lat: 47.99, lon: -122.22 },
  { id: 'navbase-pearl', name: 'Joint Base Pearl Harbor-Hickam', kind: 'navy-base', lat: 21.35, lon: -157.94 },
];

export const MARITIME_NODES: MaritimeNode[] = [
  { id: 'atlantic-north', label: 'North Atlantic / New England', shortLabel: 'NE', lat: 42.5, lon: -70.7, radiusNm: 250, scope: 'US' },
  { id: 'ny-harbor', label: 'New York Harbor', shortLabel: 'NY', lat: 40.6, lon: -73.9, radiusNm: 180, scope: 'US' },
  { id: 'chesapeake', label: 'Chesapeake / Norfolk', shortLabel: 'CB', lat: 36.9, lon: -76.2, radiusNm: 220, scope: 'US' },
  { id: 'carolina-georgia', label: 'Carolinas / Georgia Coast', shortLabel: 'CG', lat: 32.3, lon: -80.4, radiusNm: 250, scope: 'US' },
  { id: 'florida-straits', label: 'Florida Straits', shortLabel: 'FL', lat: 26.1, lon: -80.2, radiusNm: 250, scope: 'US' },
  { id: 'eastern-gulf', label: 'Eastern Gulf', shortLabel: 'EG', lat: 28.1, lon: -84.4, radiusNm: 250, scope: 'US' },
  { id: 'central-gulf', label: 'Central Gulf / Louisiana', shortLabel: 'CGF', lat: 29.2, lon: -90.1, radiusNm: 250, scope: 'US' },
  { id: 'texas-gulf', label: 'Texas Gulf', shortLabel: 'TX', lat: 28.6, lon: -95.2, radiusNm: 250, scope: 'US' },
  { id: 'southern-california', label: 'Southern California Bight', shortLabel: 'SOC', lat: 33.5, lon: -118.3, radiusNm: 220, scope: 'US' },
  { id: 'northern-california', label: 'Northern California', shortLabel: 'NCA', lat: 37.8, lon: -122.6, radiusNm: 220, scope: 'US' },
  { id: 'pacific-northwest', label: 'Puget Sound / Columbia', shortLabel: 'PNW', lat: 47.6, lon: -122.6, radiusNm: 230, scope: 'US' },
  { id: 'alaska-gulf', label: 'Gulf of Alaska', shortLabel: 'AK', lat: 60.6, lon: -149.6, radiusNm: 250, scope: 'US' },
  { id: 'hawaii', label: 'Hawaii / Central Pacific', shortLabel: 'HI', lat: 21.3, lon: -157.9, radiusNm: 250, scope: 'US' },
  { id: 'great-lakes-west', label: 'Western Great Lakes', shortLabel: 'WGL', lat: 46.5, lon: -87.3, radiusNm: 220, scope: 'US' },
  { id: 'great-lakes-east', label: 'Eastern Great Lakes', shortLabel: 'EGL', lat: 42.4, lon: -82.8, radiusNm: 220, scope: 'US' },
  { id: 'bc-coast', label: 'British Columbia Coast', shortLabel: 'BC', lat: 49.3, lon: -123.2, radiusNm: 250, scope: 'Canada' },
  { id: 'st-lawrence', label: 'St. Lawrence / Montreal', shortLabel: 'SL', lat: 45.6, lon: -73.6, radiusNm: 220, scope: 'Canada' },
  { id: 'atlantic-canada', label: 'Atlantic Canada / Halifax', shortLabel: 'HAL', lat: 44.7, lon: -63.5, radiusNm: 250, scope: 'Canada' },
];

export function maritimePortsGeoJSON() {
  return {
    type: 'FeatureCollection' as const,
    features: MARITIME_PORTS.map((port) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [port.lon, port.lat] },
      properties: port,
    })),
  };
}

export function maritimeInstallationsGeoJSON() {
  return {
    type: 'FeatureCollection' as const,
    features: MARITIME_INSTALLATIONS.map((installation) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [installation.lon, installation.lat] },
      properties: installation,
    })),
  };
}

export function maritimeNodesGeoJSON(activeIds: string[] = []) {
  return {
    type: 'FeatureCollection' as const,
    features: MARITIME_NODES.map((node) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [node.lon, node.lat] },
      properties: { ...node, active: activeIds.includes(node.id) },
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
    Math.sin(lat1) * Math.cos(angularDistance) + Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing),
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2),
    );
  return [((lon2 * 180) / Math.PI + 540) % 360 - 180, (lat2 * 180) / Math.PI];
}

function circleFeature(node: MaritimeNode, radiusNm: number) {
  const coordinates = Array.from({ length: 97 }, (_, index) => destinationPoint(node.lon, node.lat, (index / 96) * 360, Math.max(1, radiusNm)));
  return {
    type: 'Feature' as const,
    geometry: { type: 'Polygon' as const, coordinates: [[...coordinates, coordinates[0]]] },
    properties: node,
  };
}

export function activeMaritimeZonesGeoJSON(activeIds: string[]) {
  return {
    type: 'FeatureCollection' as const,
    features: MARITIME_NODES.filter((node) => activeIds.includes(node.id)).map((node) => circleFeature(node, node.radiusNm)),
  };
}

export function activeMaritimePulseGeoJSON(activeIds: string[], sweepDeg: number) {
  const radiusFactor = 0.15 + 0.85 * ((sweepDeg % 360) / 360);
  return {
    type: 'FeatureCollection' as const,
    features: MARITIME_NODES.filter((node) => activeIds.includes(node.id)).map((node) => circleFeature(node, node.radiusNm * radiusFactor)),
  };
}

export function activeMaritimeSweepsGeoJSON(activeIds: string[], sweepDeg: number) {
  return {
    type: 'FeatureCollection' as const,
    features: MARITIME_NODES.filter((node) => activeIds.includes(node.id)).map((node) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: [[node.lon, node.lat], destinationPoint(node.lon, node.lat, sweepDeg, node.radiusNm)],
      },
      properties: node,
    })),
  };
}
