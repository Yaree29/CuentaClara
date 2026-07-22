import AsyncStorage from '@react-native-async-storage/async-storage';

// Bandera cosmética (no sensible) que recuerda si el usuario ya vio la
// pantalla de bienvenida. Se usa solo para decidir la pantalla inicial del
// flujo de autenticación (Welcome vs Login), nunca para lógica de sesión.
const WELCOME_SEEN_KEY = 'cc_has_seen_welcome';

/**
 * Devuelve true si el usuario ya vio la pantalla de bienvenida alguna vez
 * en este dispositivo.
 */
export const hasSeenWelcome = async () => {
  try {
    const value = await AsyncStorage.getItem(WELCOME_SEEN_KEY);
    return value === 'true';
  } catch (e) {
    // Si falla la lectura, asumimos que no la ha visto para no romper el
    // flujo de registro (peor caso: la ve una vez más de lo necesario).
    return false;
  }
};

/**
 * Marca la pantalla de bienvenida como vista para que no vuelva a
 * mostrarse en próximos ingresos.
 */
export const markWelcomeSeen = async () => {
  try {
    await AsyncStorage.setItem(WELCOME_SEEN_KEY, 'true');
  } catch (e) {
    // No es crítico: en el peor caso se vuelve a mostrar una vez más.
  }
};

export default { hasSeenWelcome, markWelcomeSeen };
