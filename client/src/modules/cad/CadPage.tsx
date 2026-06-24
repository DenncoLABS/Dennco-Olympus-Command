import React from 'react';
import { useRuntimeSettings } from '../../admin/runtimeSettings';

export const CadPage: React.FC = () => {
  const { settings } = useRuntimeSettings();
  const cadUrl = settings.cad.resgridUrl || '/cad/';

  return (
    <section className="absolute inset-0 bg-intel-bg text-intel-text-light overflow-hidden">
      <div className="absolute left-0 right-0 top-0 h-16 border-b border-intel-accent/30 bg-black/45 backdrop-blur flex items-center justify-between px-6 z-20">
        <div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-intel-accent/80 font-mono">Computer-Aided Dispatch</div>
          <h2 className="text-xl font-mono font-bold tracking-[0.16em] uppercase">CAD / Resgrid</h2>
        </div>
        <div className="text-right font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">
          <div>Embedded Open-Source CAD</div>
          <div className="text-white/35">Authenticated by Olympus</div>
        </div>
      </div>

      <iframe
        title="Olympus CAD - Resgrid"
        src={cadUrl}
        className="absolute inset-x-0 bottom-0 top-16 h-[calc(100%-4rem)] w-full border-0 bg-black"
        sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"
      />
    </section>
  );
};
