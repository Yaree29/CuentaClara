import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainNavigator from './MainNavigator';
import CreateTransactionScreen from '../../modules/transactions/screens/CreateTransactionScreen';
import ProfileScreen from '../../modules/profile/screens/ProfileScreen';
import SettingsScreen from '../../modules/profile/screens/SettingsScreen';
import SecuritySettings from '../../modules/profile/screens/SecuritySettingsScreen';
import Token2FA from '../../modules/verification/screens/Token2FA';

// Módulos PYME accesibles desde ModulesScreen (ya no son tabs, ver
// MainNavigator.jsx). Se registran como screens de stack para poder
// navegarlos con navigation.navigate() sin ocupar espacio en el tab bar.
import PurchasesScreen from '../../modules/purchases/screens/PurchasesScreen';
import StaffScreen from '../../modules/staff/screens/StaffScreen';
import CashScreen from '../../modules/cash/screens/CashScreen';
import ServicesScreen from '../../modules/business_services/screens/ServicesScreen';
import CreateRecipeScreen from '../../modules/recipes/screens/CreateRecipeScreen';
import CommissionsScreen from '../../modules/commissions/screens/CommissionsScreen';
import TipsScreen from '../../modules/tips/screens/TipsScreen';
import OffersScreen from '../../modules/offers/screens/OffersScreen';
import PymeInventory from '../../modules/inventory/components/PymeInventory';
import StrategicAnalysisScreen from '../../modules/analytics/screens/StrategicAnalysisScreen';

const Stack = createNativeStackNavigator();

const MainStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainNavigator} />
      <Stack.Screen name="CreateTransaction" component={CreateTransactionScreen} />
      <Stack.Screen name="profile" component={ProfileScreen} />
      <Stack.Screen name="settings" component={SettingsScreen} />
      <Stack.Screen name="SecuritySettings" component={SecuritySettings} />
      <Stack.Screen name="Token2FA" component={Token2FA} />

      {/* Módulos PYME, navegables desde ModulesScreen */}
      <Stack.Screen name="purchases" component={PurchasesScreen} />
      <Stack.Screen name="staff" component={StaffScreen} />
      <Stack.Screen name="cash" component={CashScreen} />
      <Stack.Screen name="services" component={ServicesScreen} />
      <Stack.Screen name="recipes" component={CreateRecipeScreen} />
      <Stack.Screen name="commissions" component={CommissionsScreen} />
      <Stack.Screen name="tips" component={TipsScreen} />
      <Stack.Screen name="offers" component={OffersScreen} />
      <Stack.Screen name="PymeInventory" component={PymeInventory} />
      <Stack.Screen name="StrategicAnalysis" component={StrategicAnalysisScreen} />
    </Stack.Navigator>
  );
};

export default MainStackNavigator;