import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
} from 'react-native';
import MainLayout from '../../../layouts/MainLayout';
import useReceiptData from '../hooks/useReceiptData';
import { formatCurrency, shareReceipt } from '../services/receiptService';
import styles from '../styles/receiptStyles';

const SimpleReceiptScreen = ({ route, navigation }) => {
  const receipt = useReceiptData(route);
  const {
    invoiceNumber,
    date,
    customer,
    businessName,
    items,
    subtotal,
    tax,
    total,
    invoiceMode,
    customerRuc,
    customerDv,
    paymentMethod,
    paymentTerms,
    salesChannel,
    costCenter,
    seller,
    incomeAccount,
    notes,
  } = receipt;
  const isPymeReceipt = invoiceMode === 'pyme';

  const handleShare = async () => {
    try {
      await shareReceipt(receipt);
    } catch (_) {}
  };

  return (
    <MainLayout>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.receiptCard}>
          <View style={styles.headerSection}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoInitial}>{businessName.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.businessName}>{businessName}</Text>
            <Text style={styles.receiptBadge}>{isPymeReceipt ? 'FACTURA PYME' : 'COMPROBANTE DE VENTA'}</Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>N° Comprobante</Text>
              <Text style={styles.metaValue}>{invoiceNumber}</Text>
            </View>
            <View style={[styles.metaItem, styles.metaItemEnd]}>
              <Text style={styles.metaLabel}>Fecha</Text>
              <Text style={styles.metaValue}>{date}</Text>
            </View>
          </View>

          <View style={styles.clientSection}>
            <Text style={styles.clientLabel}>Cliente</Text>
            <Text style={styles.clientName}>{customer}</Text>
            {isPymeReceipt ? (
              <Text style={styles.clientMeta}>RUC {customerRuc}{customerDv ? ` - DV ${customerDv}` : ''}</Text>
            ) : null}
          </View>

          {isPymeReceipt ? (
            <View style={styles.pymeDetailGrid}>
              <View style={styles.pymeDetailItem}>
                <Text style={styles.pymeDetailLabel}>Metodo de pago</Text>
                <Text style={styles.pymeDetailValue}>{paymentMethod || 'No definido'}</Text>
              </View>
              <View style={styles.pymeDetailItem}>
                <Text style={styles.pymeDetailLabel}>Condicion</Text>
                <Text style={styles.pymeDetailValue}>{paymentTerms || 'No definido'}</Text>
              </View>
              <View style={styles.pymeDetailItem}>
                <Text style={styles.pymeDetailLabel}>Canal</Text>
                <Text style={styles.pymeDetailValue}>{salesChannel || 'No definido'}</Text>
              </View>
              <View style={styles.pymeDetailItem}>
                <Text style={styles.pymeDetailLabel}>Cuenta ingreso</Text>
                <Text style={styles.pymeDetailValue}>{incomeAccount || 'No definido'}</Text>
              </View>
              <View style={styles.pymeDetailItem}>
                <Text style={styles.pymeDetailLabel}>Centro costo</Text>
                <Text style={styles.pymeDetailValue}>{costCenter || 'No definido'}</Text>
              </View>
              <View style={styles.pymeDetailItem}>
                <Text style={styles.pymeDetailLabel}>Vendedor</Text>
                <Text style={styles.pymeDetailValue}>{seller || 'No definido'}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.tableHeader}>
            <Text style={[styles.colDesc, styles.tableHeaderText]}>Descripción</Text>
            <Text style={[styles.colQty, styles.tableHeaderText]}>Cant.</Text>
            <Text style={[styles.colPrice, styles.tableHeaderText]}>P.Unit</Text>
            <Text style={[styles.colSubtotal, styles.tableHeaderText]}>Total</Text>
          </View>

          {items.map((item, index) => (
            <View key={`${item.description}-${index}`} style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}>
              <View style={styles.colDesc}>
                <Text style={styles.tableCell} numberOfLines={2}>{item.description}</Text>
                {isPymeReceipt ? (
                  <Text style={styles.pymeLineMeta} numberOfLines={2}>
                    {item.category || 'Venta'}{item.sku ? ` - SKU ${item.sku}` : ''}{item.unit ? ` - ${item.unit}` : ''}
                  </Text>
                ) : null}
              </View>
              <Text style={[styles.colQty, styles.tableCell]}>{item.quantity}</Text>
              <Text style={[styles.colPrice, styles.tableCell]}>{formatCurrency(item.unitPrice)}</Text>
              <Text style={[styles.colSubtotal, styles.tableCell]}>{formatCurrency(item.subtotal)}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{isPymeReceipt ? 'Subtotal ventas' : 'Subtotal'}</Text>
              <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>ITBMS (7%)</Text>
              <Text style={styles.totalValue}>{formatCurrency(tax)}</Text>
            </View>
            <View style={styles.dividerLight} />
            <View style={styles.totalRow}>
              <Text style={styles.grandTotalLabel}>{isPymeReceipt ? 'TOTAL INGRESOS' : 'TOTAL'}</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(total)}</Text>
            </View>
          </View>

          {isPymeReceipt && notes ? (
            <View style={styles.pymeNotesBox}>
              <Text style={styles.pymeDetailLabel}>Notas comerciales</Text>
              <Text style={styles.pymeNotesText}>{notes}</Text>
            </View>
          ) : null}

          <View style={styles.receiptFooter}>
            <Text style={styles.footerText}>Gracias por su compra</Text>
            <Text style={styles.footerSub}>CuentaClara · Sistema de Gestión</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}> Compartir Comprobante</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
      </ScrollView>
    </MainLayout>
  );
};

export default SimpleReceiptScreen;
