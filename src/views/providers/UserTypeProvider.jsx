import React, { createContext, useContext } from 'react';
import useAuthStore from '../../store/useAuthStore';

const UserTypeContext = createContext({});

export const UserTypeProvider = ({ children }) => {
  const user = useAuthStore((state) => state.user);

  const userType = user?.userType || 'informal';
  const businessData = user?.business || null;

  const value = {
    userType,
    businessData,
    isPyme: userType === 'pyme',
    isInformal: userType === 'informal',
  };

  return (
    <UserTypeContext.Provider value={value}>
      {children}
    </UserTypeContext.Provider>
  );
};

export const useUserType = () => useContext(UserTypeContext);