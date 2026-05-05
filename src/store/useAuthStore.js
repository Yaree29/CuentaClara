import { create } from 'zustand';

const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    token: null,

    setLogin: (userData, token) => set({
        user: userData,
        token: token,
        isAuthenticated: true
    }),

    setLogout: () => set({
        user: null,
        token: null,
        isAuthenticated: false
    }),

    updateUser: (updatedData) => set((state) => ({
        user: {...state.user, ...updatedData }
    }))
}));

export default useAuthStore;