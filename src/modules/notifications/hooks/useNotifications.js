import { useCallback, useEffect, useState } from 'react';
import useAuthStore from '../../../store/useAuthStore';
import useNotificationsStore from '../../../store/useNotificationsStore';
import notificationsService from '../services/notificationService';

export const useNotifications = ({
  autoFetch = true,
  subscribe = true,
  onNewNotification,
} = {}) => {
  const user = useAuthStore((state) => state.user);
  const setNotifications = useNotificationsStore((state) => state.setNotifications);
  const addNotification = useNotificationsStore((state) => state.addNotification);
  const markReadLocal = useNotificationsStore((state) => state.markRead);
  const resetNotifications = useNotificationsStore((state) => state.resetNotifications);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(
    async (options = {}) => {
      if (!user?.id) {
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await notificationsService.listNotifications(options);
        setNotifications(data || []);
      } catch (err) {
        console.error('[useNotifications] Error loading notifications:', err);
        setError('No se pudieron cargar las notificaciones.');
      } finally {
        setLoading(false);
      }
    },
    [user?.id, setNotifications]
  );

  const markAsRead = useCallback(
    async (notificationId) => {
      try {
        await notificationsService.markAsRead(notificationId);
        markReadLocal(notificationId);
      } catch (err) {
        console.error('[useNotifications] Error marking as read:', err);
      }
    },
    [markReadLocal]
  );

  useEffect(() => {
    if (!autoFetch || !user?.id) return;
    fetchNotifications();
  }, [autoFetch, user?.id, fetchNotifications]);

  useEffect(() => {
    if (!subscribe || !user?.id) return;

    // TODO: Realtime subscription was removed because Supabase clients were deleted.
    // To restore realtime updates, a WebSocket connection to the backend or Supabase is required.

    return () => {};
  }, [subscribe, user?.id, addNotification, onNewNotification]);

  useEffect(() => {
    if (!user?.id) {
      resetNotifications();
    }
  }, [user?.id, resetNotifications]);

  return {
    loading,
    error,
    refresh: fetchNotifications,
    markAsRead,
  };
};
