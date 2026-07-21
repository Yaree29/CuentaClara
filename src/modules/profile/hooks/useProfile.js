import { useEffect, useState } from 'react';
import useAuthStore from '../../../store/useAuthStore';
import authService from '../../auth/services/authService';
import biometricService from '../../auth/services/biometricService';
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

  const reloadProfile = async () => {
    setLoading(true);
    try {
      const session = await authService.getCurrentSession();
      if (session?.user) {
        useAuthStore.getState().setLogin(session.user, session.token);
      }
    } catch (error) {
      console.error('Error reloading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Logout explícito (el usuario sale a propósito): borra el refresh token
      // biométrico y baja la bandera para OCULTAR el botón de huella en Login.
      // Sin esto, el botón seguía visible y, como signOut() ya revocó el token
      // en el servidor, al presionarlo daba "Sesión expirada".
      await biometricService.disableBiometric();
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
    reloadProfile,
  };
};

export default useProfile;
