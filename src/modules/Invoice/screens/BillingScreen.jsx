import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import MainLayout from '../../../views/layouts/MainLayout';
import { useBilling } from '../hooks/useBilling';
import styles from '../styles/billing.styles';

const BillingScreen = () => {
  const [customer, setCustomer] = useState('');
  const [items, setItems] = useState([{ id: 1, desc: '', price: '', quantity: '1', productId: null }]);
  const { createInvoice, loading, inventory, inventoryLoading, inventoryError, refreshInventory } = useBilling();

  const addItem = () => {
    setItems([...items, { id: Date.now(), desc: '', price: '', quantity: '1', productId: null }]);
  };

  const removeItem = (id) => {
    if (items.length === 1) return;

    setItems(items.filter((item) => item.id !== id));
  };

  const handleGenerate = async () => {
    if (!customer || items.some((i) => !i.desc || !i.price || !i.quantity)) {
      Alert.alert("Campos incompletos", "Por favor llena los datos del cliente y al menos un producto.");
      return;
    }
    
    try {
      const result = await createInvoice(customer, items);
      Alert.alert("Factura Generada", `Número: ${result.invoiceNumber}\nFecha: ${result.date}`);
      setCustomer('');
      setItems([{ id: 1, desc: '', price: '', quantity: '1', productId: null }]);
    } catch (error) {
      Alert.alert("Error", "No se pudo procesar la factura.");
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
          <Text style={styles.label}>Datos del Cliente</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre o Razón Social"
            value={customer}
            onChangeText={setCustomer}
          />
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
