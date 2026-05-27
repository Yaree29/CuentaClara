// Sin imports de Supabase — toda la autenticación pasa por la API de FastAPI.
// El JWT de Supabase se guarda en AsyncStorage en lugar de dejar que el cliente
// de Supabase maneje la sesión, porque ya no hay cliente de Supabase en auth.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../../config/env';

const TOKEN_KEY = 'cc_access_token';

const baseUrl = () => API_URL || 'https://cuentaclara-api.onrender.com';

const apiRequest = async (path, options = {}, token = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${baseUrl()}${path}`, { ...options, headers });

  if (!response.ok) {
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      throw new Error(data.detail || 'Error del servidor');
    } catch (e) {
      if (e.message !== 'Error del servidor' && !e.message.startsWith('Error del servidor:')) {
        throw new Error(`Error del servidor: ${text.substring(0, 150)}`);
      }
      throw e;
    }
  }

  return response.json();
};

const authService = {
  login: async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    await AsyncStorage.setItem(TOKEN_KEY, data.access_token);

    // /me y /context se cargan en paralelo para reducir latencia al iniciar sesión
    const [profile, context] = await Promise.all([
      apiRequest('/auth/me', {}, data.access_token),
      apiRequest('/auth/context', {}, data.access_token),
    ]);

    return {
      user: { ...profile, ...context, api_token: data.access_token },
      token: data.access_token,
      session: null, // session siempre null — ya no usamos el objeto de sesión de Supabase
    };
  },

  getCurrentSession: async () => {
    // Al arrancar la app, restaura la sesión desde AsyncStorage sin pedir credenciales
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    try {
      const [profile, context] = await Promise.all([
        apiRequest('/auth/me', {}, token),
        apiRequest('/auth/context', {}, token),
      ]);

      return {
        user: { ...profile, ...context, api_token: token },
        token,
        session: null,
      };
    } catch {
      // Si el token expiró o es inválido, lo borramos para forzar nuevo login
      await AsyncStorage.removeItem(TOKEN_KEY);
      return null;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    return true;
  },

  clearLocalSession: async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
  },

  resetPassword: async (email) => {
    await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return true;
  },

  // No-op: el frontend ya no escucha eventos de Supabase Auth.
  // Se mantiene la firma para no romper código que aún llame a este método.
  onAuthStateChange: (_callback) => {
    return { unsubscribe: () => {} };
  },
};

export default authService;
