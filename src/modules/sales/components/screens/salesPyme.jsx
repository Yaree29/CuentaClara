import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DashboardHeader from '../../../dashboard/components/shared/DashboardHeader';
import useAssistantModeStore from '../../../../store/useAssistantModeStore';

import SalesSection from '../components/SalesSection';
import AccountingScreen from '../components/AccountingScreen';
import RegisterCount from '../components/RegisterCount';

import styles from '../styles/salesPyme.style';

// Visibilidad de pestañas por access_type del asistente activo. El dueño
// (sin asistente activo) siempre ve las 3. "Registro de Ventas" (ledger) es
// visible para todos — solo "Ventas" (crear venta) y "Cierre Diario"
// (arqueo) se restringen.
//   sales      → Ventas + Registro de Ventas (sin Cierre Diario)
//   both       → Registro de Ventas + Cierre Diario (sin Ventas: un
//                "Supervisor" no debe poder crear ventas)
const SalesPyme = () => {
  const activeAssistant = useAssistantModeStore((state) => state.activeAssistant);
  const accessType = activeAssistant?.access_type;

  const showSalesTab = !activeAssistant || accessType === 'sales';
  const showAccountingTab = !activeAssistant || accessType === 'both';

  const [activeTab, setActiveTab] = useState(showSalesTab ? 'sales' : 'registerCount');

  const renderContent = () => {
    switch (activeTab) {
      case 'accounting':
        // Tab "Cierre Diario" — arqueo de caja.
        return <RegisterCount />;
      case 'registerCount':
        // Tab "Registro de Ventas" — ledger de solo lectura.
        return <AccountingScreen />;
      case 'sales':
      default:
        // Tab "Ventas" — crear venta. Si por algún motivo activeTab quedó en
        // 'sales' sin tener acceso (no debería ocurrir, el botón ni se
        // muestra), cae al ledger en vez de exponer el flujo de venta.
        return showSalesTab ? <SalesSection /> : <AccountingScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}
    >
      <DashboardHeader title="Ventas" variant="default" />

      {/* SWITCH */}
      <View style={styles.tabContainer}>
        {showSalesTab && (
          <TouchableOpacity style={[ styles.tabButton, activeTab === 'sales' && styles.tabButtonActive,]}
            onPress={() => setActiveTab('sales')}
          >
            <Text style={[ styles.tabText, activeTab === 'sales' && styles.tabTextActive,]}>
              Ventas
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[ styles.tabButton, activeTab === 'registerCount' && styles.tabButtonActive,]}
          onPress={() => setActiveTab('registerCount')}>
          <Text style={[ styles.tabText, activeTab === 'registerCount' && styles.tabTextActive,]}>
            Registro de Ventas
          </Text>
        </TouchableOpacity>

        {showAccountingTab && (
          <TouchableOpacity
            style={[ styles.tabButton, activeTab === 'accounting' && styles.tabButtonActive,]}
            onPress={() => setActiveTab('accounting')}
          >
            <Text style={[ styles.tabText, activeTab === 'accounting' && styles.tabTextActive,]}>
              Cierre Diario
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* CONTENIDO */}
      {renderContent()}
    </SafeAreaView>
  );
};

export default SalesPyme;
