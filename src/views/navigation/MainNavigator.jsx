import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';

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

  const MOCK_USER_TYPE = 'pyme';
  const MOCK_CATEGORY = 'products';

  const isInformal = MOCK_USER_TYPE === 'informal';
  const isPyme = MOCK_USER_TYPE === 'pyme';
  const isServicePyme = isPyme && MOCK_CATEGORY === 'service';

  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Sales') iconName = focused ? 'cash' : 'cash-outline';
          else if (route.name === 'Credit') iconName = focused ? 'card' : 'card-outline';
          else if (route.name === 'Inventory') iconName = focused ? 'cube' : 'cube-outline';
          else if (route.name === 'Services') iconName = focused ? 'construct' : 'construct-outline';
          else if (route.name === 'Billing') iconName = focused ? 'document-text' : 'document-text-outline';
          else if (route.name === 'Reports') iconName = focused ? 'bar-chart' : 'bar-chart-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
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