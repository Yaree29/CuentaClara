// =============================================================================
// MODIFICADO: 2026-06-02 (integración main → loginDr)
// Propósito: Servicio de notificaciones. Se reemplazó la implementación de
//            main —que consultaba Supabase DIRECTAMENTE (supabase.from(...))—
//            por llamadas a la API de FastAPI bajo el prefijo /notifications,
//            respetando el lineamiento del proyecto: el frontend NUNCA accede
//            a la base de datos directamente, todo pasa por el backend.
//
// Endpoints usados (ver backend/app/routers/notifications.py):
//   · GET   /notifications/                 → listar
//   · PATCH /notifications/{id}/read         → marcar como leída
//   · POST  /notifications/push-token        → registrar token push
//
// Nota: este módulo de notificaciones en el frontend queda PRESENTE pero
//       SIN CABLEAR (no se monta NotificationsListener en App.js) porque
//       depende de `expo-notifications` y `expo-device`, que aún no están
//       instalados en este proyecto. Para activarlo en el futuro:
//         1) npx expo install expo-notifications expo-device
//         2) crear la tabla `push_tokens` en la base de datos
//         3) montar <NotificationsListener /> en App.js
// =============================================================================
import { apiRequest } from '../../../services/apiClient';

// El backend expone `is_read` y `sent_at`; el store/pantallas del front usan
// `read_at` y `created_at`. Normalizamos para mantener compatibilidad.
const normalize = (n) => ({
  ...n,
  read_at: n.read_at ?? (n.is_read ? n.sent_at || new Date().toISOString() : null),
  created_at: n.created_at ?? n.sent_at,
});

const notificationsService = {
  listNotifications: async ({ unreadOnly = false, limit = 50, offset = 0 } = {}) => {
    const params = new URLSearchParams({
      unread_only: String(!!unreadOnly),
      limit: String(limit),
      offset: String(offset),
    });
    const data = await apiRequest(`/notifications/?${params.toString()}`);
    return Array.isArray(data) ? data.map(normalize) : [];
  },

  markAsRead: async (notificationId) => {
    return apiRequest(`/notifications/${notificationId}/read`, { method: 'PATCH' });
  },

  registerPushToken: async ({ token, deviceType = 'ios' }) => {
    return apiRequest('/notifications/push-token', {
      method: 'POST',
      body: JSON.stringify({ token, device_type: deviceType }),
    });
  },
};

export default notificationsService;
