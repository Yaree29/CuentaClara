import { create } from 'zustand';

const countUnread = (items = []) => items.filter((item) => !item.read_at).length;

const useNotificationsStore = create((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (items = []) =>
    set({
      notifications: items,
      unreadCount: countUnread(items),
    }),

  addNotification: (item) =>
    set((state) => {
      const exists = state.notifications.some((n) => n.id === item.id);
      const notifications = exists ? state.notifications : [item, ...state.notifications];
      return {
        notifications,
        unreadCount: countUnread(notifications),
      };
    }),

  markRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((item) =>
        item.id === id ? { ...item, read_at: new Date().toISOString() } : item
      );
      return {
        notifications,
        unreadCount: countUnread(notifications),
      };
    }),

  markAllAsRead: () =>
    set((state) => {
      const now = new Date().toISOString();
      const notifications = state.notifications.map((item) => ({
        ...item,
        read_at: item.read_at || now,
      }));
      return {
        notifications,
        unreadCount: 0,
      };
    }),

  resetNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));

export default useNotificationsStore;
