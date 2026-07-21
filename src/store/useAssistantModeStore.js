import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Bandera espejo en AsyncStorage — NO es el estado real (ese sigue siendo
// isActive/activeAssistant en memoria, sin zustand-persist, igual que
// siempre). Sirve solo para que AuthProvider detecte, en el cold start
// siguiente a un cierre completo de la app, que el Modo Asistente quedó
// "activo" sin haber pasado por disableMode() (salida con contraseña) —
// mismo patrón de banderas planas en AsyncStorage que BIOMETRIC_FLAG_KEY en
// biometricService.js.
export const ASSISTANT_MODE_ACTIVE_FLAG = 'cc_assistant_mode_active';

// =============================================================================
// Estado del Modo Asistente — en memoria, sin persist middleware (el proyecto
// no usa zustand-persist en ningún store; banderas que deben sobrevivir a
// reabrir la app van en AsyncStorage/SecureStore, no aquí — ver
// biometricService.js). Este store es puramente de sesión activa:
//
//   · isActive        — el dueño activó el Modo Asistente en este dispositivo
//                        desde el kebab . Sigue siendo la sesión del
//                        dueño (mismo JWT); no crea una cuenta ni login nuevo.
//   · activeAssistant — qué asistente está operando ahora ({id, name,
//                        access_type} tras verificar su PIN), o null cuando
//                        se volvió al selector de nombres.
//
// La restricción real de navegación por access_type y el polling de bloqueo consumiendo este mismo store.
// =============================================================================
const useAssistantModeStore = create((set) => ({
  isActive: false,
  activeAssistant: null,

  // El dueño activa el modo desde el kebab, antes de elegir un asistente.
  enableMode: () => {
    set({ isActive: true });
    AsyncStorage.setItem(ASSISTANT_MODE_ACTIVE_FLAG, 'true').catch(() => {});
  },

  // Tras verificar el PIN correctamente (POST /assistants/{id}/verify-pin).
  selectAssistant: (assistant) => set({ activeAssistant: assistant }),

  // Vuelve al selector de nombres sin salir del Modo Asistente en general.
  exitAssistant: () => set({ activeAssistant: null }),

  // El dueño sale del Modo Asistente por completo.
  // Limpia también la bandera de AsyncStorage — esta es la única salida
  // "correcta" que la borra; un force-quit la deja en 'true' a propósito.
  disableMode: () => {
    set({ isActive: false, activeAssistant: null });
    AsyncStorage.removeItem(ASSISTANT_MODE_ACTIVE_FLAG).catch(() => {});
  },
}));

export default useAssistantModeStore;
