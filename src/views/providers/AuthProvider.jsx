import React, { createContext, useContext, useEffect } from 'react';
import useAuthStore from '../../store/useAuthStore';
import useUserStore from '../../store/useUserStore';
import useBlueprintStore from '../../store/useBlueprintStore';
import { getBlueprintByRole } from '../../data/sessionTemporal';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const { setUserType } = useUserStore();
  const { setBlueprint, resetBlueprint } = useBlueprintStore();

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      const blueprint = getBlueprintByRole(user.role);
      setUserType(blueprint.userType);
      setBlueprint(blueprint);
    } else {
      resetBlueprint();
    }
  }, [isAuthenticated, user]);

  return (
    <AuthContext.Provider value={{}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);