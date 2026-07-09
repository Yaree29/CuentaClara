// =============================================================================
// supabaseClient.js — Cliente oficial de Supabase para el frontend
// =============================================================================
// Propósito: cliente único de @supabase/supabase-js que maneja la SESIÓN de
// autenticación (login, refresh automático del token, recuperación de
// contraseña, MFA) y el realtime de notificaciones.
//
// Responsabilidades separadas a propósito:
//   · Este cliente (SDK)  → auth.users de Supabase (credenciales/sesión) + realtime.
//   · FastAPI (service_role) → public.users (perfil + business_id + role) y toda
//                              la lógica de negocio. El SDK NUNCA consulta tablas
//                              de negocio directamente.
//
// El refresco del access_token lo hace el SDK solo (autoRefreshToken). El manejo
// de AppState (start/stopAutoRefresh según foreground/background) vive en App.js.
// =============================================================================
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/env';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    // persistSession:false a propósito: la sesión vive solo en memoria mientras
    // la app está viva (sobrevive a segundo plano, se pierde al cerrar la app
    // por completo). Así, al reabrir la app SIEMPRE se muestra el login — no hay
    // auto-login silencioso. El único credencial que sobrevive al cierre es el
    // refresh token biométrico en SecureStore (biometricService), gateado por
    // huella. El logout explícito lo borra. (storage se conserva para el
    // verifier PKCE del reset de contraseña.)
    persistSession: false,
    detectSessionInUrl: false,
    // 'implicit' en vez de 'pkce': con persistSession:false, el SDK fuerza un
    // storage EN MEMORIA para todo (confirmado leyendo GoTrueClient.js — ignora
    // el `storage: AsyncStorage` de arriba cuando persistSession es false), así
    // que el code_verifier de PKCE no sobrevive a que el usuario salga a su
    // correo y la app se descargue de memoria: el intercambio del código fallaba
    // en silencio al volver por el deep link. 'implicit' no necesita ese estado
    // intermedio — el enlace de recuperación trae el access_token/refresh_token
    // directamente, así que no hay nada que "sobreviva" entre pasos. Efecto
    // secundario bueno: también elimina el warning de WebCrypto (era el intento
    // de hashear el code_challenge de PKCE, que RN no soporta nativamente).
    flowType: 'implicit',
  },
});

export default supabase;
