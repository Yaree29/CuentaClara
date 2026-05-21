import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import useUserStore from '../../store/useUserStore';
import colors from '../styles/main.styles';

const MainLayout = ({ children }) => {
  const userType = useUserStore((state) => state.userType);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container} >
        {children}
      </View>
    </SafeAreaView>
  );
};

export default MainLayout;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
  },
});