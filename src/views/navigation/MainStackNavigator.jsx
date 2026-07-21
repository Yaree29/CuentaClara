import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainNavigator from './MainNavigator';
import CreateTransactionScreen from '../../modules/transactions/screens/CreateTransactionScreen';
import ProfileScreen from '../../modules/profile/screens/ProfileScreen';
import EditProfileScreen from '../../modules/profile/screens/EditProfileScreen';
import SettingsScreen from '../../modules/profile/screens/SettingsScreen';
import SecuritySettings from '../../modules/profile/screens/SecuritySettingsScreen';
import DataResetScreen from '../../modules/profile/screens/DataResetScreen';
import Token2FA from '../../modules/verification/screens/Token2FA';
import TeamScreen from '../../modules/assistants/screens/TeamScreen';
import AssistantSelectScreen from '../../modules/assistants/screens/AssistantSelectScreen';

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
      <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
      <Stack.Screen name="settings" component={SettingsScreen} />
      <Stack.Screen name="SecuritySettings" component={SecuritySettings} />
      <Stack.Screen name="DataReset" component={DataResetScreen} />
      <Stack.Screen name="Token2FA" component={Token2FA} />
      <Stack.Screen name="TeamScreen" component={TeamScreen} />

      {/* Modo Asistente — sin gesto de swipe-back: el asistente no debe poder
          "regresar" a la sesión del dueño sin PIN (ver también el bloqueo del
          back físico de Android dentro de la propia pantalla). */}
      <Stack.Screen
        name="AssistantSelect"
        component={AssistantSelectScreen}
        options={{ gestureEnabled: false }}
      />

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