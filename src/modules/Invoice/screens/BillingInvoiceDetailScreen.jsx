import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { ShareIcon } from 'react-native-heroicons/outline';
import DashboardHeader from '../../dashboard/components/shared/DashboardHeader';
import colors from '../../../theme/colors';
import billingService from '../services/billingService';
import { downloadAndShare } from '../utils/sharePdf';
import styles from '../styles/billingInvoiceDetail.styles';

const money = (value) => `$${Number(value || 0).toFixed(2)}`;

const STATUS_LABEL = {
  paid: 'Pagada',
  pending: 'Pendiente (fiado)',
  void: 'Anulada',
};

// Detalle de una factura/venta: todos los productos vendidos + totales, con un
// botón "Compartir" arriba a la derecha que genera el PDF (funciona también para
// ventas rápidas sin numeración fiscal, rotuladas "Venta #id" en el backend) y
// abre la hoja nativa de compartir.
const BillingInvoiceDetailScreen = () => {
  const route = useRoute();
  const invoiceId = route.params?.invoiceId;

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await billingService.getInvoiceDetail(invoiceId);
        if (active) setInvoice(data);
      } catch (e) {
        if (active) setError(e.message || 'No se pudo cargar la factura.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [invoiceId]);

  const handleShare = useCallback(async () => {
    if (sharing || !invoiceId) return;
    setSharing(true);
    try {
      const { url } = await billingService.getInvoicePdfUrl(invoiceId);
      const label = invoice?.invoice_number || `Venta ${invoiceId}`;
      await downloadAndShare(url, `${label}.pdf`, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartir factura',
      });
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo compartir la factura.');
    } finally {
      setSharing(false);
    }
  }, [sharing, invoiceId, invoice]);

  const items = invoice?.invoice_items || [];
  const customerName = invoice?.customer_id ? 'Cliente' : 'Consumidor final';
  const subtotal = items.reduce((sum, it) => sum + (Number(it.subtotal) || 0), 0);

  const shareAction = (
    <TouchableOpacity
      style={styles.headerShareButton}
      onPress={handleShare}
      disabled={sharing || loading || !!error}
      accessibilityLabel="Compartir factura"
    >
      {sharing ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <ShareIcon size={20} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <DashboardHeader title="Detalle de venta" rightActions={shareAction} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryTotal}>{money(invoice.total)}</Text>

            <View style={styles.summaryMetaRow}>
              <View>
                <Text style={styles.summaryMeta}>{customerName}</Text>
                <Text style={styles.summaryMetaMuted}>
                  {invoice.invoice_number || `Venta #${invoice.id}`}
                </Text>
              </View>
              <View>
                <Text style={styles.summaryMeta}>{invoice.created_at?.slice(0, 10)}</Text>
                <Text style={styles.summaryMetaMuted}>{invoice.created_at?.slice(11, 16)}</Text>
              </View>
            </View>

            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>
                {STATUS_LABEL[invoice.status] || invoice.status}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Productos ({items.length})</Text>
          <View style={styles.itemsCard}>
            {items.length === 0 ? (
              <Text style={[styles.itemMeta, { paddingVertical: 12 }]}>
                Esta venta no tiene productos registrados.
              </Text>
            ) : (
              items.map((item, index) => (
                <View
                  key={item.id ?? index}
                  style={[styles.itemRow, index === items.length - 1 && styles.itemRowLast]}
                >
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>
                      {item.products?.name || `Producto #${item.product_id}`}
                    </Text>
                    <Text style={styles.itemMeta}>
                      {Number(item.quantity)} × {money(item.unit_price)}
                    </Text>
                  </View>
                  <Text style={styles.itemSubtotal}>{money(item.subtotal)}</Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.totalsCard}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>{money(subtotal)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Impuesto</Text>
              <Text style={styles.totalsValue}>{money(invoice.tax)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsGrandLabel}>Total</Text>
              <Text style={styles.totalsGrandValue}>{money(invoice.total)}</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default BillingInvoiceDetailScreen;
