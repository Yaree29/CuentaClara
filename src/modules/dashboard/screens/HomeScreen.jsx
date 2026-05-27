import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../../theme/colors';
import useUserStore from '../../../store/useUserStore';

//Importacion del header
import DashboardHeader from '../components/shared/DashboardHeader';

//Importacion de componentes específicos para cada tipo de usuario
import InformalDashboard from '../components/InformalDashboard';
import PymeFoodDashboard from '../components/PymeFoodDashboard';
import PymeServiceDashboard from '../components/PymeServiceDashboard';
import PymePrepFoodDashboard from '../components/PymePrepFoodDashboard';
import PymeRetailDashboard from '../components/PymeRetailDashboard';
import PymeGeneralDashboard from '../components/PymeGeneralDashboard';

const HomeScreen = () => {
  // Obtenemos los valores reales del usuario activo
  const userType = useUserStore((state) => state.userType);
  const businessData = useUserStore((state) => state.businessData);

  const pymeDashboards = {
    food: <PymeFoodDashboard />,
    service: <PymeServiceDashboard />,
    prepared_food: <PymePrepFoodDashboard />,
    retail: <PymeRetailDashboard />,
    general: <PymeGeneralDashboard />
  };

  const renderDashboardContent = () => {
    if (userType === 'informal') {
      return <InformalDashboard />;
    } 
    
    // Si es PYME, busca por su categoría
    const category = businessData?.category || 'general';
    return pymeDashboards[category] || <PymeGeneralDashboard />;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <DashboardHeader isHome={true} />
      {renderDashboardContent()}
    </SafeAreaView>
  );
};

export default HomeScreen;