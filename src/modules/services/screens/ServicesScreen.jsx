import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useUserStore from '../../../store/useUserStore';
import colors from '../../../theme/colors';
import PymeServicesScreen from '../../../../pyme/services/screens/PymeServicesScreen';

const ServicesScreen = () => {
  const userType = useUserStore((state) => state.userType);

  if (userType === 'pyme') {
    return <PymeServicesScreen />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Módulo de Servicios disponible para Pyme</Text>
      <Text style={styles.subtext}>Cuando el usuario sea Pyme, esta vista mostrará personal, comisiones y servicios de hoy.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  text: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtext: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default ServicesScreen;