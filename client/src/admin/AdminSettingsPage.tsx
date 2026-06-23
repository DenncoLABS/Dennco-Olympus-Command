import React, { useEffect, useState } from 'react';
import { useRuntimeSettings } from './runtimeSettings';

const providerLabels: Record<string, string> = {
  aisstream: 'AISStream',
  opensky: 'OpenSky',
  mapTiles: 'Map tiles',
  dotTraffic: 'DOT traffic',
  dotCameras: 'DOT cameras',
  vhfAudio: 'VHF audio',
};

type VhfChannel = {
  id: string;
  label: string;
  type: string;
  streamUrl: string;
  region?: string;
  frequency?: string;
};

type EditableSettings = {
  branding: {
    productName: string;
    shortName: string;
    footerText: string;
    logoUrl: string;
    logoDataUrl: string;
    faviconUrl: string;
    faviconDataUrl: string;
  };
  apiKeys: {
    aisstream: string;
    openskyUsername: string;
    openskyPassword: string;
    openskyClientId: string;
    openskyClientSecret: string;
    mapTilesUrl: string;
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
    channels: VhfChannel[];
  };
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const blankChannel = (): VhfChannel => ({
  id: `vhf-${Date.now()}`,
  label: 'New VHF Channel',
  type: 'ATC',
  streamUrl: '',
  region: '',
  frequency: '',
});

export const AdminSettingsPage: React.FC = () => {
  const { settings, reload } = useRuntimeSettings();
  const [form, setForm] = useState<EditableSettings>({
    branding: {
      productName: settings.branding.productName,
      shortName: settings.branding.shortName,
      footerText: settings.branding.footerText,
      logoUrl: settings.branding.logoUrl,
      logoDataUrl: settings.branding.logoDataUrl,
      faviconUrl: settings.branding.faviconUrl,
      faviconDataUrl: settings.branding.faviconDataUrl,
    },
    apiKeys: {
      aisstream: '',
      openskyUsername: settings.apiKeys.openskyUsername,
      openskyPassword: '',
      openskyClientId: settings.apiKeys.openskyClientId,
      openskyClientSecret: '',
      mapTilesUrl: settings.apiKeys.mapTilesUrl,
    },
    dotFeeds: {
      ...settings.dotFeeds,
      states: settings.dotFeeds.states || [],
    },
    vhfAudio: {
      enabled: settings.vhfAudio.enabled,
      defaultChannelId: settings.vhfAudio.defaultChannelId,
      channels: settings.vhfAudio.channels || [],
    },
  });
  const [status, setStatus] = useState('');

  useEffect(() => {
    setForm((current) => ({
      ...current,
      branding: {
        productName: settings.branding.productName,
        shortName: settings.branding.shortName,
        footerText: settings.branding.footerText,
        logoUrl: settings.branding.logoUrl,
        logoDataUrl: settings.branding.logoDataUrl,
        faviconUrl: settings.branding.faviconUrl,
        faviconDataUrl: settings.branding.faviconDataUrl,
      },
      apiKeys: {
        ...current.apiKeys,
        openskyUsername: settings.apiKeys.openskyUsername,
        openskyClientId: settings.apiKeys.openskyClientId,
        mapTilesUrl: settings.apiKeys.mapTilesUrl,
      },
      dotFeeds: {
        ...settings.dotFeeds,
        states: settings.dotFeeds.states || [],
      },
      vhfAudio: {
        enabled: settings.vhfAudio.enabled,
        defaultChannelId: settings.vhfAudio.defaultChannelId,
        channels: settings.vhfAudio.channels || [],
      },
    }));
  }, [settings]);

  const save = async () => {
    setStatus('Saving...');
    const response = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      setStatus('Save failed.');
      return;
    }

    setStatus('Saved. Secret fields stay blank after reload, but remain configured unless replaced.');
    await reload();
  };

  const updateBranding = (key: keyof EditableSettings['branding'], value: string) => {
    setForm((current) => ({ ...current, branding: { ...current.branding, [key]: value } }));
  };

  const updateApi = (key: keyof EditableSettings['apiKeys'], value: string) => {
    setForm((current) => ({ ...current, apiKeys: { ...current.apiKeys, [key]: value } }));
  };

  const updateDot = (key: keyof EditableSettings['dotFeeds'], value: string | string[]) => {
    setForm((current) => ({ ...current, dotFeeds: { ...current.dotFeeds, [key]: value } }));
  };

  const updateVhf = (patch: Partial<EditableSettings['vhfAudio']>) => {
    setForm((current) => ({ ...current, vhfAudio: { ...current.vhfAudio, ...patch } }));
  };

  const updateVhfChannel = (index: number, patch: Partial<VhfChannel>) => {
    setForm((current) => ({
      ...current,
      vhfAudio: {
        ...current.vhfAudio,
        channels: current.vhfAudio.channels.map((channel, i) =>
          i === index ? { ...channel, ...patch } : channel,
        ),
      },
    }));
  };

  const logoPreview = form.branding.logoDataUrl || form.branding.logoUrl;
  const faviconPreview = form.branding.faviconDataUrl || form.branding.faviconUrl;

  return (
    <div className="absolute inset-0 overflow-auto bg-intel-bg p-8 text-intel-text-light">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-intel-accent/70 mb-2">Admin Console</div>
            <h2 className="font-mono text-3xl font-bold tracking-[0.15em] uppercase">Settings</h2>
            <p className="mt-3 text-sm text-white/50 max-w-3xl">
              Manage authentication, provider keys, VHF voice streams, DOT feeds, uploaded splash logo, favicon, branding, and custom CSS themes.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => void reload()} className="border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/60 hover:bg-white/5">
              Reload
            </button>
            <button onClick={() => void save()} className="border border-intel-accent/50 px-4 py-2 text-xs uppercase tracking-[0.2em] text-intel-accent hover:bg-intel-accent/10">
              Save
            </button>
          </div>
        </div>

        {status && <div className="border border-intel-accent/25 bg-intel-accent/10 px-4 py-3 text-sm text-intel-accent">{status}</div>}

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="border border-white/10 bg-black/30 p-5">
            <h3 className="font-mono text-lg uppercase tracking-[0.18em] mb-4">Authentication</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-white/45">Provider</dt><dd>{settings.auth.provider}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-white/45">Directory</dt><dd>{settings.auth.directoryProvider}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-white/45">NethServer 8</dt><dd>{settings.auth.nethserver8Enabled ? 'Enabled' : 'Disabled'}</dd></div>
            </dl>
          </div>

          <div className="border border-white/10 bg-black/30 p-5">
            <h3 className="font-mono text-lg uppercase tracking-[0.18em] mb-4">API Providers</h3>
            <div className="space-y-3 text-sm">
              {Object.entries(settings.providers).map(([key, configured]) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <span className="text-white/60">{providerLabels[key] || key}</span>
                  <span className={configured ? 'text-emerald-300' : 'text-white/35'}>{configured ? 'Configured' : 'Not set'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-black/30 p-5">
            <h3 className="font-mono text-lg uppercase tracking-[0.18em] mb-4">Branding Status</h3>
            <div className="space-y-3 text-sm">
              <div><div className="text-white/35">Product</div><div>{settings.branding.productName}</div></div>
              <div><div className="text-white/35">Short name</div><div>{settings.branding.shortName}</div></div>
              <div><div className="text-white/35">Footer</div><div>{settings.branding.footerText}</div></div>
            </div>
          </div>
        </section>

        <section className="border border-cyan-300/20 bg-cyan-950/10 p-5">
          <h3 className="font-mono text-lg uppercase tracking-[0.18em] mb-4">Editable Branding + Splash Assets</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TextInput label="Product name" value={form.branding.productName} onChange={(value) => updateBranding('productName', value)} />
            <TextInput label="Short name" value={form.branding.shortName} onChange={(value) => updateBranding('shortName', value)} />
            <TextInput label="Footer text" value={form.branding.footerText} onChange={(value) => updateBranding('footerText', value)} />
            <TextInput label="Logo URL" value={form.branding.logoUrl} onChange={(value) => updateBranding('logoUrl', value)} />
            <AssetUpload label="Upload splash/nav logo" preview={logoPreview} onUpload={(dataUrl) => updateBranding('logoDataUrl', dataUrl)} onClear={() => updateBranding('logoDataUrl', '')} />
            <AssetUpload label="Upload favicon" preview={faviconPreview} onUpload={(dataUrl) => updateBranding('faviconDataUrl', dataUrl)} onClear={() => updateBranding('faviconDataUrl', '')} />
          </div>
        </section>

        <section className="border border-emerald-300/20 bg-emerald-950/10 p-5">
          <h3 className="font-mono text-lg uppercase tracking-[0.18em] mb-4">Provider Keys</h3>
          <p className="text-xs text-white/45 mb-4">Password and secret fields stay blank after saving. That means they are hidden, not deleted.</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SecretInput label={`AISStream key${settings.apiKeys.aisstreamConfigured ? ' (configured)' : ''}`} value={form.apiKeys.aisstream} onChange={(value) => updateApi('aisstream', value)} placeholder="Paste AISStream key" />
            <TextInput label="Map tiles URL" value={form.apiKeys.mapTilesUrl} onChange={(value) => updateApi('mapTilesUrl', value)} />
            <TextInput label="OpenSky username" value={form.apiKeys.openskyUsername} onChange={(value) => updateApi('openskyUsername', value)} />
            <SecretInput label={`OpenSky password${settings.apiKeys.openskyPasswordConfigured ? ' (configured)' : ''}`} value={form.apiKeys.openskyPassword} onChange={(value) => updateApi('openskyPassword', value)} />
            <TextInput label="OpenSky OAuth client ID" value={form.apiKeys.openskyClientId} onChange={(value) => updateApi('openskyClientId', value)} />
            <SecretInput label={`OpenSky OAuth client secret${settings.apiKeys.openskyClientSecretConfigured ? ' (configured)' : ''}`} value={form.apiKeys.openskyClientSecret} onChange={(value) => updateApi('openskyClientSecret', value)} />
          </div>
        </section>

        <section className="border border-purple-300/20 bg-purple-950/10 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-mono text-lg uppercase tracking-[0.18em]">VHF Voice / Live Chatter</h3>
              <p className="text-sm text-white/50 mt-2 max-w-3xl">
                Add live audio stream URLs for aviation ATC, marine VHF, or your own SDR/Icecast feed. Audio appears as a toggle panel on the Flights map.
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-white/60">
              <input type="checkbox" checked={form.vhfAudio.enabled} onChange={(event) => updateVhf({ enabled: event.target.checked })} />
              Enabled
            </label>
          </div>

          <div className="space-y-4">
            {form.vhfAudio.channels.map((channel, index) => (
              <div key={channel.id || index} className="border border-white/10 bg-black/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs uppercase tracking-[0.2em] text-purple-200/70">Channel {index + 1}</div>
                  <button onClick={() => updateVhf({ channels: form.vhfAudio.channels.filter((_, i) => i !== index) })} className="border border-red-300/25 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-red-200/70 hover:bg-red-500/10">Remove</button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <TextInput label="Label" value={channel.label} onChange={(value) => updateVhfChannel(index, { label: value })} />
                  <TextInput label="Type" value={channel.type} onChange={(value) => updateVhfChannel(index, { type: value })} placeholder="ATC, Marine VHF, SDR" />
                  <TextInput label="Stream URL" value={channel.streamUrl} onChange={(value) => updateVhfChannel(index, { streamUrl: value })} />
                  <TextInput label="Region" value={channel.region || ''} onChange={(value) => updateVhfChannel(index, { region: value })} />
                  <TextInput label="Frequency" value={channel.frequency || ''} onChange={(value) => updateVhfChannel(index, { frequency: value })} />
                  <label className="block border border-white/10 bg-black/30 p-4"><div className="text-xs uppercase tracking-[0.2em] text-white/35 mb-2">Default</div><input type="radio" checked={form.vhfAudio.defaultChannelId === channel.id} onChange={() => updateVhf({ defaultChannelId: channel.id })} /></label>
                </div>
              </div>
            ))}
            <button onClick={() => updateVhf({ channels: [...form.vhfAudio.channels, blankChannel()] })} className="border border-purple-300/40 px-4 py-2 text-xs uppercase tracking-[0.2em] text-purple-200 hover:bg-purple-400/10">Add VHF Channel</button>
          </div>
        </section>

        <section className="border border-sky-300/20 bg-sky-950/10 p-5">
          <div className="flex items-start justify-between gap-4 mb-5"><div><h3 className="font-mono text-lg uppercase tracking-[0.18em]">DOT / National Traffic Feeds</h3><p className="text-sm text-white/50 mt-2 max-w-3xl">Country-wide traffic support is feed-based. Add national, state DOT, or custom GeoJSON/API endpoints for incidents, closures, and traffic cameras.</p></div><span className="border border-sky-300/30 text-sky-200 px-3 py-1 text-[10px] uppercase tracking-[0.2em]">{form.dotFeeds.providerMode || 'custom'}</span></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
            <TextInput label="National traffic feed" value={form.dotFeeds.nationalTrafficUrl} onChange={(value) => updateDot('nationalTrafficUrl', value)} />
            <TextInput label="Traffic incidents feed" value={form.dotFeeds.trafficUrl} onChange={(value) => updateDot('trafficUrl', value)} />
            <TextInput label="Traffic cameras feed" value={form.dotFeeds.camerasUrl} onChange={(value) => updateDot('camerasUrl', value)} />
            <TextInput label="Road closures feed" value={form.dotFeeds.roadClosuresUrl} onChange={(value) => updateDot('roadClosuresUrl', value)} />
            <TextInput label="Provider mode" value={form.dotFeeds.providerMode} onChange={(value) => updateDot('providerMode', value)} />
            <TextInput label="State feeds CSV" value={form.dotFeeds.states.join(',')} onChange={(value) => updateDot('states', value.split(',').map((item) => item.trim().toUpperCase()).filter(Boolean))} />
          </div>
        </section>
      </div>
    </div>
  );
};

function TextInput({ label, value, onChange, placeholder = '' }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="block border border-white/10 bg-black/30 p-4"><div className="text-xs uppercase tracking-[0.2em] text-white/35 mb-2">{label}</div><input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="w-full bg-black border border-white/15 px-3 py-2 text-sm text-white outline-none focus:border-intel-accent/60" /></label>;
}

function SecretInput({ label, value, onChange, placeholder = '' }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="block border border-white/10 bg-black/30 p-4"><div className="text-xs uppercase tracking-[0.2em] text-white/35 mb-2">{label}</div><input type="password" value={value} placeholder={placeholder || 'Leave blank to keep existing'} onChange={(event) => onChange(event.target.value)} className="w-full bg-black border border-white/15 px-3 py-2 text-sm text-white outline-none focus:border-intel-accent/60" /></label>;
}

function AssetUpload({ label, preview, onUpload, onClear }: { label: string; preview: string; onUpload: (dataUrl: string) => void; onClear: () => void }) {
  return <div className="border border-white/10 bg-black/30 p-4"><div className="text-xs uppercase tracking-[0.2em] text-white/35 mb-2">{label}</div><div className="flex items-center gap-4"><div className="w-16 h-16 border border-white/10 bg-black flex items-center justify-center overflow-hidden">{preview ? <img src={preview} alt="Preview" className="w-full h-full object-contain" /> : <span className="text-white/20 text-xs">None</span>}</div><div className="flex-1 space-y-2"><input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp,image/x-icon,image/vnd.microsoft.icon" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; onUpload(await fileToDataUrl(file)); }} className="block w-full text-xs text-white/60 file:mr-3 file:border file:border-intel-accent/40 file:bg-intel-accent/10 file:text-intel-accent file:px-3 file:py-1 file:uppercase file:tracking-wider" /><button onClick={onClear} className="border border-white/15 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/45 hover:text-white hover:border-white/35">Clear Upload</button></div></div></div>;
}
