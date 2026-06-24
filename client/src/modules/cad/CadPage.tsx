import React from 'react';
import { useRuntimeSettings } from '../../admin/runtimeSettings';

export const CadPage: React.FC = () => {
  const { settings } = useRuntimeSettings();
  const resgridUrl = settings.cad.resgridUrl || '/cad/';
  const configured = Boolean(resgridUrl && resgridUrl !== '/cad/');

  return (
    <section className="absolute inset-0 bg-intel-bg text-intel-text-light overflow-hidden">
      <div className="absolute left-0 right-0 top-0 h-16 border-b border-intel-accent/30 bg-black/45 backdrop-blur flex items-center justify-between px-6 z-20">
        <div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-intel-accent/80 font-mono">Computer-Aided Dispatch</div>
          <h2 className="text-xl font-mono font-bold tracking-[0.16em] uppercase">CAD / Resgrid</h2>
        </div>
        <div className="text-right font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">
          <div>Embedded Open-Source CAD</div>
          <div className="text-white/35">Repository-controlled integration</div>
        </div>
      </div>

      {configured ? (
        <iframe
          title="Olympus CAD - Resgrid"
          src={resgridUrl}
          className="absolute inset-x-0 bottom-0 top-16 h-[calc(100%-4rem)] w-full border-0 bg-white"
          sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"
        />
      ) : (
        <div className="absolute inset-0 top-16 flex items-center justify-center p-8">
          <div className="max-w-3xl border border-intel-accent/30 bg-black/35 p-8 shadow-[0_0_35px_rgba(0,229,255,0.1)]">
            <div className="text-intel-accent font-mono text-xs uppercase tracking-[0.22em] mb-4">CAD integration ready</div>
            <h3 className="text-2xl font-mono font-bold uppercase tracking-[0.16em] mb-4">Point Olympus at Resgrid</h3>
            <p className="text-sm text-white/70 leading-6 mb-6">
              Olympus now has a hard-coded CAD module slot. Deploy the DenncoLABS Resgrid service and set
              <span className="font-mono text-intel-accent"> OLYMPUS_CAD_URL </span>
              or save a CAD URL in Admin runtime settings. A reverse proxy path such as
              <span className="font-mono text-intel-accent"> /cad/ </span>
              keeps Resgrid inside the Olympus command surface.
            </p>
            <div className="grid gap-3 text-xs font-mono text-white/65">
              <div className="border border-white/10 bg-white/5 p-3">Default embed path: /cad/</div>
              <div className="border border-white/10 bg-white/5 p-3">Runtime setting: cad.resgridUrl</div>
              <div className="border border-white/10 bg-white/5 p-3">Repository: {settings.cad.repositoryUrl}</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
