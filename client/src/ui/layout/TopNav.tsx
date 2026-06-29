import React from 'react';
import { useThemeStore } from '../theme/theme.store';
import { useRuntimeSettings } from '../../admin/runtimeSettings';
import '../../modules/intelmaps/intelMapsToolbarCollapse';
import '../../modules/flights/flightsPerformancePatch';
import './tileWorkspaceScope';
import './appsDirectoryDeskInjection';
import './monitoringLauncherPatch';
import './deskAiLauncher';
import './pveDefaultUrlPatch';
import './mapIntervalGuard';
import './filesDeskBrowser';
import './deskWorkspaceEventSync';
import '../../styles/dock-latch-visibility-override.css';

export const TopNav: React.FC = () => {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const { settings } = useRuntimeSettings();
  const logoSrc = settings.branding.logoDataUrl || settings.branding.logoUrl;

  return (
    <header className="h-14 bg-intel-bg border-b border-intel-accent/40 shadow-[0_4px_20px_rgba(0,229,255,0.1)] flex items-center px-6 justify-between z-[5000] relative box-border overflow-visible">
      <div className="flex items-center gap-8 h-full overflow-visible">
        <div className="flex items-center gap-3">
          {logoSrc ? (
            <img src={logoSrc} alt="" className="h-7 w-7 object-contain" />
          ) : (
            <div className="olympus-providence-mark" aria-hidden="true">
              <svg viewBox="0 0 100 100" role="img" focusable="false">
                <circle cx="50" cy="52" r="43" />
                <path d="M50 9 91 82H9L50 9Z" />
                <path d="M22 59C30 47 39 41 50 41s20 6 28 18c-8 12-17 18-28 18s-20-6-28-18Z" />
                <circle cx="50" cy="59" r="10" />
                <path d="M33 34h34M29 74h42M37 24h26M39 85h22" />
              </svg>
            </div>
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
      </div>

      <div className="flex gap-4 items-center h-full text-intel-text font-mono text-xs tracking-wider">
        <div className="hidden 2xl:flex items-center gap-2 border-r border-intel-accent/30 pr-4 h-8 text-[10px] uppercase tracking-[0.14em] text-white/45">
          <span>Purpose:</span>
          <span className="text-white/70">Operational Awareness Support</span>
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
        </div>
      </div>
    </header>
  );
};
