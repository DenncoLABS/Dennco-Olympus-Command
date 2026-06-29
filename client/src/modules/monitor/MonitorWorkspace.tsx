import React from 'react';
import { useThemeStore } from '../../ui/theme/theme.store';
import { OlympusWorkspaceShell, type OlympusWorkspaceAction } from '../../ui/layout/OlympusWorkspaceShell';
import { MonitorDeskWorkspace } from './widgets/MonitorDeskWorkspace';

export const MonitorWorkspace: React.FC = () => {
  const setActiveModule = useThemeStore((state) => state.setActiveModule);
  const actions: OlympusWorkspaceAction[] = [
    { id: 'close', label: '× Close Monitor', tone: 'danger', onClick: () => setActiveModule('core') },
  ];

  return (
    <OlympusWorkspaceShell
      title="Monitor Workspace"
      subtitle="Operational widget staging, notification surfaces, Earth pinning, and live intelligence feed layout."
      surfaceLabel="Monitor Widget Surface"
      actions={actions}
    >
      <div className="h-full overflow-hidden bg-[#020617] p-4">
        <MonitorDeskWorkspace />
      </div>
    </OlympusWorkspaceShell>
  );
};
