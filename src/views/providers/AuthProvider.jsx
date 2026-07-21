// Sin suscripción a onAuthStateChange de Supabase — la sesión se gestiona
// manualmente desde AsyncStorage a través de authService.
import React, { createContext, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../../store/useAuthStore';
import useBlueprintStore from '../../store/useBlueprintStore';
import { ASSISTANT_MODE_ACTIVE_FLAG } from '../../store/useAssistantModeStore';
import authService from '../../modules/auth/services/authService';

const AuthContext = createContext({});

// El blueprint define qué tabs ve el usuario; se construye con datos que
// vienen de /auth/context (userType, business, enabled_modules)
const buildBlueprint = (user) => ({
  userType: user?.userType || 'informal',
  config: {
    source: 'api',
    business: user?.business || null,
  },
  enabled_modules: user?.enabled_modules || ['dashboard', 'profile'],
});

export const AuthProvider = ({ children }) => {
  const {
    isAuthenticated,
    user,
    setLogin,
    setLogout,
    setInitializing,
  } = useAuthStore();

  const { setBlueprint, resetBlueprint } = useBlueprintStore();

  // Al arrancar la app intenta restaurar la sesión desde AsyncStorage.
  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      try {
        // Medida de seguridad del Modo Asistente (Fase E): si esta bandera
        // sigue en 'true', la app se cerró por completo (force-quit o cierre
        // manual) mientras un asistente estaba activo, sin pasar por
        // disableMode() (la única salida que la borra). No se puede confiar
        // en que quien reabrió el dispositivo sea el dueño — se cierra la
        // sesión y se exige login nuevo en vez de restaurar cualquier Home.
        const assistantModeFlag = await AsyncStorage.getItem(ASSISTANT_MODE_ACTIVE_FLAG);
        if (assistantModeFlag === 'true') {
          await AsyncStorage.removeItem(ASSISTANT_MODE_ACTIVE_FLAG);
          await authService.logout();
          if (isMounted) setLogout();
          return;
        }

        const currentSession = await authService.getCurrentSession();

        if (!isMounted) return;

        if (currentSession?.user) {
          setLogin(currentSession.user, currentSession.token);
        } else {
          setLogout();
        }
      } catch {
        await authService.clearLocalSession();

        if (isMounted) {
          setLogout();
        }
      } finally {
        if (isMounted) {
          setInitializing(false);
        }
      }
    };

    loadSession();

    return () => {
      isMounted = false;
    };
  }, [setInitializing, setLogin, setLogout]);

  // Reconstruye el blueprint cada vez que cambia el usuario autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      const blueprint = buildBlueprint(user);
      setBlueprint(blueprint);
    } else {
      resetBlueprint();
    }
  }, [isAuthenticated, user, setBlueprint, resetBlueprint]);

  return (
    <AuthContext.Provider value={{}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);