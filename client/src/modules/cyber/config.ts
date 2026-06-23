// GENERATED FROM LIVE API PROBE — field names are exact from Cloudflare Radar API responses

export interface CyberEndpointDef {
  id: string;
  path: string;
  name: string;
  description: string;
  /** Which top-level key holds the data in the result object */
  dataKey: 'top_0' | 'summary_0' | 'serie_0' | 'trafficAnomalies' | 'stats';
  /** Renderer hint for the visualizer */
  renderer:
    | 'ranked_country'
    | 'ranked_asn'
    | 'ranked_domain'
    | 'speed_table'
    | 'anomaly_feed'
    | 'summary_pie'
    | 'bgp_stats';
  unit?: string;
}

export interface CyberCategoryDef {
  id: string;
  name: string;
  icon: string;
  color: string;
  endpoints: CyberEndpointDef[];
}

export const CYBER_CONFIG: CyberCategoryDef[] = [
  {
    id: 'attacks',
    name: 'DDoS Attacks',
    icon: '⚡',
    color: '#ff3366',
    endpoints: [
      {
        id: 'l7_top_origins',
        path: '/radar/attacks/layer7/top/locations/origin',
        name: 'L7 — Top Origin Countries',
        description: 'Top source countries of HTTP DDoS attacks',
        dataKey: 'top_0',
        renderer: 'ranked_country',
        unit: '%',
      },
      {
        id: 'l3_top_origins',
        path: '/radar/attacks/layer3/top/locations/origin',
        name: 'L3 — Top Origin Countries',
        description: 'Top source countries of volumetric network attacks',
        dataKey: 'top_0',
        renderer: 'ranked_country',
        unit: '%',
      },
      {
        id: 'l7_top_ases',
        path: '/radar/attacks/layer7/top/ases/origin',
        name: 'L7 — Top Origin ASes',
        description: 'Autonomous systems originating the most L7 DDoS traffic',
        dataKey: 'top_0',
        renderer: 'ranked_asn',
        unit: '%',
      },
    ],
  },
  {
    id: 'http',
    name: 'HTTP Traffic',
    icon: '🌐',
    color: '#00e5ff',
    endpoints: [
      {
        id: 'http_top_locations',
        path: '/radar/http/top/locations',
        name: 'Top Countries',
        description: 'Countries generating the most HTTP traffic globally',
        dataKey: 'top_0',
        renderer: 'ranked_country',
        unit: '%',
      },
    ],
  },
  {
    id: 'dns',
    name: 'DNS Queries',
    icon: '🔍',
    color: '#7b61ff',
    endpoints: [
      {
        id: 'dns_top_locations',
        path: '/radar/dns/top/locations',
        name: 'Top Countries',
        description: 'Countries querying 1.1.1.1 most often',
        dataKey: 'top_0',
        renderer: 'ranked_country',
        unit: '%',
      },
      {
        id: 'dns_top_ases',
        path: '/radar/dns/top/ases',
        name: 'Top ASes',
        description: 'Autonomous systems sending the most DNS queries to 1.1.1.1',
        dataKey: 'top_0',
        renderer: 'ranked_asn',
        unit: '%',
      },
    ],
  },
  {
    id: 'bgp',
    name: 'BGP Routing',
    icon: '🗺',
    color: '#00ff9d',
    endpoints: [
      {
        id: 'bgp_top_ases',
        path: '/radar/bgp/top/ases',
        name: 'Top Advertisers',
        description: 'Top autonomous systems by BGP route announcements',
        dataKey: 'top_0',
        renderer: 'ranked_asn',
        unit: '%',
      },
      {
        id: 'bgp_routes_stats',
        path: '/radar/bgp/routes/stats',
        name: 'Route Statistics',
        description: 'Global BGP routing table — total/valid/invalid/unknown routes and prefixes',
        dataKey: 'stats',
        renderer: 'bgp_stats',
      },
    ],
  },
  {
    id: 'ranking',
    name: 'Domain Ranking',
    icon: '🏆',
    color: '#f59e0b',
    endpoints: [
      {
        id: 'ranking_top',
        path: '/radar/ranking/top',
        name: 'Top Domains',
        description: 'Most popular domains on the Internet by Cloudflare ranking',
        dataKey: 'top_0',
        renderer: 'ranked_domain',
      },
    ],
  },
  {
    id: 'quality',
    name: 'Internet Quality',
    icon: '📡',
    color: '#e879f9',
    endpoints: [
      {
        id: 'quality_speed_top_locations',
        path: '/radar/quality/speed/top/locations',
        name: 'Speed by Country',
        description: 'Countries ranked by download bandwidth, latency and jitter',
        dataKey: 'top_0',
        renderer: 'speed_table',
      },
    ],
  },
  {
    id: 'anomalies',
    name: 'Internet Outages',
    icon: '🚨',
    color: '#ef4444',
    endpoints: [
      {
        id: 'traffic_anomalies',
        path: '/radar/traffic_anomalies',
        name: 'Live Anomaly Feed',
        description: 'Real-time Internet outages and traffic anomalies detected by Cloudflare',
        dataKey: 'trafficAnomalies',
        renderer: 'anomaly_feed',
      },
      {
        id: 'traffic_anomaly_locations',
        path: '/radar/traffic_anomalies/locations',
        name: 'Affected Countries',
        description: 'Countries experiencing the most Internet anomalies',
        dataKey: 'top_0',
        renderer: 'ranked_country',
        unit: 'anom',
      },
    ],
  },
  {
    id: 'netflows',
    name: 'NetFlows',
    icon: '🔄',
    color: '#22d3ee',
    endpoints: [
      {
        id: 'netflows_top_locations',
        path: '/radar/netflows/top/locations',
        name: 'Top Countries',
        description: 'Countries by total network traffic volume',
        dataKey: 'top_0',
        renderer: 'ranked_country',
        unit: '%',
      },
    ],
  },
];

export function getCategoryDef(id: string): CyberCategoryDef | undefined {
  return CYBER_CONFIG.find((c) => c.id === id);
}

export function getEndpointDef(path: string): CyberEndpointDef | undefined {
  for (const cat of CYBER_CONFIG) {
    const ep = cat.endpoints.find((e) => e.path === path);
    if (ep) return ep;
  }
  return undefined;
}

export function getCategoryForEndpoint(path: string): CyberCategoryDef | undefined {
  return CYBER_CONFIG.find((c) => c.endpoints.some((e) => e.path === path));
}
