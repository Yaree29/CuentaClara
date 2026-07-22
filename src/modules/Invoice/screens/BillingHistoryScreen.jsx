import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArchiveBoxIcon, ArrowDownTrayIcon } from 'react-native-heroicons/outline';
import DashboardHeader from '../../dashboard/components/shared/DashboardHeader';
import colors from '../../../theme/colors';
import { useBillingHistory } from '../hooks/useBillingHistory';
import styles from '../styles/billingHistory.styles';

const money = (value) => `$${Number(value || 0).toFixed(2)}`;

const STATUS_LABEL = {
  paid: 'Pagada',
  pending: 'Pendiente (fiado)',
  void: 'Anulada',
};

const STATUS_STYLE = {
  paid: styles.statusPaid,
  pending: styles.statusPending,
  void: styles.statusVoid,
};

const BillingHistoryScreen = () => {
  const { invoices, loading, error, shareInvoicePdf, sharingInvoiceId } = useBillingHistory();

  const handleShare = async (invoice) => {
    try {
      await shareInvoicePdf(invoice.id, invoice.invoice_number);
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo compartir la factura.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <DashboardHeader title="Historial de facturas" variant="default" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading && <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />}

        {!loading && error && <Text style={styles.errorText}>{error}</Text>}

        {!loading && !error && invoices.length === 0 && (
          <View style={styles.emptyCard}>
            <ArchiveBoxIcon size={35} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Aún no hay comprobantes generados</Text>
            <Text style={styles.emptySubtitle}>
              Las facturas que generes desde "Generar Comprobante" aparecerán aquí.
            </Text>
          </View>
        )}

        {!loading && !error && invoices.map((invoice) => {
          const customerName = invoice.customer_id ? (invoice.customer_name || 'Cliente') : 'Consumidor final';
          const canShare = !!invoice.invoice_number;
          const isSharing = sharingInvoiceId === invoice.id;

          return (
            <View key={invoice.id} style={styles.invoiceCard}>
              <View style={styles.invoiceMain}>
                <View style={styles.invoiceTopRow}>
                  <Text style={styles.invoiceTotal}>{money(invoice.total)}</Text>
                  <Text style={styles.invoiceDate}>{invoice.created_at?.slice(0, 10)}</Text>
                </View>
                <Text style={styles.invoiceCustomer} numberOfLines={1}>
                  {customerName} · {invoice.invoice_number || `Venta #${invoice.id}`}
                </Text>
                <Text style={[styles.invoiceStatus, STATUS_STYLE[invoice.status] || styles.statusVoid]}>
                  {STATUS_LABEL[invoice.status] || invoice.status}
                </Text>
              </View>

              {canShare && (
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={() => handleShare(invoice)}
                  disabled={isSharing}
                  accessibilityLabel="Descargar o compartir PDF"
                >
                  {isSharing ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <ArrowDownTrayIcon size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default BillingHistoryScreen;
