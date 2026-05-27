import React, { useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../../theme/colors';
import styles from './styles/DashboardHeader.styles';

// Importación local para extraer los datos del usuario logueado
import useAuthStore from '../../../../store/useAuthStore';
import useUserStore from '../../../../store/useUserStore';
import useNotificationsStore from '../../../../store/useNotificationsStore';

const DashboardHeader = ({ title, isHome = false }) => {
  // Obtenemos los datos del usuario actual y del negocio
  const user = useAuthStore((state) => state.user);
  const businessData = useUserStore((state) => state.businessData);
  const unreadCount = useNotificationsStore((state) => state.unreadCount);
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead);
  const navigation = useNavigation();

  // Fallbacks visuales por si algún dato no está cargado temporalmente
  const businessName = businessData?.name || 'CuentaClara';

  const handleNotificationsPress = useCallback(() => {
    markAllAsRead();
    navigation.navigate('Notifications');
  }, [markAllAsRead, navigation]);

  return (
    <View style={styles.headerContainer}>
      
      {/* Círculo de perfil lateral izquierdo*/}
      {isHome && (
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={20} color={colors.primary} />
        </View>
      )}
      
      {isHome ? (
        // Variante 1: Diseño exacto de tu captura para el Home
        <View style={styles.textContainer}>  
          <Text style={styles.businessText}>{businessName}</Text>
        </View>
      ) : (
        // Variante 2: Diseño tipo WhatsApp para el resto de pestañas
        <View style={styles.textContainer}>
          <Text style={styles.screenTitle}>{title}</Text>
        </View>
      )}
      
      {/*boton de notificaciones alado izquierdo del boton de configuracion*/}
      <Pressable
        style={styles.notificationsContainer}
        onPress={handleNotificationsPress}
      >
        <Ionicons name="notifications" size={22} color={colors.primary} />
        {unreadCount > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>
              {unreadCount > 9 ? '9+' : String(unreadCount)}
            </Text>
          </View>
        )}
      </Pressable>

      {/*boton de configuracion a la derecha*/}
      <View style={styles.settingsContainer}>
        <Ionicons name="settings" size={22} color={colors.primary} />
      </View>

    </View>
  );
};

export default DashboardHeader;
