import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../styles/main.styles';

const MainLayout = ({ children }) => {
  //const userType = 'informal';

  return (
    <SafeAreaView>
      <View >
        {children}
      </View>
    </SafeAreaView>
  );
};

export default MainLayout;