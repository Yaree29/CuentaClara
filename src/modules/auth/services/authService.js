import { getBlueprintByRole } from '../../../data/sessionTemporal';

const authService = {
    login: async(email, password) => {
        // Simulación de delay de red
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Lógica de simulación para propósitos de desarrollo
        if (email.includes('pyme')) {
            return {
                user: { id: '1', email, role: 'pyme', name: 'Admin Pyme' },
                token: 'fake-jwt-token-pyme'
            };
        }

        return {
            user: { id: '2', email, role: 'informal', name: 'Usuario Informal' },
            token: 'fake-jwt-token-informal'
        };
    },

    logout: async() => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return true;
    }
};

export default authService;