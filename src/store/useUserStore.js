import { create } from 'zustand';

const useUserStore = create((set) => ({
    userType: null, // 'pyme' | 'informal'
    businessData: null,
    preferences: {},

    setUserType: (type) => set({ userType: type }),

    setBusinessData: (data) => set({ businessData: data }),

    setPreferences: (prefs) => set((state) => ({
        preferences: {...state.preferences, ...prefs }
    })),

    resetUserContext: () => set({
        userType: null,
        businessData: null,
        preferences: {}
    })
}));

export default useUserStore;