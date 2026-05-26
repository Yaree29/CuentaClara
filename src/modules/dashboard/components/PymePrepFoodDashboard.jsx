import React, { useState }from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { FireIcon, ClockIcon, ClipboardDocumentCheckIcon, ArrowTrendingUpIcon } from 'react-native-heroicons/solid';
import styles from './styles/PymeDashboards.styles';
import colors from '../../../theme/colors';
import useAuthStore from '../../../store/useAuthStore';
import useUserStore from '../../../store/useUserStore';

const PymePrepFoodDashboard = () => {
  // Extraemos los datos del usuario actual desde Zustand
  const user = useAuthStore((state) => state.user);
  const userName = user?.name || 'Comerciante';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* SECCIÓN DE BIENVENIDA */}
      <View style={styles.welcomeContainer}>
        <View>
          <Text style={styles.welcomeTitle}>¡Hola, {userName}!</Text>
          <Text style={styles.welcomeSubtitle}>Tu negocio está creciendo hoy.</Text>
        </View>
      </View>

      {/* KPI Principal */}
      <View style={[styles.kpiMainCard, {marginTop: 20}]}>
        <Text style={styles.kpiLabel}>Pedidos del Día</Text>
        <Text style={[styles.kpiValue, {color: colors.primary}]}>48</Text>
        <Text style={styles.kpiSubtext}>Ingresos: $320.50</Text>
      </View>

      {/* Métricas Secundarias */}
      <View style={{flexDirection: 'row', gap: 12}}>
        <View style={[styles.kpiMainCard, {flex: 1, padding: 15}]}>
          <ClockIcon size={20} color={colors.warning} />
          <Text style={[styles.itemTitle, {marginTop: 8}]}>Tiempo Prom.</Text>
          <Text style={styles.itemAmount}>15 min</Text>
        </View>
        <View style={[styles.kpiMainCard, {flex: 1, padding: 15}]}>
          <ClipboardDocumentCheckIcon size={20} color={colors.success} />
          <Text style={[styles.itemTitle, {marginTop: 8}]}>Completados</Text>
          <Text style={[styles.itemAmount, {color: colors.success}]}>42</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.primaryActionBtn}>
        <FireIcon size={20} color="#FFF" />
        <Text style={styles.primaryActionBtnText}>Ver Comandas Activas</Text>
      </TouchableOpacity>

      {/* Sección Platos Top */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Platos más vendidos</Text>
      </View>

      <View style={styles.itemRow}>
        <View style={styles.itemInfo}>
          <View style={[styles.iconCircle, {backgroundColor: '#FEF3C7'}]}>
            <ArrowTrendingUpIcon size={20} color={colors.warning} />
          </View>
          <View>
            <Text style={styles.itemTitle}>Orden de Hojaldres</Text>
            <Text style={styles.itemSubtitle}>15 órdenes hoy</Text>
          </View>
        </View>
        <Text style={styles.itemAmount}>$45.00</Text>
      </View>

      <View style={styles.itemRow}>
        <View style={styles.itemInfo}>
          <View style={[styles.iconCircle, {backgroundColor: '#FEF3C7'}]}>
            <ArrowTrendingUpIcon size={20} color={colors.warning} />
          </View>
          <View>
            <Text style={styles.itemTitle}>Almuerzo: Pollo Guisado</Text>
            <Text style={styles.itemSubtitle}>12 órdenes hoy</Text>
          </View>
        </View>
        <Text style={styles.itemAmount}>$60.00</Text>
      </View>
      
      <View style={{height: 40}} />
    </ScrollView>
  );
};

export default PymePrepFoodDashboard;