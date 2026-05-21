import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';

//importación de pantallas
import HomeScreen from '../../modules/dashboard/screens/HomeScreen';
import InventoryScreen from '../../modules/inventory/screens/InventoryScreen';
import SalesScreen from '../../modules/sales/screens/SalesScreen';
import DebtScreen from '../../modules/credit/screens/DebtScreen';
import BillingScreen from '../../modules/Invoice/screens/BillingScreen';


const Tab = createBottomTabNavigator();

const MainNavigator = () => {

  //variables de prueba visual
  // 1. Informal: 'informal' / null
  // 2. PYME (Inventario): 'pyme' / 'products'
  // 3. PYME (Servicios): 'pyme' / 'service'

  // informal | pyme
  const MOCK_USER_TYPE = 'informal';

  // products | service
  const MOCK_CATEGORY = 'null';

  const isInformal = MOCK_USER_TYPE === 'informal';
  const isPyme = MOCK_USER_TYPE === 'pyme';
  const isServicePyme = isPyme && MOCK_CATEGORY === 'service';

return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
        headerShown: false,
        // Aplicamos los colores de theme/colors.js
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        //Configuración de iconos genérica (Cámbialos por los de tus capturas)
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Sales') iconName = focused ? 'cash' : 'cash-outline';
          else if (route.name === 'Credit') iconName = focused ? 'card' : 'card-outline';
          else if (route.name === 'Inventory') iconName = focused ? 'cube' : 'cube-outline';
          else if (route.name === 'Billing') iconName = focused ? 'document-text' : 'document-text-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      {/*Home de la aplicacion, para todos los usuarios */}
      <Tab.Screen name="Dashboard" component={HomeScreen} options={{ tabBarLabel: 'Inicio' }} />

      {/*Usuario Informal */}
      {MOCK_USER_TYPE === 'informal' && (
        <>
          <Tab.Screen name="Sales" component={SalesScreen} options={{ tabBarLabel: 'Ventas' }} /> //ventas rapidas
          <Tab.Screen name="Credit" component={DebtScreen} options={{ tabBarLabel: 'Créditos' }} /> //Fiado
          <Tab.Screen name="Inventory" component={InventoryScreen} options={{ tabBarLabel: 'Inventario' }} /> //Productos
        </>
      )}

      {/*PYME regular (usa inventario) */}
      {MOCK_USER_TYPE === 'pyme' && !isServicePyme && (
        <>
          <Tab.Screen name="Inventory" component={InventoryScreen} options={{ tabBarLabel: 'Inventario' }} />
          //crar otro modulo para reportes
          <Tab.Screen name="Billing" component={BillingScreen} options={{ tabBarLabel: 'Finanzas' }} /> //facturacion

        </>
      )}

      {/*PYME de Servicios (NO usa inventario) */}
      {MOCK_USER_TYPE === 'pyme' && isServicePyme && (
        <>
          //crear un modulo servicio
          <Tab.Screen name="Sales" component={SalesScreen} options={{ tabBarLabel: 'Reportes' }} />
          <Tab.Screen name="Billing" component={BillingScreen} options={{ tabBarLabel: 'Finanzas' }} />
        </>
      )}

    </Tab.Navigator>
  );
};

export default MainNavigator;