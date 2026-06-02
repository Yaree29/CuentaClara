import React, { useState }from 'react';
import { View, Text, ScrollView } from 'react-native';
import { ShoppingCartIcon, CalendarIcon, ShieldExclamationIcon } from 'react-native-heroicons/solid';
import styles from './styles/PymeDashboards.styles';
import colors from '../../../theme/colors';
import useAuthStore from '../../../store/useAuthStore';
import useUserStore from '../../../store/useUserStore';

const PymeFoodDashboard = () => {
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
      
      <View style={[styles.kpiMainCard, {marginTop: 20}]}>
        <Text style={styles.kpiLabel}>Ventas Acumuladas</Text>
        <Text style={[styles.kpiValue, {color: colors.success}]}>$845.20</Text>
        <Text style={styles.kpiSubtext}>112 artículos vendidos hoy</Text>
      </View>

      {/* Alerta Crítica (Caducidad) */}
      <Text style={styles.sectionTitle}>Control de Calidad</Text>
      <View style={styles.alertBanner}>
        <ShieldExclamationIcon size={20} color={colors.danger} />
        <Text style={styles.alertText}>3 lotes próximos a vencer</Text>
      </View>

      {/* Lista de productos perecederos */}
      <View style={styles.itemRow}>
        <View style={styles.itemInfo}>
          <View style={[styles.iconCircle, {backgroundColor: '#FEE2E2'}]}>
            <CalendarIcon size={20} color={colors.danger} />
          </View>
          <View>
            <Text style={styles.itemTitle}>Queso Prensado Artesanal</Text>
            <Text style={[styles.itemSubtitle, {color: colors.danger}]}>Vence en 2 días</Text>
          </View>
        </View>
        <Text style={styles.itemAmount}>12 und</Text>
      </View>

      <View style={styles.itemRow}>
        <View style={styles.itemInfo}>
          <View style={[styles.iconCircle, {backgroundColor: '#FEF3C7'}]}>
            <CalendarIcon size={20} color={colors.warning} />
          </View>
          <View>
            <Text style={styles.itemTitle}>Leche Entera 1L</Text>
            <Text style={[styles.itemSubtitle, {color: colors.warning}]}>Vence en 5 días</Text>
          </View>
        </View>
        <Text style={styles.itemAmount}>24 und</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Movimientos Recientes</Text>
        <Text style={styles.viewAll}>Ver todo</Text>
      </View>

      <View style={styles.itemRow}>
        <View style={styles.itemInfo}>
          <View style={[styles.iconCircle, {backgroundColor: '#F0FDF4'}]}>
            <ShoppingCartIcon size={20} color={colors.success} />
          </View>
          <View>
            <Text style={styles.itemTitle}>Venta en mostrador</Text>
            <Text style={styles.itemSubtitle}>Hace 5 min</Text>
          </View>
        </View>
        <Text style={[styles.itemAmount, {color: colors.success}]}>+$18.50</Text>
      </View>
      
      <View style={{height: 40}} />
    </ScrollView>
  );
};

export default PymeFoodDashboard;