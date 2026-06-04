import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const G = '#00A86B';
const N = '#002366';

export default function PymeServiceDashboard() {
  return (
    <View style={s.container}>
      <View style={s.card}>
        <View style={s.iconWrap}>
          <Ionicons name="construct-outline" size={42} color={G} />
        </View>
        <Text style={s.title}>Fiados</Text>
        <Text style={s.subtitle}>Sepa la bola (terminar)</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FBF3',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    elevation: 2,
  },
  iconWrap: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: N,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
});