import React, { Suspense, lazy } from 'react';
import { useThemeStore } from '../ui/theme/theme.store';
import { AdminSettingsPage } from '../admin/AdminSettingsPage';

const IntelMapsApp = lazy(() =>
  import('../modules/intelmaps/IntelMapsApp').then((m) => ({ default: m.IntelMapsApp })),
);
const CadPage = lazy(() =>
  import('../modules/cad/CadPage').then((m) => ({ default: m.CadPage })),
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
    return <AdminSettingsPage />;
  }

  if (activeModule === 'cad') {
    return (
      <Suspense fallback={<PageLoader />}>
        <CadPage />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <IntelMapsApp />
    </Suspense>
  );
};
