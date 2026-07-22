// =============================================================================
// CREADO: 2026-07-19
// Propósito: Pantalla placeholder para el Análisis Estratégico, accesible
//            desde ModulesScreen. Sigue el mismo patrón que CashScreen.jsx /
//            StaffScreen.jsx, usando los tokens de colors.js.
// =============================================================================
import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DashboardHeader from '../../dashboard/components/shared/DashboardHeader';
import styles from '../styles/strategicAnalysisScreen.styles';

const StrategicAnalysisScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <DashboardHeader title="Análisis Estratégico" />

      <View style={styles.container}>
        <Text style={styles.icon}>📊</Text>
        <Text style={styles.subtitle}>Próximamente</Text>
        <Text style={styles.description}>
          Aquí podrás ver indicadores clave, tendencias y proyecciones para tomar mejores decisiones de negocio.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default StrategicAnalysisScreen;
