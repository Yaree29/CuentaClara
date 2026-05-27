import { useState } from 'react';
import useAuthStore from '../../../store/useAuthStore';
import useUserStore from '../../../store/useUserStore';
import authService from '../services/authService';
import biometricService from '../services/biometricService';
import loginService from '../services/loginService';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const setLogin = useAuthStore((state) => state.setLogin);
  const setLogout = useAuthStore((state) => state.setLogout);
  const setUserType = useUserStore((state) => state.setUserType);
  const setBusinessData = useUserStore((state) => state.setBusinessData);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(email, password);
      setLogin(response.user, response.token, response.session);
      return response;
    } catch (err) {
      setError(err.message || 'Credenciales invalidas');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithBiometrics = async() => {
    setLoading(true);
    setError(null);
    try {
        const available = await biometricService.isAvailable();
        if (!available) {
            setError('Biometría no disponible en este dispositivo');
            return null;
        }
        const session = await biometricService.getSession();
        if (!session?.user || !session?.token) {
            setError('No hay una sesión biométrica vinculada');
            return null;
        }
        setLogin(session.user, session.token);
        return session;
    } catch (err) {
        const errorMsg = err.message || 'No se pudo autenticar con huella';
        setError(errorMsg);
        throw err;
    } finally {
        setLoading(false);
    }
  };

  const linkBiometricSession = async(user, token) => {
    try {
        await biometricService.saveSession({ user, token });
    } catch (err) {
        setError(err.message || 'No se pudo vincular la huella');
        throw err;
    }
  };

  const unlinkBiometricSession = async() => {
    await biometricService.clearSession();
  };

  const isBiometricAvailable = async() => biometricService.isAvailable();
  const isBiometricEnabled = async() => biometricService.hasStoredCredentials();

  /**
   * Guarda email + password cifrados en el dispositivo, protegidos por huella.
   */
  const saveCredentialsForBiometric = async (email, password) => {
    try {
      await biometricService.saveCredentials(email, password);
    } catch (err) {
      setError(err.message || 'No se pudieron guardar las credenciales');
      throw err;
    }
  };

  /**
   * Verifica si hay credenciales almacenadas (sin pedir huella).
   */
  const hasStoredCredentials = async () => {
    return biometricService.hasStoredCredentials();
  };

  /**
   * Flujo completo: pide huella → recupera credenciales → hace login real
   * con Supabase para obtener un token fresco.
   */
  const loginWithStoredCredentials = async () => {
    setLoading(true);
    setError(null);
    try {
      const available = await biometricService.isAvailable();
      if (!available) {
        setError('Biometría no disponible en este dispositivo');
        return null;
      }

      // Esto dispara el prompt de huella dactilar / Face ID
      const creds = await biometricService.getCredentials();
      if (!creds?.email || !creds?.password) {
        setError('No hay credenciales guardadas. Inicia sesión con correo y contraseña.');
        return null;
      }

      // Login fresco con Supabase usando las credenciales recuperadas
      const result = await loginService.login(creds.email, creds.password);

      setUserType(result.user?.role || 'user');
      setBusinessData(result.business || null);
      setLogin(result.user, result.token, null);

      return result;
    } catch (err) {
      const errorMsg = err.message || 'No se pudo autenticar con huella';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async() => {
    await authService.logout();
    await biometricService.clearSession();
    setLogout();
  };

  const resetPassword = async (email) => {
    setLoading(true);
    setError(null);

    try {
      await authService.resetPassword(email);
      return true;
    } catch (err) {
      setError(err.message || 'No se pudo enviar el correo de recuperación');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    loginWithBiometrics,
    loginWithStoredCredentials,
    linkBiometricSession,
    unlinkBiometricSession,
    saveCredentialsForBiometric,
    hasStoredCredentials,
    isBiometricAvailable,
    isBiometricEnabled,
    logout,
    resetPassword,
    loading,
    error,
  };
};
