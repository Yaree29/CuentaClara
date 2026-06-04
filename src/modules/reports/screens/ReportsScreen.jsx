import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const G = '#00A86B';
const N = '#002366';

const SERVICE_TYPES = ['Blower', 'Corte basico', 'Corte + Barba', 'Perfilado de Barba'];

const MOCK = {
  negocio: 'Barberia Chompiras',
  pct: 12,
  destacado: { nombre: 'Corte + Barba', desc: 'El servicio mas solicitado esta semana.' },
  recientes: [
    { id: 'srv-1', nombre: 'Corte Degradado (Fade)', dur: '35 min', empleado: 'Carlos R.', monto: 25.00, estado: 'Pagado', estadoColor: G },
    { id: 'srv-2', nombre: 'Perfilado de Barba', dur: '20 min', empleado: 'Ana M.', monto: 15.00, estado: 'Pagado', estadoColor: G },
    { id: 'srv-3', nombre: 'Tratamiento Capilar', dur: '45 min', empleado: 'Ana M.', monto: 40.00, estado: 'Fiado', estadoColor: '#A5393E' },
  ],
  personal: [
    { ini: 'CR', nombre: 'Carlos Rojas', comision: 68.50, meta: 100, color: '#435b9f' },
    { ini: 'AM', nombre: 'Ana Martinez', comision: 42.15, meta: 100, color: G },
    { ini: 'LG', nombre: 'Luis Garcia', comision: 17.00, meta: 100, color: '#A5393E' },
  ],
};

export default function ReportsScreen({ navigation, route }) {
  const [services, setServices] = useState(MOCK.recientes);
  const [modalOpen, setModalOpen] = useState(false);
  const [serviceType, setServiceType] = useState(SERVICE_TYPES[0]);
  const [employee, setEmployee] = useState('Carlos R.');
  const [duration, setDuration] = useState('30 min');
  const [amount, setAmount] = useState('25.00');

  const metrics = useMemo(() => {
    const ventasHoy = services.reduce((sum, srv) => sum + srv.monto, 0);
    return {
      ventasHoy,
      totalServ: services.length,
      comisiones: ventasHoy * 0.3,
    };
  }, [services]);

  useEffect(() => {
    const authorizedId = route?.params?.authorizedDeleteServiceId;
    if (!authorizedId) return;

    setServices(current => current.filter(service => service.id !== authorizedId));
    navigation.setParams({ authorizedDeleteServiceId: undefined });
  }, [navigation, route?.params?.authorizedDeleteServiceId]);

  const handleCreateService = () => {
    const nextService = {
      id: `srv-${Date.now()}`,
      nombre: serviceType,
      dur: duration || '30 min',
      empleado: employee || 'Sin asignar',
      monto: Number(amount) || 0,
      estado: 'Pagado',
      estadoColor: G,
    };

    setServices(current => [nextService, ...current]);
    setModalOpen(false);
    setServiceType(SERVICE_TYPES[0]);
    setEmployee('Carlos R.');
    setDuration('30 min');
    setAmount('25.00');
  };

  const handleDeleteService = (service) => {
    navigation.navigate('Token2FA', {
      actionType: 'delete_service',
      actionLabel: `Borrar servicio: ${service.nombre}`,
      targetName: service.nombre,
      targetId: service.id,
      returnScreen: 'Reportes',
    });
  };

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <Text style={s.headerSub}>RESUMEN DE HOY</Text>
        <Text style={s.headerTitle}>{MOCK.negocio}</Text>
      </View>

      <TouchableOpacity style={s.newBtn} onPress={() => setModalOpen(true)}>
        <Ionicons name="add-circle" size={20} color="#fff" />
        <Text style={s.newBtnText}>Nuevo Servicio</Text>
      </TouchableOpacity>

      <View style={s.card}>
        <View style={s.cardTop}>
          <View style={s.cardIcon}><Ionicons name="cash-outline" size={22} color={G} /></View>
          <Text style={{ fontSize: 12, fontWeight: '600', color: G }}>+{MOCK.pct}% vs ayer</Text>
        </View>
        <Text style={s.cardSub}>Servicios de Hoy</Text>
        <Text style={s.amount}>${metrics.ventasHoy.toFixed(2)}</Text>
      </View>

      <View style={s.card}>
        <View style={s.cardTop}>
          <View style={[s.cardIcon, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="document-text-outline" size={22} color="#435b9f" />
          </View>
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b' }}>{metrics.totalServ} Servicios</Text>
        </View>
        <Text style={s.cardSub}>Comisiones Devengadas</Text>
        <Text style={[s.amount, { color: '#435b9f' }]}>${metrics.comisiones.toFixed(2)}</Text>
      </View>

      <View style={s.featuredCard}>
        <Text style={s.featuredTitle}>{MOCK.destacado.nombre}</Text>
        <Text style={s.featuredDesc}>{MOCK.destacado.desc}</Text>
        <View style={{ flexDirection: 'row' }}>
          {['CR', 'AM'].map((ini, i) => (
            <View key={ini} style={[s.avatar, { marginLeft: i > 0 ? -8 : 0 }]}>
              <Text style={s.avatarText}>{ini}</Text>
            </View>
          ))}
          <View style={[s.avatar, { marginLeft: -8, backgroundColor: '#435b9f' }]}>
            <Text style={s.avatarText}>+5</Text>
          </View>
        </View>
        <View style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.1 }}>
          <Ionicons name="cut-outline" size={100} color="#fff" />
        </View>
      </View>

      <View style={s.secHeader}>
        <Text style={s.secTitle}>Servicios Recientes</Text>
        <TouchableOpacity><Text style={{ fontSize: 13, color: G, fontWeight: '600' }}>Ver todo</Text></TouchableOpacity>
      </View>

      {services.map((srv) => (
        <View key={srv.id} style={s.srvCard}>
          <View style={s.srvIcon}><Ionicons name="cut-outline" size={20} color={G} /></View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#1e293b' }}>{srv.nombre}</Text>
            <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{srv.dur} - {srv.empleado}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: N }}>${srv.monto.toFixed(2)}</Text>
            <Text style={{ fontSize: 11, fontWeight: '700', color: srv.estadoColor, marginTop: 2 }}>{srv.estado}</Text>
          </View>
          <TouchableOpacity style={s.deleteBtn} onPress={() => handleDeleteService(srv)}>
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>
      ))}

      <Text style={[s.secTitle, { marginHorizontal: 16, marginTop: 20, marginBottom: 10 }]}>Comisiones Personal</Text>
      <View style={s.card}>
        {MOCK.personal.map((p, i) => {
          const pct = (p.comision / p.meta) * 100;
          return (
            <View key={p.ini} style={[{ paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
              i < MOCK.personal.length - 1 && { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }]}
            >
              <View style={[s.staffAvatar, { backgroundColor: p.color }]}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{p.ini}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#1e293b' }}>{p.nombre}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: N }}>${p.comision.toFixed(2)}</Text>
                </View>
                <Text style={{ fontSize: 11, color: '#64748b', marginBottom: 6, marginTop: 2 }}>Meta: ${p.meta}.00</Text>
                <View style={{ height: 4, backgroundColor: '#E2E8F0', borderRadius: 2 }}>
                  <View style={{ height: 4, borderRadius: 2, width: `${pct}%`, backgroundColor: p.color }} />
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <View style={{ height: 40 }} />

      <Modal visible={modalOpen} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Crear servicio</Text>
            <Text style={s.modalSub}>Selecciona el tipo de servicio de barberia.</Text>

            <View style={s.typeGrid}>
              {SERVICE_TYPES.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[s.typeBtn, serviceType === type && s.typeBtnActive]}
                  onPress={() => setServiceType(type)}
                >
                  <Text style={[s.typeText, serviceType === type && s.typeTextActive]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput style={s.modalInput} placeholder="Empleado" value={employee} onChangeText={setEmployee} />
            <TextInput style={s.modalInput} placeholder="Duracion" value={duration} onChangeText={setDuration} />
            <TextInput style={s.modalInput} placeholder="Monto" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />

            <TouchableOpacity style={s.modalBtn} onPress={handleCreateService}>
              <Text style={s.modalBtnText}>Confirmar servicio</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.cancelBtn} onPress={() => setModalOpen(false)}>
              <Text style={s.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4FBF3' },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  headerSub: { fontSize: 11, fontWeight: '700', color: '#64748b', letterSpacing: 1, textTransform: 'uppercase' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: N },
  newBtn: { backgroundColor: G, marginHorizontal: 16, marginTop: 12, borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  newBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginHorizontal: 16, marginTop: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center' },
  cardSub: { fontSize: 13, color: '#64748b', marginBottom: 4 },
  amount: { fontSize: 32, fontWeight: '800', color: N },
  featuredCard: { backgroundColor: N, marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 20, overflow: 'hidden', position: 'relative' },
  featuredTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4 },
  featuredDesc: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 14 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#435b9f', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: N },
  avatarText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  secHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginTop: 20, marginBottom: 10 },
  secTitle: { fontSize: 17, fontWeight: '700', color: N },
  srvCard: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 8, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', elevation: 1 },
  srvIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center' },
  deleteBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center' },
  staffAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: N, marginBottom: 6 },
  modalSub: { fontSize: 13, color: '#64748b', marginBottom: 16 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  typeBtn: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  typeBtnActive: { backgroundColor: G, borderColor: G },
  typeText: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  typeTextActive: { color: '#fff' },
  modalInput: { backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 10 },
  modalBtn: { backgroundColor: G, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 },
  modalBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn: { alignItems: 'center', padding: 12 },
  cancelText: { fontSize: 15, color: '#64748b' },
});
