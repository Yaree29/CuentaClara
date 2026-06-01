import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useAuthStore from '../../../store/useAuthStore';
import styles from '../styles/transaction.styles';

const CreateTransactionScreen = ({ route }) => {
  const navigation = useNavigation();
  const type = route?.params?.type || 'expense';
  const { user } = useAuthStore();

  const userType = user?.type || 'informal';
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