import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DashboardHeader from '../../../src/modules/dashboard/components/shared/DashboardHeader';
import colors from '../../../src/theme/colors';
import InventoryAlertWidget from '../../../widgets/inventory-alert-widget';
import ProductScannerWidget from '../../../widgets/scanner-widget';
import { inventorySummaryMock } from '../mocks/inventoryMocks';

const PymeInventoryScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <DashboardHeader title="Inventario Pyme" isHome={false} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroKicker}>Control de stock</Text>
          <Text style={styles.heroTitle}>Monitorea tus productos críticos en tiempo real.</Text>
          <Text style={styles.heroSubtitle}>Las alertas se alimentan de datos mock y dejan lista la integración posterior con inventario real.</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Alertas activas</Text>
            <Text style={styles.summaryValue}>{inventorySummaryMock.totalAlerts}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>En riesgo</Text>
            <Text style={styles.summaryValue}>{inventorySummaryMock.itemsAtRisk}</Text>
          </View>
        </View>

        <InventoryAlertWidget />
        <ProductScannerWidget />
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
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  summaryValue: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 6,
  },
});

export default PymeInventoryScreen;
