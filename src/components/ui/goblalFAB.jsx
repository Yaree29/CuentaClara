import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useAuthStore from '../../store/useAuthStore';

const GlobalFAB = () => {
  const [open, setOpen] = useState(false);
  const { user, isBiometricVerified } = useAuthStore();
  const navigation = useNavigation();

  if (!user || !isBiometricVerified) return null;
  

  return (
    <View style={styles.container}>
      {open && (
        <View style={styles.menu}>
            <TouchableOpacity
                style={styles.option}
                onPress={() => {
                    setOpen(false);
                    navigation.navigate('CreateTransaction', { type: 'expense' });
                }}
                >
                <Text style={styles.optionText}>Gasto</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.option}
                onPress={() => {
                    setOpen(false);
                    navigation.navigate('CreateTransaction', { type: 'income' });
                }}
                >
                <Text style={styles.optionText}>Ingreso</Text>
            </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setOpen(!open)}>
        <Text style={styles.fabText}>{open ? 'X' : '+'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default GlobalFAB;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    alignItems: 'flex-end',
  },
  fab: {
    backgroundColor: '#2563eb',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    
  },
  fabText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  menu: {
    marginBottom: 10,
    alignItems: 'flex-end',
  },
  option: {
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  optionText: {
    color: '#fff',
    fontSize: 14,
  },
});