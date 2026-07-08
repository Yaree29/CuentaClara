import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../../modules/auth/screens/LoginScreen';
import RegisterScreen from '../../modules/auth/screens/RegisterScreen';
import RecoveryOptionsScreen from '../../modules/auth/screens/RecoveryOptionsScreen';

const Stack = createNativeStackNavigator();

// Login es la pantalla de entrada de la app (unifica lo que antes era
// Welcome + Login por separado).
const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="RecoveryOptions" component={RecoveryOptionsScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;