import { useQuery } from '@tanstack/react-query';

export function useDynamicCyberData(endpointPath: string, timeRange: string = '7d') {
  return useQuery({
    queryKey: ['cyber-data', endpointPath, timeRange],
    queryFn: async () => {
      // Request 25 results; Cloudflare default is only 5
      const params = new URLSearchParams({ dateRange: timeRange, limit: '100' });
      const res = await fetch(`/api/cyber${endpointPath}?${params.toString()}`);
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Failed to load radar data: ${body}`);
      }
      return res.json();
    },
    enabled: !!endpointPath,
    refetchInterval: 5 * 60 * 1000,
  });
}
