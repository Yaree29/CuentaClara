// =============================================================================
// useNotificationPreferences.js
// -----------------------------------------------------------------------------
// Hook para la pantalla de preferencias de notificación (qué avisos push
// recibe el dueño PYME cuando un asistente registra una venta o modifica
// inventario). Mismo patrón de actualización optimista con rollback que
// useInventoryConfig.js::updateFlag.
// =============================================================================
import { useCallback, useEffect, useState } from 'react';
import notificationsService from '../services/notificationService';

export const NOTIFICATION_PREF_LABELS = {
  sales: {
    label: 'Ventas',
    description: 'Cuando un asistente registra una venta.',
  },
  inventory: {
    label: 'Inventario',
    description: 'Cuando un asistente agrega o ajusta un producto.',
  },
};

export const ALL_NOTIFICATION_PREF_FLAGS = ['sales', 'inventory'];

const defaultPrefs = { sales: true, inventory: true };

const useNotificationPreferences = () => {
  const [prefs, setPrefs] = useState(defaultPrefs);
  const [loading, setLoading] = useState(true);

  const fetchPrefs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationsService.getPreferences();
      setPrefs({ ...defaultPrefs, ...data });
    } catch (error) {
      setPrefs(defaultPrefs);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrefs();
  }, [fetchPrefs]);

  const updatePref = useCallback(async (flag, value) => {
    setPrefs((prev) => ({ ...prev, [flag]: value }));
    try {
      const updated = await notificationsService.updatePreferences({ [flag]: value });
      setPrefs((prev) => ({ ...prev, ...updated }));
    } catch (error) {
      setPrefs((prev) => ({ ...prev, [flag]: !value }));
      throw error;
    }
  }, []);

  return { prefs, loading, updatePref, refetch: fetchPrefs };
};

export default useNotificationPreferences;
