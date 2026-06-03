import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../../theme/colors';
import styles from './styles/DashboardHeader.styles';

// Importación local para extraer los datos del usuario logueado
import useAuthStore from '../../../../store/useAuthStore';
import useUserStore from '../../../../store/useUserStore';

const DashboardHeader = ({ title, isHome = false }) => {
  // Obtenemos los datos del usuario actual y del negocio
  const user = useAuthStore((state) => state.user);
  const businessData = useUserStore((state) => state.businessData);

  // Fallbacks visuales por si algún dato no está cargado temporalmente
  const businessName = businessData?.name || 'CuentaClara';

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

      {/*boton de configuracion a la derecha*/}
      <View style={styles.settingsContainer}>
        <Ionicons name="settings" size={22} color={colors.primary} />
      </View>

    </View>
  );
};

export default DashboardHeader;