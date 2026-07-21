import React from 'react';
import { View, Text } from 'react-native';
import { MegaphoneIcon } from 'react-native-heroicons/solid';
import { mapLowStockAlert } from '../utils/inventoryAlerts';
import styles, { ALERT_STYLES } from '../styles/inventoryAlertWidget.styles';

/**
 * @typedef {Object} LowStockAlert
 * @property {number} product_id
 * @property {string} product_name
 * @property {string} sku
 * @property {number} current_stock
 * @property {number} min_stock
 * @property {number} deficit
 */

const InventoryAlertWidget = ({ alerts = [], title = 'Alertas de inventario', subtitle = 'Productos con stock bajo' }) => {
  const displayAlerts = alerts.map(mapLowStockAlert);

  return (
    <View style={styles.widget}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>PYME</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.totalPill}>
          <Text style={styles.totalPillText}>{displayAlerts.length}</Text>
        </View>
      </View>

      {displayAlerts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay productos con stock bajo por ahora.</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {displayAlerts.map((alert) => {
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
                    {alert.remaining}{alert.unit ? ` ${alert.unit}` : ''}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default InventoryAlertWidget;
