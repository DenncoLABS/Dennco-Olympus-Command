import React from 'react';
import { useThemeStore } from '../ui/theme/theme.store';
import { OlympusWorkspaceShell, type OlympusWorkspaceAction } from '../ui/layout/OlympusWorkspaceShell';
import { AdminSettingsPage } from './AdminSettingsPage';

export const AdminSettingsWorkspace: React.FC = () => {
  const setActiveModule = useThemeStore((state) => state.setActiveModule);
  const actions: OlympusWorkspaceAction[] = [
    { id: 'close', label: '× Close Admin', tone: 'danger', onClick: () => setActiveModule('core') },
  ];

  return (
    <OlympusWorkspaceShell
      title="Admin Settings"
      subtitle="Protected runtime settings, provider configuration, branding, VHF audio, DOT feeds, and system controls."
      surfaceLabel="Protected Admin Workspace"
      actions={actions}
    >
      <div className="relative h-full overflow-hidden bg-[#020617]">
        <AdminSettingsPage />
      </div>
    </OlympusWorkspaceShell>
  );
};
