import React, { useMemo, useState } from 'react';
import { useThemeStore, type ActiveModule } from '../theme/theme.store';
import { useRuntimeSettings } from '../../admin/runtimeSettings';
import { logoutAdmin } from '../../admin/LoginGate';

const intelModules: Array<{ id: ActiveModule; label: string }> = [
  { id: 'flights', label: 'Flights' },
  { id: 'maritime', label: 'Maritime' },
  { id: 'monitor', label: 'Monitor' },
  { id: 'dot', label: 'DOT' },
  { id: 'cyber', label: 'Cyber' },
];

export const TopNav: React.FC = () => {
  // Fine-grained selectors — each only re-renders TopNav when its own slice changes.
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const mapProjection = useThemeStore((s) => s.mapProjection);
  const setMapProjection = useThemeStore((s) => s.setMapProjection);
  const activeModule = useThemeStore((s) => s.activeModule);
  const setActiveModule = useThemeStore((s) => s.setActiveModule);
  const { settings } = useRuntimeSettings();
  const logoSrc = settings.branding.logoDataUrl || settings.branding.logoUrl;
  const [intelOpen, setIntelOpen] = useState(false);

  const enabledIntelModules = useMemo(
    () => intelModules.filter((module) => settings.featureToggles[module.id] !== false),
    [settings.featureToggles],
  );
  const activeIntelModule = enabledIntelModules.find((module) => module.id === activeModule);
  const intelActive = Boolean(activeIntelModule);

  const openIntelModule = (module: ActiveModule) => {
    setActiveModule(module);
    setIntelOpen(false);
  };

  return (
    <header className="h-14 bg-intel-bg border-b border-intel-accent/40 shadow-[0_4px_20px_rgba(0,229,255,0.1)] flex items-center px-6 justify-between z-10 relative box-border">
      {/* Left side: Logo & Module Nav */}
      <div className="flex items-center gap-8 h-full">
        <div className="flex items-center gap-3">
          {logoSrc ? (
            <img src={logoSrc} alt="" className="h-7 w-7 object-contain" />
          ) : (
            <div className="w-2 h-2 bg-intel-accent animate-pulse shadow-[0_0_8px_var(--color-intel-accent)]"></div>
          )}
          <h1 className="text-intel-text-light font-mono font-bold text-2xl tracking-[0.2em] shrink-0 drop-shadow-[0_0_8px_rgba(224,242,254,0.5)]">
            {settings.branding.shortName}
          </h1>
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 border border-blue-400/30 bg-blue-950/30 text-[10px] font-mono uppercase tracking-[0.16em] text-blue-100/85 shadow-[0_0_12px_rgba(59,130,246,0.18)]">
            <span>U.S. Company</span>
            <span className="text-white/25">|</span>
            <span>Dennco Information Systems</span>
          </div>
        </div>

        <nav className="flex gap-4 h-full pt-4">
          <div className="relative h-full" onMouseLeave={() => setIntelOpen(false)}>
            <button
              onClick={() => setIntelOpen((open) => !open)}
              onMouseEnter={() => setIntelOpen(true)}
              className={`px-4 h-full border-b-2 font-mono text-sm tracking-widest uppercase transition-all ${
                intelActive
                  ? 'border-intel-accent text-intel-accent drop-shadow-[0_0_8px_var(--color-intel-accent)] bg-gradient-to-t from-intel-accent/10 to-transparent'
                  : 'border-transparent text-intel-text hover:text-intel-text-light hover:border-intel-text/50 opacity-70 hover:opacity-100'
              }`}
              aria-haspopup="menu"
              aria-expanded={intelOpen}
            >
              INTEL
              <span className="ml-2 text-[10px] opacity-60">{activeIntelModule ? activeIntelModule.label : 'Screens'} ▾</span>
            </button>

            {intelOpen && (
              <div className="absolute left-0 top-full mt-0 min-w-[220px] border border-intel-accent/30 bg-[#05070b]/95 shadow-[0_18px_35px_rgba(0,0,0,0.75)] backdrop-blur z-50 py-2" role="menu">
                <div className="px-3 pb-2 text-[9px] uppercase tracking-[0.18em] text-white/35 font-mono">
                  Intel Screens
                </div>
                {enabledIntelModules.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => openIntelModule(module.id)}
                    className={`w-full text-left px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] border-l-2 transition-all ${
                      activeModule === module.id
                        ? 'border-intel-accent bg-intel-accent/10 text-intel-accent'
                        : 'border-transparent text-intel-text-light/65 hover:text-intel-text-light hover:bg-white/5 hover:border-white/20'
                    }`}
                    role="menuitem"
                  >
                    {module.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveModule('admin')}
            className={`px-4 h-full border-b-2 font-mono text-sm tracking-widest uppercase transition-all ${
              activeModule === 'admin'
                ? 'border-intel-accent text-intel-accent drop-shadow-[0_0_8px_var(--color-intel-accent)] bg-gradient-to-t from-intel-accent/10 to-transparent'
                : 'border-transparent text-intel-text hover:text-intel-text-light hover:border-intel-text/50 opacity-70 hover:opacity-100'
            }`}
          >
            Admin
          </button>
        </nav>
      </div>

      {/* Right side: View toggles */}
      <div className="flex gap-4 items-center h-full text-intel-text font-mono text-xs tracking-wider">
        <div className="hidden 2xl:flex items-center gap-2 border-r border-intel-accent/30 pr-4 h-8 text-[10px] uppercase tracking-[0.14em] text-white/45">
          <span>Purpose:</span>
          <span className="text-white/70">Operational Awareness Support</span>
        </div>
        <div className="flex items-center gap-2 border-r border-intel-accent/30 pr-4 h-8">
          <span className="opacity-50">PROJECTION:</span>
          <button
            onClick={() => setMapProjection(mapProjection === 'mercator' ? 'globe' : 'mercator')}
            className={`px-3 py-1 bg-intel-bg border border-intel-accent/50 text-intel-accent hover:bg-intel-accent/10 hover:shadow-[0_0_8px_var(--color-intel-accent)] transition-all uppercase`}
          >
            {mapProjection}
          </button>
        </div>

        <div className="flex items-center gap-2 h-8">
          <span className="opacity-50">SENSOR:</span>
          {(['eo', 'flir', 'crt'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 transition-all uppercase border ${
                mode === m
                  ? 'border-intel-accent bg-intel-accent/10 text-intel-accent shadow-[0_0_8px_rgba(0,229,255,0.4)]'
                  : 'border-intel-panel bg-intel-bg hover:border-intel-accent/50 text-intel-text'
              }`}
            >
              {m}
            </button>
          ))}
          <button onClick={logoutAdmin} className="ml-2 px-3 py-1 border border-white/15 text-white/45 hover:text-white hover:border-white/35 uppercase">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};
