import React from 'react';
import { View, Text } from 'react-native';
import { BanknotesIcon, ChartBarIcon, UserGroupIcon } from 'react-native-heroicons/solid';
import colors from '../../../theme/colors';
import styles from '../styles/staffCommissionWidget.styles';

/**
 * @typedef {Object} StaffPerformance
 * @property {number} id
 * @property {string} name
 * @property {string|null} role
 * @property {number} completed - ventas registradas hoy (invoices_count)
 * @property {number} income
 * @property {null} commission - no existe en el schema todavía
 */

const formatMoney = (amount) => `$${Number(amount || 0).toFixed(2)}`;

const MetricChip = ({ icon: Icon, label, value, muted }) => (
  <View style={styles.metricChip}>
    <View style={styles.metricIcon}>
      <Icon size={16} color={colors.primary} />
    </View>
    <View style={styles.metricContent}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={muted ? styles.metricValueMuted : styles.metricValue}>{value}</Text>
    </View>
  </View>
);

const StaffCommissionWidget = ({ summary, title = 'Resumen de comisiones', subtitle = 'Desempeño diario del personal' }) => {
  const totalServices = summary?.totalServices ?? 0;
  const totalIncome = summary?.totalIncome ?? 0;
  const activeStaff = summary?.activeStaff ?? 0;

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
        <MetricChip icon={ChartBarIcon} label="Ventas hoy" value={String(totalServices)} />
        <MetricChip icon={BanknotesIcon} label="Ingresos hoy" value={formatMoney(totalIncome)} />
        <MetricChip icon={UserGroupIcon} label="Activos" value={String(activeStaff)} />
        {/* Comisiones: no existe tabla/columna de comisión en el schema todavía
            (ver auditoría) — se muestra explícitamente sin inventar el dato. */}
        <MetricChip icon={BanknotesIcon} label="Comisiones" value="No configurado" muted />
      </View>
    </View>
  );
};

export default StaffCommissionWidget;
