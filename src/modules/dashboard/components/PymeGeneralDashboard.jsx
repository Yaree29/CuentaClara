import React, { useState, useCallback }from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { BanknotesIcon, ChartBarIcon, ArrowUpIcon, ArrowDownIcon } from 'react-native-heroicons/solid';
import styles from './styles/PymeDashboards.styles';
import colors from '../../../theme/colors';
import useAuthStore from '../../../store/useAuthStore';
import useUserStore from '../../../store/useUserStore';

const PymeGeneralDashboard = () => {
  // Extraemos los datos del usuario actual desde Zustand
  const user = useAuthStore((state) => state.user);
  const userName = user?.name || 'Comerciante';

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simular un refresh o aquí iría tu función para recargar datos
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >

      {/* SECCIÓN DE BIENVENIDA */}
      <View style={styles.welcomeContainer}>
              <View>
                <Text style={styles.welcomeTitle}>¡Hola, {userName}!</Text>
                <Text style={styles.welcomeSubtitle}>Tu negocio está creciendo hoy.</Text>
              </View>
            </View>

      <View style={[styles.kpiMainCard, {marginTop: 20, backgroundColor: '#F8FAFC'}]}>
        <Text style={styles.kpiLabel}>Balance General</Text>
        <Text style={styles.kpiValue}>$12,450.00</Text>
        <View style={styles.chartPlaceholder}>
          <View style={[styles.bar, {height: 40}]} />
          <View style={[styles.bar, {height: 60}]} />
          <View style={[styles.bar, {height: 30}]} />
          <View style={[styles.barActive, {height: 85, width: 25, borderRadius: 4}]} />
          <View style={[styles.bar, {height: 50}]} />
        </View>
      </View>

      <View style={styles.itemRow}>
        <View style={styles.itemInfo}>
          <ArrowUpIcon size={20} color={colors.success} />
          <Text style={[styles.itemTitle, {marginLeft: 10}]}>Ingresos</Text>
        </View>
        <Text style={[styles.itemAmount, {color: colors.success}]}>$8,200</Text>
      </View>

      <View style={styles.itemRow}>
        <View style={styles.itemInfo}>
          <ArrowDownIcon size={20} color={colors.danger} />
          <Text style={[styles.itemTitle, {marginLeft: 10}]}>Egresos</Text>
        </View>
        <Text style={[styles.itemAmount, {color: colors.danger}]}>$3,150</Text>
      </View>

      <Text style={styles.sectionTitle}>Cuentas Pendientes</Text>
      <View style={styles.itemRow}>
        <Text style={styles.itemTitle}>Roberto Lozano</Text>
        <TouchableOpacity style={{backgroundColor: colors.primary, padding: 6, borderRadius: 6}}>
          <Text style={{color: '#FFF', fontSize: 12}}>Cobrar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default PymeGeneralDashboard;