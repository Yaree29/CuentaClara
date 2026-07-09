// =============================================================================
// mfaService.js — 2FA (TOTP) nativo de Supabase
// =============================================================================
// Reemplaza la implementación casera con pyotp en FastAPI. Usa
// supabase.auth.mfa.* — los factores se guardan en el esquema auth de Supabase,
// no en public.users (ya no se tocan las columnas mfa_secret/mfa_enabled).
//
// Flujos:
//   · Activar 2FA:  startEnroll() → mostrar QR/secret → confirmEnroll(factorId, code)
//   · Desactivar:   disable()
//   · Estado:       isEnabled()
//   · Login:        needsChallenge() → verifyChallenge(code) para elevar a aal2
// =============================================================================
import { supabase } from '../../../services/supabaseClient';

const mfaService = {
  // ¿El usuario tiene un factor TOTP verificado?
  isEnabled: async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) return false;
    return (data?.totp || []).some((f) => f.status === 'verified');
  },

  // Inicia el enrolamiento. Limpia primero cualquier factor TOTP a medio
  // configurar de un intento anterior (Supabase no permite duplicados colgados).
  // La limpieza es "best effort": si un unenroll individual falla, no debe
  // tumbar el enroll (antes un solo fallo ahí abortaba todo el flujo con el
  // mismo mensaje genérico que un fallo real de enroll, mezclando dos causas).
  startEnroll: async () => {
    const { data: list, error: listError } = await supabase.auth.mfa.listFactors();
    if (listError) throw new Error(listError.message);

    const stale = (list?.all || []).filter(
      (f) => f.factor_type === 'totp' && f.status !== 'verified'
    );
    for (const f of stale) {
      try {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      } catch (err) {
        console.warn('[mfaService] No se pudo limpiar un factor TOTP viejo:', err);
      }
    }

    // `issuer` explícito a propósito: sin él, el servidor de Supabase (GoTrue)
    // deriva el issuer del TOTP desde el host del Site URL configurado en el
    // panel. Si ese Site URL es un esquema custom (cuentaclara://), el host
    // queda vacío y la generación del QR falla en el servidor con
    // "Error generating QR Code". Pasando el issuer aquí no dependemos de eso.
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      issuer: 'CuentaClara',
    });
    if (error) throw new Error(error.message);
    return {
      factorId: data.id,
      qrCode: data.totp?.qr_code, // SVG data URI (el SDK ya arma el data: URI completo)
      secret: data.totp?.secret,
      uri: data.totp?.uri,
    };
  },

  // Confirma el enrolamiento con el código de la app autenticadora.
  confirmEnroll: async (factorId, code) => {
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) throw new Error(challengeError.message);
    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    });
    return !error;
  },

  // Desactiva el 2FA quitando todos los factores TOTP del usuario. Igual que en
  // startEnroll, cada unenroll es best-effort: uno fallido no debe dejar la
  // pantalla de Seguridad sin poder confirmar que el resto sí se desactivó.
  disable: async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) throw new Error(error.message);

    const factors = (data?.all || []).filter((f) => f.factor_type === 'totp');
    for (const f of factors) {
      try {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      } catch (err) {
        console.warn('[mfaService] No se pudo quitar un factor TOTP:', err);
      }
    }
    return true;
  },

  // Login: ¿la sesión está en aal1 pero el usuario tiene 2FA (aal2)?
  needsChallenge: async () => {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) return false;
    return data?.currentLevel === 'aal1' && data?.nextLevel === 'aal2';
  },

  // Login: verifica el código TOTP para elevar la sesión a aal2.
  verifyChallenge: async (code) => {
    const { data: list, error } = await supabase.auth.mfa.listFactors();
    if (error) throw new Error(error.message);
    const factor = (list?.totp || [])[0];
    if (!factor) throw new Error('No hay un factor MFA configurado');

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: factor.id,
    });
    if (challengeError) throw new Error(challengeError.message);

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: factor.id,
      challengeId: challenge.id,
      code,
    });
    return !verifyError;
  },
};

export default mfaService;
