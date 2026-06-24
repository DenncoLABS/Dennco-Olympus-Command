import { create } from 'zustand';

export type GlobalNotificationDomain = 'flight' | 'maritime' | 'monitor' | 'dot' | 'cad' | 'system';

export type GlobalNotification = {
  id: string;
  domain: GlobalNotificationDomain;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  details: string;
  timestamp: number;
  entityId?: string;
  reportedBy?: string;
};

type GlobalNotificationsState = {
  notifications: GlobalNotification[];
  pushNotification: (notification: Omit<GlobalNotification, 'id' | 'timestamp'> & { id?: string; timestamp?: number }) => void;
  clearNotifications: () => void;
};

export const useGlobalNotificationsStore = create<GlobalNotificationsState>((set) => ({
  notifications: [],
  pushNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          id: notification.id || `global-${notification.domain}-${Date.now()}`,
          timestamp: notification.timestamp || Date.now(),
          ...notification,
        },
        ...state.notifications,
      ].slice(0, 20),
    })),
  clearNotifications: () => set({ notifications: [] }),
}));
