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
// =============================================================================
import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import colors from '../../../theme/colors';
import styles from './styles/InformalDashboard.styles';

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

const InformalDashboard = ({ onTodayIncomeChange } = {}) => {
  const navigation = useNavigation();

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

  // Reporta el ingreso del día hacia arriba (HomeScreen.jsx) — ahí lo usa el
  // saludo de DashboardHeader.jsx (showGreeting), que vive fuera de este
  // ScrollView.
  useEffect(() => {
    onTodayIncomeChange?.(todayIncome);
  }, [todayIncome, onTodayIncomeChange]);

  const goToTab = (tabName, params) => {
    try {
      navigation.navigate(tabName, params);
    } catch (e) {
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
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[colors.primary]} tintColor={colors.primary} />
      }
    >
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

      {/* TARJETA UNIFICADA DE FIADOS */}
      <View style={styles.debtUnifiedCard}>
        <View style={styles.debtUnifiedLeft}>
          <Text style={styles.debtUnifiedLabel}>Por Cobrar (Fiado)</Text>
          <Text style={styles.debtUnifiedAmount}>{formatMoney(totalDebt)}</Text>
        </View>
        <View style={styles.debtUnifiedRight}>
          <Ionicons name="people" size={20} color={colors.info} style={styles.debtUnifiedIcon} />
          <Text style={styles.debtUnifiedText}>
            Clientes fiados: {debtorsCount} {debtorsCount === 1 ? 'persona' : 'personas'}
          </Text>
        </View>
      </View>

      {/* ACCIONES RÁPIDAS
          Los shortcuts no solo navegan al tab: además disparan el pop-up de
          la acción concreta para ahorrarle al comerciante un par de taps.
          Los params (openFiado / openAddProduct) son consumidos y limpiados
          por las pantallas destino (ver salesInformal.jsx / InformalInventory.jsx). */}
      <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity
          style={styles.quickActionButtonLeft}
          onPress={() => goToTab('sales', { openFiado: true })}
        >
          <View style={styles.quickActionIconContainerLeft}>
            <Ionicons name="people-outline" size={24} color={colors.info} />
          </View>
          <Text style={styles.quickActionTitleLeft}>Anotar Fiado</Text>
          <Text style={styles.quickActionSubtitle}>Anota a quién le fiaste</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButtonRight}
          onPress={() => goToTab('inventory', { openAddProduct: true })}
        >
          <View style={styles.quickActionIconContainerRight}>
            <Ionicons name="cube-outline" size={24} color={colors.success} />
          </View>
          <Text style={styles.quickActionTitleRight}>Nuevo Producto</Text>
          <Text style={styles.quickActionSubtitle}>Registra y pon precios</Text>
        </TouchableOpacity>
      </View>

      {/* ACTIVIDADES RECIENTES*/}
      <Text style={styles.sectionTitle}>Actividades Recientes</Text>
      <View style={styles.activityCard}>
        {recentMovements.length === 0 ? (
          <Text style={styles.emptyMessage}>Aún no hay movimientos registrados.</Text>
        ) : (
          recentMovements.map((mov, idx) => {
            const isSale = mov.type === 'sale' || mov.reason === 'sale';
            const isPurchase = mov.type === 'purchase' || mov.reason === 'purchase';

            let iconName = 'cube';
            let iconColor = colors.info;
            let iconContainerStyle = styles.activityIconStock;
            let amountStyle = styles.activityAmountStock;
            let amountStr = '';

            const qty = Number(mov.quantity) || 0;
            const price = Number(mov.product_price) || 0;

            if (isSale) {
              iconName = 'trending-up';
              iconColor = colors.success;
              iconContainerStyle = styles.activityIconSale;
              amountStyle = styles.activityAmountSale;
              amountStr = `+${formatMoney(qty * price)}`;
            } else if (isPurchase) {
              iconName = 'arrow-down-circle';
              iconColor = colors.danger;
              iconContainerStyle = styles.activityIconPurchase;
              amountStyle = styles.activityAmountPurchase;
              amountStr = `-${formatMoney(qty * price)}`;
            } else {
              // Ajuste de Inventario Puro
              iconName = 'cube';
              iconColor = colors.info;
              iconContainerStyle = styles.activityIconStock;
              amountStyle = styles.activityAmountStock;
              const isNegative = mov.type === 'out' || mov.type === 'loss' || mov.reason === 'waste';
              amountStr = `${isNegative ? '-' : '+'}${qty % 1 === 0 ? qty.toFixed(0) : qty.toFixed(2)} un`;
            }

            return (
              <React.Fragment key={`mov-${idx}`}>
                <View style={styles.activityRow}>
                  <View style={styles.activityLeft}>
                    <View style={iconContainerStyle}>
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
                  <Text style={amountStyle}>
                    {amountStr}
                  </Text>
                </View>
                {idx < recentMovements.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            );
          })
        )}
      </View>

      {/* STOCK DE PRODUCTOS
          Se muestra siempre (también cuando no hay nada por reponer) para que
          el usuario sepa que la app le vigila el stock, no solo cuando algo
          anda mal. */}
      <Text style={styles.sectionTitle}>Stock de Productos</Text>
      {lowStockProducts.length === 0 ? (
        <View style={styles.stockOkBanner}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={styles.stockOkText}>
            Todo en orden. Ningún producto está por agotarse.
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.stockBanner}
          onPress={() => goToTab('inventory')}
          activeOpacity={0.7}
        >
          <View style={styles.stockBannerHeader}>
            <Ionicons name="alert-circle" size={20} color={colors.warning} />
            <Text style={styles.stockBannerTitle}>
              {lowStockProducts.length} producto{lowStockProducts.length !== 1 ? 's' : ''} por reponer
            </Text>
          </View>

          {lowStockProducts.map((prod, idx) => {
            const stock = Number(prod.current_stock) || 0;
            const agotado = stock <= 0;
            const unidad = prod.unit ? ` ${prod.unit}` : '';

            return (
              <View key={`low-${prod.product_id ?? idx}`} style={styles.stockRow}>
                <Text style={styles.stockRowName} numberOfLines={1}>
                  {prod.product_name || 'Producto sin nombre'}
                </Text>
                <View style={[styles.stockBadge, agotado && styles.stockBadgeCritical]}>
                  <Text style={[styles.stockBadgeText, agotado && styles.stockBadgeTextCritical]}>
                    {agotado ? 'Agotado' : `Quedan ${stock}${unidad}`}
                  </Text>
                </View>
              </View>
            );
          })}

          <Text style={styles.stockBannerFooter}>Toca para ir a Inventario →</Text>
        </TouchableOpacity>
      )}

    </ScrollView>
  );
};

export default InformalDashboard;
