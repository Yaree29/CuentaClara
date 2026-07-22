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
import NotificationsListener from './src/modules/notifications/components/NotificationsListener';

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
// Evita procesar dos veces el MISMO enlace: en arranque en frío,
// Linking.getInitialURL() y el evento 'url' pueden disparar ambos con la misma
// URL. El segundo setSession reutilizaría un refresh token que el primero ya
// rotó — falla y deja la sesión de recuperación inservible, así que después
// updateUser (ResetPasswordScreen) no encontraba sesión válida.
let lastRecoveryUrl = null;

const handleRecoveryUrl = async (url) => {
  if (!url || !url.includes('reset-password')) return;
  if (url === lastRecoveryUrl) return;
  lastRecoveryUrl = url;

  const accessToken = getParam(url, 'access_token');
  const refreshToken = getParam(url, 'refresh_token');

  if (!accessToken || !refreshToken) {
    // Supabase devuelve el motivo en el propio fragmento cuando el enlace no
    // sirve (p.ej. error_description=Email+link+is+invalid+or+has+expired).
    const description = getParam(url, 'error_description');
    Alert.alert(
      'Enlace no válido',
      description
        ? description.replace(/\+/g, ' ')
        : 'Este enlace de recuperación ya venció o ya se usó. Solicita uno nuevo desde "¿Olvidaste tu contraseña?".'
    );
    return;
  }

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (error) {
    // Se muestra el mensaje real: un texto genérico aquí hacía imposible
    // distinguir un enlace vencido de un fallo de red.
    Alert.alert('No se pudo abrir el enlace', error.message || 'Intenta solicitar la recuperación de nuevo.');
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
                        <NotificationsListener />
                    </UserTypeProvider>
                </AuthProvider>
            </NavigationContainer>
            <Toast />
        </SafeAreaProvider >
    );
}
