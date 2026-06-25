import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const infrastructureApps = [
  { id: 'zabbix', label: 'Zabbix', icon: 'ZBX', role: 'Monitoring server and agent integration', port: '10050 / 10051', install: '/opt/dennco/olympus-command/scripts/install-infrastructure-apps.sh zabbix' },
  { id: 'agent-dvr', label: 'Agent DVR', icon: 'DVR', role: 'Open-source camera and surveillance console', port: '8090', install: '/opt/dennco/olympus-command/scripts/install-infrastructure-apps.sh agent-dvr' },
  { id: 'rc2', label: 'RadioConsole2', icon: 'RC2', role: 'Radio console app placeholder and integration surface', port: 'local', install: '/opt/dennco/olympus-command/scripts/install-infrastructure-apps.sh rc2' },
  { id: 'freepbx', label: 'FreePBX', icon: 'PBX', role: 'Open-source PBX and telephony management', port: '80 / 443', install: '/opt/dennco/olympus-command/scripts/install-infrastructure-apps.sh freepbx' },
  { id: 'gitlab', label: 'GitLab CE', icon: 'GL', role: 'Open-source GitLab Community Edition code hosting and DevOps platform', port: '80 / 443 / 22', install: '/opt/dennco/olympus-command/scripts/install-infrastructure-apps.sh gitlab' },
  { id: 'nethserver8', label: 'NethServer 8', icon: 'NS8', role: 'Cluster and container service administration', port: '9090', install: '/opt/dennco/olympus-command/scripts/install-infrastructure-apps.sh nethserver8' },
  { id: 'proxmox8', label: 'Proxmox 8', icon: 'PVE', role: 'Virtualization and node management console', port: '8006', install: '/opt/dennco/olympus-command/scripts/install-infrastructure-apps.sh proxmox8' },
];

export const InfrastructureAppsDock: React.FC = () => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeApp = infrastructureApps.find((app) => app.id === activeId) || null;

  const panel = (
    <>
      <div className="olympus-infra-app-dock fixed bottom-[118px] left-5 z-[4680] flex items-center gap-2 rounded-2xl border border-cyan-300/20 bg-black/80 px-2 py-1.5 font-mono shadow-[0_0_18px_rgba(34,211,238,0.14)] backdrop-blur">
        <div className="px-2 text-[8px] uppercase tracking-[0.16em] text-cyan-300/70">Infra Apps</div>
        {infrastructureApps.map((app) => (
          <button
            key={app.id}
            type="button"
            onClick={() => setActiveId((current) => current === app.id ? null : app.id)}
            className={`h-9 min-w-9 rounded-xl border px-2 text-[9px] uppercase tracking-[0.1em] transition ${activeId === app.id ? 'border-cyan-300/70 bg-cyan-300/15 text-cyan-100' : 'border-white/10 bg-white/[0.03] text-white/55 hover:border-cyan-300/45 hover:text-cyan-100'}`}
            title={app.label}
          >
            {app.icon}
          </button>
        ))}
      </div>

      {activeApp && (
        <section className="fixed bottom-[166px] left-5 z-[4685] w-[430px] rounded border border-cyan-300/25 bg-black/92 p-4 font-mono text-white shadow-[0_24px_80px_rgba(0,0,0,0.78)] backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">Olympus Infrastructure App</div>
              <div className="mt-1 text-2xl font-bold uppercase tracking-[0.12em] text-white">{activeApp.label}</div>
            </div>
            <button onClick={() => setActiveId(null)} className="border border-white/10 px-2 py-1 text-xs text-white/55 hover:text-red-200">×</button>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-white/55">{activeApp.role}</p>
          <div className="mt-4 grid gap-2 text-[10px] uppercase tracking-[0.12em] text-white/45">
            <div className="rounded border border-white/10 bg-white/[0.03] p-2"><span className="text-cyan-300">Default Port:</span> {activeApp.port}</div>
            <div className="rounded border border-white/10 bg-white/[0.03] p-2"><span className="text-cyan-300">Install Helper:</span><br /><code className="break-all normal-case tracking-normal text-white/75">sudo {activeApp.install}</code></div>
            <div className="rounded border border-white/10 bg-white/[0.03] p-2"><span className="text-cyan-300">Olympus Role:</span> Managed app launcher and local service integration surface.</div>
          </div>
        </section>
      )}
    </>
  );

  return typeof document !== 'undefined' ? createPortal(panel, document.body) : null;
};
