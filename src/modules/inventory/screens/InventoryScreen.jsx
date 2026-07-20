// =============================================================================
// MODIFICADO: 2026-07-19
// Propósito: Pantalla de inventario, exclusiva de usuarios Informal (el tab
//            "inventory" ya no existe para PYME — ver MainNavigator.jsx).
//            El inventario avanzado de PYME vive ahora en ModulesScreen.
// =============================================================================
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../../theme/colors';
import DashboardHeader from '../../dashboard/components/shared/DashboardHeader';
import InformalInventory from '../components/InformalInventory';

const InventoryScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <DashboardHeader title="Mi Catálogo" isHome={false} />
      <InformalInventory />
    </SafeAreaView>
  );
};

export default InventoryScreen;
