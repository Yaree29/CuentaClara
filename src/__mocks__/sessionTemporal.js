// Blueprint dinámico para simulación de multi-tenancy
export const sessionTemporal = {
    pyme: {
        userType: 'pyme',
        config: {
            theme: 'corporate',
            showAdvancedMetrics: true,
        },
        enabled_modules: [
            'auth',
            'dashboard',
            'inventory',
            'sales',
            'profile',
            'reports',
            'billing',
            'settings'
        ]
    },
    informal: {
        userType: 'informal',
        config: {
            theme: 'minimal',
            showAdvancedMetrics: false,
        },
        enabled_modules: [
            'auth',
            'dashboard',
            'inventory',
            'sales',
            'credit',
            'billing',
            'profile'
        ]
    }
};

export const getBlueprintByRole = (role) => {
    return sessionTemporal[role] || sessionTemporal.informal;
};