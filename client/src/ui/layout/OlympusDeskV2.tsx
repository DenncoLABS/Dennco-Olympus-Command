import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRuntimeSettings } from '../../admin/runtimeSettings';
import type { ActiveModule } from '../theme/theme.store';
import { MonitorDeskWorkspace } from '../../modules/monitor/widgets/MonitorDeskWorkspace';

type DeskView = 'core' | 'apps' | 'files' | 'architecture' | 'terminal' | 'services' | 'packages' | 'flight' | 'maritime' | 'monitor' | 'dot' | 'cad' | 'admin' | 'settings';
type DockPlacement = 'left' | 'center' | 'right';
type DeskStatus = 'active' | 'planned' | 'protected';
type DeskItem = { id: string; label: string; icon: string; view: DeskView; module?: ActiveModule; group?: string; description?: string; status?: DeskStatus };
type FileEntry = { path: string; type: string; role: string; status: DeskStatus };

const HEIGHT_KEY = 'olympus.desk.v2.height';
const DOCK_KEY = 'olympus.desk.v2.dock';
const VIEW_KEY = 'olympus.desk.v2.view';

const deskItems: DeskItem[] = [
  { id: 'core', label: 'Core', icon: 'Ω', view: 'core', group: 'OS', status: 'active', description: 'Olympus Core system overview and Debian/GNOME shell plan.' },
  { id: 'apps', label: 'Apps', icon: '▦', view: 'apps', group: 'OS', status: 'active', description: 'App browser and launcher for all Olympus modules.' },
  { id: 'files', label: 'Files', icon: '▣', view: 'files', group: 'OS', status: 'active', description: 'Hard-coded file browser for Olympus system paths.' },
  { id: 'architecture', label: 'Architecture', icon: '⌬', view: 'architecture', group: 'OS', status: 'active', description: 'Visual system architecture map.' },
  { id: 'terminal', label: 'Terminal', icon: '⌁', view: 'terminal', group: 'OS', status: 'active', description: 'Controlled terminal workspace placeholder.' },
  { id: 'services', label: 'Services', icon: '◫', view: 'services', group: 'System', status: 'planned', description: 'Systemd services and health controls.' },
  { id: 'packages', label: 'Packages', icon: '⬡', view: 'packages', group: 'System', status: 'planned', description: 'Debian package and apt repo controls.' },
  { id: 'flights', label: 'Flight', icon: '✈', view: 'flight', module: 'flights', group: 'Operational', status: 'active', description: 'Aircraft, emergencies, aviation infrastructure, and weather overlays.' },
  { id: 'maritime', label: 'Maritime', icon: '⛴', view: 'maritime', module: 'maritime', group: 'Operational', status: 'active', description: 'AIS vessels, vessel dossiers, maritime state, and Mayday context.' },
  { id: 'monitor', label: 'Monitor', icon: '◉', view: 'monitor', module: 'monitor', group: 'Operational', status: 'active', description: 'Global monitor map and saved intelligence widgets.' },
  { id: 'dot', label: 'DOT', icon: '◆', view: 'dot', module: 'dot', group: 'Operational', status: 'active', description: 'Traffic events, CCTV, road flow, and DOT feeds.' },
  { id: 'cad', label: 'CAD', icon: '☷', view: 'cad', module: 'cad', group: 'Operational', status: 'active', description: 'Dispatch, calls, units, personnel, logs, reports, trainings, inventory.' },
  { id: 'admin', label: 'Admin', icon: '⚙', view: 'admin', module: 'admin', group: 'System', status: 'protected', description: 'Runtime settings, branding, API keys, and feature toggles.' },
  { id: 'settings', label: 'Settings', icon: '◎', view: 'settings', group: 'OS', status: 'planned', description: 'Desk, Dock, GNOME, and shell settings.' },
];

const fileEntries: FileEntry[] = [
  { path: '/opt/dennco/olympus-command', type: 'directory', role: 'Installed Olympus application root', status: 'active' },
  { path: '/opt/dennco/olympus-command/client', type: 'directory', role: 'React interface bundle and client assets', status: 'active' },
  { path: '/opt/dennco/olympus-command/server', type: 'directory', role: 'Express API, routes, provider services, diagnostics', status: 'active' },
  { path: '/opt/dennco/olympus-command/ops/cad/olympus-cad', type: 'directory', role: 'Local CAD service and persistent CAD GUI', status: 'active' },
  { path: '/etc/dennco/olympus-command/olympus-command.env', type: 'config', role: 'Runtime settings, API keys, admin access, provider configuration', status: 'protected' },
  { path: '/var/lib/dennco/olympus-cad/cad-state.json', type: 'state', role: 'Persistent CAD calls, units, personnel, logs, reports, inventory', status: 'active' },
  { path: '/var/lib/dennco/olympus-cad/calls', type: 'directory', role: 'CAD incident folders and call artifacts', status: 'active' },
  { path: '/usr/share/applications/olympus-command.desktop', type: 'desktop', role: 'GNOME application launcher target', status: 'planned' },
  { path: '/etc/xdg/autostart/olympus-command.desktop', type: 'desktop', role: 'GNOME autostart target', status: 'planned' },
  { path: '/usr/share/icons/hicolor/256x256/apps/olympus-command.png', type: 'icon', role: 'GNOME launcher icon target', status: 'planned' },
];

const architectureNodes = [
  ['Debian Base', 'Host OS packages, apt repository, systemd, local state directories'],
  ['GNOME Shell', 'Desktop launcher, autostart entry, future kiosk/session integration'],
  ['Olympus Core GUI', 'TopNav, Tile Screens, full-width Desk, Dock launcher'],
  ['Tile Screens', 'Primary monitor viewing surface. Intel Maps opens map workspaces from tiles and closes back to tiles.'],
  ['Olympus Desk', 'Apps, Files, Architecture, Terminal, Services, Packages, Settings'],
  ['Intel Maps App', 'Flight, Maritime, Monitor, DOT, and Cyber maps attach to the Intel Maps workspace bar.'],
  ['API Layer', 'Express routes, diagnostics, provider normalization, local CAD service'],
  ['State/Data', 'Runtime settings, CAD state, caches, folders, future file actions'],
] as const;

const serviceRows = [
  ['dennco-olympus-command', 'Main Olympus web/API service', 'active placeholder'],
  ['olympus-cad', 'Local CAD Core service on port 5050', 'active placeholder'],
  ['nginx / reverse proxy', 'Public entrypoint and local routing', 'planned check'],
  ['GNOME session', 'Future shell/autostart integration', 'planned'],
] as const;

const packageRows = [
  ['dennco-olympus-command', 'Current apt package installed from Dennco repo', 'managed'],
  ['Publish Apt Package', 'GitHub Actions workflow for Debian package publishing', 'manual or watched path'],
  ['packaging/* trigger', 'Small file change used to wake package workflow', 'active process'],
  ['/var/lib/apt/lists', 'Apt list cache cleared before reinstall verification', 'server-side'],
] as const;

function savedNumber(key: string, fallback: number) {
  const value = Number(localStorage.getItem(key));
  return Number.isFinite(value) ? value : fallback;
}

function clampHeight(value: number) {
  return Math.max(112, Math.min(value, Math.floor(window.innerHeight * 0.72)));
}

function savedDock(): DockPlacement {
  const value = localStorage.getItem(DOCK_KEY);
  return value === 'left' || value === 'right' || value === 'center' ? value : 'center';
}

function savedView(): DeskView {
  const value = localStorage.getItem(VIEW_KEY) as DeskView | null;
  return deskItems.some((item) => item.view === value) ? value as DeskView : 'core';
}

export const OlympusDeskV2: React.FC = () => {
  const { settings } = useRuntimeSettings();
  const [height, setHeight] = useState(() => clampHeight(savedNumber(HEIGHT_KEY, 240)));
  const [open, setOpen] = useState(true);
  const [view, setView] = useState<DeskView>(() => savedView());
  const [dock, setDock] = useState<DockPlacement>(() => savedDock());
  const resizeRef = useRef<{ pointerId: number; startY: number; startHeight: number } | null>(null);
  const launchers = useMemo(() => deskItems.filter((item) => !item.module || settings.featureToggles[item.module] !== false), [settings.featureToggles]);

  useEffect(() => { localStorage.setItem(HEIGHT_KEY, String(height)); }, [height]);
  useEffect(() => { localStorage.setItem(VIEW_KEY, view); }, [view]);
  useEffect(() => { localStorage.setItem(DOCK_KEY, dock); }, [dock]);
  useEffect(() => {
    const onResize = () => setHeight((current) => clampHeight(current));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const startResize = (event: React.PointerEvent<HTMLDivElement>) => {
    resizeRef.current = { pointerId: event.pointerId, startY: event.clientY, startHeight: height };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveResize = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = resizeRef.current;
    if (!state || state.pointerId !== event.pointerId) return;
    setHeight(clampHeight(state.startHeight + state.startY - event.clientY));
  };
  const stopResize = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = resizeRef.current;
    if (!state || state.pointerId !== event.pointerId) return;
    resizeRef.current = null;
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* noop */ }
  };
  const dockClass = dock === 'left' ? 'justify-start' : dock === 'right' ? 'justify-end' : 'justify-center';

  return (
    <section className="relative z-[4200] w-full shrink-0 border-t border-cyan-300/25 bg-black/90 font-mono text-white shadow-[0_-16px_40px_rgba(0,0,0,0.82)]" style={{ height: `${open ? height : 44}px` }}>
      <div className="absolute left-1/2 top-0 z-20 h-4 w-48 -translate-x-1/2 cursor-ns-resize rounded-b border-x border-b border-cyan-300/25 bg-cyan-300/10 text-center text-[8px] uppercase tracking-[0.24em] text-cyan-200/65" onPointerDown={startResize} onPointerMove={moveResize} onPointerUp={stopResize} onPointerCancel={stopResize}>Drag Desk</div>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex h-11 items-center justify-between border-b border-white/10 px-4 pt-2">
          <div><div className="text-[10px] uppercase tracking-[0.26em] text-cyan-300">Olympus Desk</div><div className="text-[9px] uppercase tracking-[0.16em] text-white/40">Full-width OS workspace · Apps Browser · File Browser · Core GUI</div></div>
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-white/45">
            <button onClick={() => setDock('left')} className={`border px-2 py-1 ${dock === 'left' ? 'border-cyan-300/60 text-cyan-200' : 'border-white/10 hover:border-cyan-300/40'}`}>Dock Left</button>
            <button onClick={() => setDock('center')} className={`border px-2 py-1 ${dock === 'center' ? 'border-cyan-300/60 text-cyan-200' : 'border-white/10 hover:border-cyan-300/40'}`}>Dock Center</button>
            <button onClick={() => setDock('right')} className={`border px-2 py-1 ${dock === 'right' ? 'border-cyan-300/60 text-cyan-200' : 'border-white/10 hover:border-cyan-300/40'}`}>Dock Right</button>
            <button onClick={() => setOpen((value) => !value)} className="border border-white/10 px-2 py-1 text-cyan-200 hover:border-cyan-300/60">{open ? 'Hide' : 'Show'}</button>
          </div>
        </div>

        {open && <><div className="min-h-0 flex-1 overflow-hidden px-4 py-3"><DeskApp view={view} setView={setView} dock={dock} setDock={setDock} height={height} setHeight={setHeight} /></div><div className={`flex border-t border-cyan-300/15 bg-black/65 px-3 py-2 ${dockClass}`}><div className="flex max-w-full items-end gap-2 overflow-x-auto rounded-2xl border border-cyan-300/20 bg-white/[0.03] px-3 py-2 shadow-[0_0_24px_rgba(34,211,238,0.12)]"><div className="mr-2 hidden min-w-[110px] flex-col items-start border-r border-white/10 pr-3 md:flex"><span className="text-[9px] uppercase tracking-[0.22em] text-cyan-300">Olympus Dock</span><span className="text-[8px] uppercase tracking-[0.16em] text-white/35">Launcher</span></div>{launchers.map((item) => <button key={item.id} type="button" onClick={() => setView(item.view)} className={`group flex min-w-[58px] flex-col items-center justify-center rounded-xl border px-2 py-1.5 transition-all ${view === item.view ? 'border-cyan-300/60 bg-cyan-400/15 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.25)]' : 'border-white/10 bg-white/[0.03] text-white/55 hover:border-cyan-300/40 hover:bg-cyan-400/10 hover:text-cyan-100'}`} title={item.label}><span className="text-lg leading-none">{item.icon}</span><span className="mt-1 text-[8px] uppercase tracking-[0.1em]">{item.label}</span></button>)}</div></div></>}
      </div>
    </section>
  );
};

function DeskApp({ view, setView, dock, setDock, height, setHeight }: { view: DeskView; setView: (view: DeskView) => void; dock: DockPlacement; setDock: (dock: DockPlacement) => void; height: number; setHeight: (height: number) => void }) {
  const title = deskItems.find((item) => item.view === view)?.label || view;
  return (
    <div className="grid h-full grid-cols-[270px_1fr] gap-4 text-white/70">
      <aside className="rounded border border-white/10 bg-black/35 p-3 overflow-auto custom-scrollbar">
        <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">Desk Window</div>
        <div className="mt-2 text-2xl font-bold uppercase tracking-[0.14em] text-white">{title}</div>
        <div className="mt-2 text-xs leading-relaxed text-white/45">Olympus Desk apps run inside this workspace. Tile screens and map workspaces remain above the Desk.</div>
        <div className="mt-4 space-y-1 text-[10px] uppercase tracking-[0.12em] text-white/40">
          <button onClick={() => setView('apps')} className="block w-full border border-white/10 px-2 py-1 text-left hover:border-cyan-300/40 hover:text-cyan-200">Open Apps Browser</button>
          <button onClick={() => setView('files')} className="block w-full border border-white/10 px-2 py-1 text-left hover:border-cyan-300/40 hover:text-cyan-200">Open File Browser</button>
          <button onClick={() => setView('architecture')} className="block w-full border border-white/10 px-2 py-1 text-left hover:border-cyan-300/40 hover:text-cyan-200">Visualize Architecture</button>
          <button onClick={() => setView('terminal')} className="block w-full border border-white/10 px-2 py-1 text-left hover:border-cyan-300/40 hover:text-cyan-200">Open Terminal</button>
          <button onClick={() => setView('settings')} className="block w-full border border-white/10 px-2 py-1 text-left hover:border-cyan-300/40 hover:text-cyan-200">Desk Settings</button>
        </div>
      </aside>
      <main className="min-h-0 overflow-hidden rounded border border-cyan-300/15 bg-[#020617]/70">
        <div className="flex h-9 items-center justify-between border-b border-white/10 bg-white/[0.03] px-3">
          <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">{title} Window</span>
          <span className="text-[9px] uppercase tracking-[0.14em] text-white/35">GNOME-style Olympus shell</span>
        </div>
        <div className="h-[calc(100%-36px)] overflow-auto custom-scrollbar p-4">
          {view === 'core' && <CoreView />}
          {view === 'apps' && <AppsView setView={setView} />}
          {view === 'files' && <FilesView />}
          {view === 'architecture' && <ArchitectureView />}
          {view === 'terminal' && <TerminalView />}
          {view === 'services' && <ServicesView />}
          {view === 'packages' && <PackagesView />}
          {view === 'monitor' && <MonitorDeskWorkspace />}
          {view === 'settings' && <SettingsView dock={dock} setDock={setDock} height={height} setHeight={setHeight} />}
          {['flight', 'maritime', 'dot', 'cad', 'admin'].includes(view) && <ModuleView view={view} />}
        </div>
      </main>
    </div>
  );
}

function CoreView() { return <div><h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">Core System</h3><p className="mt-3 text-sm text-white/60">Olympus Core is the OS control surface for Debian/GNOME services, tile screens, package state, data folders, apps, and command modules.</p><div className="mt-4 grid grid-cols-2 gap-3 text-xs"><StatusCard title="Debian Host" value="apt + systemd underneath Olympus" status="active" /><StatusCard title="Tile Screens" value="core route and monitor viewing surface" status="active" /><StatusCard title="Intel Maps App" value="Flight, Maritime, Monitor, DOT, Cyber workspace" status="active" /><StatusCard title="Systemd Service" value="dennco-olympus-command" status="active" /><StatusCard title="CAD Service" value="olympus-cad · :5050/health" status="active" /><StatusCard title="GNOME Launcher" value="/usr/share/applications/olympus-command.desktop" status="planned" /></div></div>; }
function AppsView({ setView }: { setView: (view: DeskView) => void }) { const groups = ['OS', 'Operational', 'System']; return <div><h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">Apps Browser</h3><p className="mt-2 text-sm text-white/55">Hard-coded Olympus app browser. Click Open to load an app inside the Desk.</p>{groups.map((group) => <section key={group} className="mt-4"><div className="text-[10px] uppercase tracking-[0.18em] text-white/35">{group}</div><div className="mt-2 grid grid-cols-2 gap-3 xl:grid-cols-3">{deskItems.filter((item) => item.group === group).map((item) => <article key={item.id} className="border border-white/10 bg-white/[0.03] p-3 hover:border-cyan-300/35"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-xl text-cyan-200">{item.icon}</span><span className="font-bold text-white">{item.label}</span></div><span className={`text-[9px] uppercase tracking-[0.12em] ${item.status === 'active' ? 'text-emerald-300' : item.status === 'protected' ? 'text-amber-300' : 'text-white/35'}`}>{item.status}</span></div><p className="mt-2 text-xs text-white/45">{item.description}</p><button onClick={() => setView(item.view)} className="mt-3 border border-cyan-300/25 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-cyan-200 hover:bg-cyan-300/10">Open</button></article>)}</div></section>)}</div>; }
function FilesView() { const [selected, setSelected] = useState<FileEntry>(fileEntries[0]); return <div className="grid h-full grid-cols-[1fr_320px] gap-4"><div><h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">File Browser</h3><div className="mt-3 overflow-hidden border border-white/10"><table className="w-full text-left text-xs"><thead className="bg-white/[0.04] text-white/35 uppercase tracking-[0.14em]"><tr><th className="p-2">Path</th><th className="p-2">Type</th><th className="p-2">Status</th></tr></thead><tbody>{fileEntries.map((entry) => <tr key={entry.path} onClick={() => setSelected(entry)} className={`cursor-pointer border-t border-white/5 hover:bg-cyan-300/5 ${selected.path === entry.path ? 'bg-cyan-300/10 text-cyan-100' : 'text-white/60'}`}><td className="p-2 font-mono">{entry.path}</td><td className="p-2 uppercase text-white/35">{entry.type}</td><td className="p-2 uppercase text-white/35">{entry.status}</td></tr>)}</tbody></table></div></div><aside className="border border-cyan-300/15 bg-black/35 p-3"><div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">Selected File</div><div className="mt-3 break-all font-mono text-sm text-white">{selected.path}</div><div className="mt-3 text-xs leading-relaxed text-white/55">{selected.role}</div><div className="mt-4 grid gap-2 text-[10px] uppercase tracking-[0.14em]"><button className="border border-white/10 px-2 py-1 text-white/35">Open preview later</button><button className="border border-white/10 px-2 py-1 text-white/35">Ask Olympus later</button><button className="border border-white/10 px-2 py-1 text-white/35">Visualize dependency later</button></div></aside></div>; }
function ArchitectureView() { return <div><h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">Architecture Viewer</h3><div className="mt-4 grid gap-2">{architectureNodes.map(([label, detail], index) => <div key={label} className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300/30 text-xs text-cyan-200">{index + 1}</div><div className="flex-1 border border-white/10 bg-white/[0.03] p-3"><div className="text-sm font-bold text-white">{label}</div><div className="text-xs text-white/45">{detail}</div></div></div>)}</div></div>; }
function TerminalView() { return <div className="h-full rounded border border-emerald-400/20 bg-black p-4 font-mono text-sm text-emerald-300 shadow-inner"><div className="text-[10px] uppercase tracking-[0.2em] text-emerald-200/60">Olympus Terminal</div><div className="mt-4">olympus:~$ <span className="animate-pulse">_</span></div><div className="mt-3 text-xs text-emerald-300/55">Controlled backend command actions will be wired later. Planned actions include service health checks, apt package status, and CAD health checks.</div><div className="mt-5 grid gap-2 text-xs text-emerald-300/55"><code>systemctl status dennco-olympus-command</code><code>curl -s http://127.0.0.1:5050/health</code><code>dpkg -l | grep dennco-olympus-command</code></div></div>; }
function ServicesView() { return <TableView title="Debian / Olympus Services" intro="Service status placeholders for the OS Desk. Live systemd/API checks can be wired into this panel later." headers={['Service', 'Role', 'State']} rows={serviceRows} />; }
function PackagesView() { return <TableView title="Debian Package Controls" intro="Package and workflow placeholders for apt publish, reinstall verification, and future GUI controls." headers={['Package / Area', 'Role', 'State']} rows={packageRows} />; }
function SettingsView({ dock, setDock, height, setHeight }: { dock: DockPlacement; setDock: (dock: DockPlacement) => void; height: number; setHeight: (height: number) => void }) { return <div><h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">Desk / Dock Settings</h3><p className="mt-2 text-sm text-white/55">Local Desk settings are saved in browser localStorage. These controls stage the future GNOME-style shell preferences.</p><div className="mt-4 grid gap-3 md:grid-cols-2"><StatusCard title="Dock Placement" value={dock} status="saved locally" /><StatusCard title="Desk Height" value={`${height}px`} status="saved locally" /><StatusCard title="Tile Screen Behavior" value="Core route shows tile screens. Intel Maps closes back to tiles." status="active" /><StatusCard title="GNOME Integration" value="desktop file, autostart, icon package, kiosk mode" status="planned" /></div><div className="mt-4 flex gap-2 text-[10px] uppercase tracking-[0.14em]"><button onClick={() => setDock('left')} className="border border-white/10 px-2 py-1 text-white/55 hover:border-cyan-300/40 hover:text-cyan-200">Dock Left</button><button onClick={() => setDock('center')} className="border border-white/10 px-2 py-1 text-white/55 hover:border-cyan-300/40 hover:text-cyan-200">Dock Center</button><button onClick={() => setDock('right')} className="border border-white/10 px-2 py-1 text-white/55 hover:border-cyan-300/40 hover:text-cyan-200">Dock Right</button><button onClick={() => setHeight(240)} className="border border-white/10 px-2 py-1 text-white/55 hover:border-cyan-300/40 hover:text-cyan-200">Reset Height</button></div></div>; }
function ModuleView({ view }: { view: DeskView }) { return <div><h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">{view} workspace</h3><p className="mt-3 text-sm text-white/60">Desk workspace for {view}. Tile screens and Intel Maps remain unchanged until a widget is intentionally placed onto them.</p><div className="mt-4 grid gap-3 md:grid-cols-2"><StatusCard title="Desk App Surface" value={`${view} opens inside Olympus Desk`} status="active" /><StatusCard title="Tile Screens" value="No automatic map takeover" status="protected" /><StatusCard title="Future Widgets" value="Draggable windows can later pin to Intel Maps" status="planned" /><StatusCard title="Local State" value="Desk view and dock settings saved locally" status="active" /></div></div>; }
function TableView({ title, intro, headers, rows }: { title: string; intro: string; headers: readonly string[]; rows: readonly (readonly string[])[] }) { return <div><h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">{title}</h3><p className="mt-2 text-sm text-white/55">{intro}</p><div className="mt-4 overflow-hidden border border-white/10"><table className="w-full text-left text-xs"><thead className="bg-white/[0.04] text-white/35 uppercase tracking-[0.14em]"><tr>{headers.map((header) => <th key={header} className="p-2">{header}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row[0]} className="border-t border-white/5 text-white/60 hover:bg-cyan-300/5">{row.map((cell) => <td key={cell} className="p-2">{cell}</td>)}</tr>)}</tbody></table></div></div>; }
function StatusCard({ title, value, status }: { title: string; value: string; status: string }) { return <div className="border border-white/10 bg-white/[0.03] p-3"><div className="text-[10px] uppercase tracking-[0.18em] text-white/35">{title}</div><div className="mt-1 break-all font-mono text-white">{value}</div><div className="mt-2 text-[9px] uppercase tracking-[0.14em] text-cyan-300">{status}</div></div>; }
