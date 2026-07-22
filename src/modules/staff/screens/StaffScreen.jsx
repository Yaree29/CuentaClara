// =============================================================================
// CREADO: 2026-05-20
// Propósito: Pantalla placeholder para el módulo de Personal. Se muestra cuando
//            un negocio tiene el módulo "staff" activo en sus features pero
//            la funcionalidad completa aún no está implementada.
// =============================================================================
import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DashboardHeader from '../../dashboard/components/shared/DashboardHeader';
import styles from '../styles/staffScreen.styles';

const StaffScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <DashboardHeader title="Personal" />

      <View style={styles.container}>
        <Text style={styles.icon}>👥</Text>
        <Text style={styles.subtitle}>Próximamente</Text>
        <Text style={styles.description}>
          Aquí podrás gestionar empleados, roles y permisos del negocio.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default StaffScreen;
