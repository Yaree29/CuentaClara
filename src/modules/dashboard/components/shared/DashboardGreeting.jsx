// =============================================================================
// CREADO: 2026-07-19
// Propósito: Saludo dinámico del Dashboard (Inicio), compartido entre
//            InformalDashboard.jsx y PymeDashboard.jsx para no duplicar la
//            lógica de mensajes. Antes vivía dentro de DashboardHeader.jsx —
//            se movió aquí. Reutiliza los estilos welcomeContainer/welcomeTitle/
//            welcomeSubtitle ya existentes en InformalDashboard.styles.js.
// =============================================================================
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import useAuthStore from '../../../../store/useAuthStore';
import styles from '../styles/InformalDashboard.styles';

// Para "hay ventas hoy" existen 2 variantes de frase; se elige una al azar
// una sola vez por montaje (no en cada render) para que el subtítulo no
// cambie solo porque el dashboard refrescó datos.
const buildSubtitle = (hasSalesToday, businessName, useAltPhrase) => {
  const isLongName = businessName ? businessName.length > 16 : false;

  if (hasSalesToday) {
    if (businessName) {
      if (isLongName) {
        return useAltPhrase
          ? `${businessName} está creciendo\u00A0🎉`
          : `${businessName} va muy bien hoy\u00A0📈`;
      }
      return useAltPhrase
        ? `Tu ${businessName} está creciendo hoy\u00A0🎉`
        : `Tu ${businessName} está teniendo un buen día\u00A0📈`;
    }
    return useAltPhrase ? '¡Vamos por más hoy!\u00A0🎉' : '¡Vamos por un buen día!\u00A0📈';
  }

  if (businessName) {
    return isLongName
      ? `¡Vamos por más con ${businessName}!\u00A0💪`
      : `Aún no acaba el día, ¡vamos por más con ${businessName}!\u00A0💪`;
  }

  return 'Aún no acaba el día, ¡vamos por más!\u00A0💪';
};

const DashboardGreeting = ({ todayIncome = 0 }) => {
  const user = useAuthStore((state) => state.user);
  const firstName = user?.name?.split(' ')[0] || 'Comerciante';
  const businessName = user?.business?.name || '';

  const [useAltPhrase] = useState(() => Math.random() < 0.5);

  const subtitle = buildSubtitle(todayIncome > 0, businessName, useAltPhrase);

  return (
    <View style={styles.welcomeContainer}>
      <View>
        <Text style={styles.welcomeTitle}>
          <Text style={styles.welcomeTitleRegular}>¡Hola, </Text>
          <Text style={styles.welcomeTitleBold}>{firstName}</Text>
          <Text style={styles.welcomeTitleRegular}>!</Text>
        </Text>
        <Text style={styles.welcomeSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
};

export default DashboardGreeting;