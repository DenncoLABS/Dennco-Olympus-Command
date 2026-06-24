import React, { useMemo, useState } from 'react';
import { useRuntimeSettings } from '../../admin/runtimeSettings';
import { useThemeStore, type ActiveModule } from '../theme/theme.store';

type DeskView = 'core' | 'apps' | 'architecture' | 'settings';

type DeskItem = {
  id: string;
  label: string;
  icon: string;
  module?: ActiveModule;
  view?: DeskView;
};

const deskItems: DeskItem[] = [
  { id: 'core', label: 'Core', icon: 'Ω', view: 'core' },
  { id: 'apps', label: 'Apps', icon: '▦', view: 'apps' },
  { id: 'architecture', label: 'Architecture', icon: '⌬', view: 'architecture' },
  { id: 'flights', label: 'Flight', icon: '✈', module: 'flights' },
  { id: 'maritime', label: 'Maritime', icon: '⛴', module: 'maritime' },
  { id: 'monitor', label: 'Monitor', icon: '◉', module: 'monitor' },
  { id: 'dot', label: 'DOT', icon: '◆', module: 'dot' },
  { id: 'cad', label: 'CAD', icon: '☷', module: 'cad' },
  { id: 'admin', label: 'Admin', icon: '⚙', module: 'admin' },
  { id: 'settings', label: 'Settings', icon: '◎', view: 'settings' },
];

export const OlympusDesk: React.FC = () => {
  const activeModule = useThemeStore((state) => state.activeModule);
  const setActiveModule = useThemeStore((state) => state.setActiveModule);
  const { settings } = useRuntimeSettings();
  const [activeView, setActiveView] = useState<DeskView | null>(null);

  const enabledItems = useMemo(
    () => deskItems.filter((item) => !item.module || settings.featureToggles[item.module] !== false),
    [settings.featureToggles],
  );

  const openItem = (item: DeskItem) => {
    if (item.module) {
      setActiveModule(item.module);
      setActiveView(null);
      return;
    }
    setActiveView((current) => (current === item.view ? null : item.view || null));
  };

  return (
    <>
      {activeView && <DeskWindow view={activeView} onClose={() => setActiveView(null)} />}
      <div className="fixed left-1/2 bottom-8 z-[4200] -translate-x-1/2 pointer-events-auto font-mono">
        <div className="flex items-end gap-2 rounded-2xl border border-cyan-300/25 bg-black/80 px-3 py-2 shadow-[0_0_30px_rgba(34,211,238,0.18)] backdrop-blur-xl">
          <div className="mr-2 hidden md:flex flex-col items-start border-r border-white/10 pr-3">
            <span className="text-[9px] uppercase tracking-[0.22em] text-cyan-300">Olympus Desk</span>
            <span className="text-[8px] uppercase tracking-[0.16em] text-white/35">Navigation Dock</span>
          </div>
          {enabledItems.map((item) => {
            const selected = item.module ? activeModule === item.module : activeView === item.view;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => openItem(item)}
                className={`group flex min-w-[54px] flex-col items-center justify-center rounded-xl border px-2 py-1.5 transition-all ${
                  selected
                    ? 'border-cyan-300/60 bg-cyan-400/15 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.25)]'
                    : 'border-white/10 bg-white/[0.03] text-white/55 hover:border-cyan-300/40 hover:bg-cyan-400/10 hover:text-cyan-100'
                }`}
                title={item.label}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                <span className="mt-1 text-[8px] uppercase tracking-[0.1em]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

function DeskWindow({ view, onClose }: { view: DeskView; onClose: () => void }) {
  return (
    <div className="fixed bottom-28 left-1/2 z-[4100] w-[680px] max-w-[calc(100vw-32px)] -translate-x-1/2 pointer-events-auto font-mono">
      <div className="tech-panel overflow-hidden shadow-[0_22px_54px_rgba(0,0,0,0.85)]">
        <div className="tech-panel-header flex items-center justify-between border-b border-cyan-300/25 px-4 py-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">Olympus Desk</div>
            <div className="mt-1 text-lg font-bold uppercase tracking-[0.14em] text-white">{view}</div>
          </div>
          <button type="button" onClick={onClose} className="text-cyan-300 hover:text-white">[X]</button>
        </div>
        <div className="p-4 text-sm text-white/70">
          {view === 'core' && <div>Core navigation shell is online.</div>}
          {view === 'apps' && <div>Olympus apps are available from the desk dock.</div>}
          {view === 'architecture' && <div>Architecture viewer placeholder. Module map will be added here next.</div>}
          {view === 'settings' && <div>Desk settings placeholder. Runtime customization will be added here later.</div>}
        </div>
      </div>
    </div>
  );
}
