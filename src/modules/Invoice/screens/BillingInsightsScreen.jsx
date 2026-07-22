import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, InformationCircleIcon } from 'react-native-heroicons/outline';
import DashboardHeader from '../../dashboard/components/shared/DashboardHeader';
import colors from '../../../theme/colors';
import { useBillingInsights } from '../hooks/useBillingInsights';
import styles from '../styles/billingInsights.styles';

const money = (value) => `$${Number(value || 0).toFixed(2)}`;
const NO_DISPONIBLE = 'No disponible';

const RANGE_OPTIONS = [
  { label: '7 días', days: 7 },
  { label: '30 días', days: 30 },
  { label: '90 días', days: 90 },
];

// Ícono/color sutil según el margen — sin alarmar por "No disponible" (es una
// limitación de datos por cost_price sin configurar, no un error del usuario).
const MarginValue = ({ hasMissingCost, margin }) => {
  if (hasMissingCost) {
    return (
      <View style={styles.rowValueGroup}>
        <InformationCircleIcon size={14} color={colors.textMuted} />
        <Text style={styles.rowValueMuted}>{NO_DISPONIBLE}</Text>
      </View>
    );
  }

  const isNegative = Number(margin) < 0;
  return (
    <View style={styles.rowValueGroup}>
      {isNegative ? (
        <ArrowTrendingDownIcon size={14} color={colors.danger} />
      ) : (
        <ArrowTrendingUpIcon size={14} color={colors.success} />
      )}
      <Text style={isNegative ? styles.rowValueNegative : styles.rowValuePositive}>{money(margin)}</Text>
    </View>
  );
};

const BillingInsightsScreen = () => {
  const { data, loading, error, rangeDays, setRangeDays } = useBillingInsights(30);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <DashboardHeader title="Ganancias y Márgenes" variant="default" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.segmented}>
          {RANGE_OPTIONS.map((option) => {
            const active = rangeDays === option.days;
            return (
              <TouchableOpacity
                key={option.days}
                style={[styles.segmentButton, active && styles.segmentButtonActive]}
                onPress={() => setRangeDays(option.days)}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{option.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {loading && <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />}

        {!loading && error && <Text style={styles.errorText}>{error}</Text>}

        {!loading && !error && data && (
          <>
            {/* Hero — mismo lenguaje visual que "Ventas del Día" del Dashboard PYME */}
            <View style={styles.heroCard}>
              <Text style={styles.heroTitle}>Margen del período</Text>
              <Text style={styles.heroAmount}>{money(data.total_margin)}</Text>
              <Text style={styles.heroSubtext}>Últimos {rangeDays} días</Text>

              <View style={styles.heroRevenueRow}>
                <Text style={styles.heroRevenueLabel}>Ingresos totales</Text>
                <Text style={styles.heroRevenueValue}>{money(data.total_revenue)}</Text>
              </View>
            </View>

            {data.has_missing_cost && (
              <Text style={styles.gapNotice}>
                Este margen es parcial: hay productos sin costo (cost_price) configurado en Inventario,
                así que sus ventas no se incluyen en el cálculo.
              </Text>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Productos vendidos</Text>
              <Text style={styles.sectionSubtitle}>Cantidad, ingresos y margen por producto en el período.</Text>

              {data.products.length === 0 ? (
                <Text style={styles.emptyText}>No hay ventas en este período.</Text>
              ) : (
                data.products.map((product, index) => (
                  <View
                    key={product.product_id}
                    style={[styles.row, index === data.products.length - 1 && styles.rowLast]}
                  >
                    <View style={styles.rowLeft}>
                      <Text style={styles.rowName}>{product.product_name}</Text>
                      <Text style={styles.rowMeta}>
                        {product.quantity_sold} vendidos · {money(product.revenue)}
                      </Text>
                    </View>
                    <MarginValue hasMissingCost={product.has_missing_cost} margin={product.margin} />
                  </View>
                ))
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Margen por factura</Text>

              {data.invoices.length === 0 ? (
                <Text style={styles.emptyText}>No hay facturas en este período.</Text>
              ) : (
                data.invoices.map((invoice, index) => (
                  <View
                    key={invoice.invoice_id}
                    style={[styles.row, index === data.invoices.length - 1 && styles.rowLast]}
                  >
                    <View style={styles.rowLeft}>
                      <Text style={styles.rowName}>{invoice.invoice_number || `Venta #${invoice.invoice_id}`}</Text>
                      <Text style={styles.rowMeta}>
                        {invoice.created_at?.slice(0, 10)} · {money(invoice.total)}
                      </Text>
                    </View>
                    <MarginValue hasMissingCost={invoice.has_missing_cost} margin={invoice.margin} />
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default BillingInsightsScreen;
