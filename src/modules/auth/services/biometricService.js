import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../../services/supabaseClient';

// =============================================================================
// Arquitectura de la huella (auditada contra el checklist de 10 puntos):
//
//  · AsyncStorage (cosmético, NO sensible): bandera de activación + nombre para
//    el saludo. Consultarlos nunca dispara prompts.                     [#1]
//  · SecureStore (cifrado en reposo por Keychain/Keystore): SOLO el REFRESH
//    token de Supabase (dura días, rota). NUNCA el access token (vence 1h). [#2]
//
//  Gate biométrico: se hace con LocalAuthentication.authenticateAsync() a nivel
//  de app (UN solo prompt) en vez de requireAuthentication:true en el ítem.
//  Motivo: requireAuthentication dispara el prompt en CADA escritura, lo que
//  hace imposible rotar el token en silencio (#6) sin spam de prompts. El
//  estándar bancario es gatear la ACCIÓN y guardar cifrado.        [#4 adaptado]
//
//  Rotación (#6): Supabase rota el refresh token en cada refresco. Mientras la
//  app vive, App.js escucha onAuthStateChange y llama syncStoredRefreshToken()
//  para mantener el token de SecureStore al día. Además unlockWithBiometrics()
//  guarda el token rotado inmediatamente tras canjearlo.
// =============================================================================
const BIOMETRIC_FLAG_KEY = 'cc_biometric_enabled'; // AsyncStorage: null | 'true' | 'false'
const REMEMBERED_USER_KEY = 'cc_remembered_user';  // AsyncStorage: {name, email}
const REFRESH_TOKEN_KEY = 'cc_biometric_refresh';  // SecureStore: refresh_token (string)

// Mapea los códigos de error de expo-local-authentication a razones estables.
const mapAuthError = (error) => {
  switch (error) {
    case 'user_cancel':
    case 'system_cancel':
    case 'app_cancel':
    case 'user_fallback':
      return 'user_cancel';
    case 'lockout':
    case 'lockout_permanent':
      return 'lockout';
    case 'not_enrolled':
    case 'not_available':
    case 'passcode_not_set':
      return 'unavailable';
    default:
      return 'unknown';
  }
};

const biometricService = {
  // Hardware + huella/rostro registrados. Consulta pura, nunca prompt.
  isAvailable: async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) return false;
      return await LocalAuthentication.isEnrolledAsync();
    } catch (err) {
      console.error('Error verificando biometría:', err);
      return false;
    }
  },

  // Bandera tri-estado en AsyncStorage. null = nunca se decidió.   [#3 sin prompt]
  getBiometricFlag: async () => {
    try {
      return await AsyncStorage.getItem(BIOMETRIC_FLAG_KEY);
    } catch {
      return null;
    }
  },

  isBiometricEnabled: async () => (await biometricService.getBiometricFlag()) === 'true',

  declineBiometric: async () => {
    await AsyncStorage.setItem(BIOMETRIC_FLAG_KEY, 'false');
  },

  getRememberedUser: async () => {
    try {
      const raw = await AsyncStorage.getItem(REMEMBERED_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setRememberedUser: async ({ name, email }) => {
    try {
      await AsyncStorage.setItem(REMEMBERED_USER_KEY, JSON.stringify({ name, email }));
    } catch (err) {
      console.error('Error guardando usuario recordado:', err);
    }
  },

  // Escribe el refresh token en SecureStore (cifrado en reposo, sin prompt).
  _storeRefreshToken: async (refreshToken) => {
    if (!refreshToken) return;
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },

  // Activa la huella: toma el refresh token VIGENTE del SDK (no del store, que
  // podría estar desfasado por una rotación) y lo guarda. No pide prompt: el
  // usuario ya está autenticado; el gate ocurre al iniciar sesión con huella.
  enableBiometric: async ({ user } = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    const refreshToken = session?.refresh_token;
    if (!refreshToken) {
      throw new Error('No hay sesión activa para vincular la huella');
    }
    await biometricService._storeRefreshToken(refreshToken);
    await AsyncStorage.setItem(BIOMETRIC_FLAG_KEY, 'true');
    await biometricService.setRememberedUser({
      name: user?.name,
      email: user?.email || session.user?.email,
    });
  },

  // Logout explícito / desactivar: borra el token y oculta el botón.   [#7]
  disableBiometric: async () => {
    try {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch {
      // ignorar
    }
    await AsyncStorage.setItem(BIOMETRIC_FLAG_KEY, 'false');
  },

  // Rotación silenciosa (#6): mantener el token guardado al día cada vez que el
  // SDK rota la sesión mientras la app vive. Sin prompt. No-op si no está activa.
  syncStoredRefreshToken: async (refreshToken) => {
    if (!refreshToken) return;
    if ((await biometricService.getBiometricFlag()) !== 'true') return;
    try {
      await biometricService._storeRefreshToken(refreshToken);
    } catch {
      // ignorar
    }
  },

  // Login diario de un solo toque (#5). authenticateAsync abre el prompt UNA vez;
  // si es exitoso, se lee el refresh token y se canjea por una sesión nueva.
  // El SDK establece la sesión (en memoria) y devuelve el token rotado, que se
  // vuelve a guardar de inmediato para la próxima vez (#6).
  unlockWithBiometrics: async () => {
    // 1) Gate biométrico
    let authResult;
    try {
      authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Inicia sesión con tu huella',
        cancelLabel: 'Usar contraseña',
        disableDeviceFallback: false,
      });
    } catch {
      return { success: false, reason: 'unknown' };
    }
    if (!authResult.success) {
      return { success: false, reason: mapAuthError(authResult.error) }; // [#10 cancel]
    }

    // 2) Leer el refresh token (sin prompt)
    let refreshToken = null;
    try {
      refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    } catch {
      refreshToken = null;
    }
    if (!refreshToken) return { success: false, reason: 'no_session' };

    // 3) Canjear por una sesión nueva vía Supabase (equivale a /auth/refresh).
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data?.session) {
      // Refresh token rechazado (rotado/expirado/revocado) → borrar y forzar
      // contraseña. Se resetea la bandera a null para volver a ofrecer activar
      // la huella tras el próximo login por contraseña.               [#10]
      await biometricService.disableBiometric();
      await AsyncStorage.removeItem(BIOMETRIC_FLAG_KEY);
      return { success: false, reason: 'expired' };
    }

    // 4) Guardar el token rotado de inmediato (el anterior ya se consumió).
    await biometricService._storeRefreshToken(data.session.refresh_token);

    return { success: true };
  },
};

export default biometricService;
