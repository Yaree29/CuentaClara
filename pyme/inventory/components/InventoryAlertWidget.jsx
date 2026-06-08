import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MegaphoneIcon } from 'react-native-heroicons/solid';
import colors from '../../../src/theme/colors';
import { inventoryAlertsMock } from '../mocks/inventoryMocks';

const ALERT_STYLES = {
  danger: {
    container: '#FEF2F2',
    border: '#FECACA',
    title: '#991B1B',
    accent: colors.danger,
  },
  warning: {
    container: '#FFFBEB',
    border: '#FDE68A',
    title: '#92400E',
    accent: colors.warning,
  },
};

const InventoryAlertWidget = ({ alerts = inventoryAlertsMock, title = 'Alertas de inventario', subtitle = 'Productos con stock bajo' }) => {
  return (
    <View style={styles.widget}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>PYME</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.totalPill}>
          <Text style={styles.totalPillText}>{alerts.length}</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {alerts.map((alert) => {
          const levelStyles = ALERT_STYLES[alert.level] || ALERT_STYLES.warning;

          return (
            <View key={alert.id} style={[styles.card, { backgroundColor: levelStyles.container, borderColor: levelStyles.border }]}>
              <View style={styles.cardTopRow}>
                <View style={[styles.iconCircle, { backgroundColor: `${levelStyles.accent}15` }]}>
                  <MegaphoneIcon size={18} color={levelStyles.accent} />
                </View>
                <View style={styles.badge}>
                  <Text style={[styles.badgeText, { color: levelStyles.title }]}>{alert.level === 'danger' ? 'Crítico' : 'Atención'}</Text>
                </View>
              </View>

              <Text style={[styles.message, { color: levelStyles.title }]}>{alert.message}</Text>
              <Text style={styles.productName}>{alert.productName}</Text>

              <View style={styles.cardFooter}>
                <Text style={styles.remainingLabel}>Restan</Text>
                <Text style={[styles.remainingValue, { color: levelStyles.accent }]}>
                  {alert.remaining} {alert.unit}
                </Text>
              </View>
            </View>
          );
        })}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
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
  totalPill: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  totalPillText: {
    color: colors.textWhite,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    flexGrow: 1,
    flexBasis: '100%',
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  message: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  productName: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  cardFooter: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  remainingLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  remainingValue: {
    fontSize: 16,
    fontWeight: '800',
  },
});

export default InventoryAlertWidget;
