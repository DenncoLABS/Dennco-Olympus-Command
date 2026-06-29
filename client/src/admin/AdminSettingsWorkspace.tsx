import React from 'react';
import { OlympusWorkspaceShell } from '../ui/layout/OlympusWorkspaceShell';
import { AdminSettingsPage } from './AdminSettingsPage';

export const AdminSettingsWorkspace: React.FC = () => {
  return (
    <OlympusWorkspaceShell
      title="Admin Settings"
      subtitle="Protected runtime settings, provider configuration, branding, VHF audio, DOT feeds, and system controls."
      surfaceLabel="Protected Admin Workspace"
      showDefaultClose
    >
      <div className="relative h-full overflow-hidden bg-[#020617]">
        <AdminSettingsPage />
      </div>
    </OlympusWorkspaceShell>
  );
};
