// =============================================================================
// MODIFICADO: 2026-07-22
// Propósito: Lógica del saludo dinámico (nombre + subtítulo) — antes se
//            renderizaba como bloque propio dentro del scroll de
//            InformalDashboard.jsx/PymeDashboard.jsx; ahora vive en la fila
//            fija de DashboardHeader.jsx (variant "Home"). Se deja aquí como
//            hook para que el Header reutilice exactamente esta lógica sin
//            duplicarla.
// =============================================================================
import { useState } from 'react';
import useAuthStore from '../../../../store/useAuthStore';

// Para "hay ventas hoy" existen 2 variantes de frase; se elige una al azar
// una sola vez por montaje (no en cada render) para que el subtítulo no
// cambie solo porque el dashboard refrescó datos.
const buildSubtitle = (hasSalesToday, businessName, useAltPhrase) => {
  const isLongName = businessName ? businessName.length > 16 : false;

  if (hasSalesToday) {
    if (businessName) {
      if (isLongName) {
        return useAltPhrase
          ? `${businessName} está creciendo 🎉`
          : `${businessName} va muy bien hoy 📈`;
      }
      return useAltPhrase
        ? `Tu ${businessName} está creciendo hoy 🎉`
        : `Tu ${businessName} está teniendo un buen día 📈`;
    }
    return useAltPhrase ? '¡Vamos por más hoy! 🎉' : '¡Vamos por un buen día! 📈';
  }

  if (businessName) {
    return isLongName
      ? `¡Vamos por más con ${businessName}! 💪`
      : `Aún no acaba el día, ¡vamos por más con ${businessName}! 💪`;
  }

  return 'Aún no acaba el día, ¡vamos por más! 💪';
};

// Hook — nombre de pila del usuario + subtítulo dinámico según si ya hubo
// ventas hoy. Usado por DashboardHeader.jsx para el saludo de la pantalla
// Inicio.
export const useDashboardGreeting = (todayIncome = 0) => {
  const user = useAuthStore((state) => state.user);
  const firstName = user?.name?.split(' ')[0] || 'Comerciante';
  const businessName = user?.business?.name || '';

  const [useAltPhrase] = useState(() => Math.random() < 0.5);

  const subtitle = buildSubtitle(todayIncome > 0, businessName, useAltPhrase);

  return { firstName, subtitle };
};

export default useDashboardGreeting;
