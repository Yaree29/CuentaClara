// =============================================================================
// RegisterCount.jsx
// ------------------
// "Cierre Diario" real: Abrir Caja (monto inicial) → operar el día
// registrando gastos reales vinculados a la sesión → Cerrar Caja (monto
// contado, diferencia contra lo esperado calculado en backend a partir de
// ventas en efectivo reales y gastos reales de la sesión).
//
// Reemplaza el formulario anterior (ingresos por ventas + "otros ingresos"
// manuales + gastos, todo solo en memoria vía useSaleStore). "Otros
// ingresos" no existe en este flujo — no hay tabla real para esa cifra (ver
// auditoría), así que no se inventa ni se muestra.
// =============================================================================
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import styles from './styles/closeDay.style';
import colors from '../../../../theme/colors';
import cashService from '../../services/cashService';
import expensesService from '../../services/expensesService';

const money = (value) => `$${(Number(value) || 0).toFixed(2)}`;

const RegisterCount = () => {
  const [loading, setLoading] = useState(true);
  const [sessionStatus, setSessionStatus] = useState(null);
  const [sessionExpenses, setSessionExpenses] = useState([]);

  const [openingAmount, setOpeningAmount] = useState('');
  const [openingSession, setOpeningSession] = useState(false);

  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [savingExpense, setSavingExpense] = useState(false);

  const [closeModalVisible, setCloseModalVisible] = useState(false);
  const [countedAmount, setCountedAmount] = useState('');
  const [closingSession, setClosingSession] = useState(false);
  const [closeResult, setCloseResult] = useState(null);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const status = await cashService.getSessionStatus();
      setSessionStatus(status);

      if (status?.is_open && status?.session?.id) {
        const list = await expensesService
          .getExpenses({ cashSessionId: status.session.id })
          .catch(() => []);
        setSessionExpenses(Array.isArray(list) ? list : []);
      } else {
        setSessionExpenses([]);
      }
    } catch (error) {
      console.error('Error cargando estado de caja:', error);
      Toast.show({
        type: 'error',
        text1: 'No se pudo cargar el estado de caja',
        text2: error?.message || 'Intenta de nuevo.',
      });
      setSessionStatus({ is_open: false, session: null });
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStatus();
    }, [loadStatus])
  );

  const handleOpenSession = async () => {
    const amount = Number(openingAmount);
    if (openingAmount.trim() === '' || Number.isNaN(amount) || amount < 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto inicial válido (0 o mayor).');
      return;
    }

    setOpeningSession(true);
    try {
      await cashService.openSession(amount);
      setOpeningAmount('');
      await loadStatus();
      Toast.show({ type: 'success', text1: 'Caja abierta' });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo abrir la caja',
        text2: error?.message || 'Intenta de nuevo.',
      });
    } finally {
      setOpeningSession(false);
    }
  };

  const handleRegisterExpense = async () => {
    const amount = Number(expenseAmount);
    if (!expenseAmount || Number.isNaN(amount) || amount <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto de gasto mayor a 0.');
      return;
    }

    setSavingExpense(true);
    try {
      await expensesService.createExpense({
        amount,
        description: expenseDescription.trim() || null,
        cashSessionId: sessionStatus?.session?.id,
      });
      setExpenseAmount('');
      setExpenseDescription('');
      await loadStatus();
      Toast.show({ type: 'success', text1: 'Gasto registrado' });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo registrar el gasto',
        text2: error?.message || 'Intenta de nuevo.',
      });
    } finally {
      setSavingExpense(false);
    }
  };

  const openCloseModal = () => {
    setCountedAmount('');
    setCloseResult(null);
    setCloseModalVisible(true);
  };

  const handleConfirmClose = async () => {
    const amount = Number(countedAmount);
    if (countedAmount.trim() === '' || Number.isNaN(amount) || amount < 0) {
      Alert.alert('Monto inválido', 'Ingresa el monto contado físicamente.');
      return;
    }

    setClosingSession(true);
    try {
      const result = await cashService.closeSession(amount);
      setCloseResult(result);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo cerrar la caja',
        text2: error?.message || 'Intenta de nuevo.',
      });
    } finally {
      setClosingSession(false);
    }
  };

  const handleFinishClose = async () => {
    setCloseModalVisible(false);
    setCloseResult(null);
    await loadStatus();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // ─── Sin caja abierta: pantalla "Abrir Caja" ─────────────────────────────
  if (!sessionStatus?.is_open) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.generalRegisterCard}>
          <Text style={styles.productsSectionTitle}>Abrir Caja</Text>

          <Text style={styles.generalLabel}>Monto inicial en caja</Text>
          <TextInput
            style={styles.generalInput}
            keyboardType="numeric"
            placeholder="$0.00"
            value={openingAmount}
            onChangeText={setOpeningAmount}
          />

          <TouchableOpacity
            style={[styles.saveButton, openingSession && { opacity: 0.6 }]}
            onPress={handleOpenSession}
            disabled={openingSession}
          >
            {openingSession ? (
              <ActivityIndicator color={colors.textButton} />
            ) : (
              <Text style={styles.saveButtonText}>Abrir Caja</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // ─── Caja abierta: operar el día + cerrar ────────────────────────────────
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.sessionCard}>
        <Text style={styles.productsSectionTitle}>Caja abierta</Text>

        <View style={styles.sessionRow}>
          <Text style={styles.sessionLabel}>Monto de apertura</Text>
          <Text style={styles.sessionValue}>{money(sessionStatus.opening_amount)}</Text>
        </View>
        <View style={styles.sessionRow}>
          <Text style={styles.sessionLabel}>Ventas en efectivo</Text>
          <Text style={styles.sessionValue}>{money(sessionStatus.cash_income)}</Text>
        </View>
        <View style={styles.sessionRow}>
          <Text style={styles.sessionLabel}>Gastos registrados</Text>
          <Text style={styles.sessionValue}>{money(sessionStatus.expenses)}</Text>
        </View>
        <View style={[styles.sessionRow, styles.sessionRowLast]}>
          <Text style={styles.sessionLabel}>Esperado en caja ahora</Text>
          <Text style={styles.sessionValue}>{money(sessionStatus.expected_amount)}</Text>
        </View>
      </View>

      <View style={styles.generalRegisterCard}>
        <Text style={styles.productsSectionTitle}>Registrar Gasto</Text>

        <Text style={styles.generalLabel}>Monto</Text>
        <TextInput
          style={styles.generalInput}
          keyboardType="numeric"
          placeholder="$0.00"
          value={expenseAmount}
          onChangeText={setExpenseAmount}
        />

        <Text style={styles.generalLabel}>Descripción (opcional)</Text>
        <TextInput
          style={styles.generalInput}
          placeholder="Ej. Compra de bolsas"
          value={expenseDescription}
          onChangeText={setExpenseDescription}
        />

        <TouchableOpacity
          style={[styles.saveButton, savingExpense && { opacity: 0.6 }]}
          onPress={handleRegisterExpense}
          disabled={savingExpense}
        >
          {savingExpense ? (
            <ActivityIndicator color={colors.textButton} />
          ) : (
            <Text style={styles.saveButtonText}>Registrar Gasto</Text>
          )}
        </TouchableOpacity>

        {sessionExpenses.length === 0 ? (
          <Text style={styles.emptyText}>Sin gastos registrados en esta sesión.</Text>
        ) : (
          sessionExpenses.map((expense, index) => (
            <View
              key={expense.id}
              style={[
                styles.expenseItem,
                index === sessionExpenses.length - 1 && styles.expenseItemLast,
              ]}
            >
              <Text style={styles.expenseItemDescription} numberOfLines={1}>
                {expense.description || 'Gasto sin descripción'}
              </Text>
              <Text style={styles.expenseItemAmount}>-{money(expense.amount)}</Text>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={openCloseModal}>
        <Text style={styles.saveButtonText}>Cerrar Caja</Text>
      </TouchableOpacity>

      <Modal
        visible={closeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCloseModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {!closeResult ? (
              <>
                <Text style={styles.modalTitle}>Cerrar Caja</Text>
                <Text style={styles.modalSubtitle}>
                  Cuenta el efectivo físico en caja e ingresa el monto exacto.
                </Text>

                <Text style={styles.generalLabel}>Monto contado</Text>
                <TextInput
                  style={styles.generalInput}
                  keyboardType="numeric"
                  placeholder="$0.00"
                  value={countedAmount}
                  onChangeText={setCountedAmount}
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => setCloseModalVisible(false)}
                  >
                    <Text style={styles.secondaryButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveButton, { flex: 1, marginTop: 0 }]}
                    onPress={handleConfirmClose}
                    disabled={closingSession}
                  >
                    {closingSession ? (
                      <ActivityIndicator color={colors.textButton} />
                    ) : (
                      <Text style={styles.saveButtonText}>Confirmar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Caja cerrada</Text>
                <Text style={styles.modalSubtitle}>Resultado del arqueo:</Text>

                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Esperado</Text>
                  <Text style={styles.resultValue}>{money(closeResult.expected_amount)}</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Contado</Text>
                  <Text style={styles.resultValue}>{money(closeResult.counted_amount)}</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Diferencia</Text>
                  <Text
                    style={[
                      styles.resultValue,
                      closeResult.difference >= 0
                        ? styles.differenceValuePositive
                        : styles.differenceValueNegative,
                    ]}
                  >
                    {closeResult.difference >= 0 ? '+' : ''}
                    {money(closeResult.difference)}
                  </Text>
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleFinishClose}>
                  <Text style={styles.saveButtonText}>Listo</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default RegisterCount;
