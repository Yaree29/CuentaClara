import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

const TOKEN_STORAGE_KEY = 'cc_secure_jwt_token';

const decodeJwtPayload = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    throw new Error('El token recibido no tiene un formato JWT válido.');
  }
};

const readStoredToken = async () => {
  const rawValue = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const stored = JSON.parse(rawValue);

    if (!stored?.token || typeof stored.token !== 'string') {
      await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
      return null;
    }

    return stored;
  } catch (error) {
    await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
    return null;
  }
};

const tokenManager = {
  saveToken: async (token) => {
    if (!token || typeof token !== 'string') {
      throw new Error('No se recibió un token válido para almacenar.');
    }

    // Guardamos el JWT en SecureStore para evitar texto plano en el dispositivo.
    const payload = decodeJwtPayload(token);
    const expiresAt = typeof payload.exp === 'number' ? payload.exp * 1000 : null;

    await SecureStore.setItemAsync(
      TOKEN_STORAGE_KEY,
      JSON.stringify({
        token,
        expiresAt,
        savedAt: Date.now(),
      }),
      {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      }
    );

    return token;
  },

  getToken: async () => {
    const stored = await readStoredToken();

    if (!stored) {
      return null;
    }

    // Si el JWT ya expiró, se elimina y la app fuerza un reingreso seguro.
    if (stored.expiresAt && Date.now() >= stored.expiresAt) {
      await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
      return null;
    }

    return stored.token;
  },

  removeToken: async () => {
    await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
  },

  isAuthenticated: async () => {
    const token = await tokenManager.getToken();
    return Boolean(token);
  },
};

export default tokenManager;