import { create } from 'zustand';

const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isBiometricVerified: false,
    

    setLogin: (userData, token) => set({
        user: userData,
        token: token,
        isAuthenticated: true,
        isBiometricVerified: false
    }),

    setLogout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
        isBiometricVerified: false
    }),

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