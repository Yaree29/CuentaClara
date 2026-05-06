import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_SESSION_KEY = 'cc_biometric_session';
const BIOMETRIC_ENABLED_KEY = 'cc_biometric_enabled';
const BIOMETRIC_TYPE_KEY = 'cc_biometric_type';
const SESSION_TIMESTAMP_KEY = 'cc_session_timestamp';

// 24 horas en milisegundos
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000;

const biometricService = {
  /**
   * Verifica si el dispositivo tiene hardware biométrico disponible
   */
  isAvailable: async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) return false;
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return enrolled;
    } catch (err) {
      console.error('Error verificando biometría:', err);
      return false;
    }
  },

  /**
   * Obtiene el tipo de biometría disponible (Face ID, Touch ID, etc.)
   */
  getAvailableBiometrics: async () => {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (err) {
      console.error('Error obteniendo tipos de biometría:', err);
      return [];
    }
  },

  /**
   * Verifica si ya hay una sesión biométrica vinculada
   */
  isEnabled: async () => {
    try {
      const enabledFlag = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
      if (enabledFlag !== 'true') return false;

      // Verifica que el token aún existe
      const session = await SecureStore.getItemAsync(BIOMETRIC_SESSION_KEY);
      if (!session) {
        await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
        return false;
      }

      // Verifica expiración de sesión (24 horas)
      const timestamp = await SecureStore.getItemAsync(SESSION_TIMESTAMP_KEY);
      if (timestamp) {
        const age = Date.now() - parseInt(timestamp, 10);
        if (age > SESSION_EXPIRY_MS) {
          await biometricService.clearSession();
          return false;
        }
      }

      return true;
    } catch (err) {
      console.error('Error verificando si biometría está habilitada:', err);
      return false;
    }
  },

  /**
   * Almacena la sesión en Keychain/Keystore protegida por biometría
   * La sesión solo se libera después de autenticación biométrica exitosa
   */
  saveSession: async (session) => {
    try {
      const biometryTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      await SecureStore.setItemAsync(
        BIOMETRIC_SESSION_KEY,
        JSON.stringify(session),
        {
          keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
          requireAuthentication: true,
        }
      );
      await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
      await SecureStore.setItemAsync(SESSION_TIMESTAMP_KEY, Date.now().toString());
      await SecureStore.setItemAsync(BIOMETRIC_TYPE_KEY, JSON.stringify(biometryTypes));
    } catch (err) {
      console.error('Error guardando sesión biométrica:', err);
      throw new Error('No se pudo vincular la huella');
    }
  },

  /**
   * Obtiene la sesión del Keychain/Keystore
   * requireAuthentication: true fuerza al OS a solicitar biometría
   */
  getSession: async () => {
    try {
      const stored = await SecureStore.getItemAsync(BIOMETRIC_SESSION_KEY, {
        requireAuthentication: true,
      });
      if (!stored) return null;
      return JSON.parse(stored);
    } catch (err) {
      if (err.message?.includes('cancelled')) {
        throw new Error('Autenticación cancelada');
      }
      console.error('Error obteniendo sesión biométrica:', err);
      throw new Error('No se pudo autenticar con huella');
    }
  },

  /**
   * Limpia la sesión biométrica completamente
   */
  clearSession: async () => {
    try {
      await SecureStore.deleteItemAsync(BIOMETRIC_SESSION_KEY);
      await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
      await SecureStore.deleteItemAsync(SESSION_TIMESTAMP_KEY);
      await SecureStore.deleteItemAsync(BIOMETRIC_TYPE_KEY);
    } catch (err) {
      console.error('Error limpiando sesión biométrica:', err);
    }
  },
};

export default biometricService;