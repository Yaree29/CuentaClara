import { useEffect, useState } from 'react';
import useAuthStore from '../../../store/useAuthStore';
import authService from '../../auth/services/authService';
import profileService from '../services/profileService';

const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, setLogout } = useAuthStore();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileService.getUserProfile(user);
        setProfile(data);
      } catch (error) {
        console.error('Error al cargar perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const logout = async () => {
    try {
      // Cerrar sesión en Supabase (servidor)
      await authService.logout();
      // Limpiar cualquier sesión local persistida
      if (authService.clearLocalSession) {
        await authService.clearLocalSession();
      }
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    } finally {
      // Reset del estado local de la app
      setLogout();
    }
  };

  return {
    profile,
    loading,
    logout,
  };
};

export default useProfile;
