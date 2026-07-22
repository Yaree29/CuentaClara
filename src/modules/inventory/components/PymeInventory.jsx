// =============================================================================
// PymeInventory.jsx
// -----------------------------------------------------------------------------
// Fusionado desde pymeEdgar/pyme/inventory/screens/PymeInventoryScreen.jsx.
// Se mantiene este nombre de archivo (no PymeInventoryScreen) porque ya está
// referenciado en MainNavigator.jsx (tab "assistantInventory" del Modo
// Asistente) y en ModulesScreen.jsx (navigation.navigate('PymeInventory')).
// =============================================================================
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import DashboardHeader from '../../dashboard/components/shared/DashboardHeader';
import colors from '../../../theme/colors';
import InventoryAlertWidget from './InventoryAlertWidget';
import ProductScannerWidget from './ProductScannerWidget';
import inventoryService from '../services/inventoryService';
import useInventoryConfig, { FLAG_LABELS } from '../hooks/useInventoryConfig';
import styles from '../styles/pymeInventory.styles';

// Flags con placeholder visual genérico (todavía sin funcionalidad propia).
// "escaner" no está acá porque ya tiene un widget real: ProductScannerWidget.
const PLACEHOLDER_FLAGS = ['control_peso', 'caducidad', 'mermas', 'recetas', 'produccion', 'stock_predictivo'];

const ConfigFlagPlaceholder = ({ flag }) => (
  <View style={styles.flagCard}>
    <Text style={styles.flagCardTitle}>{FLAG_LABELS[flag].label}</Text>
    <Text style={styles.flagCardDescription}>{FLAG_LABELS[flag].description}</Text>
  </View>
);

const PymeInventory = () => {
  const { config, loading: loadingConfig } = useInventoryConfig();
  const activePlaceholderFlags = PLACEHOLDER_FLAGS.filter((flag) => config[flag]);

  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await inventoryService.lowStockAlerts();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (error) {
      setAlerts([]);
    } finally {
      setLoadingAlerts(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAlerts();
    }, [fetchAlerts])
  );

  const totalAlerts = alerts.length;
  // Déficit crítico: sin stock disponible (current_stock === 0).
  const itemsAtRisk = alerts.filter((alert) => alert.current_stock === 0).length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <DashboardHeader title="Inventario Pyme" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroKicker}>Control de stock</Text>
          <Text style={styles.heroTitle}>Monitorea tus productos críticos en tiempo real.</Text>
          <Text style={styles.heroSubtitle}>Alertas y catálogo conectados a tu inventario real del negocio.</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Alertas activas</Text>
            <Text style={styles.summaryValue}>{totalAlerts}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>En riesgo</Text>
            <Text style={styles.summaryValue}>{itemsAtRisk}</Text>
          </View>
        </View>

        {loadingAlerts ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <InventoryAlertWidget alerts={alerts} />
        )}

        {loadingConfig ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <>
            {config.escaner && <ProductScannerWidget />}

            {activePlaceholderFlags.length > 0 && (
              <View style={styles.flagsSection}>
                <Text style={styles.flagsSectionTitle}>Configuraciones activas</Text>
                {activePlaceholderFlags.map((flag) => (
                  <ConfigFlagPlaceholder key={flag} flag={flag} />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PymeInventory;
