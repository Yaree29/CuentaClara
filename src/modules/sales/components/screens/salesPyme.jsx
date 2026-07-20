import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DashboardHeader from '../../../dashboard/components/shared/DashboardHeader';

import SalesSection from '../components/SalesSection';
import AccountingScreen from '../components/AccountingScreen';
import RegisterCount from '../components/RegisterCount';

import styles from '../styles/salesPyme.style';

const SalesPyme = () => {
  const [activeTab, setActiveTab] = useState('sales');

  const renderContent = () => {
    switch (activeTab) {
      case 'accounting':
        return <RegisterCount />;
      case 'registerCount':
        return <SalesSection />;
      case 'sales':
      default:
        return <AccountingScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}
    >
      <DashboardHeader title="Ventas" variant="default" />

      {/* SWITCH */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[ styles.tabButton, activeTab === 'sales' && styles.tabButtonActive,]}
          onPress={() => setActiveTab('sales')}
        >
          <Text style={[ styles.tabText, activeTab === 'sales' && styles.tabTextActive,]}>
            Ventas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[ styles.tabButton, activeTab === 'registerCount' && styles.tabButtonActive,]}
          onPress={() => setActiveTab('registerCount')}>
          <Text style={[ styles.tabText, activeTab === 'registerCount' && styles.tabTextActive,]}>
            Registro de Ventas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[ styles.tabButton, activeTab === 'accounting' && styles.tabButtonActive,]}
          onPress={() => setActiveTab('accounting')}
        >
          <Text style={[ styles.tabText, activeTab === 'accounting' && styles.tabTextActive,]}>
            Cierre Diario
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTENIDO */}
      {renderContent()}
    </SafeAreaView>
  );
};

export default SalesPyme;