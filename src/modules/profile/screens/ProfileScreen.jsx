import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import MainLayout from '../../../views/layouts/MainLayout';
import useProfile from '../hooks/useProfile';

const G = '#00A86B';
const N = '#002366';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { profile, loading, logout } = useProfile();

  if (loading) {
    return (
      <MainLayout>
        <View style={s.center}><ActivityIndicator size="large" color={G} /></View>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Mi Perfil</Text>

        {/* Avatar */}
        <View style={s.avatarCard}>
          <View style={s.avatar}>
            <Text style={s.avatarLetter}>{profile?.name?.charAt(0)}</Text>
          </View>
          <Text style={s.name}>{profile?.name}</Text>
          <Text style={s.email}>{profile?.email}</Text>
          <Text style={s.role}>Rol: {profile?.role}</Text>
        </View>

        {/* Negocio */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Negocio</Text>
          <View style={s.row}>
            <Text style={s.label}>Nombre</Text>
            <Text style={s.value}>{profile?.businessName}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>Miembro desde</Text>
            <Text style={s.value}>{profile?.joinedDate}</Text>
          </View>
        </View>

        {/* Seguridad */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🔒 Seguridad</Text>

          <TouchableOpacity
            style={s.secRow}
            onPress={() => navigation.navigate('Token2FA', { actionType: 'generic' })}
          >
            <View style={s.secIcon}>
              <Ionicons name="shield-checkmark-outline" size={20} color={G} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.secLabel}>Activar verificación en dos pasos</Text>
              <Text style={s.secSub}>Conectar con Google Authenticator</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={logout}>
          <Text style={s.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </MainLayout>
  );
};

const s = StyleSheet.create({
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title:       { fontSize: 24, fontWeight: '800', color: N, paddingHorizontal: 16, paddingTop: 16, marginBottom: 16 },
  avatarCard:  { alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, padding: 24, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', elevation: 2 },
  avatar:      { width: 70, height: 70, borderRadius: 35, backgroundColor: G, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarLetter:{ fontSize: 28, fontWeight: '800', color: '#fff' },
  name:        { fontSize: 18, fontWeight: '700', color: N },
  email:       { fontSize: 13, color: '#64748b', marginTop: 2 },
  role:        { fontSize: 12, color: '#64748b', marginTop: 2 },
  section:     { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', elevation: 1 },
  sectionTitle:{ fontSize: 14, fontWeight: '700', color: N, marginBottom: 12 },
  row:         { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  label:       { fontSize: 13, color: '#64748b' },
  value:       { fontSize: 13, fontWeight: '600', color: N },
  secRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  secIcon:     { width: 38, height: 38, borderRadius: 10, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center' },
  secLabel:    { fontSize: 14, fontWeight: '700', color: N },
  secSub:      { fontSize: 12, color: '#64748b', marginTop: 2 },
  logoutBtn:   { marginHorizontal: 16, marginTop: 8, backgroundColor: '#FEF2F2', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#FECACA' },
  logoutText:  { fontSize: 15, fontWeight: '700', color: '#DC2626' },
});

export default ProfileScreen;
