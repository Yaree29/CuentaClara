import React, { createContext, useContext, useEffect } from 'react';
import useAuthStore from '../../store/useAuthStore';
import useUserStore from '../../store/useUserStore';
import useBlueprintStore from '../../store/useBlueprintStore';
import { getBlueprintByRole } from '../../data/sessionTemporal';
import authService from '../../modules/auth/services/authService';

const AuthContext = createContext({});

const buildBlueprint = (user) => {
  if (user?.enabled_modules?.length) {
    return {
      userType: user.userType || 'informal',
      config: {
        source: 'supabase',
        business: user.business,
      },
      enabled_modules: user.enabled_modules,
    };
  }

  return getBlueprintByRole(user?.role);
};

export const AuthProvider = ({ children }) => {
  const { isAuthenticated, user, setLogin, setLogout, setInitializing } =
    useAuthStore();
  const { setUserType } = useUserStore();
  const { setBlueprint, resetBlueprint } = useBlueprintStore();

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      try {
        const currentSession = await authService.getCurrentSession();

        if (!isMounted) return;

        if (currentSession?.user) {
          setLogin(
            currentSession.user,
            currentSession.token,
            currentSession.session
          );
        } else {
          setLogout();
        }
      } catch (error) {
        await authService.clearLocalSession();
        if (isMounted) {
          setLogout();
        }
      } finally {
        if (isMounted) setInitializing(false);
      }
    };

    loadSession();

    const subscription = authService.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setLogout();
        return;
      }

      if (event !== 'SIGNED_IN' && event !== 'TOKEN_REFRESHED') return;
      if (!session?.user) return;

      setTimeout(async () => {
        try {
          const sessionUser = await authService.getUserContext(session);
          setLogin(sessionUser, session.access_token, session);
        } catch (error) {
          await authService.clearLocalSession();
          setLogout();
        }
      }, 0);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [setInitializing, setLogin, setLogout]);

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
