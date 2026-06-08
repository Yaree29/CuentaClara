import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BanknotesIcon, ChartBarIcon, UserGroupIcon } from 'react-native-heroicons/solid';
import colors from '../../../src/theme/colors';
import { servicesSummaryMock, staffMock } from '../mocks/staffMocks';

const formatMoney = (amount) => `$${amount.toFixed(2)}`;

const MetricChip = ({ icon: Icon, label, value }) => (
  <View style={styles.metricChip}>
    <View style={styles.metricIcon}>
      <Icon size={16} color={colors.primary} />
    </View>
    <View style={styles.metricContent}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  </View>
);

const StaffCommissionWidget = ({ staff = staffMock, summary = servicesSummaryMock, title = 'Resumen de comisiones', subtitle = 'Desempeño diario del personal' }) => {
  const totalServices = summary.totalServices ?? staff.reduce((total, member) => total + member.completed, 0);
  const totalCommissions = summary.totalCommissions ?? staff.reduce((total, member) => total + member.commission, 0);
  const activeStaff = summary.activeStaff ?? staff.length;

  return (
    <View style={styles.widget}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>SERVICIOS</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <MetricChip icon={ChartBarIcon} label="Servicios hoy" value={String(totalServices)} />
        <MetricChip icon={BanknotesIcon} label="Comisiones" value={formatMoney(totalCommissions)} />
        <MetricChip icon={UserGroupIcon} label="Activos" value={String(activeStaff)} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  widget: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  header: {
    marginBottom: 12,
  },
  kicker: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 3,
  },
  metricsRow: {
    gap: 10,
  },
  metricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardSecondary,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  metricContent: {
    flex: 1,
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  metricValue: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
});

export default StaffCommissionWidget;
