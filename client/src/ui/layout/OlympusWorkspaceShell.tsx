import React from 'react';

export type OlympusWorkspaceAction = {
  id: string;
  label: string;
  active?: boolean;
  tone?: 'default' | 'primary' | 'success' | 'danger';
  onClick: () => void;
};

export type OlympusWorkspaceShellProps = {
  title: string;
  subtitle: string;
  surfaceLabel?: string;
  actions?: OlympusWorkspaceAction[];
  children: React.ReactNode;
};

function actionClass(action: OlympusWorkspaceAction) {
  if (action.tone === 'danger') return 'border-red-400/40 bg-red-500/10 text-red-200 hover:border-red-300/60';
  if (action.tone === 'success') return 'border-emerald-300/35 bg-emerald-300/10 text-emerald-100 hover:border-emerald-200/60';
  if (action.tone === 'primary' || action.active) return 'border-cyan-300/55 bg-cyan-300/15 text-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.18)]';
  return 'border-white/10 bg-white/[0.03] text-white/60 hover:border-cyan-300/35 hover:text-cyan-100';
}

export const OlympusWorkspaceShell: React.FC<OlympusWorkspaceShellProps> = ({
  title,
  subtitle,
  surfaceLabel = 'Workspace Surface',
  actions = [],
  children,
}) => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#020617] font-mono text-white">
      <div className="absolute left-4 right-4 top-4 z-[20] flex flex-wrap items-center justify-between gap-3 rounded border border-cyan-300/20 bg-black/70 px-3 py-2 backdrop-blur">
        <div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-cyan-300">{title}</div>
          <div className="text-[9px] uppercase tracking-[0.16em] text-white/40">{subtitle}</div>
        </div>
        {actions.length ? (
          <div className="flex flex-wrap items-center justify-end gap-2">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={action.onClick}
                className={`rounded border px-3 py-1 text-[10px] uppercase tracking-[0.14em] transition ${actionClass(action)}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="absolute inset-x-4 bottom-4 top-20 overflow-hidden rounded border border-cyan-300/20 bg-black/45 shadow-[0_24px_60px_rgba(0,0,0,0.72)]">
        <div className="flex h-10 items-center justify-between border-b border-cyan-300/15 bg-[#05070b]/90 px-3">
          <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">{title}</div>
          <div className="text-[9px] uppercase tracking-[0.14em] text-white/35">{surfaceLabel}</div>
        </div>
        <div className="h-[calc(100%-40px)] overflow-hidden bg-[#020617]">
          {children}
        </div>
      </div>
    </div>
  );
};
