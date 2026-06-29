import React, { Suspense, lazy } from 'react';
import { useThemeStore } from '../ui/theme/theme.store';
import { TileScreens } from '../modules/tiles/TileScreens';

const AdminSettingsWorkspace = lazy(() =>
  import('../admin/AdminSettingsWorkspace').then((m) => ({ default: m.AdminSettingsWorkspace })),
);
const IntelMapsApp = lazy(() =>
  import('../modules/intelmaps/IntelMapsApp').then((m) => ({ default: m.IntelMapsApp })),
);
const CadPage = lazy(() =>
  import('../modules/cad/CadPage').then((m) => ({ default: m.CadPage })),
);
const ZbxWorkspace = lazy(() =>
  import('../modules/zbx/ZbxWorkspace').then((m) => ({ default: m.ZbxWorkspace })),
);
const ServiceWorkspace = lazy(() =>
  import('../modules/services/ServiceWorkspace').then((m) => ({ default: m.ServiceWorkspace })),
);
const LabNodeWorkspace = lazy(() =>
  import('../modules/labnode/LabNodeWorkspace').then((m) => ({ default: m.LabNodeWorkspace })),
);

const PageLoader: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-intel-bg">
    <span className="text-intel-text-light/40 text-xs font-mono tracking-widest uppercase animate-pulse">
      Loading…
    </span>
  </div>
);

export const AppRoutes: React.FC = () => {
  const activeModule = useThemeStore((s) => s.activeModule);

  if (activeModule === 'admin') {
    return (
      <Suspense fallback={<PageLoader />}>
        <AdminSettingsWorkspace />
      </Suspense>
    );
  }

  if (activeModule === 'cad') {
    return (
      <Suspense fallback={<PageLoader />}>
        <CadPage />
      </Suspense>
    );
  }

  if (activeModule === 'labnode') {
    return (
      <Suspense fallback={<PageLoader />}>
        <LabNodeWorkspace />
      </Suspense>
    );
  }

  if (activeModule === 'zbx') {
    return (
      <Suspense fallback={<PageLoader />}>
        <ZbxWorkspace />
      </Suspense>
    );
  }

  if (activeModule === 'svc') {
    return (
      <Suspense fallback={<PageLoader />}>
        <ServiceWorkspace />
      </Suspense>
    );
  }

  if (activeModule === 'core') {
    return <TileScreens />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <IntelMapsApp />
    </Suspense>
  );
};
