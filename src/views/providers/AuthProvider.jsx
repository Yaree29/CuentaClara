// Sin suscripción a onAuthStateChange de Supabase — la sesión se gestiona
// manualmente desde AsyncStorage a través de authService.
import React, { createContext, useContext, useEffect } from 'react';
import useAuthStore from '../../store/useAuthStore';
import useUserStore from '../../store/useUserStore';
import useBlueprintStore from '../../store/useBlueprintStore';
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
  const { isAuthenticated, user, setLogin, setLogout, setInitializing } = useAuthStore();
  const { setUserType } = useUserStore();
  const { setBlueprint, resetBlueprint } = useBlueprintStore();

  // Al arrancar la app intenta restaurar la sesión desde AsyncStorage.
  // isInitializing se mantiene en true hasta que esto termine, para
  // que el navigator no muestre nada antes de saber si hay sesión activa.
  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      try {
        const currentSession = await authService.getCurrentSession();

        if (!isMounted) return;

        if (currentSession?.user) {
          setLogin(currentSession.user, currentSession.token);
        } else {
          setLogout();
        }
      } catch {
        await authService.clearLocalSession();
        if (isMounted) setLogout();
      } finally {
        if (isMounted) setInitializing(false);
      }
    };

    loadSession();

    return () => {
      isMounted = false;
    };
  }, [setInitializing, setLogin, setLogout]);

  // Reconstruye el blueprint cada vez que cambia el usuario autenticado,
  // lo que actualiza los tabs visibles en la navegación
  useEffect(() => {
    if (isAuthenticated && user) {
      const blueprint = buildBlueprint(user);
      setUserType(blueprint.userType);
      setBlueprint(blueprint);
    } else {
      resetBlueprint();
    }
  }, [isAuthenticated, user, resetBlueprint, setBlueprint, setUserType]);

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);
