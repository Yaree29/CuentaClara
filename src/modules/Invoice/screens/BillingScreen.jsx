import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  DocumentPlusIcon,
  ClockIcon,
  ChartBarIcon,
  InformationCircleIcon,
} from 'react-native-heroicons/outline';
import DashboardHeader from '../../dashboard/components/shared/DashboardHeader';
import { useBilling } from '../hooks/useBilling';
import styles from '../styles/billing.styles';
import colors from '../../../theme/colors';

// =============================================================================
// InvoiceFormModal — el formulario de "Generar Comprobante" que antes ERA
// BillingScreen completo. Se movió a un modal para que el tab MiRUC sea un
// punto de entrada simple (CTA + accesos secundarios), no un formulario largo
// por defecto. Mismo patrón visual que el comprobante de venta de Informal
// (salesInformal.jsx: Modal transparent + animationType="fade", tarjeta
// centrada con esquinas redondeadas) — no el modal de pantalla completa de
// RecipeFormModal.
// =============================================================================
const InvoiceFormModal = ({ visible, onClose }) => {
  const [items, setItems] = useState([{ id: 1, desc: '', price: '', quantity: '1', productId: null }]);
  const [customerId, setCustomerId] = useState(null);
  const [customerPicked, setCustomerPicked] = useState(false);
  const [showCustomers, setShowCustomers] = useState(false);
  const [newCustomerMode, setNewCustomerMode] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [creatingCustomer, setCreatingCustomer] = useState(false);

  const {
    createInvoice, sendInvoiceByWhatsApp, loading, inventory, inventoryLoading, inventoryError, refreshInventory,
    customers, customersLoading, customersError, createCustomer,
  } = useBilling();

  const selectedCustomer = customers.find((c) => c.id === customerId) || null;

  const resetForm = () => {
    setCustomerId(null);
    setCustomerPicked(false);
    setShowCustomers(false);
    setNewCustomerMode(false);
    setItems([{ id: 1, desc: '', price: '', quantity: '1', productId: null }]);
  };

  const pickCustomer = (id) => {
    setCustomerId(id);
    setCustomerPicked(true);
    setShowCustomers(false);
    setNewCustomerMode(false);
  };

  const handleCreateCustomer = async () => {
    if (!newCustomerName.trim()) {
      Alert.alert('Nombre requerido', 'Ingresa el nombre del cliente.');
      return;
    }
    setCreatingCustomer(true);
    try {
      const customer = await createCustomer({ name: newCustomerName, phone: newCustomerPhone });
      pickCustomer(customer.id);
      setNewCustomerName('');
      setNewCustomerPhone('');
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo crear el cliente.');
    } finally {
      setCreatingCustomer(false);
    }
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), desc: '', price: '', quantity: '1', productId: null }]);
  };

  const removeItem = (id) => {
    if (items.length === 1) return;

    setItems(items.filter((item) => item.id !== id));
  };

  const handleGenerate = async () => {
    if (!customerPicked || items.some((i) => !i.desc || !i.price || !i.quantity)) {
      Alert.alert("Campos incompletos", "Por favor selecciona un cliente y al menos un producto.");
      return;
    }

    try {
      const result = await createInvoice(customerId, items);
      const phone = selectedCustomer?.phone || null;

      Alert.alert(
        "Factura Generada",
        `Número: ${result.invoiceNumber}\nFecha: ${result.date}`,
        [
          { text: "Cerrar", style: "cancel" },
          {
            text: "Enviar por WhatsApp",
            onPress: async () => {
              try {
                await sendInvoiceByWhatsApp(result.invoiceId, result.invoiceNumber, phone);
              } catch (waError) {
                Alert.alert("Error", waError.message || "No se pudo enviar la factura por WhatsApp.");
              }
            },
          },
        ]
      );

      resetForm();
    } catch (error) {
      Alert.alert("Error", error.message || "No se pudo procesar la factura.");
    }
  };

  const addProductToItems = (product) => {
    const emptyIndex = items.findIndex((item) => !item.desc && !item.price);
    const newItem = {
      id: Date.now(),
      desc: product.name,
      price: String(product.price ?? ''),
      quantity: '1',
      productId: product.id,
    };

    if (emptyIndex >= 0) {
      const newItems = [...items];
      newItems[emptyIndex] = { ...newItems[emptyIndex], ...newItem };
      setItems(newItems);
      return;
    }

    setItems([...items, newItem]);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalHeaderTitle}>Nueva Factura</Text>
          <TouchableOpacity style={styles.modalCloseIcon} onPress={onClose}>
            <Text style={styles.modalCloseIconText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>
          <View style={styles.section}>
            <View style={styles.rowHeader}>
              <Text style={styles.label}>Datos del Cliente</Text>
              <TouchableOpacity onPress={() => setShowCustomers(!showCustomers)}>
                <Text style={styles.addText}>{showCustomers ? 'Cerrar' : 'Cambiar'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.input} onPress={() => setShowCustomers(!showCustomers)}>
              <Text style={{ color: customerPicked ? colors.textPrimary : colors.textMuted }}>
                {customerPicked
                  ? (selectedCustomer ? selectedCustomer.name : 'Consumidor final')
                  : 'Seleccionar cliente'}
              </Text>
            </TouchableOpacity>

            {showCustomers && (
              <View style={[styles.inventoryList, { marginTop: 8 }]}>
                {customersLoading && (
                  <ActivityIndicator color={colors.primary} style={styles.inlineLoader} />
                )}

                {!customersLoading && customersError && (
                  <Text style={styles.errorText}>{customersError}</Text>
                )}

                {!customersLoading && (
                  <>
                    <TouchableOpacity style={styles.inventoryItem} onPress={() => pickCustomer(null)}>
                      <Text style={styles.inventoryName}>Consumidor final</Text>
                    </TouchableOpacity>

                    {customers.map((c) => (
                      <TouchableOpacity
                        key={c.id}
                        style={styles.inventoryItem}
                        onPress={() => pickCustomer(c.id)}
                      >
                        <View style={styles.customerNameFlex}>
                          <Text style={styles.inventoryName}>{c.name}</Text>
                          {!!c.phone && <Text style={styles.inventoryMeta}>{c.phone}</Text>}
                        </View>
                      </TouchableOpacity>
                    ))}

                    {!newCustomerMode && (
                      <TouchableOpacity style={styles.inventoryItem} onPress={() => setNewCustomerMode(true)}>
                        <Text style={[styles.inventoryName, styles.addText]}>+ Nuevo cliente</Text>
                      </TouchableOpacity>
                    )}

                    {newCustomerMode && (
                      <View style={styles.inventoryItem}>
                        <View style={styles.customerNameFlex}>
                          <TextInput
                            style={[styles.input, styles.inputSpaced]}
                            placeholder="Nombre del cliente"
                            value={newCustomerName}
                            onChangeText={setNewCustomerName}
                          />
                          <TextInput
                            style={styles.input}
                            placeholder="Teléfono (opcional)"
                            keyboardType="phone-pad"
                            value={newCustomerPhone}
                            onChangeText={setNewCustomerPhone}
                          />
                        </View>
                        <TouchableOpacity onPress={handleCreateCustomer} disabled={creatingCustomer}>
                          {creatingCustomer ? (
                            <ActivityIndicator color={colors.primary} />
                          ) : (
                            <Text style={styles.addText}>Guardar</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.rowHeader}>
              <Text style={styles.label}>Inventario disponible</Text>
              <TouchableOpacity onPress={refreshInventory}>
                <Text style={styles.addText}>Actualizar</Text>
              </TouchableOpacity>
            </View>

            {inventoryLoading && (
              <ActivityIndicator color={colors.primary} style={styles.inlineLoader} />
            )}

            {!inventoryLoading && inventoryError && (
              <Text style={styles.errorText}>{inventoryError}</Text>
            )}

            {!inventoryLoading && !inventoryError && inventory.length === 0 && (
              <Text style={styles.emptyText}>No hay productos activos en inventario.</Text>
            )}

            {!inventoryLoading && !inventoryError && inventory.length > 0 && (
              <View style={styles.inventoryList}>
                {inventory.map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    style={styles.inventoryItem}
                    onPress={() => addProductToItems(product)}
                  >
                    <View style={styles.customerNameFlex}>
                      <Text style={styles.inventoryName}>{product.name}</Text>
                      <Text style={styles.inventoryMeta}>
                        ${Number(product.price || 0).toFixed(2)} · Stock {product.stock} {product.unit || ''}
                      </Text>
                    </View>
                    <Text style={styles.addText}>Agregar</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.rowHeader}>
              <Text style={styles.label}>Detalle de Productos</Text>
              <TouchableOpacity onPress={addItem}>
                <Text style={styles.addText}>+ Agregar fila</Text>
              </TouchableOpacity>
            </View>

              {items.map((item, index) => (
                <View key={item.id} style={styles.itemRow}>
                  <TextInput
                    style={[styles.input, styles.itemInputDesc]}
                    placeholder="Descripción"
                    value={item.desc}
                    onChangeText={(val) => {
                      const newItems = [...items];
                      newItems[index].desc = val;
                      newItems[index].productId = null;
                      setItems(newItems);
                    }}
                  />
                  <TextInput
                    style={[styles.input, styles.itemInputPrice]}
                    placeholder="Precio"
                    keyboardType="numeric"
                    value={String(item.price ?? '')}
                    onChangeText={(val) => {
                      const newItems = [...items];
                      newItems[index].price = val;
                      setItems(newItems);
                    }}
                  />
                  <TextInput
                    style={[styles.input, styles.itemInputQuantity]}
                    placeholder="Cant."
                    keyboardType="numeric"
                    value={String(item.quantity ?? '1')}
                    onChangeText={(val) => {
                      const newItems = [...items];
                      newItems[index].quantity = val;
                      setItems(newItems);
                    }}
                  />

                  <TouchableOpacity
                    onPress={() => removeItem(item.id)}
                    disabled={items.length === 1}
                  >
                  <Text style={[
                    styles.addText,
                    items.length === 1 && styles.removeItemDisabled
                    ]}>✕</Text>
                </TouchableOpacity>

              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.mainButton, loading && styles.disabledButton]}
            onPress={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.textButton} />
            ) : (
              <Text style={styles.mainButtonText}>Generar Comprobante</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ─── Hub de MiRUC ────────────────────────────────────────────────────────────

const BillingScreen = () => {
  const navigation = useNavigation();
  const [formVisible, setFormVisible] = useState(false);

  return (
    <SafeAreaView style={styles.hubScreen} edges={['top']}>
      <DashboardHeader title="MiRUC" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.hubContent}>
        <TouchableOpacity style={styles.heroCta} onPress={() => setFormVisible(true)} activeOpacity={0.85}>
          <View style={styles.heroCtaIconWrap}>
            <DocumentPlusIcon size={28} color={colors.textWhite} />
          </View>
          <View style={styles.heroCtaText}>
            <Text style={styles.heroCtaTitle}>Generar Comprobante</Text>
            <Text style={styles.heroCtaSubtitle}>Crea una factura para tu cliente</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionTile} onPress={() => navigation.navigate('BillingHistory')}>
            <View style={styles.actionIconWrap}>
              <ClockIcon size={20} color={colors.primary} />
            </View>
            <Text style={styles.actionTileTitle}>Historial</Text>
            <Text style={styles.actionTileSubtitle}>Tus comprobantes generados</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionTile} onPress={() => navigation.navigate('BillingInsights')}>
            <View style={styles.actionIconWrap}>
              <ChartBarIcon size={20} color={colors.primary} />
            </View>
            <Text style={styles.actionTileTitle}>Ganancias</Text>
            <Text style={styles.actionTileSubtitle}>Márgenes y productos vendidos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.disclaimerRow}>
          <InformationCircleIcon size={16} color={colors.textMuted} />
          <Text style={styles.disclaimerText}>
            Los comprobantes generados aquí son informativos: no reemplazan un comprobante fiscal oficial.
          </Text>
        </View>
      </ScrollView>

      <InvoiceFormModal visible={formVisible} onClose={() => setFormVisible(false)} />
    </SafeAreaView>
  );
};

export default BillingScreen;
