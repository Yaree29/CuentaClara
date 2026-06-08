import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainNavigator from './MainNavigator';
import CreateTransactionScreen from '../../modules/transctions/screens/CreateTransactionScreen';
import ProfileScreen from '../../modules/profile/screens/ProfileScreen';
import Token2FA from '../../modules/verification/screens/Token2FA';

const Stack = createNativeStackNavigator();

const MainStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainNavigator} />
      <Stack.Screen name="CreateTransaction" component={CreateTransactionScreen} />
      <Stack.Screen name="profile" component={ProfileScreen} />
      <Stack.Screen name="Token2FA" component={Token2FA} />
    </Stack.Navigator>
  );
};

export default MainStackNavigator;