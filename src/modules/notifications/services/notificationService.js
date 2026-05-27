import { supabase } from '../../../services/supabaseClient';
import useAuthStore from '../../../store/useAuthStore';

const notificationsService = {
  listNotifications: async ({ unreadOnly = false, limit = 50, offset = 0 } = {}) => {
    const user = useAuthStore.getState().user;
    if (!user?.id) {
      throw new Error('No hay sesión activa. Por favor inicia sesión nuevamente.');
    }

    try {
      console.log('[notificationService] Fetching notifications for user:', user.id);
      
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id);

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      console.log('[notificationService] Got notifications:', data?.length || 0);
      return data || [];
    } catch (err) {
      console.error('[notificationService] Error loading notifications:', err);
      throw err;
    }
  },

  markAsRead: async (notificationId) => {
    const user = useAuthStore.getState().user;
    if (!user?.id) {
      throw new Error('No hay sesión activa.');
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      console.error('[notificationService] Error marking as read:', err);
      throw err;
    }
  },

  registerPushToken: async ({ token, deviceType = 'ios' }) => {
    const user = useAuthStore.getState().user;
    if (!user?.id) {
      throw new Error('No hay sesión activa.');
    }

    try {
      const { data, error } = await supabase
        .from('push_tokens')
        .upsert(
          {
            user_id: user.id,
            token,
            device_type: deviceType,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,token' }
        )
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      console.error('[notificationService] Error registering push token:', err);
      throw err;
    }
  },

  deleteReadNotifications: async () => {
    const user = useAuthStore.getState().user;
    if (!user?.id) {
      throw new Error('No hay sesión activa.');
    }

    try {
      console.log('[notificationService] Deleting read notifications for user:', user.id);
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
        .eq('is_read', true);

      if (error) {
        throw error;
      }

      console.log('[notificationService] Read notifications deleted successfully');
      return { success: true };
    } catch (err) {
      console.error('[notificationService] Error deleting read notifications:', err);
      throw err;
    }
  },
};

export default notificationsService;
