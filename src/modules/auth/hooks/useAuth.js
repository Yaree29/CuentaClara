import { useState } from 'react';
import useAuthStore from '../../../store/useAuthStore';
import authService from '../services/authService';
import biometricService from '../services/biometricService';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const setLogin = useAuthStore((state) => state.setLogin);
  const setLogout = useAuthStore((state) => state.setLogout);

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
  const isBiometricEnabled = async() => biometricService.isEnabled();

  const logout = async() => {
    await authService.logout();
    await biometricService.clearSession();
    setLogout();
  };

  return {
    login,
    loginWithBiometrics,
    linkBiometricSession,
    unlinkBiometricSession,
    isBiometricAvailable,
    isBiometricEnabled,
    logout,
    loading,
    error,
  };
};
