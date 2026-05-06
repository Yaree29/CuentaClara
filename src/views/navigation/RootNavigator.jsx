import React from 'react';
import useAuthStore from '../../store/useAuthStore';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import BiometricLockScreen from '../../modules/auth/screens/BiometricLockScreen';
import MainStackNavigator from './MainStackNavigator';


const RootNavigator = () => {
  const { user, isBiometricVerified } = useAuthStore();

      if (!user) {
      return <AuthNavigator />;
    }

    if (!isBiometricVerified) {
      return <BiometricLockScreen />;
    }

    return <MainStackNavigator />;
};

export default RootNavigator;