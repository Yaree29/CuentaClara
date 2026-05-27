import { create } from 'zustand';

const countUnread = (items = []) => items.filter((item) => !item.is_read).length;

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
        item.id === id ? { ...item, is_read: true } : item
      );
      return {
        notifications,
        unreadCount: countUnread(notifications),
      };
    }),

  markAllAsRead: () =>
    set((state) => {
      const notifications = state.notifications.map((item) => ({
        ...item,
        is_read: true,
      }));
      return {
        notifications,
        unreadCount: 0,
      };
    }),

  removeReadNotifications: () =>
    set((state) => {
      const notifications = state.notifications.filter((item) => !item.is_read);
      return {
        notifications,
        unreadCount: countUnread(notifications),
      };
    }),

  resetNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));

export default useNotificationsStore;
