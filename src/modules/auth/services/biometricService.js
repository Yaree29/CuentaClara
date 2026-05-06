const biometricService = {
  // Simula la verificación de si el hardware soporta biometría
  isSensorAvailable: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return true; // Simula que el dispositivo tiene huella/rostro
  },

  // Simula el proceso de escaneo
  authenticate: async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // En una implementación real, aquí se llamaría a la librería nativa
    return { success: true };
  }
};

export default biometricService;