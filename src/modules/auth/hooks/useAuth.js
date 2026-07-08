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

  // Flujo C (login diario de un solo toque): un único prompt nativo dentro
  // de unlockWithBiometrics(). Devuelve {success, reason} en vez de lanzar,
  // así la pantalla decide qué mostrar según la razón (cancelado, bloqueado, etc).
  const loginWithBiometrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await biometricService.unlockWithBiometrics();
      if (!result.success) {
        return { success: false, reason: result.reason };
      }
      setLogin(result.session.user, result.session.token);
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const linkBiometricSession = async(user, token) => {
    try {
        await biometricService.enableBiometric({ user, token });
    } catch (err) {
        setError(err.message || 'No se pudo vincular la huella');
        throw err;
    }
  };

  const unlinkBiometricSession = async() => {
    await biometricService.disableBiometric();
  };

  const isBiometricAvailable = async() => biometricService.isAvailable();
  const isBiometricEnabled = async() => biometricService.isBiometricEnabled();

  // Cerrar sesión NO apaga la huella ni borra el token seguro — es una
  // propiedad del dispositivo/cuenta, no de la sesión activa (estilo bancario).
  // Solo unlinkBiometricSession()/disableBiometric() la apaga de verdad.
  const logout = async() => {
    await authService.logout();
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
    linkBiometricSession,
    unlinkBiometricSession,
    isBiometricAvailable,
    isBiometricEnabled,
    logout,
    resetPassword,
    loading,
    error,
  };
};
