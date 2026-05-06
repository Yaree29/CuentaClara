import { create } from 'zustand';

const useAuthStore = create((set) => ({
    user: null,
    token: null,
    session: null,
    isAuthenticated: false,
    isInitializing: true,
    isBiometricVerified: false,

    setLogin: (userData, token, session = null) => set({
        user: userData,
        token: token,
        session: session,
        isAuthenticated: true,
        isInitializing: false,
        isBiometricVerified: false
    }),

    setLogout: () => set({
        user: null,
        token: null,
        session: null,
        isAuthenticated: false,
        isInitializing: false,
        isBiometricVerified: false
    }),

    setInitializing: (isInitializing) => set({ isInitializing }),

    updateUser: (updatedData) => set((state) => ({
        user: {...state.user, ...updatedData }
    })),

    setBiometricVerified: (value) => set({
        isBiometricVerified: value
    }),


    resetBiometric: () => set({
        isBiometricVerified: false
    })
}));

export default useAuthStore;
