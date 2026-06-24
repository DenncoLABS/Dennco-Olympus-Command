import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ShellLayout } from '../ui/layout/ShellLayout';
import { AppRoutes } from './routes';
import { AppSessionSync } from './AppSessionSync';
import { LoginGate } from '../admin/LoginGate';
import { RuntimeSettingsProvider } from '../admin/runtimeSettings';
import { GlobalNotificationsPanel } from '../notifications/GlobalNotificationsPanel';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RuntimeSettingsProvider>
        <LoginGate>
          <AppSessionSync />
          <ShellLayout>
            <AppRoutes />
          </ShellLayout>
          <GlobalNotificationsPanel />
        </LoginGate>
      </RuntimeSettingsProvider>
    </QueryClientProvider>
  );
};
