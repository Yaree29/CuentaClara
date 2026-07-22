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
//
//            showGreeting=true (solo HomeScreen.jsx): reemplaza el título
//            plano por el saludo dinámico que antes vivía en
//            DashboardGreeting.jsx (bloque aparte, dentro del scroll de cada
//            dashboard) — misma lógica (hook useDashboardGreeting, sin
//            duplicarla), ahora en la fila fija del Header, con el avatar
//            más grande alineado a la derecha en vez de a la izquierda.
// =============================================================================
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './styles/DashboardHeader.styles';
import useAuthStore from '../../../../store/useAuthStore';
import useDashboardGreeting from './DashboardGreeting';

// rightActions: nodo opcional con los botones/acciones propias de la pantalla
// (ej. filtro, búsqueda). Se renderiza dentro de un slot de tamaño fijo para
// que, tenga o no contenido, el título y el avatar no se muevan de pantalla
// a pantalla. Ignorado cuando showGreeting=true (esa fila solo tiene saludo
// + avatar, sin acciones extra).
const DashboardHeader = ({ title, rightActions = null, showGreeting = false, todayIncome = 0 }) => {
  const navigation = useNavigation();

  const user = useAuthStore((state) => state.user);
  const avatarUrl = user?.avatar_url || user?.business?.logo_url;
  const initial = (user?.name || user?.business?.name || 'U').charAt(0).toUpperCase();

  // El hook se llama siempre (reglas de hooks) — el cálculo es barato incluso
  // cuando showGreeting=false y no se usa su resultado.
  const { firstName, subtitle } = useDashboardGreeting(todayIncome);

  if (showGreeting) {
    return (
      <View style={styles.headerContainerGreeting}>
        <View style={styles.greetingTextWrap}>
          <Text style={styles.greetingTitle} numberOfLines={1}>
            <Text style={styles.greetingTitleRegular}>¡Hola, </Text>
            <Text style={styles.greetingTitleBold}>{firstName}</Text>
            <Text style={styles.greetingTitleRegular}>!</Text>
          </Text>
          <Text style={styles.greetingSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.avatarContainerLarge}
          onPress={() => navigation.navigate('profile')}
          activeOpacity={0.7}
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImageLarge} />
          ) : (
            <Text style={styles.avatarInitialLarge}>{initial}</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.headerContainer}>
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

      <Text style={styles.screenTitle} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.actionsSlot}>{rightActions}</View>
    </View>
  );
};

export default DashboardHeader;
