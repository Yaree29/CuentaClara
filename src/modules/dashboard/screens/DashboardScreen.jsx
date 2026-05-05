import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { authService } from '../../auth/services/authService';

export default function DashboardScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Button
        title="Registrar Venta Rápida"
        onPress={() => navigation.navigate('QuickSale')}
      />
      <View style={styles.logoutButton}>
        <Button title="Cerrar Sesión" onPress={authService.signOut} color="#f44336" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  logoutButton: {
    marginTop: 20,
  }
});
