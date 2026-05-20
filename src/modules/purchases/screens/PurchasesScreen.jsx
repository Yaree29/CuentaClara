// =============================================================================
// CREADO: 2026-05-20
// Propósito: Pantalla placeholder para el módulo de Compras. Se muestra cuando
//            un negocio tiene el módulo "purchases" activo en sus features pero
//            la funcionalidad completa aún no está implementada.
// =============================================================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MainLayout from '../../../views/layouts/MainLayout';

const PurchasesScreen = () => {
  return (
    <MainLayout>
      <View style={styles.container}>
        <Text style={styles.icon}>🛒</Text>
        <Text style={styles.title}>Compras</Text>
        <Text style={styles.subtitle}>Próximamente</Text>
        <Text style={styles.description}>
          Aquí podrás registrar compras a proveedores y gastos del negocio.
        </Text>
      </View>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});

export default PurchasesScreen;
