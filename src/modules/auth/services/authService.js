// =============================================================================
// authService.js — Autenticación vía el SDK oficial de Supabase
// =============================================================================
// El SDK (supabaseClient) es el dueño de la SESIÓN: login, refresh automático
// del token, logout y recuperación de contraseña pasan por él. FastAPI ya no
// interviene en el login — solo se le piden /auth/me y /auth/context (con el
// token del SDK, vía apiRequestPublic) para traer el perfil de public.users
// (business_id, role, enabled_modules, userType), que vive FUERA de auth.users.
//
// El REGISTRO se hace en FastAPI (registerService.js) por su rollback atómico y
// la dependencia circular negocio↔usuario.
// =============================================================================
import { supabase } from '../../../services/supabaseClient';
import { apiRequest, apiRequestPublic } from '../../../services/apiClient';

// Traduce los mensajes en inglés del SDK a los que ya espera la UI.
const mapAuthError = (error) => {
  const msg = (error?.message || '').toLowerCase();
  if (msg.includes('invalid login credentials')) return 'Credenciales incorrectas';
  if (msg.includes('email not confirmed')) return 'Debes confirmar tu correo antes de iniciar sesión';
  if (msg.includes('network')) return 'Sin conexión. Verifica tu internet e intenta de nuevo';
  return error?.message || 'No se pudo iniciar sesión';
};

// Con una sesión válida del SDK, arma el objeto `user` completo desde el backend.
// /me y /context se cargan en paralelo para reducir latencia.
const buildSession = async (session) => {
  const [profile, context] = await Promise.all([
    apiRequestPublic('/auth/me', {}, session.access_token),
    apiRequestPublic('/auth/context', {}, session.access_token),
  ]);
  return {
    user: { ...profile, ...context, api_token: session.access_token },
    token: session.access_token,
  };
};

const authService = {
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw new Error(mapAuthError(error));
    if (!data.session) throw new Error('Credenciales incorrectas');

    // Si el usuario tiene 2FA, la sesión queda en aal1 y hay que elevarla a aal2
    // con un código TOTP antes de completar el login (lo resuelve LoginScreen).
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.currentLevel === 'aal1' && aal?.nextLevel === 'aal2') {
      return { mfaRequired: true };
    }
    return buildSession(data.session);
  },

  // Completa el login después de verificar el código MFA (sesión ya en aal2).
  completeAfterMfa: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Sesión no disponible');
    return buildSession(session);
  },

  getCurrentSession: async () => {
    // getSession() restaura de memoria/SDK y refresca solo si hace falta.
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    try {
      return await buildSession(session);
    } catch {
      // El token es válido pero el backend no respondió (ej. Render caído).
      // No cerramos la sesión del SDK: solo indicamos que no hay perfil ahora.
      return null;
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    return true;
  },

  clearLocalSession: async () => {
    await supabase.auth.signOut();
  },

  // Envía el correo de recuperación con deep link a la app (ResetPasswordScreen).
  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: 'cuentaclara://reset-password' }
    );
    if (error) throw new Error(error.message || 'No se pudo enviar el correo de recuperación');
    return true;
  },

  // Confirma la contraseña de la cuenta sin crear una sesión nueva (el JWT
  // activo del dueño no cambia). Usado como "confirma que eres tú" antes de
  // revelar un PIN de asistente regenerado.
  verifyPassword: async (password) => {
    try {
      await apiRequest('/auth/verify-password', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      return true;
    } catch {
      return false;
    }
  },
};

export default authService;
