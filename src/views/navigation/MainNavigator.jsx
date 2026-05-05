import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import useBlueprintStore from '../../store/useBlueprintStore';
import HomeScreen from '../../modules/dashboard/screens/HomeScreen';
import InventoryScreen from '../../modules/inventory/screens/InventoryScreen';
import ProfileScreen from '../../modules/profile/screens/ProfileScreen';
import SalesScreen from '../../modules/sales/screens/SalesScreen';
import DebtScreen from '../../modules/credit/screens/DebtScreen';
import BillingScreen from '../../modules/Invoice/screens/BillingScreen';

const Tab = createBottomTabNavigator();

const MainNavigator = () => {
  const modules = useBlueprintStore((state) => state.modules);

  if (!modules || modules.length === 0) {
    return null; 
  }

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      {modules.includes('dashboard') && (
        <Tab.Screen name="Dashboard" component={HomeScreen} />
      )}
      {modules.includes('inventory') && (
        <Tab.Screen name="Inventory" component={InventoryScreen} />
      )}
      {modules.includes('sales') && (
        <Tab.Screen name="Sales" component={SalesScreen} />
      )}
      {modules.includes('credit') && (
        <Tab.Screen name="Credit" component={DebtScreen} />
      )}      
      {modules.includes('billing') && (
        <Tab.Screen name="Billing" component={BillingScreen} />
      )}
      {modules.includes('profile') && (
        <Tab.Screen name="Profile" component={ProfileScreen} />
      )}

    </Tab.Navigator>
  );
};

export default MainNavigator;