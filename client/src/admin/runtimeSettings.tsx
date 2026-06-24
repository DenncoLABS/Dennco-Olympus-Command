import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export interface RuntimeSettings {
  auth: {
    provider: string;
    directoryProvider: string;
    nethserver8Enabled: boolean;
  };
  branding: {
    productName: string;
    shortName: string;
    logoUrl: string;
    logoDataUrl: string;
    faviconUrl: string;
    faviconDataUrl: string;
    footerText: string;
  };
  apiKeys: {
    openskyUsername: string;
    openskyClientId: string;
    mapTilesUrl: string;
    aisstreamConfigured: boolean;
    openskyPasswordConfigured: boolean;
    openskyClientSecretConfigured: boolean;
  };
  featureToggles: Record<string, boolean>;
  theme: {
    customCss: string;
  };
  providers: Record<string, boolean>;
  cad: {
    mode: string;
    resgridUrl: string;
    repositoryUrl: string;
  };
  dotFeeds: {
    nationalTrafficUrl: string;
    trafficUrl: string;
    camerasUrl: string;
    roadClosuresUrl: string;
    providerMode: string;
    states: string[];
  };
  vhfAudio: {
    enabled: boolean;
    defaultChannelId: string;
    channels: Array<{
      id: string;
      label: string;
      type: string;
      streamUrl: string;
      region?: string;
      frequency?: string;
    }>;
  };
}

const fallbackSettings: RuntimeSettings = {
  auth: {
    provider: 'local',
    directoryProvider: 'none',
    nethserver8Enabled: false,
  },
  branding: {
    productName: 'Dennco Olympus Command',
    shortName: 'OLYMPUS',
    logoUrl: '',
    logoDataUrl: '',
    faviconUrl: '',
    faviconDataUrl: '',
    footerText: 'Dennco Olympus Command',
  },
  apiKeys: {
    openskyUsername: '',
    openskyClientId: '',
    mapTilesUrl: '',
    aisstreamConfigured: false,
    openskyPasswordConfigured: false,
    openskyClientSecretConfigured: false,
  },
  featureToggles: {
    flights: true,
    maritime: true,
    monitor: true,
    dot: true,
    cyber: true,
    cad: true,
    cssInjector: true,
  },
  theme: {
    customCss: '',
  },
  providers: {},
  cad: {
    mode: 'embedded-resgrid',
    resgridUrl: '/cad/',
    repositoryUrl: 'https://github.com/DenncoLABS/Resgrid',
  },
  dotFeeds: {
    nationalTrafficUrl: '',
    trafficUrl: '',
    camerasUrl: '',
    roadClosuresUrl: '',
    providerMode: 'custom',
    states: [],
  },
  vhfAudio: {
    enabled: true,
    defaultChannelId: '',
    channels: [],
  },
};

interface RuntimeSettingsContextValue {
  settings: RuntimeSettings;
  isLoading: boolean;
  reload: () => Promise<void>;
}

const RuntimeSettingsContext = createContext<RuntimeSettingsContextValue | null>(null);

function applyDocumentBranding(settings: RuntimeSettings) {
  document.title = settings.branding.productName;

  const favicon = settings.branding.faviconDataUrl || settings.branding.faviconUrl;
  if (favicon) {
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = favicon;
  }

  let style = document.getElementById('olympus-admin-css-injector') as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = 'olympus-admin-css-injector';
    document.head.appendChild(style);
  }
  style.textContent = settings.featureToggles.cssInjector ? settings.theme.customCss || '' : '';
}

export const RuntimeSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<RuntimeSettings>(fallbackSettings);
  const [isLoading, setIsLoading] = useState(true);

  const reload = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/runtime-settings');
      if (response.ok) {
        const next = (await response.json()) as RuntimeSettings;
        const merged = {
          ...fallbackSettings,
          ...next,
          branding: { ...fallbackSettings.branding, ...(next.branding || {}) },
          apiKeys: { ...fallbackSettings.apiKeys, ...(next.apiKeys || {}) },
          featureToggles: { ...fallbackSettings.featureToggles, ...(next.featureToggles || {}) },
          cad: { ...fallbackSettings.cad, ...(next.cad || {}) },
          dotFeeds: { ...fallbackSettings.dotFeeds, ...(next.dotFeeds || {}) },
          vhfAudio: { ...fallbackSettings.vhfAudio, ...(next.vhfAudio || {}) },
        };
        setSettings(merged);
        applyDocumentBranding(merged);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const value = useMemo(() => ({ settings, isLoading, reload }), [settings, isLoading]);

  return <RuntimeSettingsContext.Provider value={value}>{children}</RuntimeSettingsContext.Provider>;
};

export function useRuntimeSettings() {
  const context = useContext(RuntimeSettingsContext);
  if (!context) throw new Error('useRuntimeSettings must be used inside RuntimeSettingsProvider');
  return context;
}
