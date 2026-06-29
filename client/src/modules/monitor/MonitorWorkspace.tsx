import React from 'react';
import { OlympusWorkspaceShell } from '../../ui/layout/OlympusWorkspaceShell';
import { MonitorDeskWorkspace } from './widgets/MonitorDeskWorkspace';

export const MonitorWorkspace: React.FC = () => {
  return (
    <OlympusWorkspaceShell
      title="Monitor Workspace"
      subtitle="Operational widget staging, notification surfaces, Earth pinning, and live intelligence feed layout."
      surfaceLabel="Monitor Widget Surface"
      showDefaultClose
    >
      <div className="h-full overflow-hidden bg-[#020617] p-4">
        <MonitorDeskWorkspace />
      </div>
    </OlympusWorkspaceShell>
  );
};
