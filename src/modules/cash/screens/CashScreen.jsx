// =============================================================================
// CREADO: 2026-05-20
// Propósito: Pantalla placeholder para el módulo de Caja. Se muestra cuando
//            un negocio tiene el módulo "cash" activo en sus features pero
//            la funcionalidad completa aún no está implementada.
// =============================================================================
import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DashboardHeader from '../../dashboard/components/shared/DashboardHeader';
import styles from '../styles/cashScreen.styles';

const CashScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <DashboardHeader title="Caja" />

      <View style={styles.container}>
        <Text style={styles.icon}>💵</Text>
        <Text style={styles.subtitle}>Próximamente</Text>
        <Text style={styles.description}>
          Aquí podrás administrar el flujo de caja diario, cierres y arqueos.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default CashScreen;
