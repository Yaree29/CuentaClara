import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import MainLayout from '../../../views/layouts/MainLayout';
import { useBilling } from '../hooks/useBilling';
import styles from '../styles/billing.styles';

const BillingScreen = () => {
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

      setCustomerId(null);
      setCustomerPicked(false);
      setItems([{ id: 1, desc: '', price: '', quantity: '1', productId: null }]);
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
    <MainLayout>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Nueva Factura</Text>

        <View style={styles.section}>
          <View style={styles.rowHeader}>
            <Text style={styles.label}>Datos del Cliente</Text>
            <TouchableOpacity onPress={() => setShowCustomers(!showCustomers)}>
              <Text style={styles.addText}>{showCustomers ? 'Cerrar' : 'Cambiar'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.input} onPress={() => setShowCustomers(!showCustomers)}>
            <Text style={{ color: customerPicked ? '#1e293b' : '#94a3b8' }}>
              {customerPicked
                ? (selectedCustomer ? selectedCustomer.name : 'Consumidor final')
                : 'Seleccionar cliente'}
            </Text>
          </TouchableOpacity>

          {showCustomers && (
            <View style={[styles.inventoryList, { marginTop: 8 }]}>
              {customersLoading && (
                <ActivityIndicator color="#2563eb" style={{ marginVertical: 10 }} />
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
                      <View style={{ flex: 1 }}>
                        <Text style={styles.inventoryName}>{c.name}</Text>
                        {!!c.phone && <Text style={styles.inventoryMeta}>{c.phone}</Text>}
                      </View>
                    </TouchableOpacity>
                  ))}

                  {!newCustomerMode && (
                    <TouchableOpacity style={styles.inventoryItem} onPress={() => setNewCustomerMode(true)}>
                      <Text style={[styles.inventoryName, { color: '#2563eb' }]}>+ Nuevo cliente</Text>
                    </TouchableOpacity>
                  )}

                  {newCustomerMode && (
                    <View style={styles.inventoryItem}>
                      <View style={{ flex: 1 }}>
                        <TextInput
                          style={[styles.input, { marginBottom: 8 }]}
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
                          <ActivityIndicator color="#2563eb" />
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
            <ActivityIndicator color="#2563eb" style={{ marginVertical: 10 }} />
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
                  <View style={{ flex: 1 }}>
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
                  style={[styles.input, { flex: 2 }]}
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
                  style={[styles.input, { flex: 1, marginLeft: 10 }]}
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
                  style={[styles.input, { flex: 0.7, marginLeft: 10 }]}
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
                  items.length === 1 && { opacity: 0.5 } 
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
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.mainButtonText}>Generar Factura Fiscal</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </MainLayout>
  );
};

export default BillingScreen;
