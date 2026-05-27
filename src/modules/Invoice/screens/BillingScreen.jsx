import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, Modal,
} from 'react-native';
import MainLayout from '../../../views/layouts/MainLayout';
import { useBilling } from '../hooks/useBilling';
import styles from '../styles/billing.styles';

const EMPTY_ITEM = () => ({ id: Date.now(), desc: '', price: '', quantity: '1' });
const EMPTY_PRODUCT = { desc: '', price: '', quantity: '1' };

const BillingScreen = () => {
  const [customer, setCustomer] = useState('');
  const [items, setItems] = useState([EMPTY_ITEM()]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newProduct, setNewProduct] = useState({ ...EMPTY_PRODUCT });
  const { createInvoice, loading } = useBilling();

  /* ─── Items de la factura ─── */
  const updateItem = (index, field, val) => {
    const next = [...items];
    next[index][field] = val;
    setItems(next);
  };

  const removeItem = (id) => {
    if (items.length === 1) return;
    setItems(items.filter((i) => i.id !== id));
  };

  /* ─── Modal: agregar producto manual ─── */
  const handleAddProduct = () => {
    if (!newProduct.desc.trim() || !newProduct.price || isNaN(newProduct.price)) {
      Alert.alert('Datos incompletos', 'Ingresa descripción y precio válidos.');
      return;
    }
    const emptyIdx = items.findIndex((i) => !i.desc && !i.price);
    const entry = { id: Date.now(), ...newProduct };
    if (emptyIdx >= 0) {
      const next = [...items];
      next[emptyIdx] = entry;
      setItems(next);
    } else {
      setItems([...items, entry]);
    }
    setNewProduct({ ...EMPTY_PRODUCT });
    setModalVisible(false);
  };

  /* ─── Generar factura ─── */
  const handleGenerate = async () => {
    if (!customer.trim() || items.some((i) => !i.desc || !i.price || !i.quantity)) {
      Alert.alert('Campos incompletos', 'Completa los datos del cliente y al menos un producto.');
      return;
    }
    try {
      const result = await createInvoice(customer, items);
      Alert.alert('Factura generada', `N°: ${result.invoiceNumber}\nFecha: ${result.date}`);
      setCustomer('');
      setItems([EMPTY_ITEM()]);
    } catch {
      Alert.alert('Error', 'No se pudo procesar la factura.');
    }
  };

  const subtotal = items.reduce((acc, i) => acc + (parseFloat(i.price) || 0) * (parseFloat(i.quantity) || 0), 0);
  const tax = subtotal * 0.07;
  const total = subtotal + tax;

  return (
    <MainLayout>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>Nueva Factura</Text>

        {/* Cliente */}
        <View style={styles.section}>
          <Text style={styles.label}>Datos del Cliente</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre o Razón Social"
            value={customer}
            onChangeText={setCustomer}
          />
        </View>

        {/* Detalle de productos */}
        <View style={styles.section}>
          <View style={styles.rowHeader}>
            <Text style={styles.label}>Detalle de Productos</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text style={styles.addText}>+ Agregar producto</Text>
            </TouchableOpacity>
          </View>

          {items.map((item, index) => (
            <View key={item.id} style={styles.itemRow}>
              <TextInput
                style={[styles.input, { flex: 2 }]}
                placeholder="Descripción"
                value={item.desc}
                onChangeText={(v) => updateItem(index, 'desc', v)}
              />
              <TextInput
                style={[styles.input, { flex: 1, marginLeft: 8 }]}
                placeholder="Precio"
                keyboardType="numeric"
                value={item.price}
                onChangeText={(v) => updateItem(index, 'price', v)}
              />
              <TextInput
                style={[styles.input, { flex: 0.7, marginLeft: 8 }]}
                placeholder="Cant."
                keyboardType="numeric"
                value={item.quantity}
                onChangeText={(v) => updateItem(index, 'quantity', v)}
              />
              <TouchableOpacity onPress={() => removeItem(item.id)} disabled={items.length === 1}>
                <Text style={[styles.addText, items.length === 1 && { opacity: 0.3 }]}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Totales */}
        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>ITBMS (7%)</Text>
            <Text style={styles.totalValue}>${tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandRow]}>
            <Text style={styles.grandLabel}>TOTAL</Text>
            <Text style={styles.grandValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.mainButton, loading && styles.disabledButton]}
          onPress={handleGenerate}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.mainButtonText}>Generar Factura Fiscal</Text>
          }
        </TouchableOpacity>
      </ScrollView>

      {/* Modal: agregar producto manual */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Agregar Producto</Text>
            <TextInput
              style={[styles.input, { marginBottom: 10 }]}
              placeholder="Descripción del producto"
              value={newProduct.desc}
              onChangeText={(v) => setNewProduct((p) => ({ ...p, desc: v }))}
            />
            <TextInput
              style={[styles.input, { marginBottom: 10 }]}
              placeholder="Precio unitario"
              keyboardType="decimal-pad"
              value={newProduct.price}
              onChangeText={(v) => setNewProduct((p) => ({ ...p, price: v }))}
            />
            <TextInput
              style={[styles.input, { marginBottom: 16 }]}
              placeholder="Cantidad"
              keyboardType="numeric"
              value={newProduct.quantity}
              onChangeText={(v) => setNewProduct((p) => ({ ...p, quantity: v }))}
            />
            <TouchableOpacity style={styles.mainButton} onPress={handleAddProduct}>
              <Text style={styles.mainButtonText}>Agregar a la factura</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </MainLayout>
  );
};

export default BillingScreen;