// =============================================================================
// recoveryState.js — bandera compartida "hay una recuperación de contraseña en
// curso".
// -----------------------------------------------------------------------------
// La sesión que crea el enlace de recuperación (App.js → setSession con los
// tokens del deep link) es una sesión REAL de Supabase: emite SIGNED_IN y
// authService.getCurrentSession() la devuelve como si el usuario hubiera
// iniciado sesión normalmente. Eso provocaba dos efectos indeseados:
//
//   1. App.js sincronizaba el refresh token biométrico con ESA sesión, así que
//      recuperar la contraseña re-vinculaba la huella a la cuenta recuperada:
//      al volver al login, el botón de huella entraba a esa cuenta sin haber
//      escrito nunca la contraseña nueva.
//   2. AuthProvider, al arrancar la app en frío por el deep link, corría
//      getCurrentSession() en paralelo y podía encontrar ya establecida la
//      sesión de recuperación → setLogin → RootNavigator saltaba al stack
//      principal en vez de mostrar "Nueva contraseña".
//
// Vive en un módulo aparte (no en App.js) para que AuthProvider pueda leerlo
// sin crear un import circular: App.js ya importa AuthProvider.
// =============================================================================
let recoveryInProgress = false;

export const startRecovery = () => {
  recoveryInProgress = true;
};

export const endRecovery = () => {
  recoveryInProgress = false;
};

export const isRecoveryInProgress = () => recoveryInProgress;

export default { startRecovery, endRecovery, isRecoveryInProgress };
