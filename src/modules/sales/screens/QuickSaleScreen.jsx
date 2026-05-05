import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Linking } from 'react-native';
import { salesService } from '../services/salesService';
import { useAuth } from '../../../app/providers/AuthProvider';

export default function QuickSaleScreen() {
  const { user } = useAuth();
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' or 'credit'
  const [loading, setLoading] = useState(false);

  const handleRegisterSale = async () => {
    if (!productName || !quantity || !price) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);
    const saleData = {
      productName,
      quantity: parseInt(quantity, 10),
      price: parseFloat(price),
      paymentMethod,
      userId: user.id,
      businessId: user.user_metadata.business_id, // Asumiendo que el business_id está en user_metadata
    };

    const { invoice, error } = await salesService.createQuickSale(saleData);

    if (error) {
      Alert.alert('Error', 'No se pudo registrar la venta.');
      setLoading(false);
      return;
    }

    Alert.alert(
      'Venta Registrada',
      `Venta #${invoice.id} registrada con éxito.`,
      [
        { text: 'OK' },
        {
          text: 'Enviar por WhatsApp',
          onPress: () => sendInvoiceByWhatsApp(invoice),
        },
      ]
    );
    setLoading(false);
    // Limpiar campos
    setProductName('');
    setQuantity('1');
    setPrice('');
  };

  const sendInvoiceByWhatsApp = (invoice) => {
    const message = `
*Factura Simplificada*
---------------------
*Emprendimiento:* ${invoice.business_name || 'Mi Negocio'}
*Venta ID:* ${invoice.id}
*Fecha:* ${new Date(invoice.created_at).toLocaleDateString()}
---------------------
*Productos:*
- ${invoice.items[0].quantity} x ${invoice.items[0].product_name} - $${invoice.items[0].subtotal.toFixed(2)}
---------------------
*Total:* $${invoice.total.toFixed(2)}
    `;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Asegúrate de tener WhatsApp instalado.');
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nombre del Producto</Text>
      <TextInput
        style={styles.input}
        value={productName}
        onChangeText={setProductName}
        placeholder="Ej: Mochila"
      />

      <Text style={styles.label}>Cantidad</Text>
      <TextInput
        style={styles.input}
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Precio Total de la Venta</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
        placeholder="Ej: 25.00"
      />

      <View style={styles.switchContainer}>
        <Button title="Contado" onPress={() => setPaymentMethod('cash')} color={paymentMethod === 'cash' ? '#3498db' : 'gray'} />
        <Button title="Fiado" onPress={() => setPaymentMethod('credit')} color={paymentMethod === 'credit' ? '#3498db' : 'gray'} />
      </View>

      <Button
        title={loading ? 'Registrando...' : 'Registrar Venta'}
        onPress={handleRegisterSale}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
});
