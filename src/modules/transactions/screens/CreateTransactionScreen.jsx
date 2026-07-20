import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useAuthStore from '../../../store/useAuthStore';
import colors from '../../../theme/colors';

const CreateTransactionScreen = ({ route }) => {
  const navigation = useNavigation();
  const type = route?.params?.type || 'expense';
  const { user } = useAuthStore();

  const userType = user?.userType || 'informal';
  const businessType = user?.businessType || null;

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [extraData, setExtraData] = useState({});

  const renderPymeFields = () => {
    if (businessType === 'butcher') {
      return (
        <>
          <TextInput
            placeholder="Kilos vendidos"
            style={styles.input}
            keyboardType="numeric"
            onChangeText={(value) => setExtraData({ ...extraData, kilos: value })}
          />
          <TextInput
            placeholder="Precio por kilo"
            style={styles.input}
            keyboardType="numeric"
            onChangeText={(value) => setExtraData({ ...extraData, pricePerKilo: value })}
          />
        </>
      );
    }
    return null;
  };

  const handleSave = () => {
    const payload = { type, amount, description, extraData };
    console.log('DATA:', payload);
    navigation.goBack(); // opcional: salir después de guardar
  };

  return (
    <View style={styles.container}>
      {/* 🔴 BOTÓN SALIR */}
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      <Text style={styles.title}>
        {type === 'income' ? 'Registrar Ingreso' : 'Registrar Gasto'}
      </Text>

      <TextInput
        placeholder="Monto"
        style={styles.input}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      {userType === 'pyme' && renderPymeFields()}

      <TextInput
        placeholder="Descripción (opcional)"
        style={styles.input}
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Guardar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CreateTransactionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.cardSecondary,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: colors.border,
    width: 35,
    height: 35,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 50,
  },
  input: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: colors.textButton,
    fontWeight: 'bold',
  },
});