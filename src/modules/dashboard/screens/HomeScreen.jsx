import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../../theme/colors';

//Importacion de componentes específicos para cada tipo de usuario
import InformalDashboard from '../components/InformalDashboard';
import PymeFoodDashboard from '../components/PymeFoodDashboard';
import PymeServiceDashboard from '../components/PymeServiceDashboard';
import PymePrepFoodDashboard from '../components/PymePrepFoodDashboard';
import PymeRetailDashboard from '../components/PymeRetailDashboard';
import PymeGeneralDashboard from '../components/PymeGeneralDashboard';

const HomeScreen = () => {
  // ==========================================
  // ZONA DE PRUEBAS VISUALES (MOCKS)
  // Cambia userType a 'informal' o 'pyme'
  // Si es 'pyme', cambia category a: 'food', 'service', 'prepared_food', 'retail' o 'general'
  // ==========================================
  const mockState = {
    userType: 'pyme', 
    category: 'service' 
  };

  // 2. Creamos un "Diccionario" de componentes para las PYMES
  // Esto evita tener muchos if/else anidados
  const pymeDashboards = {
    food: <PymeFoodDashboard />,
    service: <PymeServiceDashboard />,
    prepared_food: <PymePrepFoodDashboard />,
    retail: <PymeRetailDashboard />,
    general: <PymeGeneralDashboard />
  };

  // 3. Función que decide qué mostrar
  const renderDashboardContent = () => {
    // Si es informal, no importa la categoría, mostramos su dashboard único
    if (mockState.userType === 'informal') {
      return <InformalDashboard />;
    }

    // Si es PYME, buscamos el dashboard en nuestro diccionario según su categoría.
    // Si por algún error la categoría no existe, mostramos el 'general' por defecto.
    return pymeDashboards[mockState.category] || <PymeGeneralDashboard />;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Aquí se inyecta automáticamente el diseño correcto */}
      {renderDashboardContent()}
    </SafeAreaView>
  );
};

export default HomeScreen;