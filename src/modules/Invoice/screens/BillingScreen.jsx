import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import MainLayout from '../../../views/layouts/MainLayout';
import { useBilling } from '../hooks/useBilling';
import styles from '../styles/billing.styles';

const BillingScreen = () => {
  const [customer, setCustomer] = useState('');
  const [items, setItems] = useState([{ id: 1, desc: '', price: '' }]);
  const { createInvoice, loading } = useBilling();

  const addItem = () => {
    setItems([...items, { id: Date.now(), desc: '', price: '' }]);
  };

  const removeItem = () => {
    if (items.length === 1) return;

    setItems(items.slice(0, -1));
  };

  const handleGenerate = async () => {
    if (!customer || items.some(i => !i.desc || !i.price)) {
      Alert.alert("Campos incompletos", "Por favor llena los datos del cliente y al menos un producto.");
      return;
    }
    
    try {
      const result = await createInvoice(customer, items);
      Alert.alert("Factura Generada", `Número: ${result.invoiceNumber}\nFecha: ${result.date}`);
      setCustomer('');
      setItems([{ id: 1, desc: '', price: '' }]);
    } catch (error) {
      Alert.alert("Error", "No se pudo procesar la factura.");
    }
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
                onChangeText={(val) => {
                  const newItems = [...items];
                  newItems[index].desc = val;
                  setItems(newItems);
                }}
              />
              <TextInput
                style={[styles.input, { flex: 1, marginLeft: 10 }]}
                placeholder="Precio"
                keyboardType="numeric"
                onChangeText={(val) => {
                  const newItems = [...items];
                  newItems[index].price = val;
                  setItems(newItems);
                }}
              />

              <TouchableOpacity 
                onPress={removeItem}
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