import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import colors from '../../theme/colors';
import useUserStore from '../../store/useUserStore';
import { View } from 'react-native';

// Importación de íconos
import { 
  HomeIcon, 
  BanknotesIcon, 
  CreditCardIcon, 
  ArchiveBoxIcon, 
  WrenchScrewdriverIcon, 
  DocumentTextIcon, 
  ChartBarIcon 
} from 'react-native-heroicons/solid';

// Importación de pantallas
import HomeScreen from '../../modules/dashboard/screens/HomeScreen';
import InventoryScreen from '../../modules/inventory/screens/InventoryScreen';
import SalesScreen from '../../modules/sales/screens/SalesScreen';
import DebtScreen from '../../modules/credit/screens/DebtScreen';
import BillingScreen from '../../modules/Invoice/screens/BillingScreen';
import ServicesScreen from '../../modules/services/screens/ServicesScreen';
import ReportsScreen from '../../modules/reports/screens/ReportsScreen';

const Tab = createBottomTabNavigator();

const MainNavigator = () => {

  // Variables de prueba visual
  // 1. Informal: 'informal' / null
  // 2. PYME (Inventario): 'pyme' / 'products'
  // 3. PYME (Servicios): 'pyme' / 'service'

  //const MOCK_USER_TYPE = 'pyme';
  //const MOCK_CATEGORY = 'products';

  //const isInformal = MOCK_USER_TYPE === 'informal';
  //const isPyme = MOCK_USER_TYPE === 'pyme';
  //const isServicePyme = isPyme && MOCK_CATEGORY === 'service';

  //Para simular bifurcación - se leen los dato usando la libreria Zustand, que permite manejar el estado global de la app
  const userType = useUserStore((state) => state.userType);
  const businessData = useUserStore((state) => state.businessData);

  const isInformal = userType === 'informal';
  const isPyme = userType === 'pyme';
  const isServicePyme = isPyme && businessData?.category === 'service';

  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary, 
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          paddingBottom: 6,
        },
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0, 
          elevation: 12, 
          shadowColor: '#000', 
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
          height: 65, 
        },
        //Configuración de Heroicons en la barra
        tabBarIcon: ({ focused, color }) => {
          let IconComponent;
          
          if (route.name === 'Dashboard') IconComponent = HomeIcon;
          else if (route.name === 'Sales') IconComponent = BanknotesIcon;
          else if (route.name === 'Credit') IconComponent = CreditCardIcon;
          else if (route.name === 'Inventory') IconComponent = ArchiveBoxIcon;
          else if (route.name === 'Services') IconComponent = WrenchScrewdriverIcon;
          else if (route.name === 'Billing') IconComponent = DocumentTextIcon;
          else if (route.name === 'Reports') IconComponent = ChartBarIcon;

          return (
            <View style={{
              backgroundColor: focused ? `${colors.primary}15` : 'transparent',
              paddingHorizontal: 16,
              paddingVertical: 4,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 4, 
            }}>
              {IconComponent && <IconComponent size={22} color={color} />}
            </View>
          );
        },
      })}
    >
      {/* Home de la aplicación, visible para todos los roles */}
      <Tab.Screen name="Dashboard" component={HomeScreen} options={{ tabBarLabel: 'Inicio' }} />

      {/* Navegación para Usuario Informal */}
      {isInformal && (
        <Tab.Group>
          <Tab.Screen name="Sales" component={SalesScreen} options={{ tabBarLabel: 'Ventas' }} />
          <Tab.Screen name="Credit" component={DebtScreen} options={{ tabBarLabel: 'Créditos' }} />
          <Tab.Screen name="Inventory" component={InventoryScreen} options={{ tabBarLabel: 'Inventario' }} />
        </Tab.Group>
      )}

      {/* Navegación para PYME regular (Basada en productos/inventario) */}
      {isPyme && !isServicePyme && (
        <Tab.Group>
          <Tab.Screen name="Sales" component={SalesScreen} options={{ tabBarLabel: 'Ventas' }} />
          <Tab.Screen name="Inventory" component={InventoryScreen} options={{ tabBarLabel: 'Inventario' }} />
          <Tab.Screen name="Reports" component={ReportsScreen} options={{ tabBarLabel: 'Reportes' }} />
          <Tab.Screen name="Billing" component={BillingScreen} options={{ tabBarLabel: 'Finanzas' }} />
        </Tab.Group>
      )}

      {/* Navegación para PYME de Servicios (Sin inventario) */}
      {isPyme && isServicePyme && (
        <Tab.Group>
          <Tab.Screen name="Sales" component={SalesScreen} options={{ tabBarLabel: 'Ventas' }} />
          <Tab.Screen name="Services" component={ServicesScreen} options={{ tabBarLabel: 'Servicios' }} />
          <Tab.Screen name="Reports" component={ReportsScreen} options={{ tabBarLabel: 'Reportes' }} />
          <Tab.Screen name="Billing" component={BillingScreen} options={{ tabBarLabel: 'Finanzas' }} />
        </Tab.Group>
      )}

    </Tab.Navigator>
  );
};

export default MainNavigator;