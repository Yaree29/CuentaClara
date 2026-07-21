import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
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