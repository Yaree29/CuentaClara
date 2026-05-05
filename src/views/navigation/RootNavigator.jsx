import React from 'react';
import useAuthStore from '../../store/useAuthStore';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const RootNavigator = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
};

export default RootNavigator;