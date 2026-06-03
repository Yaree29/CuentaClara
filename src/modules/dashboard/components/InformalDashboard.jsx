// =============================================================================
// CREADO: 2026-05-27
// Propósito: Resumen general del negocio (pantalla Inicio) para usuarios
//            informales. Diseño portado de la rama Fronted, conectado a la
//            API real (los servicios ya existentes en loginDr) en lugar de
//            los mocks originales.
//
// Qué muestra (siempre datos vía FastAPI):
//   · Ventas del día                       — salesService.getProfitsAndExpenses
//   · Por cobrar (fiado) + clientes        — debtService.getDebts
//   · 3 botones de acceso rápido a tabs    — useNavigation (Ventas/Fiado/Inventario)
//   · Últimas 3 actividades de inventario  — inventoryService.getMovements
//   · Alerta con productos con stock bajo  — inventoryService.lowStockAlerts
//
// Diferencia clave con main:
//   · main usaba useLowStock con consultas Supabase directas. Aquí se usa el
//     endpoint /inventory/stock/low (ya implementado en el backend).
// =============================================================================
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import colors from '../../../theme/colors';
import styles from './styles/InformalDashboard.styles';

import useAuthStore from '../../../store/useAuthStore';
import { useInformalDashboard } from '../hooks/useInformalDashboard';

const REASON_LABEL = {
  sale: 'Venta',
  purchase: 'Compra',
  waste: 'Pérdida',
  return: 'Devolución',
  manual: 'Ajuste',
};

const formatMoney = (n) => `$${(Number(n) || 0).toFixed(2)}`;

const formatTimeAgo = (iso) => {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Hace instantes';
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} d`;
};

const InformalDashboard = () => {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const userName = user?.name || 'Comerciante';

  const {
    loading,
    refreshing,
    refresh,
    todayIncome,
    totalDebt,
    debtorsCount,
    recentMovements,
    lowStockProducts,
  } = useInformalDashboard();

  const goToTab = (tabName) => {
    try {
      navigation.navigate(tabName);
    } catch (e) {
      // si el tab no está habilitado en el blueprint actual, no rompemos
      console.warn(`[Dashboard] tab "${tabName}" no disponible:`, e?.message);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[colors.primary]} tintColor={colors.primary} />
      }
    >
      {/* BIENVENIDA */}
      <View style={styles.welcomeContainer}>
        <View>
          <Text style={styles.welcomeTitle}>¡Hola, {userName}!</Text>
          <Text style={styles.welcomeSubtitle}>Tu negocio está creciendo hoy.</Text>
        </View>
      </View>

      {/* VENTAS DEL DÍA */}
      <View style={styles.mainCard}>
        <View style={styles.mainCardHeader}>
          <Text style={styles.mainCardTitle}>Ventas del Día</Text>
          {todayIncome > 0 && (
            <View style={styles.badgeSuccess}>
              <Ionicons name="trending-up" size={14} color={colors.textSuccess} />
              <Text style={styles.badgeText}>Hoy</Text>
            </View>
          )}
        </View>
        <Text style={styles.mainCardAmount}>{formatMoney(todayIncome)}</Text>
        <Text style={styles.mainCardSubtext}>Dinero total recibido en caja hoy</Text>
      </View>

      {/* GRID: POR COBRAR + CLIENTES FIADOS */}
      <View style={styles.gridContainer}>
        <View style={[styles.gridCard, { marginRight: 8 }]}>
          <View style={[styles.iconBadge, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="card" size={20} color={colors.danger} />
          </View>
          <Text style={styles.gridCardLabel}>Por Cobrar (Fiado)</Text>
          <Text style={[styles.gridCardValue, { color: colors.danger }]}>{formatMoney(totalDebt)}</Text>
        </View>

        <View style={[styles.gridCard, { marginLeft: 8 }]}>
          <View style={[styles.iconBadge, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="people" size={20} color={colors.info} />
          </View>
          <Text style={styles.gridCardLabel}>Clientes Fiados</Text>
          <Text style={styles.gridCardValue}>{debtorsCount} {debtorsCount === 1 ? 'persona' : 'personas'}</Text>
        </View>
      </View>

      {/* ACCIONES RÁPIDAS — navegan a los tabs correspondientes */}
      <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
      <View style={styles.actionsContainer}>

        <TouchableOpacity
          style={[styles.actionButton, { borderColor: colors.successDark }]}
          onPress={() => goToTab('credit')}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: colors.successBorder }]}>
            <Ionicons name="bookmark" size={22} color={colors.successDark} />
          </View>
          <Text style={styles.actionText}>Anotar Fiado</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { borderColor: colors.successDark }]}
          onPress={() => goToTab('inventory')}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: colors.successBorder }]}>
            <Ionicons name="cube" size={22} color={colors.successDark} />
          </View>
          <Text style={styles.actionText}>Nuevo Producto</Text>
        </TouchableOpacity>
      </View>

      {/* ACTIVIDADES RECIENTES — últimos movimientos de inventario */}
      <Text style={styles.sectionTitle}>Actividades Recientes</Text>
      <View style={styles.activityCard}>
        {recentMovements.length === 0 ? (
          <Text style={styles.emptyMessage}>Aún no hay movimientos registrados.</Text>
        ) : (
          recentMovements.map((mov, idx) => {
            const isIn = mov.type === 'in';
            const iconBg = isIn ? colors.successLight : '#FEE2E2';
            const iconColor = isIn ? colors.success : colors.danger;
            const iconName = isIn ? 'arrow-down-circle' : 'arrow-up-circle';
            const amountColor = isIn ? colors.textSuccess : colors.textError;
            const qty = Number(mov.quantity) || 0;
            const sign = isIn ? '+' : '-';
            return (
              <React.Fragment key={`mov-${idx}`}>
                <View style={styles.activityRow}>
                  <View style={styles.activityLeft}>
                    <View style={[styles.activityIcon, { backgroundColor: iconBg }]}>
                      <Ionicons name={iconName} size={18} color={iconColor} />
                    </View>
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityTitle} numberOfLines={1}>
                        {mov.product_name || 'Producto'}
                      </Text>
                      <Text style={styles.activityTime}>
                        {REASON_LABEL[mov.reason] || mov.reason} · {formatTimeAgo(mov.created_at)}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.activityAmount, { color: amountColor }]}>
                    {sign}{qty % 1 === 0 ? qty.toFixed(0) : qty.toFixed(2)}
                  </Text>
                </View>
                {idx < recentMovements.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            );
          })
        )}
      </View>

      {/* ALERTA DE INVENTARIO */}
      {lowStockProducts.length > 0 && (
        <View style={[styles.stockBanner, { marginTop: 20, marginBottom: 4 }]}>
          <View style={styles.stockBannerHeader}>
            <Ionicons name="alert-circle" size={20} color={colors.warning} />
            <Text style={styles.stockBannerTitle}>
              Alerta de Inventario ({lowStockProducts.length} producto{lowStockProducts.length !== 1 ? 's' : ''} bajo{lowStockProducts.length !== 1 ? 's' : ''})
            </Text>
          </View>
          <View style={styles.stockItemsContainer}>
            {lowStockProducts.map((prod, idx) => (
              <View key={`low-${prod.product_id ?? idx}`} style={styles.stockBadge}>
                <Text style={styles.stockBadgeText}>{prod.product_name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export default InformalDashboard;
