
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../../theme/colors';
import useAuthStore from '../../../store/useAuthStore';

import DashboardHeader from '../components/shared/DashboardHeader';
import InformalDashboard from '../components/InformalDashboard';
import PymeFoodDashboard from '../components/PymeFoodDashboard';
import PymeServiceDashboard from '../components/PymeServiceDashboard';
import PymeRetailDashboard from '../components/PymeRetailDashboard';
import PymePrepFoodDashboard from '../components/PymePrepFoodDashboard';
import PymeGeneralDashboard from '../components/PymeGeneralDashboard';

const HomeScreen = () => {
  const user = useAuthStore((state) => state.user);
  const userType = user?.userType; // 'pyme' | 'informal'
  const categoryId = user?.business?.category_id;

  const renderDashboard = () => {
    if (userType === 'informal') {
      return <InformalDashboard />;
    }

    // Adaptación del Dashboard de PYME según el ID real de la categoría del negocio
    switch (categoryId) {
      case 1: // Alimentos (Carnicería, Frutería, etc.)
        return <PymeFoodDashboard />;
      case 2: // Servicios (Barbería, Estilista, etc.)
        return <PymeServiceDashboard />;
      case 3: // Comercio (Tienda de ropa, Papelería, Farmacia, Ferretería)
        return <PymeRetailDashboard />;
      case 4: // Restaurante (Panadería, Alimentos Preparados)
        return <PymePrepFoodDashboard />;
      case 5: // General / Tienda general
      default:
        return <PymeGeneralDashboard />;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <DashboardHeader isHome={true} />
      {renderDashboard()}
    </SafeAreaView>
  );
};

export default HomeScreen;