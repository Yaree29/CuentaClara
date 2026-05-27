import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../services/supabaseClient';
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
        console.log('[useNotifications] Skipping fetch - no user id');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        console.log('[useNotifications] Fetching notifications for user:', user.id);
        const data = await notificationsService.listNotifications(options);
        console.log('[useNotifications] Got notifications:', data?.length || 0);
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

    let channel;
    
    try {
      channel = supabase.channel(`notifications:${user.id}`);
      
      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const notification = payload?.new;
            if (!notification) return;
            addNotification(notification);
            if (typeof onNewNotification === 'function') {
              onNewNotification(notification);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('[useNotifications] Realtime subscription active');
          }
        });
    } catch (err) {
      console.error('[useNotifications] Error setting up realtime:', err);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
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
