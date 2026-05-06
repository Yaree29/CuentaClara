import React from 'react';
import useAuthStore from '../../store/useAuthStore';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

import MainStackNavigator from './MainStackNavigator';


const RootNavigator = () => {
  const { user, isBiometricVerified } = useAuthStore();

      if (!user) {
      return <AuthNavigator />;
    }



    return <MainStackNavigator />;
};

export default RootNavigator;