import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Toast from 'react-native-toast-message';

import styles from './styles/closeDay.style';
import useSalesStore from '../../../../store/useSaleStore';

const RegisterCount = () => {
  const addGeneralMovement = useSalesStore((state) => state.addGeneralMovement);
  const dailySales = useSalesStore((state) => state.dailySales);

  // Registro de otros ingresos y gastos
  const [generalRegister, setGeneralRegister] = useState({
    otherIncome: '',
    expense: '',
  });

  // Total de ingresos provenientes de las ventas del día
  const salesIncome = dailySales.reduce((total, sale) => total + sale.total, 0);

  // Convertimos los inputs a flotantes para cálculos intermedios
  const parsedOtherIncome = parseFloat(generalRegister.otherIncome || 0);
  const parsedExpense = parseFloat(generalRegister.expense || 0);
  const currentTotalIncome = salesIncome + parsedOtherIncome;

  const saveGeneralRegister = () => {
    if (currentTotalIncome <= 0 && parsedExpense <= 0) {
      Alert.alert(
        'Registro vacío',
        'No existen ingresos ni gastos para registrar.'
      );
      return;
    }

    const registerData = {
      id: Date.now(),
      salesIncome,
      otherIncome: parsedOtherIncome,
      totalIncome: currentTotalIncome,
      expense: parsedExpense,
      balance: currentTotalIncome - parsedExpense,
      date: new Date().toISOString(),
    };

    addGeneralMovement(registerData);
    console.log('REGISTRO GENERAL:', registerData);

    Toast.show({
      type: 'success',
      text1: 'Registro guardado',
    });

    setGeneralRegister({
      otherIncome: '',
      expense: '',
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {/* REGISTRO GENERAL */}
      <View style={styles.generalRegisterCard}>
        <Text style={styles.productsSectionTitle}>
          Registro General
        </Text>

        {/* INGRESOS POR VENTAS */}
        <Text style={styles.generalLabel}>Ingresos por ventas</Text>
        <View style={styles.readOnlyInput}>
          <Text style={styles.readOnlyValue}>
            ${salesIncome.toFixed(2)}
          </Text>
        </View>

        {/* OTROS INGRESOS */}
        <Text style={styles.generalLabel}>Otros ingresos</Text>
        <TextInput
          style={styles.generalInput}
          keyboardType="numeric"
          placeholder="$0.00"
          value={generalRegister.otherIncome}
          onChangeText={(text) =>
            setGeneralRegister((prev) => ({
              ...prev,
              otherIncome: text,
            }))
          }
        />

        {/* GASTOS */}
        <Text style={styles.generalLabel}>Gastos</Text>
        <TextInput
          style={styles.generalInput}
          keyboardType="numeric"
          placeholder="$0.00"
          value={generalRegister.expense}
          onChangeText={(text) =>
            setGeneralRegister((prev) => ({
              ...prev,
              expense: text,
            }))
          }
        />

        {/* TOTAL */}
        <Text style={styles.generalLabel}>Total de ingresos</Text>
        <View style={styles.readOnlyInput}>
          <Text style={styles.readOnlyValue}>
            ${currentTotalIncome.toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveGeneralRegister}
        >
          <Text style={styles.saveButtonText}>
            Guardar Registro
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default RegisterCount;