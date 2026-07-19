import React, { useEffect } from 'react';
import { AppState, Linking, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { supabase } from './src/services/supabaseClient';
import biometricService from './src/modules/auth/services/biometricService';
import { AuthProvider } from './src/views/providers/AuthProvider';
import { UserTypeProvider } from './src/views/providers/UserTypeProvider';
import RootNavigator from './src/views/navigation/RootNavigator';
import GlobalFAB from './src/components/ui/goblalFAB';

export const navigationRef = createNavigationContainerRef();

// Si el deep link llega antes de que el navigator esté listo (cold start),
// se guarda aquí y se navega en el onReady del NavigationContainer.
let pendingRecovery = false;

const getParam = (url, key) => {
  const match = url.match(new RegExp(`[?&#]${key}=([^&#]+)`));
  return match ? decodeURIComponent(match[1]) : null;
};

// Procesa el enlace de recuperación (cuentaclara://reset-password#access_token=
// ...&refresh_token=...&type=recovery, formato del flujo 'implicit' — sin code
// que canjear, los tokens ya vienen en el propio enlace) y navega a
// ResetPasswordScreen. Cualquier fallo se avisa explícitamente: un fallo
// silencioso aquí se ve, desde la app, como "no pasó nada" al tocar el enlace.
const handleRecoveryUrl = async (url) => {
  if (!url || !url.includes('reset-password')) return;

  const accessToken = getParam(url, 'access_token');
  const refreshToken = getParam(url, 'refresh_token');

  if (!accessToken || !refreshToken) {
    Alert.alert(
      'Enlace no válido',
      'Este enlace de recuperación ya venció o ya se usó. Solicita uno nuevo desde "¿Olvidaste tu contraseña?".'
    );
    return;
  }

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (error) {
    Alert.alert('No se pudo abrir el enlace', 'Intenta solicitar la recuperación de nuevo.');
    return;
  }

  if (navigationRef.isReady()) {
    navigationRef.navigate('ResetPassword');
  } else {
    pendingRecovery = true;
  }
};

export default function App() {
    // El SDK de Supabase solo debe auto-refrescar el token mientras la app está
    // en primer plano; en background se detiene para no gastar red/batería.
    useEffect(() => {
        supabase.auth.startAutoRefresh();
        const sub = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                supabase.auth.startAutoRefresh();
            } else {
                supabase.auth.stopAutoRefresh();
            }
        });
        return () => sub.remove();
    }, []);

    // Rotación del refresh token biométrico: cada vez que el SDK rota la sesión
    // mientras la app vive, se actualiza el token guardado en SecureStore para
    // que la huella siga funcionando la próxima vez que se abra la app.
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if ((event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') && session?.refresh_token) {
                biometricService.syncStoredRefreshToken(session.refresh_token);
            }
        });
        return () => subscription?.unsubscribe();
    }, []);

    // Deep linking de recuperación de contraseña (app abierta o en frío).
    useEffect(() => {
        Linking.getInitialURL().then((url) => {
            if (url) handleRecoveryUrl(url);
        });
        const sub = Linking.addEventListener('url', ({ url }) => handleRecoveryUrl(url));
        return () => sub.remove();
    }, []);

    return (
        <SafeAreaProvider >
            <NavigationContainer
                ref={navigationRef}
                onReady={() => {
                    if (pendingRecovery) {
                        pendingRecovery = false;
                        navigationRef.navigate('ResetPassword');
                    }
                }}
            >
                <AuthProvider>
                    <UserTypeProvider>
                        <RootNavigator />
                        <GlobalFAB />
                    </UserTypeProvider>
                </AuthProvider>
            </NavigationContainer>
            <Toast />
        </SafeAreaProvider >
    );
}
