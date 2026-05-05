import React, { createContext, useContext } from 'react';
import useUserStore from '../../store/useUserStore';

const UserTypeContext = createContext({});

export const UserTypeProvider = ({ children }) => {
  const userType = useUserStore((state) => state.userType);
  const businessData = useUserStore((state) => state.businessData);

  const value = {
    userType,
    businessData,
    isPyme: userType === 'pyme',
    isInformal: userType === 'informal'
  };

  return (
    <UserTypeContext.Provider value={value}>
      {children}
    </UserTypeContext.Provider>
  );
};

export const useUserType = () => useContext(UserTypeContext);