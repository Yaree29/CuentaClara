import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DashboardHeader from '../../../src/modules/dashboard/components/shared/DashboardHeader';
import colors from '../../../src/theme/colors';
import StaffCommissionWidget from '../../../widgets/staff-commission-widget';
import StaffList from '../components/StaffList';
import { servicesSummaryMock, staffMock } from '../mocks/staffMocks';

const PymeServicesScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <DashboardHeader title="Servicios Pyme" isHome={false} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroKicker}>Comisiones y desempeño</Text>
          <Text style={styles.heroTitle}>Visualiza el avance diario de tu equipo.</Text>
          <Text style={styles.heroSubtitle}>Usa datos mock para mostrar la lista de personal, servicios realizados y comisiones acumuladas.</Text>
        </View>

        <StaffCommissionWidget staff={staffMock} summary={servicesSummaryMock} />
        <StaffList staff={staffMock} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  hero: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  heroKicker: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 6,
    lineHeight: 26,
  },
  heroSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 8,
    lineHeight: 19,
  },
});

export default PymeServicesScreen;
