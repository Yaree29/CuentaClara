import { useCallback, useEffect, useState } from 'react';
import useAuthStore from '../../../store/useAuthStore';
import useNotificationsStore from '../../../store/useNotificationsStore';
import notificationsService from '../services/notificationService';
import { supabase } from '../../../services/supabaseClient';

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

  const businessId = user?.business?.id || user?.business_id;

  useEffect(() => {
    if (!subscribe || !user?.id || !businessId) return;

    // Realtime: nuevas notificaciones del negocio llegan sin refrescar. La RLS
    // activa en `notifications` + la sesión autenticada del SDK garantizan que
    // solo lleguen las del propio negocio.
    const channel = supabase
      .channel(`notifications:${businessId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `business_id=eq.${businessId}`,
        },
        (payload) => {
          addNotification(payload.new);
          onNewNotification?.(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [subscribe, user?.id, businessId, addNotification, onNewNotification]);

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
