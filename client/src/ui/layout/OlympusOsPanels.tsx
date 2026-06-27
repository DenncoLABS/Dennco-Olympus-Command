import React from 'react';
import { olympusOsTools } from './olympusOsManifest';

export function CoreOsPanel() {
  return (
    <div>
      <h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">Core system</h3>
      <p className="mt-3 text-sm text-white/60">Olympus Core is the local control surface for desktop launchers, services, packages, folders, modules, and command apps.</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {olympusOsTools.map((tool) => (
          <div key={tool.id} className="border border-white/10 bg-white/[0.03] p-3">
            <div className="text-sm font-bold text-white"><span className="mr-2 text-cyan-200">{tool.icon}</span>{tool.title}</div>
            <div className="mt-1 text-xs text-white/45">{tool.description}</div>
            <div className={`mt-2 text-[10px] uppercase tracking-[0.14em] ${tool.stage === 'active' ? 'text-emerald-300/75' : 'text-amber-300/70'}`}>{tool.stage}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ServicesPanel() {
  return (
    <div>
      <h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">Services</h3>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        {['Olympus Web Service', 'Olympus CAD Service', 'Core Data Services', 'Desktop Session'].map((svc) => (
          <div key={svc} className="border border-white/10 bg-white/[0.03] p-3">
            <div className="font-bold text-white">{svc}</div>
            <div className="mt-1 text-xs text-white/40">status hook planned</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PackagesPanel() {
  return (
    <div>
      <h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">Packages</h3>
      <p className="mt-3 text-sm text-white/60">Package view for installed Olympus build, repository health, and update status. Live package checks will attach here later.</p>
    </div>
  );
}

export function GnomePanel() {
  return (
    <div>
      <h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">GNOME integration</h3>
      <p className="mt-3 text-sm text-white/60">The Debian package installs launcher and autostart assets for a desktop appliance workflow.</p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        {['/usr/share/applications/olympus-command.desktop', '/etc/xdg/autostart/olympus-command.desktop', '/usr/share/pixmaps/dennco-olympus-command.svg', 'scripts/install-gnome-desktop.sh'].map((path) => (
          <div key={path} className="border border-cyan-300/15 bg-cyan-400/5 p-3 text-cyan-100">{path}</div>
        ))}
      </div>
    </div>
  );
}
