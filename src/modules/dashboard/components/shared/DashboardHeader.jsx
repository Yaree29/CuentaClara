// =============================================================================
// CREADO: 2026-05-26
// Propósito: Header reutilizable para las pantallas internas del dashboard.
//            Integrado desde la rama Fronted. Muestra el nombre del negocio
//            cuando es la pantalla Home, y un título cuando es cualquier otra
//            pestaña (Ventas, Fiados, etc.).
// Adaptación: usa Ionicons de @expo/vector-icons que ya fue instalado.
// =============================================================================
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import colors from '../../../../theme/colors';
import styles from './styles/DashboardHeader.styles';

// Store de autenticación
import useAuthStore from '../../../../store/useAuthStore';

const DashboardHeader = ({ title, isHome = false }) => {
  const navigation = useNavigation();

  const user = useAuthStore((state) => state.user);

  // El negocio ahora viene dentro del usuario autenticado
  const businessName = user?.business?.name || 'CuentaClara';

  return (
    <View style={styles.headerContainer}>
      {/* Círculo de perfil lateral izquierdo (solo en Home) */}
      {isHome && (
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={24} color={colors.textWhite} />
        </View>
      )}

      {isHome ? (
        <View style={styles.textContainer}>
          <Text style={styles.businessText}>{businessName}</Text>
        </View>
      ) : (
        <View style={styles.textContainer}>
          <Text style={styles.screenTitle}>{title}</Text>
        </View>
      )}

      {/* Configuración */}
      <TouchableOpacity
        style={styles.settingsContainer}
        onPress={() => navigation.navigate('profile')}
        activeOpacity={0.7}
      >
        <Ionicons name="settings" size={22} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

export default DashboardHeader;