// =============================================================================
// ServicesScreen.jsx
// -----------------------------------------------------------------------------
// Fusionado desde pymeEdgar/pyme/services/screens/PymeServicesScreen.jsx. Se
// mantiene este nombre de archivo (no PymeServicesScreen) porque ya está
// referenciado en MainStackNavigator.jsx (Stack.Screen "services") y en
// ModulesScreen.jsx (módulo condicional "services").
// =============================================================================
import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DashboardHeader from '../../dashboard/components/shared/DashboardHeader';
import colors from '../../../theme/colors';
import StaffCommissionWidget from '../components/StaffCommissionWidget';
import StaffList from '../components/StaffList';
import useStaffPerformance from '../hooks/useStaffPerformance';
import styles from '../styles/servicesScreen.styles';

const ServicesScreen = () => {
  const { staff, summary, loading } = useStaffPerformance();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <DashboardHeader title="Servicios Pyme" variant="default" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroKicker}>Comisiones y desempeño</Text>
          <Text style={styles.heroTitle}>Visualiza el avance diario de tu equipo.</Text>
          <Text style={styles.heroSubtitle}>Datos reales de tus asistentes activos y sus ventas de hoy.</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : staff.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aún no tienes asistentes activos registrados en Equipo.</Text>
          </View>
        ) : (
          <>
            <StaffCommissionWidget summary={summary} />
            <StaffList staff={staff} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ServicesScreen;
