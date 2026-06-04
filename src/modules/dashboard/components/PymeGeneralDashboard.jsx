import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const G = '#00A86B';
const N = '#002366';

const MOCK = {
  ventasHoy: 1240.50, ventasAyer: 1107.58,
  alertasCriticas: 4,
  productoAlerta: { nombre: 'Leche Entera 1L', stock: '2 días stock' },
  masVendidos: [
    { nombre: 'Harina Pan 1kg',    unidades: 42, ingreso: 105.00, rotacion: 'Alta Rotación' },
    { nombre: 'Coca-Cola 2.5L',    unidades: 38, ingreso: 95.00,  rotacion: 'Alta Rotación' },
    { nombre: 'Huevo Cartón 30u',  unidades: 25, ingreso: 125.00, rotacion: 'Estable'       },
  ],
  barras: [40, 65, 55, 80, 95],
  dias:   ['Lun', 'Mar', 'Mie', 'Jue', 'Vie'],
  tasaRotacion: 8.4,
};

const BarChart = ({ barras, dias }) => {
  const max = Math.max(...barras);
  return (
    <View style={s.chartWrap}>
      <View style={s.chartBars}>
        {barras.map((v, i) => (
          <View key={i} style={s.barCol}>
            <View style={[s.bar, { height: (v / max) * 80 },
              i === barras.length - 1 ? { backgroundColor: G } : { backgroundColor: '#A7F3D0' }]} />
            <Text style={s.barLabel}>{dias[i]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default function PymeGeneralDashboard() {
  const [scanModal, setScanModal] = useState(false);
  const [scanCode, setScanCode]   = useState('');
  const pct = Math.round(((MOCK.ventasHoy - MOCK.ventasAyer) / MOCK.ventasAyer) * 100);
  const today = new Date().toLocaleDateString('es-PA', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Resumen Operativo</Text>
        <Text style={s.headerSub}>{today}</Text>
      </View>

      {/* Ventas hoy */}
      <View style={s.card}>
        <Text style={s.caps}>VENTAS HOY</Text>
        <Text style={s.amount}>${MOCK.ventasHoy.toLocaleString('es-PA', { minimumFractionDigits: 2 })}</Text>
        <View style={s.trendRow}>
          <Ionicons name="trending-up" size={16} color={G} />
          <Text style={s.trendText}>+{pct}% vs ayer</Text>
        </View>
      </View>

      {/* Escanear */}
      <View style={s.card}>
        <Text style={s.caps}>ESCANEAR Y COBRAR</Text>
        <TouchableOpacity style={s.scanBtn} onPress={() => setScanModal(true)}>
          <Ionicons name="barcode-outline" size={48} color="#fff" />
          <Text style={s.scanBtnText}>Escanear Código</Text>
        </TouchableOpacity>
      </View>

      {/* Alertas */}
      <View style={[s.card, { backgroundColor: '#FEF9EE', borderColor: '#D97706' }]}>
        <View style={s.alertHeader}>
          <View>
            <Text style={[s.caps, { color: '#92400E' }]}>ALERTAS ROTACIÓN</Text>
            <Text style={s.alertCount}>{MOCK.alertasCriticas} Críticos</Text>
          </View>
          <Ionicons name="warning-outline" size={24} color="#D97706" />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#92400E' }}>{MOCK.productoAlerta.nombre}</Text>
          <Text style={{ fontSize: 13, color: '#D97706', fontWeight: '600' }}>{MOCK.productoAlerta.stock}</Text>
        </View>
        <View style={{ height: 4, backgroundColor: '#EF4444', borderRadius: 2, width: '40%' }} />
      </View>

      {/* Más vendidos */}
      <View style={s.card}>
        <View style={s.secRow}>
          <Text style={s.secTitle}>Más Vendidos</Text>
          <TouchableOpacity><Text style={{ fontSize: 13, color: G, fontWeight: '600' }}>Ver Todo</Text></TouchableOpacity>
        </View>
        {MOCK.masVendidos.map((p, i) => (
          <View key={i} style={[s.productRow, i < MOCK.masVendidos.length - 1 && { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }]}>
            <View style={s.productIcon}>
              <Ionicons name="cube-outline" size={20} color={G} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.productName}>{p.nombre}</Text>
              <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{p.unidades} unidades vendidas</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#1e293b' }}>${p.ingreso.toFixed(2)}</Text>
              <Text style={[{ fontSize: 12, color: '#64748b', marginTop: 2 }, p.rotacion === 'Alta Rotación' && { color: G, fontWeight: '600' }]}>
                {p.rotacion}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Eficiencia */}
      <View style={s.card}>
        <View style={s.secRow}>
          <Text style={s.secTitle}>Eficiencia de Inventario</Text>
          <Ionicons name="bar-chart-outline" size={20} color="#64748b" />
        </View>
        <BarChart barras={MOCK.barras} dias={MOCK.dias} />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="sync-outline" size={16} color={G} />
          <Text style={{ fontSize: 13, color: '#64748b' }}> Tasa de Rotación: </Text>
          <Text style={{ fontSize: 13, fontWeight: '700', color: N }}>{MOCK.tasaRotacion}x</Text>
          <Text style={{ fontSize: 12, color: G }}> +0.5 este mes</Text>
        </View>
      </View>

      <View style={{ height: 40 }} />

      <Modal visible={scanModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: N, marginBottom: 6 }}>Escanear Código</Text>
            <Text style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Ingresa el código del producto (demo)</Text>
            <TextInput style={s.modalInput} placeholder="Ej: 7501055310007" value={scanCode} onChangeText={setScanCode} keyboardType="number-pad" />
            <TouchableOpacity style={s.modalBtn} onPress={() => { setScanModal(false); setScanCode(''); }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Buscar producto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ alignItems: 'center', padding: 12 }} onPress={() => setScanModal(false)}>
              <Text style={{ fontSize: 15, color: '#64748b' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#F4FBF3' },
  header:      { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: N },
  headerSub:   { fontSize: 14, color: '#64748b', marginTop: 2, textTransform: 'capitalize' },
  card:        { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginHorizontal: 16, marginTop: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', elevation: 2 },
  caps:        { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 },
  amount:      { fontSize: 36, fontWeight: '800', color: G, letterSpacing: -0.5 },
  trendRow:    { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  trendText:   { fontSize: 13, color: G, fontWeight: '600' },
  scanBtn:     { backgroundColor: G, borderRadius: 14, paddingVertical: 20, alignItems: 'center', gap: 8, elevation: 4 },
  scanBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  alertCount:  { fontSize: 22, fontWeight: '800', color: '#92400E', marginTop: 2 },
  secRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  secTitle:    { fontSize: 17, fontWeight: '700', color: N },
  productRow:  { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 },
  productIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center' },
  productName: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  chartWrap:   { backgroundColor: '#F0FDF4', borderRadius: 12, padding: 12, marginBottom: 12 },
  chartBars:   { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 100, paddingBottom: 20 },
  barCol:      { alignItems: 'center', flex: 1 },
  bar:         { width: 28, borderRadius: 6 },
  barLabel:    { fontSize: 10, color: '#64748b', marginTop: 4 },
  modalOverlay:{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalCard:   { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalInput:  { backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 14 },
  modalBtn:    { backgroundColor: G, borderRadius: 12, padding: 16, alignItems: 'center' },
});
