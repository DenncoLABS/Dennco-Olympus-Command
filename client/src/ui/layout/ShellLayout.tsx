import React, { type ReactNode } from 'react';
import { TopNav } from './TopNav';
import { useThemeStore } from '../theme/theme.store';
import { clsx } from 'clsx';
import { Github, Shield } from 'lucide-react';
import { useRuntimeSettings } from '../../admin/runtimeSettings';
import '../theme/crt.css';
import '../theme/flir.css';
import '../theme/eo.css';

interface ShellLayoutProps {
  children: ReactNode;
}

export const ShellLayout: React.FC<ShellLayoutProps> = ({ children }) => {
  const mode = useThemeStore((s) => s.mode);
  const { settings } = useRuntimeSettings();

  return (
    <div className={clsx('flex flex-col h-screen w-screen overflow-hidden', `theme-${mode}`)}>
      <TopNav />
      <main className="flex-1 relative bg-intel-bg">{children}</main>
      <footer className="flex items-center justify-center gap-4 px-4 py-1.5 bg-black/70 border-t border-white/10 text-[10px] text-white/40 shrink-0">
        <span className="font-bold tracking-[0.2em] text-white/70 uppercase text-[11px]">
          {settings.branding.shortName}
        </span>
        <span className="text-white/15">|</span>
        <span>{settings.branding.footerText}</span>
        <span className="text-white/15">|</span>
        <span className="group flex items-center gap-1 text-emerald-300/70">
          <Shield size={11} className="opacity-70" />
          <span>{settings.auth.nethserver8Enabled ? 'NethServer 8 Directory Ready' : 'Local Admin Mode'}</span>
        </span>
        <span className="text-white/15">|</span>
        <a
          href="https://github.com/DenncoLABS/Dennco-Olympus-Command"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-1 transition-all duration-200 hover:text-white"
          style={{ textShadow: 'none' }}
          onMouseEnter={(e) => (e.currentTarget.style.textShadow = '0 0 8px rgba(255,255,255,0.8)')}
          onMouseLeave={(e) => (e.currentTarget.style.textShadow = 'none')}
        >
          <Github size={11} className="opacity-60 group-hover:opacity-100 transition-opacity" />
          <span>GitHub</span>
        </a>
      </footer>
    </div>
  );
};
