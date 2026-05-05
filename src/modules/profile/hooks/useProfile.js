import { useState, useEffect } from 'react';
import useAuthStore from '../../../store/useAuthStore';
import profileService from '../services/profileService';

const useProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user, setLogout } = useAuthStore();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await profileService.getUserProfile(user?.id);
                setProfile(data);
            } catch (error) {
                console.error("Error al cargar perfil:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchProfile();
    }, [user]);

    return {
        profile,
        loading,
        logout: setLogout
    };
};


export default useProfile;