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

const STATIC_GLOBAL_CAMERAS: DotCamera[] = [
  {
    id: 'jp-shibuya-crossing',
    name: 'Shibuya Scramble Crossing',
    lat: 35.6595,
    lon: 139.7005,
    city: 'Tokyo',
    country: 'Japan',
    streamUrl: 'https://www.youtube.com/embed/HpdO5Kq3o7Y?autoplay=1&mute=1',
    streamType: 'iframe',
    source: 'OSIRIS / YouTube Live',
  },
  {
    id: 'jp-tokyo-tower',
    name: 'Tokyo Tower Live Cam',
    lat: 35.6586,
    lon: 139.7454,
    city: 'Tokyo',
    country: 'Japan',
    streamUrl: 'https://www.youtube.com/embed/cbJ03Xk_eLQ?autoplay=1&mute=1',
    streamType: 'iframe',
    source: 'OSIRIS / YouTube Live',
  },
  {
    id: 'fr-paris-eiffel',
    name: 'Paris - Eiffel Tower Area',
    lat: 48.8584,
    lon: 2.2945,
    city: 'Paris',
    country: 'France',
    streamUrl: 'https://www.youtube.com/embed/UMuEooW0iAQ?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0',
    streamType: 'iframe',
    source: 'OSIRIS / YouTube Live',
  },
  {
    id: 'fr-nice-promenade',
    name: 'Nice - Promenade des Anglais',
    lat: 43.6961,
    lon: 7.2717,
    city: 'Nice',
    country: 'France',
    streamUrl: 'https://www.youtube.com/embed/YAdNYoRY0Cw?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0',
    streamType: 'iframe',
    source: 'OSIRIS / YouTube Live',
  },
  {
    id: 'butler-oh-hamilton',
    name: 'Hamilton, OH',
    lat: 39.3988617,
    lon: -84.5595353,
    city: 'Hamilton',
    country: 'US',
    imageUrl: 'https://gsccam.butlersheriff.org/axis-cgi/jpg/image.cgi',
    externalUrl: 'https://gsccam.butlersheriff.org/camera/index.html#/video',
    source: 'OSIRIS / Butler County OH',
  },
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
  return data
    .map((cam: any): DotCamera | null => {
      const lat = normalizeNumber(cam.lat);
      const lon = normalizeNumber(cam.lon);
      if (lat == null || lon == null) return null;
      const img = cam.additionalProperties?.find((p: any) => p.key === 'imageUrl')?.value;
      const camId = String(cam.id || '').replace('JamCams_', '');
      return {
        id: `tfl-${cam.id || camId}`,
        name: cam.commonName || 'London JamCam',
        lat,
        lon,
        city: 'London',
        country: 'UK',
        imageUrl: img || `https://s3-eu-west-1.amazonaws.com/jamcams.tfl.gov.uk/${camId}.jpg`,
        source: 'TfL JamCams',
      };
    })
    .filter(Boolean) as DotCamera[];
}

async function fetchWsdotCameras(): Promise<DotCamera[]> {
  const data = await fetchJson('https://data.wsdot.wa.gov/log/public/cameras.json', 12_000);
  if (!Array.isArray(data)) return [];
  return data
    .map((cam: any): DotCamera | null => {
      const lat = normalizeNumber(cam.CameraLocation?.Latitude);
      const lon = normalizeNumber(cam.CameraLocation?.Longitude);
      if (lat == null || lon == null || !cam.ImageURL) return null;
      return {
        id: `wsdot-${cam.CameraID}`,
        name: cam.Title || 'WSDOT Camera',
        lat,
        lon,
        city: 'Washington',
        country: 'US',
        imageUrl: cam.ImageURL,
        source: 'WSDOT',
      };
    })
    .filter(Boolean) as DotCamera[];
}

async function fetchAustraliaCameras(): Promise<DotCamera[]> {
  const data = await fetchJson('https://www.livetraffic.com/datajson/all-feeds-web.json', 12_000);
  if (!Array.isArray(data)) return [];
  return data
    .filter((event: any) => event.eventType === 'liveCams')
    .map((cam: any): DotCamera | null => {
      const lat = normalizeNumber(cam.geometry?.coordinates?.[1]);
      const lon = normalizeNumber(cam.geometry?.coordinates?.[0]);
      if (lat == null || lon == null) return null;
      return {
        id: `aus-${cam.path || `${lat},${lon}`}`,
        name: cam.properties?.title || 'Australia Traffic Camera',
        lat,
        lon,
        city: cam.properties?.region || 'Australia',
        country: 'Australia',
        imageUrl: cam.properties?.href || '',
        externalUrl: cam.properties?.href || '',
        source: 'Live Traffic Australia',
      };
    })
    .filter(Boolean) as DotCamera[];
}

router.get('/cctv', async (_req, res) => {
  const settled = await Promise.allSettled([
    fetchTfLCameras(),
    fetchWsdotCameras(),
    fetchAustraliaCameras(),
  ]);
  const live = settled.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
  const cameras = [...live, ...STATIC_GLOBAL_CAMERAS]
    .filter((camera) => Number.isFinite(camera.lat) && Number.isFinite(camera.lon))
    .slice(0, 2500);

  res.json({
    cameras,
    count: cameras.length,
    sources: [...new Set(cameras.map((camera) => camera.source))],
    updatedAt: new Date().toISOString(),
  });
});

export default router;
