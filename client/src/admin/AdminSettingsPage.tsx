import React from 'react';
import { useRuntimeSettings } from './runtimeSettings';

const providerLabels: Record<string, string> = {
  aisstream: 'AISStream',
  opensky: 'OpenSky',
  mapTiles: 'Map tiles',
};

export const AdminSettingsPage: React.FC = () => {
  const { settings, reload } = useRuntimeSettings();

  return (
    <div className="absolute inset-0 overflow-auto bg-intel-bg p-8 text-intel-text-light">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-intel-accent/70 mb-2">Admin Console</div>
            <h2 className="font-mono text-3xl font-bold tracking-[0.15em] uppercase">Settings</h2>
            <p className="mt-3 text-sm text-white/50 max-w-3xl">
              Manage authentication, NethServer 8 directory settings, API providers, feature toggles, branding, and custom CSS themes.
            </p>
          </div>
          <button onClick={() => void reload()} className="border border-intel-accent/50 px-4 py-2 text-xs uppercase tracking-[0.2em] text-intel-accent hover:bg-intel-accent/10">
            Reload
          </button>
        </div>

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
            <h3 className="font-mono text-lg uppercase tracking-[0.18em] mb-4">Branding</h3>
            <div className="space-y-3 text-sm">
              <div><div className="text-white/35">Product</div><div>{settings.branding.productName}</div></div>
              <div><div className="text-white/35">Short name</div><div>{settings.branding.shortName}</div></div>
              <div><div className="text-white/35">Footer</div><div>{settings.branding.footerText}</div></div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border border-white/10 bg-black/30 p-5">
            <h3 className="font-mono text-lg uppercase tracking-[0.18em] mb-4">Feature Toggles</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {Object.entries(settings.featureToggles).map(([key, enabled]) => (
                <div key={key} className="border border-white/10 px-4 py-3 flex justify-between">
                  <span className="capitalize">{key}</span>
                  <span className={enabled ? 'text-emerald-300' : 'text-red-300'}>{enabled ? 'On' : 'Off'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-black/30 p-5">
            <h3 className="font-mono text-lg uppercase tracking-[0.18em] mb-4">CSS Injector</h3>
            <p className="text-sm text-white/50 mb-4">
              Custom CSS is loaded from server runtime settings and injected into the page only when the CSS injector toggle is enabled.
            </p>
            <pre className="max-h-56 overflow-auto border border-white/10 bg-black/60 p-4 text-xs text-white/60 whitespace-pre-wrap">
              {settings.theme.customCss || 'No custom CSS loaded.'}
            </pre>
          </div>
        </section>

        <section className="border border-amber-300/20 bg-amber-950/10 p-5 text-sm text-amber-100/75">
          Editable forms will be wired to protected server-side settings storage in the next pass. This page currently reads runtime settings, provider status, branding, toggles, and injected CSS safely without exposing secrets.
        </section>
      </div>
    </div>
  );
};
