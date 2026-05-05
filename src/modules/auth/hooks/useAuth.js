import { useState } from 'react';
import useAuthStore from '../../../store/useAuthStore';
import authService from '../services/authService';

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const setLogin = useAuthStore((state) => state.setLogin);
    const setLogout = useAuthStore((state) => state.setLogout);

    const login = async(email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authService.login(email, password);
            setLogin(response.user, response.token);
            return response;
        } catch (err) {
            setError('Credenciales inválidas');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async() => {
        await authService.logout();
        setLogout();
    };

    return {
        login,
        logout,
        loading,
        error
    };
};