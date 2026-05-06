import { create } from 'zustand';

const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isInitializing: true,
    token: null,
    session: null,

    setLogin: (userData, token, session = null) => set({
        user: userData,
        token: token,
        session,
        isAuthenticated: true,
        isInitializing: false
    }),

    setLogout: () => set({
        user: null,
        token: null,
        session: null,
        isAuthenticated: false,
        isInitializing: false
    }),

    setInitializing: (isInitializing) => set({ isInitializing }),

    updateUser: (updatedData) => set((state) => ({
        user: {...state.user, ...updatedData }
    }))
}));

export default useAuthStore;
