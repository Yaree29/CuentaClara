import { create } from 'zustand';

// =============================================================================
// Estado de sesión en memoria. La sesión "real" (tokens y su rotación) la
// administra el SDK de Supabase (supabaseClient). Aquí solo se guarda lo que la
// UI consulta de forma síncrona:
//   · user  — perfil completo (business_id, role, enabled_modules, userType)
//   · token — access_token, usado como respaldo por apiClient cuando el SDK
//             todavía no tiene la sesión en memoria (p.ej. justo tras registro)
// El refresh token NO se guarda aquí: vive en el SDK y, para la huella, cifrado
// en SecureStore (biometricService).
// =============================================================================
const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isInitializing: true,
    isBiometricVerified: false,

    setLogin: (userData, token) => set({
        user: userData,
        token,
        isAuthenticated: true,
        isInitializing: false,
        isBiometricVerified: false,
    }),

    setLogout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
        isInitializing: false,
        isBiometricVerified: false,
    }),

    setInitializing: (isInitializing) => set({ isInitializing }),

    updateUser: (updatedData) => set((state) => ({
        user: { ...state.user, ...updatedData },
    })),

    setBiometricVerified: (value) => set({ isBiometricVerified: value }),

    resetBiometric: () => set({ isBiometricVerified: false }),
}));

export default useAuthStore;
