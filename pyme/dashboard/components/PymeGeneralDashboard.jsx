import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BanknotesIcon, ChartBarIcon, ArrowUpIcon, ArrowDownIcon } from 'react-native-heroicons/solid';
import colors from '../../../src/theme/colors';
import useAuthStore from '../../../src/store/useAuthStore';
import InventoryAlertWidget from '../../../widgets/inventory-alert-widget';
import StaffCommissionWidget from '../../../widgets/staff-commission-widget';
import { inventoryAlertsMock, inventorySummaryMock } from '../../inventory/mocks/inventoryMocks';
import { servicesSummaryMock, staffMock } from '../../services/mocks/staffMocks';

const MetricCard = ({ label, value, icon: Icon, tone }) => (
  <View style={styles.metricCard}>
    <View style={[styles.metricIcon, tone === 'success' && styles.metricIconSuccess, tone === 'danger' && styles.metricIconDanger]}>
      <Icon size={18} color={tone === 'success' ? colors.successDark : tone === 'danger' ? colors.danger : colors.primary} />
    </View>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

const PymeGeneralDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const userName = user?.name || 'Comerciante';

  const income = 8200;
  const expenses = 3150;
  const balance = income - expenses;

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.heroKicker}>Panel Pyme</Text>
        <Text style={styles.heroTitle}>¡Hola, {userName}!</Text>
        <Text style={styles.heroSubtitle}>Tu negocio está creciendo hoy. Revisa ventas, inventario y comisiones desde un resumen unificado.</Text>
      </View>

      <View style={styles.balanceCard}>
        <View style={styles.balanceTopRow}>
          <View>
            <Text style={styles.balanceLabel}>Balance general</Text>
            <Text style={styles.balanceValue}>$ {balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={styles.balanceIcon}>
            <BanknotesIcon size={24} color={colors.primary} />
          </View>
        </View>

        <View style={styles.chartPlaceholder}>
          <View style={[styles.bar, { height: 40 }]} />
          <View style={[styles.bar, { height: 60 }]} />
          <View style={[styles.bar, { height: 30 }]} />
          <View style={[styles.barActive, { height: 85 }]} />
          <View style={[styles.bar, { height: 50 }]} />
        </View>
      </View>

      <View style={styles.metricsRow}>
        <MetricCard label="Ingresos" value="$8,200" icon={ArrowUpIcon} tone="success" />
        <MetricCard label="Egresos" value="$3,150" icon={ArrowDownIcon} tone="danger" />
        <MetricCard label="Servicios" value={String(servicesSummaryMock.totalServices)} icon={ChartBarIcon} tone="neutral" />
      </View>

      <InventoryAlertWidget alerts={inventoryAlertsMock} title="Alertas de stock" subtitle="Control de productos críticos" />
      <StaffCommissionWidget staff={staffMock} summary={servicesSummaryMock} title="Comisiones del día" subtitle="Resumen de tu equipo" />

      <View style={styles.footerCard}>
        <Text style={styles.footerLabel}>Inventario en riesgo</Text>
        <Text style={styles.footerValue}>{inventorySummaryMock.itemsAtRisk} unidades</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  heroCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 12,
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
    color: colors.greeting,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 6,
  },
  heroSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  balanceCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  balanceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  balanceLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  balanceValue: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
  },
  balanceIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPlaceholder: {
    height: 96,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  bar: {
    width: 24,
    borderRadius: 6,
    backgroundColor: `${colors.primary}30`,
  },
  barActive: {
    width: 24,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.reportHighlight,
    marginBottom: 10,
  },
  metricIconSuccess: {
    backgroundColor: colors.successLight,
  },
  metricIconDanger: {
    backgroundColor: '#FEE2E2',
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  metricValue: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 4,
  },
  footerCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  footerLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  footerValue: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },
});

export default PymeGeneralDashboard;
