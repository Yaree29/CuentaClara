// =============================================================================
// MODIFICADO: 2026-07-22
// Propósito: Header único y estandarizado para TODAS las pantallas internas
//            (dashboard, ventas, fiado, inventario, módulos PYME, etc.),
//            inspirado en el patrón de Microsoft Teams: avatar pequeño
//            (abre "Mi Perfil") + nombre de la pestaña + una última sección
//            reservada para acciones propias de cada pantalla (filtros,
//            búsqueda, etc.), vacía por defecto.
//
//            Antes existían dos variantes ('home' con avatar+kebab sin
//            título, 'default' con título sin avatar) — se unificaron en un
//            solo layout para que el tamaño del avatar y de la letra del
//            título sea idéntico en todos los módulos y no haya sobresaltos
//            visuales al cambiar de pestaña.
// =============================================================================
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import colors from '../../../../theme/colors';
import styles from './styles/DashboardHeader.styles';
import useAuthStore from '../../../../store/useAuthStore';
import useAssistantModeStore from '../../../../store/useAssistantModeStore';

// rightActions: nodo opcional con los botones/acciones propias de la pantalla
// (ej. filtro, búsqueda). Se renderiza dentro de un slot de tamaño fijo para
// que, tenga o no contenido, el título y el avatar no se muevan de pantalla
// a pantalla.
const DashboardHeader = ({ title, rightActions = null }) => {
  const navigation = useNavigation();

  const user = useAuthStore((state) => state.user);
  const avatarUrl = user?.avatar_url || user?.business?.logo_url;
  const initial = (user?.name || user?.business?.name || 'U').charAt(0).toUpperCase();

  // Con un asistente operando el dispositivo (Modo Asistente), el ícono de
  // perfil se quita por completo — no solo se deshabilita — porque llevaría
  // a "Mi Perfil" con la sesión del dueño (el asistente no tiene sesión
  // propia, ver assistants_service.py). Sin el ícono, no hay forma de entrar
  // ahí desde la UI mientras un asistente esté activo.
  const activeAssistant = useAssistantModeStore((state) => state.activeAssistant);

  return (
    <View style={styles.headerContainer}>
      {!activeAssistant && (
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => navigation.navigate('profile')}
          activeOpacity={0.7}
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarInitial}>{initial}</Text>
          )}
        </TouchableOpacity>
      )}

      <Text style={styles.screenTitle} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.actionsSlot}>{rightActions}</View>
    </View>
  );
};

export default DashboardHeader;
