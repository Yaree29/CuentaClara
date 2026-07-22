import { Alert } from 'react-native';
import { useNotifications } from '../hooks/useNotifications';

// Decisión del proyecto (2026-07-21): NO se usa push real (FCM/Firebase).
// Las notificaciones de asistente solo llegan mientras la app está abierta o
// recién en segundo plano, vía la suscripción Realtime de Supabase que ya
// hace useNotifications() sobre la tabla `notifications` — no requiere
// permisos de sistema ni token de dispositivo.
const NotificationsListener = () => {
  useNotifications({
    onNewNotification: (notification) => {
      if (notification?.type === 'alert') {
        Alert.alert('CuentaClara', notification.message || 'Tienes una notificación nueva.');
      }
    },
  });

  return null;
};

export default NotificationsListener;
