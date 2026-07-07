import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../../theme/colors';

const ServicesScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Módulo de Servicios (En construcción)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  text: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ServicesScreen;