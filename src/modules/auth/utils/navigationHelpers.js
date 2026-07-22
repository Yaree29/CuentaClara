/**
 * Vuelve a la pantalla anterior si existe en el stack; si no la hay
 * (por ejemplo, porque se llegó aquí con navigation.replace desde
 * WelcomeScreen y no queda historial previo), navega en su lugar a una
 * pantalla de respaldo en vez de disparar el error
 * "GO_BACK was not handled by any navigator".
 */
export const safeGoBack = (navigation, fallbackRoute = 'Login') => {
  if (navigation?.canGoBack?.()) {
    navigation.goBack();
  } else {
    navigation.replace(fallbackRoute);
  }
};

export default { safeGoBack };