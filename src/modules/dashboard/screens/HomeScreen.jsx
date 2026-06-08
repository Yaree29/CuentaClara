// =============================================================================
// MODIFICADO: 2026-05-27
// Propósito: Pantalla "Inicio" del navegador principal. Antes mostraba un
//            placeholder con datos mock. Ahora actúa como un resumen real del
//            negocio: integra el diseño de la rama Fronted (DashboardHeader +
//            InformalDashboard) pero alimentándose de la API de FastAPI.
//
// Bifurcación:
//   · userType === 'informal'  → InformalDashboard
//   · userType === 'pyme'      → InformalDashboard (placeholder; las variantes
//                                 PYME por categoría — food / retail / etc.—
//                                 quedan pendientes para una próxima
//                                 integración. La vista resumen es la misma
//                                 funcionalmente: ventas, fiado, inventario.)
// =============================================================================
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import useUserStore from '../../../store/useUserStore';
import colors from '../../../theme/colors';

import DashboardHeader from '../components/shared/DashboardHeader';
import InformalDashboard from '../components/InformalDashboard';
import PymeGeneralDashboard from '../../../../pyme/dashboard/components/PymeGeneralDashboard';

const HomeScreen = () => {
  const userType = useUserStore((state) => state.userType);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <DashboardHeader isHome={true} />
      {userType === 'pyme' ? <PymeGeneralDashboard /> : <InformalDashboard />}
    </SafeAreaView>
  );
};

export default HomeScreen;
