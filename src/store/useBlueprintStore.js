import { create } from 'zustand';

const useBlueprintStore = create((set) => ({
    config: null,
    modules: [],
    isLoading: false,

    setBlueprint: (blueprint) => set({
        config: blueprint,
        modules: blueprint.enabled_modules || []
    }),

    // Actualiza solo la lista de módulos activos (ej. tras activar uno nuevo
    // vía PUT /businesses/me/modules), sin reconstruir todo el blueprint.
    setModules: (modules) => set({ modules: modules || [] }),

    isModuleEnabled: (moduleName) => (state) => {
        return state.modules.includes(moduleName);
    },

    resetBlueprint: () => set({
        config: null,
        modules: []
    })
}));

export default useBlueprintStore;