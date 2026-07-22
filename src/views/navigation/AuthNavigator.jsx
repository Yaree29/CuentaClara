import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../../modules/auth/screens/LoginScreen';
import RegisterScreen from '../../modules/auth/screens/RegisterScreen';
import RecoveryOptionsScreen from '../../modules/auth/screens/RecoveryOptionsScreen';
import ResetPasswordScreen from '../../modules/auth/screens/ResetPasswordScreen';
import WelcomeScreen from '../../modules/auth/screens/WelcomeScreen';
import { hasSeenWelcome } from '../../modules/auth/utils/firstLaunch';
import colors from '../../theme/colors';

const Stack = createNativeStackNavigator();

// Login sigue siendo la pantalla de entrada para usuarios recurrentes.
// Welcome se antepone SOLO la primera vez que alguien nuevo abre la app
// (nunca la ha usado en este dispositivo); una vez continúa, no se vuelve
// a mostrar y el flujo normal siempre entra por Login.
const AuthNavigator = () => {
  const [checkingFirstLaunch, setCheckingFirstLaunch] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    let active = true;
    (async () => {
      const seen = await hasSeenWelcome();
      if (!active) return;
      setInitialRoute(seen ? 'Login' : 'Welcome');
      setCheckingFirstLaunch(false);
    })();
    return () => { active = false; };
  }, []);

  if (checkingFirstLaunch) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryDark }}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="RecoveryOptions" component={RecoveryOptionsScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
