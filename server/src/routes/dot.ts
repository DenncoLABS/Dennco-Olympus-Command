import { Router } from 'express';

const router = Router();

type DotCamera = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  imageUrl?: string;
  streamUrl?: string;
  streamType?: 'jpg' | 'hls' | 'iframe' | 'mjpeg';
  externalUrl?: string;
  roadway?: string;
  direction?: string;
  status?: string;
  source: string;
  city?: string;
  country?: string;
};

const US_FALLBACK_CAMERAS: DotCamera[] = [
  { id: 'us-nyc-midtown', name: 'New York Midtown Traffic Camera', lat: 40.7549, lon: -73.9840, city: 'New York', country: 'US', externalUrl: 'https://webcams.nyctmc.org/', source: 'NYC DOT fallback' },
  { id: 'us-nyc-brooklyn-bridge', name: 'Brooklyn Bridge Traffic Camera', lat: 40.7061, lon: -73.9969, city: 'New York', country: 'US', externalUrl: 'https://webcams.nyctmc.org/', source: 'NYC DOT fallback' },
  { id: 'us-dc-i395', name: 'Washington DC I-395 Traffic Camera', lat: 38.8854, lon: -77.0320, city: 'Washington', country: 'US', externalUrl: 'https://ddot.dc.gov/', source: 'DDOT fallback' },
  { id: 'us-la-101', name: 'Los Angeles US-101 Traffic Camera', lat: 34.0522, lon: -118.2437, city: 'Los Angeles', country: 'US', externalUrl: 'https://cwwp2.dot.ca.gov/', source: 'Caltrans fallback' },
  { id: 'us-sf-bay-bridge', name: 'San Francisco Bay Bridge Traffic Camera', lat: 37.7890, lon: -122.3900, city: 'San Francisco', country: 'US', externalUrl: 'https://cwwp2.dot.ca.gov/', source: 'Caltrans fallback' },
  { id: 'us-seattle-i5', name: 'Seattle I-5 Traffic Camera', lat: 47.6062, lon: -122.3321, city: 'Seattle', country: 'US', externalUrl: 'https://wsdot.com/travel/real-time/cameras', source: 'WSDOT fallback' },
  { id: 'us-portland-i5', name: 'Portland I-5 Traffic Camera', lat: 45.5152, lon: -122.6784, city: 'Portland', country: 'US', externalUrl: 'https://www.tripcheck.com/', source: 'Oregon DOT fallback' },
  { id: 'us-chicago-loop', name: 'Chicago Loop Traffic Camera', lat: 41.8781, lon: -87.6298, city: 'Chicago', country: 'US', externalUrl: 'https://www.travelmidwest.com/', source: 'IDOT fallback' },
  { id: 'us-houston-i10', name: 'Houston I-10 Traffic Camera', lat: 29.7604, lon: -95.3698, city: 'Houston', country: 'US', externalUrl: 'https://traffic.houstontranstar.org/', source: 'Houston TranStar fallback' },
  { id: 'us-dallas-i35', name: 'Dallas I-35 Traffic Camera', lat: 32.7767, lon: -96.7970, city: 'Dallas', country: 'US', externalUrl: 'https://its.txdot.gov/', source: 'TxDOT fallback' },
  { id: 'us-miami-i95', name: 'Miami I-95 Traffic Camera', lat: 25.7617, lon: -80.1918, city: 'Miami', country: 'US', externalUrl: 'https://fl511.com/', source: 'FL511 fallback' },
  { id: 'us-atlanta-i75', name: 'Atlanta I-75 Traffic Camera', lat: 33.7490, lon: -84.3880, city: 'Atlanta', country: 'US', externalUrl: 'https://511ga.org/', source: 'Georgia 511 fallback' },
  { id: 'us-denver-i25', name: 'Denver I-25 Traffic Camera', lat: 39.7392, lon: -104.9903, city: 'Denver', country: 'US', externalUrl: 'https://www.cotrip.org/', source: 'CDOT fallback' },
  { id: 'us-phoenix-i10', name: 'Phoenix I-10 Traffic Camera', lat: 33.4484, lon: -112.0740, city: 'Phoenix', country: 'US', externalUrl: 'https://az511.gov/', source: 'AZ511 fallback' },
  { id: 'us-las-vegas-i15', name: 'Las Vegas I-15 Traffic Camera', lat: 36.1699, lon: -115.1398, city: 'Las Vegas', country: 'US', externalUrl: 'https://www.nvroads.com/', source: 'NDOT fallback' },
  { id: 'us-boston-i90', name: 'Boston I-90 Traffic Camera', lat: 42.3601, lon: -71.0589, city: 'Boston', country: 'US', externalUrl: 'https://mass511.com/', source: 'Mass511 fallback' },
  { id: 'us-philly-i95', name: 'Philadelphia I-95 Traffic Camera', lat: 39.9526, lon: -75.1652, city: 'Philadelphia', country: 'US', externalUrl: 'https://www.511pa.com/', source: '511PA fallback' },
  { id: 'us-detroit-i75', name: 'Detroit I-75 Traffic Camera', lat: 42.3314, lon: -83.0458, city: 'Detroit', country: 'US', externalUrl: 'https://mdotjboss.state.mi.us/MiDrive/map', source: 'MDOT fallback' },
  { id: 'us-minneapolis-i94', name: 'Minneapolis I-94 Traffic Camera', lat: 44.9778, lon: -93.2650, city: 'Minneapolis', country: 'US', externalUrl: 'https://511mn.org/', source: 'MnDOT fallback' },
  { id: 'us-salt-lake-i15', name: 'Salt Lake City I-15 Traffic Camera', lat: 40.7608, lon: -111.8910, city: 'Salt Lake City', country: 'US', externalUrl: 'https://udottraffic.utah.gov/', source: 'UDOT fallback' },
  { id: 'us-hamilton-oh', name: 'Hamilton, OH', lat: 39.3988617, lon: -84.5595353, city: 'Hamilton', country: 'US', imageUrl: 'https://gsccam.butlersheriff.org/axis-cgi/jpg/image.cgi', externalUrl: 'https://gsccam.butlersheriff.org/camera/index.html#/video', source: 'OSIRIS / Butler County OH' },
];

const STATIC_GLOBAL_CAMERAS: DotCamera[] = [
  { id: 'jp-shibuya-crossing', name: 'Shibuya Scramble Crossing', lat: 35.6595, lon: 139.7005, city: 'Tokyo', country: 'Japan', streamUrl: 'https://www.youtube.com/embed/HpdO5Kq3o7Y?autoplay=1&mute=1', streamType: 'iframe', source: 'OSIRIS / YouTube Live' },
  { id: 'jp-tokyo-tower', name: 'Tokyo Tower Live Cam', lat: 35.6586, lon: 139.7454, city: 'Tokyo', country: 'Japan', streamUrl: 'https://www.youtube.com/embed/cbJ03Xk_eLQ?autoplay=1&mute=1', streamType: 'iframe', source: 'OSIRIS / YouTube Live' },
  { id: 'fr-paris-eiffel', name: 'Paris - Eiffel Tower Area', lat: 48.8584, lon: 2.2945, city: 'Paris', country: 'France', streamUrl: 'https://www.youtube.com/embed/UMuEooW0iAQ?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0', streamType: 'iframe', source: 'OSIRIS / YouTube Live' },
  { id: 'fr-nice-promenade', name: 'Nice - Promenade des Anglais', lat: 43.6961, lon: 7.2717, city: 'Nice', country: 'France', streamUrl: 'https://www.youtube.com/embed/YAdNYoRY0Cw?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0', streamType: 'iframe', source: 'OSIRIS / YouTube Live' },
  ...US_FALLBACK_CAMERAS,
];

function normalizeNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function fetchJson(url: string, timeoutMs = 8_000): Promise<any | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function fetchTfLCameras(): Promise<DotCamera[]> {
  const data = await fetchJson('https://api.tfl.gov.uk/Place/Type/JamCam', 12_000);
  if (!Array.isArray(data)) return [];
  return data.map((cam: any): DotCamera | null => {
    const lat = normalizeNumber(cam.lat);
    const lon = normalizeNumber(cam.lon);
    if (lat == null || lon == null) return null;
    const img = cam.additionalProperties?.find((p: any) => p.key === 'imageUrl')?.value;
    const camId = String(cam.id || '').replace('JamCams_', '');
    return { id: `tfl-${cam.id || camId}`, name: cam.commonName || 'London JamCam', lat, lon, city: 'London', country: 'UK', imageUrl: img || `https://s3-eu-west-1.amazonaws.com/jamcams.tfl.gov.uk/${camId}.jpg`, source: 'TfL JamCams' };
  }).filter(Boolean) as DotCamera[];
}

async function fetchWsdotCameras(): Promise<DotCamera[]> {
  const data = await fetchJson('https://data.wsdot.wa.gov/log/public/cameras.json', 12_000);
  if (!Array.isArray(data)) return [];
  return data.map((cam: any): DotCamera | null => {
    const lat = normalizeNumber(cam.CameraLocation?.Latitude);
    const lon = normalizeNumber(cam.CameraLocation?.Longitude);
    if (lat == null || lon == null || !cam.ImageURL) return null;
    return { id: `wsdot-${cam.CameraID}`, name: cam.Title || 'WSDOT Camera', lat, lon, city: 'Washington', country: 'US', imageUrl: cam.ImageURL, source: 'WSDOT' };
  }).filter(Boolean) as DotCamera[];
}

async function fetchCaltransCameras(): Promise<DotCamera[]> {
  const districts = ['d03', 'd04', 'd05', 'd06', 'd07', 'd08', 'd10', 'd11', 'd12'];
  const settled = await Promise.allSettled(districts.map(async (district) => {
    const data = await fetchJson(`https://cwwp2.dot.ca.gov/data/${district}/cctv/cctvStatus${district.toUpperCase()}.json`, 9_000);
    const items = Array.isArray(data?.data) ? data.data : [];
    return items.map((cam: any): DotCamera | null => {
      const lat = normalizeNumber(cam.cctv?.location?.latitude || cam.location?.latitude);
      const lon = normalizeNumber(cam.cctv?.location?.longitude || cam.location?.longitude);
      const imageUrl = cam.cctv?.imageData?.static?.currentImageURL || '';
      if (lat == null || lon == null || !imageUrl) return null;
      return { id: `caltrans-${district}-${cam.cctv?.index || `${lat},${lon}`}`, name: cam.cctv?.location?.locationName || cam.location?.locationName || 'Caltrans CCTV', lat, lon, city: 'California', country: 'US', imageUrl, source: 'Caltrans' };
    }).filter(Boolean) as DotCamera[];
  }));
  return settled.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
}

async function fetchAustraliaCameras(): Promise<DotCamera[]> {
  const data = await fetchJson('https://www.livetraffic.com/datajson/all-feeds-web.json', 12_000);
  if (!Array.isArray(data)) return [];
  return data.filter((event: any) => event.eventType === 'liveCams').map((cam: any): DotCamera | null => {
    const lat = normalizeNumber(cam.geometry?.coordinates?.[1]);
    const lon = normalizeNumber(cam.geometry?.coordinates?.[0]);
    if (lat == null || lon == null) return null;
    return { id: `aus-${cam.path || `${lat},${lon}`}`, name: cam.properties?.title || 'Australia Traffic Camera', lat, lon, city: cam.properties?.region || 'Australia', country: 'Australia', imageUrl: cam.properties?.href || '', externalUrl: cam.properties?.href || '', source: 'Live Traffic Australia' };
  }).filter(Boolean) as DotCamera[];
}

router.get('/cctv', async (_req, res) => {
  const settled = await Promise.allSettled([fetchTfLCameras(), fetchWsdotCameras(), fetchCaltransCameras(), fetchAustraliaCameras()]);
  const live = settled.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
  const dedup = new Map<string, DotCamera>();
  [...live, ...STATIC_GLOBAL_CAMERAS].forEach((camera) => {
    if (Number.isFinite(camera.lat) && Number.isFinite(camera.lon)) dedup.set(camera.id, camera);
  });
  const cameras = [...dedup.values()].slice(0, 3000);
  res.json({ cameras, count: cameras.length, sources: [...new Set(cameras.map((camera) => camera.source))], updatedAt: new Date().toISOString() });
});

export default router;
