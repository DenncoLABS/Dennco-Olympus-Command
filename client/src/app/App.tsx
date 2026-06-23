import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ShellLayout } from '../ui/layout/ShellLayout';
import { AppRoutes } from './routes';
import { LoginGate } from '../admin/LoginGate';
import { RuntimeSettingsProvider } from '../admin/runtimeSettings';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RuntimeSettingsProvider>
        <LoginGate>
          <ShellLayout>
            <AppRoutes />
          </ShellLayout>
        </LoginGate>
      </RuntimeSettingsProvider>
    </QueryClientProvider>
  );
};
