import React from 'react';
import { useRuntimeSettings } from '../../admin/runtimeSettings';
import { useThemeStore } from '../../ui/theme/theme.store';
import { OlympusWorkspaceShell, type OlympusWorkspaceAction } from '../../ui/layout/OlympusWorkspaceShell';

export const CadPage: React.FC = () => {
  const { settings } = useRuntimeSettings();
  const setActiveModule = useThemeStore((state) => state.setActiveModule);
  const cadUrl = settings.cad.resgridUrl || '/cad/';

  const actions: OlympusWorkspaceAction[] = [
    { id: 'external', label: 'External', onClick: () => window.open(cadUrl, '_blank', 'noopener,noreferrer') },
    { id: 'close', label: '× Close CAD', tone: 'danger', onClick: () => setActiveModule('core') },
  ];

  return (
    <OlympusWorkspaceShell
      title="CAD / Resgrid"
      subtitle="Computer-aided dispatch workspace · embedded open-source CAD · authenticated by Olympus"
      surfaceLabel="CAD Workspace Surface"
      actions={actions}
    >
      <iframe
        title="Olympus CAD - Resgrid"
        src={cadUrl}
        className="h-full w-full border-0 bg-black"
        sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"
      />
    </OlympusWorkspaceShell>
  );
};
