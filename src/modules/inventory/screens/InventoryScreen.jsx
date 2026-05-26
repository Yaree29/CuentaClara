import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import useUserStore from '../../../store/useUserStore';
import colors from '../../../theme/colors';
import DashboardHeader from '../../dashboard/components/shared/DashboardHeader';

// Imports de los sub-componentes
import InformalInventory from '../components/InformalInventory';
// import PymeInventory from '../components/PymeInventory'; 

const InventoryScreen = () => {
  const userType = useUserStore((state) => state.userType);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <DashboardHeader title="Mi Catálogo" isHome={false} />
      
      {/* Orquestador visual */}
      {userType === 'informal' ? (
        <InformalInventory />
      ) : (
        <Text>Aquí irá el PymeInventory</Text> 
      )}
    </SafeAreaView>
  );
};

export default InventoryScreen;