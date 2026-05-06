import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../../modules/auth/screens/LoginScreen';
import RegisterScreen from '../../modules/auth/screens/RegisterScreen';
import WelcomeScreen from '../../modules/auth/screens/WelcomeScreen';
import BiometricLockScreen from '../../modules/auth/screens/BiometricLockScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;