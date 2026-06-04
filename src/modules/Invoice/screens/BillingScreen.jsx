import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, Modal, StyleSheet,
} from 'react-native';
import MainLayout from '../../../views/layouts/MainLayout';
import colors from '../../../theme/colors';

const EMPTY_ITEM = () => ({ id: Date.now(), desc: '', price: '', quantity: '1' });

const BillingScreen = () => {
  const [customer,      setCustomer]      = useState('');
  const [items,         setItems]         = useState([EMPTY_ITEM()]);
  const [modalVisible,  setModalVisible]  = useState(false);
  const [newProduct,    setNewProduct]    = useState({ desc: '', price: '', quantity: '1' });
  const [loading,       setLoading]       = useState(false);

  const updateItem = (index, field, val) => {
    const next = [...items]; next[index][field] = val; setItems(next);
  };
  const removeItem = (id) => { if (items.length > 1) setItems(items.filter(i => i.id !== id)); };

  const handleAddProduct = () => {
    if (!newProduct.desc.trim() || !newProduct.price || isNaN(newProduct.price)) {
      Alert.alert('Datos incompletos', 'Ingresa descripción y precio válidos.');
      return;
    }
    const idx = items.findIndex(i => !i.desc && !i.price);
    const entry = { id: Date.now(), ...newProduct };
    if (idx >= 0) { const n = [...items]; n[idx] = entry; setItems(n); }
    else setItems([...items, entry]);
    setNewProduct({ desc: '', price: '', quantity: '1' });
    setModalVisible(false);
  };

  const handleGenerate = async () => {
    if (!customer.trim() || items.some(i => !i.desc || !i.price)) {
      Alert.alert('Campos incompletos', 'Completa cliente y al menos un producto.'); return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    Alert.alert('Factura generada', `Cliente: ${customer}\nProductos: ${items.length}`);
    setCustomer(''); setItems([EMPTY_ITEM()]); setLoading(false);
  };

  const subtotal = items.reduce((a, i) => a + (parseFloat(i.price)||0)*(parseFloat(i.quantity)||0), 0);
  const tax = subtotal * 0.07;

  return (
    <MainLayout>
      <ScrollView contentContainerStyle={{ paddingBottom: 40, padding: 16 }}>
        <Text style={s.title}>Nueva Factura</Text>

        <Text style={s.label}>Cliente</Text>
        <TextInput style={s.input} placeholder="Nombre o Razón Social" value={customer} onChangeText={setCustomer} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 8 }}>
          <Text style={s.label}>Productos</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={{ color: '#00A86B', fontWeight: '700' }}>+ Agregar</Text>
          </TouchableOpacity>
        </View>

        {items.map((item, index) => (
          <View key={item.id} style={{ flexDirection: 'row', gap: 6, marginBottom: 8, alignItems: 'center' }}>
            <TextInput style={[s.input, { flex: 2 }]} placeholder="Descripción" value={item.desc} onChangeText={v => updateItem(index, 'desc', v)} />
            <TextInput style={[s.input, { flex: 1 }]} placeholder="$" keyboardType="numeric" value={item.price} onChangeText={v => updateItem(index, 'price', v)} />
            <TextInput style={[s.input, { flex: 0.7 }]} placeholder="Qty" keyboardType="numeric" value={item.quantity} onChangeText={v => updateItem(index, 'quantity', v)} />
            <TouchableOpacity onPress={() => removeItem(item.id)}>
              <Text style={{ color: colors.danger }}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={s.totalsBox}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ color: '#64748b' }}>Subtotal</Text><Text>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ color: '#64748b' }}>ITBMS (7%)</Text><Text>${tax.toFixed(2)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 8 }}>
            <Text style={{ fontWeight: '800', fontSize: 16 }}>TOTAL</Text>
            <Text style={{ fontWeight: '800', fontSize: 16, color: '#002366' }}>${(subtotal+tax).toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={handleGenerate} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Generar Factura</Text>}
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#002366', marginBottom: 14 }}>Agregar Producto</Text>
            <TextInput style={[s.input, { marginBottom: 10 }]} placeholder="Descripción" value={newProduct.desc} onChangeText={v => setNewProduct(p => ({ ...p, desc: v }))} />
            <TextInput style={[s.input, { marginBottom: 10 }]} placeholder="Precio" keyboardType="decimal-pad" value={newProduct.price} onChangeText={v => setNewProduct(p => ({ ...p, price: v }))} />
            <TextInput style={[s.input, { marginBottom: 16 }]} placeholder="Cantidad" keyboardType="numeric" value={newProduct.quantity} onChangeText={v => setNewProduct(p => ({ ...p, quantity: v }))} />
            <TouchableOpacity style={s.btn} onPress={handleAddProduct}>
              <Text style={s.btnText}>Agregar a factura</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ alignItems: 'center', marginTop: 12 }} onPress={() => setModalVisible(false)}>
              <Text style={{ color: '#64748b', fontSize: 15 }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </MainLayout>
  );
};

const s = StyleSheet.create({
  title:       { fontSize: 22, fontWeight: '800', color: '#002366', marginBottom: 16 },
  label:       { fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input:       { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1e293b' },
  totalsBox:   { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14, marginTop: 16, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  btn:         { backgroundColor: '#00A86B', borderRadius: 12, padding: 16, alignItems: 'center' },
  btnText:     { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalOverlay:{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard:   { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
});

export default BillingScreen;
