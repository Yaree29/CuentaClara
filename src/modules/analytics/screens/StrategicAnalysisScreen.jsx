// =============================================================================
// CREADO: 2026-07-19
// Propósito: Pantalla placeholder para el Análisis Estratégico, accesible
//            desde ModulesScreen. Sigue el mismo patrón que CashScreen.jsx /
//            StaffScreen.jsx, usando los tokens de colors.js.
// =============================================================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MainLayout from '../../../views/layouts/MainLayout';
import colors from '../../../theme/colors';

const StrategicAnalysisScreen = () => {
  return (
    <MainLayout>
      <View style={styles.container}>
        <Text style={styles.icon}>📊</Text>
        <Text style={styles.title}>Análisis Estratégico</Text>
        <Text style={styles.subtitle}>Próximamente</Text>
        <Text style={styles.description}>
          Aquí podrás ver indicadores clave, tendencias y proyecciones para tomar mejores decisiones de negocio.
        </Text>
      </View>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});

export default StrategicAnalysisScreen;
