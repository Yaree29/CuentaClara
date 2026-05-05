import { create } from 'zustand';

const useBlueprintStore = create((set) => ({
    config: null,
    modules: [],
    isLoading: false,

    setBlueprint: (blueprint) => set({
        config: blueprint,
        modules: blueprint.enabled_modules || []
    }),

    isModuleEnabled: (moduleName) => (state) => {
        return state.modules.includes(moduleName);
    },

    resetBlueprint: () => set({
        config: null,
        modules: []
    })
}));

export default useBlueprintStore;