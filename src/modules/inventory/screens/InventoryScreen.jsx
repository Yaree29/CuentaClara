// =============================================================================
// MODIFICADO: 2026-05-27
// Propósito: Pantalla orquestadora del módulo de inventario. Integrada desde
//            la rama main. Para informales muestra InformalInventory; para
//            PYME aún no hay UI implementada (placeholder).
// =============================================================================
import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
//import useUserStore from '../../../store/useUserStore';
import colors from '../../../theme/colors';
import DashboardHeader from '../../dashboard/components/shared/DashboardHeader';

// Imports de los sub-componentes
import InformalInventory from '../components/InformalInventory';
// import PymeInventory from '../components/PymeInventory'; Próximamente...

const InventoryScreen = () => {
  const userType = 'informal';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <DashboardHeader title="Mi Catálogo" isHome={false} />

      {/* Orquestador visual */}
      {userType === 'informal' ? (
        <InformalInventory />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, textAlign: 'center' }}>
            Funcionalidad no disponible
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
            La vista de inventario para PYME aún no está implementada.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default InventoryScreen;
