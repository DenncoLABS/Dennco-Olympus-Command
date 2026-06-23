import 'dotenv/config';

const CLOUDFLARE_API_URL = 'https://api.cloudflare.com/client/v4';
const CACHE_TTL = 15 * 60 * 1000; // 15 mins

const queryCache = new Map<string, { data: any; expiresAt: number }>();

export async function fetchCloudflareRadar(
  endpoint: string,
  params: Record<string, string> = {},
): Promise<any> {
  const token = process.env.CLOUDFLARE_RADAR_TOKEN;
  if (!token) {
    console.warn('CLOUDFLARE_RADAR_TOKEN is not set.');
    throw new Error('CLOUDFLARE_RADAR_TOKEN is missing');
  }

  const searchParams = new URLSearchParams(params);
  searchParams.set('format', 'json');
  const cacheKey = `${endpoint}?${searchParams.toString()}`;

  const cached = queryCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  try {
    const resp = await fetch(`${CLOUDFLARE_API_URL}${endpoint}?${searchParams.toString()}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!resp.ok) {
      const body = await resp.text();
      throw new Error(`Cloudflare API error: ${resp.status} ${resp.statusText} - ${body}`);
    }

    const data = await resp.json();

    if (!data.success) {
      throw new Error(`Cloudflare API returned failure: ${JSON.stringify(data.errors)}`);
    }

    queryCache.set(cacheKey, {
      data: data.result,
      expiresAt: Date.now() + CACHE_TTL,
    });

    return data.result;
  } catch (err: any) {
    console.error(`Cloudflare fetch error for ${endpoint}:`, err.message);
    if (cached?.data) {
      console.log('Returning stale cached data as fallback.');
      return cached.data;
    }
    throw err;
  }
}
