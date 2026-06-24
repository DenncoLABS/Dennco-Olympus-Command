import React, { useEffect, useState } from 'react';
import { useRuntimeSettings } from './runtimeSettings';

export const CadSettingsPanel: React.FC = () => {
  const { settings, reload } = useRuntimeSettings();
  const [resgridUrl, setResgridUrl] = useState(settings.cad.resgridUrl || '/cad/');
  const [serviceUrl, setServiceUrl] = useState(settings.cad.serviceUrl || 'http://127.0.0.1:5050/');
  const [mode, setMode] = useState(settings.cad.mode || 'embedded-resgrid');
  const [status, setStatus] = useState('');

  useEffect(() => {
    setResgridUrl(settings.cad.resgridUrl || '/cad/');
    setServiceUrl(settings.cad.serviceUrl || 'http://127.0.0.1:5050/');
    setMode(settings.cad.mode || 'embedded-resgrid');
  }, [settings.cad.mode, settings.cad.resgridUrl, settings.cad.serviceUrl]);

  const save = async () => {
    setStatus('Saving CAD settings...');
    const response = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cad: { mode, resgridUrl, serviceUrl } }),
    });
    if (!response.ok) {
      setStatus('CAD settings save failed.');
      return;
    }
    setStatus('CAD settings saved.');
    await reload();
  };

  return (
    <section className="border border-amber-300/20 bg-amber-950/10 p-5">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="font-mono text-lg uppercase tracking-[0.18em]">CAD / Resgrid</h3>
          <p className="text-sm text-white/50 mt-2 max-w-3xl">
            CAD is part of Olympus. The browser embeds the protected CAD path while Olympus proxies that path to the local service target.
          </p>
        </div>
        <button onClick={() => void save()} className="border border-amber-300/40 px-4 py-2 text-xs uppercase tracking-[0.2em] text-amber-200 hover:bg-amber-400/10">
          Save CAD
        </button>
      </div>
      {status && <div className="mb-4 border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm text-amber-200">{status}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <label className="block border border-white/10 bg-black/30 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-white/35 mb-2">CAD embed path</div>
          <input value={resgridUrl} onChange={(event) => setResgridUrl(event.target.value)} placeholder="/cad/" className="w-full bg-black border border-white/15 px-3 py-2 text-sm text-white outline-none focus:border-intel-accent/60" />
        </label>
        <label className="block border border-white/10 bg-black/30 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-white/35 mb-2">Local service target</div>
          <input value={serviceUrl} onChange={(event) => setServiceUrl(event.target.value)} placeholder="http://127.0.0.1:5050/" className="w-full bg-black border border-white/15 px-3 py-2 text-sm text-white outline-none focus:border-intel-accent/60" />
        </label>
        <label className="block border border-white/10 bg-black/30 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-white/35 mb-2">CAD mode</div>
          <input value={mode} onChange={(event) => setMode(event.target.value)} placeholder="embedded-resgrid" className="w-full bg-black border border-white/15 px-3 py-2 text-sm text-white outline-none focus:border-intel-accent/60" />
        </label>
        <div className="block border border-white/10 bg-black/30 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-white/35 mb-2">Source repository</div>
          <div className="text-sm text-white/65 break-all">{settings.cad.repositoryUrl}</div>
        </div>
      </div>
    </section>
  );
};
