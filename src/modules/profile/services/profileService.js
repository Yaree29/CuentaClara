const profileService = {
    getUserProfile: async(userId) => {
        // Simulación de carga de datos de perfil
        await new Promise(resolve => setTimeout(resolve, 800));

        return {
            name: 'Usuario Administrador',
            email: 'admin@cuenta-clara.com',
            businessName: 'Mi Negocio Pyme S.A.',
            joinedDate: '2026-01-15',
            preferences: {
                notifications: true,
                currency: 'USD'
            }
        };
    }
};

export default profileService;