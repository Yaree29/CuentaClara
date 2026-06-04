import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const G = '#00A86B';
const N = '#002366';

export default function SellScreen() {
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState('');

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Vender</Text>
        <Text style={s.headerSub}>Escanea o registra una venta rapida</Text>
      </View>

      <TouchableOpacity style={s.scanBtn} onPress={() => setModalOpen(true)}>
        <Ionicons name="barcode-outline" size={54} color="#fff" />
        <Text style={s.scanBtnText}>Escanear codigo</Text>
      </TouchableOpacity>

      <View style={s.card}>
        <Text style={s.caps}>VENTA RAPIDA</Text>
        <Text style={s.amount}>$0.00</Text>
        <Text style={s.hint}>Lista para agregar productos</Text>
      </View>

      <Modal visible={modalOpen} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Escanear codigo</Text>
            <Text style={s.modalSub}>Ingresa el codigo del producto</Text>
            <TextInput
              style={s.modalInput}
              placeholder="Ej: 7501055310007"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
            />
            <TouchableOpacity style={s.modalBtn} onPress={() => { setModalOpen(false); setCode(''); }}>
              <Text style={s.modalBtnText}>Agregar producto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.cancelBtn} onPress={() => setModalOpen(false)}>
              <Text style={s.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FBF3',
    padding: 16,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: N,
  },
  headerSub: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  scanBtn: {
    backgroundColor: G,
    borderRadius: 16,
    paddingVertical: 26,
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    elevation: 4,
  },
  scanBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    elevation: 2,
  },
  caps: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: '800',
    color: G,
  },
  hint: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: N,
    marginBottom: 6,
  },
  modalSub: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 14,
  },
  modalBtn: {
    backgroundColor: G,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    alignItems: 'center',
    padding: 12,
  },
  cancelText: {
    fontSize: 15,
    color: '#64748b',
  },
});
