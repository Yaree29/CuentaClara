import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DashboardHeader from '../../dashboard/components/shared/DashboardHeader';
import BillingHistoryScreen from './BillingHistoryScreen';
import BillingInsightsScreen from './BillingInsightsScreen';
import styles from '../styles/billing.styles';

// =============================================================================
// MiRUC — pantalla única con 2 subpestañas (mismo patrón que salesPyme.jsx).
// -----------------------------------------------------------------------------
// Antes era un hub con dos botones apilados que navegaban a pantallas
// separadas, dejando mucho espacio vacío. Ahora "Historial de facturas"
// (activa por defecto) y "Ganancias" viven aquí como subpestañas embebidas
// (embedded), llenando la pantalla sin espacio muerto. El detalle de una venta
// (BillingInvoiceDetailScreen) sigue siendo un screen aparte navegable desde
// las filas del historial.
// =============================================================================
const BillingScreen = () => {
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'insights'

  return (
    <SafeAreaView style={styles.hubScreen} edges={['top']}>
      <DashboardHeader title="MiRUC" />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            Historial
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'insights' && styles.tabButtonActive]}
          onPress={() => setActiveTab('insights')}
        >
          <Text style={[styles.tabText, activeTab === 'insights' && styles.tabTextActive]}>
            Ganancias
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'history'
        ? <BillingHistoryScreen embedded />
        : <BillingInsightsScreen embedded />}
    </SafeAreaView>
  );
};

export default BillingScreen;
