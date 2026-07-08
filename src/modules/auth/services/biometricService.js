import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dos niveles de almacenamiento con responsabilidades separadas a propósito:
// - AsyncStorage: datos públicos (no requieren huella para leerse). Consultarlos
//   NUNCA debe disparar el prompt nativo del SO.
// - SecureStore con requireAuthentication:true: solo la sesión real. Leer o
//   escribir esta clave es lo ÚNICO que debe pedir huella, y solo cuando el
//   usuario lo pide explícitamente (tocar el botón / activar el switch).
const BIOMETRIC_FLAG_KEY = 'cc_biometric_enabled'; // AsyncStorage: null | 'true' | 'false'
const REMEMBERED_USER_KEY = 'cc_remembered_user'; // AsyncStorage: {name, email}
const SECURE_SESSION_KEY = 'cc_secure_session'; // SecureStore, requireAuthentication:true: {user, token}

const classifyAuthError = (err) => {
  const msg = (err?.message || '').toLowerCase();
  if (msg.includes('cancel')) return 'user_cancel';
  if (msg.includes('lockout') || msg.includes('too many') || msg.includes('locked')) return 'lockout';
  if (msg.includes('not available') || msg.includes('not enrolled') || msg.includes('no hardware')) return 'unavailable';
  return 'unknown';
};

const biometricService = {
  /**
   * Hardware + huellas/rostro registrados en el dispositivo. Consulta pura,
   * nunca dispara el prompt nativo.
   */
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

  /**
   * Bandera tri-estado en AsyncStorage — nunca toca SecureStore, nunca dispara
   * el prompt. null = nunca se decidió; 'true'/'false' = ya se decidió.
   */
  getBiometricFlag: async () => {
    try {
      return await AsyncStorage.getItem(BIOMETRIC_FLAG_KEY);
    } catch (err) {
      console.error('Error leyendo bandera de biometría:', err);
      return null;
    }
  },

  isBiometricEnabled: async () => (await biometricService.getBiometricFlag()) === 'true',

  /** "Ahora no" — no se vuelve a preguntar automáticamente. */
  declineBiometric: async () => {
    await AsyncStorage.setItem(BIOMETRIC_FLAG_KEY, 'false');
  },

  getRememberedUser: async () => {
    try {
      const raw = await AsyncStorage.getItem(REMEMBERED_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.error('Error leyendo usuario recordado:', err);
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

  /**
   * Activa la huella: guarda la sesión en SecureStore con requireAuthentication:true.
   * Ese guardado ya obliga al SO a pedir la huella como parte de la operación —
   * es el ÚNICO prompt de esta función, no se pide una segunda vez aparte.
   */
  enableBiometric: async ({ user, token }) => {
    try {
      await SecureStore.setItemAsync(
        SECURE_SESSION_KEY,
        JSON.stringify({ user, token }),
        {
          keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
          requireAuthentication: true,
        }
      );
      await AsyncStorage.setItem(BIOMETRIC_FLAG_KEY, 'true');
      await biometricService.setRememberedUser({ name: user?.name, email: user?.email });
    } catch (err) {
      console.error('Error activando biometría:', err);
      throw new Error('No se pudo activar la huella');
    }
  },

  /** Apaga la huella: borra la sesión protegida y la bandera. */
  disableBiometric: async () => {
    try {
      await SecureStore.deleteItemAsync(SECURE_SESSION_KEY);
      await AsyncStorage.setItem(BIOMETRIC_FLAG_KEY, 'false');
    } catch (err) {
      console.error('Error desactivando biometría:', err);
    }
  },

  /**
   * Flujo C — login diario de un solo toque. Se llama SOLO cuando el usuario
   * toca el botón "Iniciar con Huella"; el SO pide la huella una única vez.
   */
  unlockWithBiometrics: async () => {
    try {
      const raw = await SecureStore.getItemAsync(SECURE_SESSION_KEY, {
        requireAuthentication: true,
      });
      if (!raw) return { success: false, reason: 'no_session' };
      return { success: true, session: JSON.parse(raw) };
    } catch (err) {
      return { success: false, reason: classifyAuthError(err) };
    }
  },
};

export default biometricService;
