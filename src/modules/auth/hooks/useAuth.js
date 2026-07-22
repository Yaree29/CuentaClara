import { useState } from 'react';
import useAuthStore from '../../../store/useAuthStore';
import authService from '../services/authService';
import biometricService from '../services/biometricService';

// Único mensaje que ve el usuario ante un login fallido. No distingue si el
// correo no existe, si la contraseña no coincide o si la cuenta está
// incompleta: todos esos casos comparten esta respuesta.
const GENERIC_LOGIN_ERROR = 'Correo o contraseña incorrectos.';

// Un fallo es "de credenciales" si el servidor respondió rechazando el acceso.
// Los errores de red o de servidor caído no entran acá: a esos se les deja su
// mensaje real, porque le sirve al usuario y no revela nada de la cuenta.
const isCredentialsError = (err) => {
  const msg = (err?.message || '').toLowerCase();

  return (
    msg.includes('credencial') ||
    msg.includes('invalid login') ||
    msg.includes('contraseña') ||
    msg.includes('usuario no encontrado') ||
    msg.includes('email not confirmed') ||
    msg.includes('401')
  );
};

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
      // Si falta el reto MFA, no se inicia sesión aún — LoginScreen lo maneja.
      if (response?.mfaRequired) return response;
      setLogin(response.user, response.token);
      return response;
    } catch (err) {
      // Mensaje único para CUALQUIER fallo de autenticación. No se propaga
      // err.message: distinguir "ese correo no existe" de "la contraseña no
      // coincide" le confirma a un atacante qué correos están registrados.
      // Los problemas que no son de credenciales (sin internet, servidor
      // caído) sí conservan su mensaje, porque ahí no hay nada que filtrar.
      setError(isCredentialsError(err) ? GENERIC_LOGIN_ERROR : (err.message || GENERIC_LOGIN_ERROR));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Completa el login tras verificar el código MFA (sesión ya elevada a aal2).
  const completeMfaLogin = async () => {
    const response = await authService.completeAfterMfa();
    setLogin(response.user, response.token);
    return response;
  };

  // Flujo C (login diario de un solo toque): authenticateAsync abre el prompt
  // una vez dentro de unlockWithBiometrics(); si tiene éxito, la sesión ya está
  // en el SDK y se arma el perfil completo con getCurrentSession(). Devuelve
  // {success, reason} en vez de lanzar, para que la pantalla decida el mensaje.
  const loginWithBiometrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await biometricService.unlockWithBiometrics();
      if (!result.success) {
        return { success: false, reason: result.reason };
      }
      const session = await authService.getCurrentSession();
      if (!session?.user) {
        return { success: false, reason: 'unknown' };
      }
      setLogin(session.user, session.token);
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  // Activa la huella para el usuario actual. enableBiometric() toma el refresh
  // token vigente directamente del SDK; aquí solo se pasa el user para el saludo.
  const linkBiometricSession = async (user) => {
    try {
      await biometricService.enableBiometric({ user });
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

  // Logout explícito (cambiar de cuenta / salir a propósito): borra el refresh
  // token biométrico y oculta el botón, y revoca la sesión en Supabase. Distinto
  // de cerrar la app: al reabrir, el botón de huella sigue disponible.
  const logout = async() => {
    await biometricService.disableBiometric();
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
    completeMfaLogin,
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
