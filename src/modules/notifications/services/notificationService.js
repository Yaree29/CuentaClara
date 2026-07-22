// =============================================================================
// MODIFICADO: 2026-07-21 (notificaciones de Modo Asistente)
// Propósito: Servicio de notificaciones. Llama a la API de FastAPI bajo el
//            prefijo /notifications — el frontend nunca accede a la base de
//            datos directamente, todo pasa por el backend.
//
// Decisión del proyecto: NO se usa push real (FCM/Firebase) — las
// notificaciones de asistente solo llegan mientras la app está abierta o
// recién en segundo plano, vía Realtime de Supabase sobre la tabla
// `notifications` (ver hooks/useNotifications.js). Por eso no hay
// registerPushToken aquí.
//
// Endpoints usados (ver backend/app/routers/notifications.py):
//   · GET    /notifications/                → listar
//   · PATCH  /notifications/{id}/read        → marcar como leída
//   · GET    /notifications/preferences      → preferencias por tipo de evento
//   · PATCH  /notifications/preferences      → editar preferencias
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

  getPreferences: async () => {
    return apiRequest('/notifications/preferences');
  },

  updatePreferences: async (patch) => {
    return apiRequest('/notifications/preferences', {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
  },
};

export default notificationsService;
