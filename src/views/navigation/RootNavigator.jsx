import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import useAuthStore from '../../store/useAuthStore';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

import MainStackNavigator from './MainStackNavigator';


const RootNavigator = () => {
  const { user, isAuthenticated, isInitializing } = useAuthStore();

  if (isInitializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!isAuthenticated && !user) {
    return <AuthNavigator />;
  }

    return <MainStackNavigator />;
};

export default RootNavigator;
