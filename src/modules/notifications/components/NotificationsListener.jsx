import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import useAuthStore from '../../../store/useAuthStore';
import { useNotifications } from '../hooks/useNotifications';
import notificationsService from '../services/notificationService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const registerForPush = async () => {
  if (!Device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
};

const NotificationsListener = () => {
  const { user, isAuthenticated } = useAuthStore();
  useNotifications({
    onNewNotification: (notification) => {
      if (notification?.type === 'alert') {
        Alert.alert('Stock bajo', notification.message || 'Tienes una alerta de inventario.');
      }
    },
  });

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    let isMounted = true;
    const register = async () => {
      try {
        const token = await registerForPush();
        if (!token || !isMounted) return;
        await notificationsService.registerPushToken({
          token,
          deviceType: Platform.OS,
        });
      } catch (err) {
        console.error('[NotificationsListener] Error registrando token push:', err);
      }
    };

    register();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?.id]);

  return null;
};

export default NotificationsListener;
