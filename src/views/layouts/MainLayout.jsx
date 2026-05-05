import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import useUserStore from '../../store/useUserStore';
import colors from '../styles/main.styles';

const MainLayout = ({ children }) => {
  const userType = useUserStore((state) => state.userType);

  return (
    <SafeAreaView>
      <View >
        {children}
      </View>
    </SafeAreaView>
  );
};

/*
<SafeAreaView style={styles.container}>
      <View style={[
        styles.content, 
        userType === 'pyme' ? styles.pymeBg : styles.informalBg
      ]}>
        {children}
      </View>
    </SafeAreaView>
*/

export default MainLayout;