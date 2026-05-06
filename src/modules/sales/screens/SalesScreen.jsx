import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import MainLayout from '../../../views/layouts/MainLayout';
import { useSales } from '../hooks/useSales';
import styles from '../styles/sales.styles';

const SalesScreen = () => {
  const [cartCount, setCartCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [description, setDescription] = useState(''); // 🔥 nuevo estado
  const { processSale, loading } = useSales();

  const handleQuickAdd = (price) => {
    setCartCount(prev => prev + 1);
    setTotal(prev => prev + price);
  };

  const handleCheckout = async () => {
    if (cartCount === 0) return;
    
    try {
      await processSale([], total, description); // 🔥 enviar descripción
      Alert.alert("Éxito", "Venta registrada correctamente");
      setCartCount(0);
      setTotal(0);
      setDescription(''); // 🔥 limpiar
    } catch (error) {
      Alert.alert("Error", "No se pudo registrar la venta");
    }
  };

  return (
    <MainLayout>
      <Text style={styles.title}>Registro de Ventas</Text>
      
      <View style={styles.display}>
        <Text style={styles.displayLabel}>Total a cobrar:</Text>
        <Text style={styles.displayValue}>${total.toFixed(2)}</Text>
        <Text style={styles.displaySub}>{cartCount} productos en carrito</Text>
      </View>

      <View style={styles.quickActions}>
        {[1, 5, 10, 20].map((amount) => (
          <TouchableOpacity 
            key={amount} 
            style={styles.amountBtn}
            onPress={() => handleQuickAdd(amount)}
          >
            <Text style={styles.amountBtnText}>+${amount}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={localStyles.input}
        placeholder="Descripción (opcional)"
        value={description}
        onChangeText={setDescription}
      />
      
      <TouchableOpacity 
        style={[styles.checkoutBtn, (cartCount === 0 || loading) && styles.disabledBtn]}
        onPress={handleCheckout}
        disabled={cartCount === 0 || loading}
      >
        <Text style={styles.checkoutBtnText}>
          {loading ? "Procesando..." : "Registrar Venta"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.clearBtn}
        onPress={() => {
          setCartCount(0);
          setTotal(0);
          setDescription(''); // 🔥 limpiar también
        }}
      >
        <Text style={styles.clearBtnText}>Limpiar</Text>
      </TouchableOpacity>
    </MainLayout>
  );
};

export default SalesScreen;

const localStyles = StyleSheet.create({
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginVertical: 10,
  },
});