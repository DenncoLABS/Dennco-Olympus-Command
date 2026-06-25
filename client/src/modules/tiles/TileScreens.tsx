import React from 'react';
import { useThemeStore, type ActiveModule } from '../../ui/theme/theme.store';

const mapTiles: Array<{ id: ActiveModule; title: string; icon: string; detail: string }> = [
  { id: 'flights', title: 'Flight Map', icon: '✈', detail: 'Aircraft, emergencies, aviation infrastructure, and weather overlays.' },
  { id: 'maritime', title: 'Maritime Map', icon: '⛴', detail: 'AIS vessels, ports, incidents, and maritime operating picture.' },
  { id: 'monitor', title: 'Monitor Map', icon: '◉', detail: 'Global monitor, alerts, Gulf watch, and regional intelligence.' },
  { id: 'dot', title: 'DOT Map', icon: '◆', detail: 'Traffic cameras, road events, flow visualization, and closures.' },
  { id: 'cyber', title: 'Cyber Map', icon: '⬡', detail: 'Cyber operations and internet intelligence workspace.' },
];

const systemTiles: Array<{ id: ActiveModule; title: string; icon: string; detail: string }> = [
  { id: 'cad', title: 'CAD Core', icon: '☷', detail: 'Dispatch, personnel, calls, units, reports, documents, and logs.' },
  { id: 'admin', title: 'Admin', icon: '⚙', detail: 'Runtime settings, branding, API keys, feature toggles, and system configuration.' },
];

export const TileScreens: React.FC = () => {
  const setActiveModule = useThemeStore((state) => state.setActiveModule);

  return (
    <div className="absolute inset-0 overflow-auto bg-[#020617] p-6 font-mono text-white custom-scrollbar">
      <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(rgba(34,211,238,0.12)_1px,transparent_1px)] bg-[size:28px_28px]" />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded border border-cyan-300/20 bg-black/70 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
          <div className="text-[10px] uppercase tracking-[0.32em] text-cyan-300">Olympus Tile Screens</div>
          <h2 className="mt-2 text-2xl font-bold uppercase tracking-[0.18em] text-white">Command Tiles</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/50">
            Tile screens are the base Olympus viewing surface. Opening Intel Maps launches the map app and attaches Flight, Maritime, Monitor, DOT, and Cyber maps inside that workspace. Closing Intel Maps returns here and closes every map window attached to it.
          </p>
        </header>

        <section>
          <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300/80">Intel Maps App</div>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {mapTiles.map((tile) => (
              <button
                key={tile.id}
                type="button"
                onClick={() => setActiveModule(tile.id)}
                className="group min-h-[170px] rounded border border-white/10 bg-white/[0.035] p-4 text-left transition hover:border-cyan-300/50 hover:bg-cyan-300/10"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl text-cyan-200 drop-shadow-[0_0_12px_rgba(34,211,238,0.35)]">{tile.icon}</span>
                  <span className="text-[9px] uppercase tracking-[0.16em] text-white/30 group-hover:text-cyan-200/70">Open</span>
                </div>
                <div className="mt-5 text-sm font-bold uppercase tracking-[0.16em] text-white">{tile.title}</div>
                <p className="mt-2 text-xs leading-relaxed text-white/45">{tile.detail}</p>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/35">System Tiles</div>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {systemTiles.map((tile) => (
              <button
                key={tile.id}
                type="button"
                onClick={() => setActiveModule(tile.id)}
                className="group min-h-[140px] rounded border border-white/10 bg-black/50 p-4 text-left transition hover:border-cyan-300/50 hover:bg-white/[0.06]"
              >
                <div className="text-2xl text-cyan-200">{tile.icon}</div>
                <div className="mt-4 text-sm font-bold uppercase tracking-[0.16em] text-white">{tile.title}</div>
                <p className="mt-2 text-xs leading-relaxed text-white/45">{tile.detail}</p>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
