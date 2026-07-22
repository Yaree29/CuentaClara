// =============================================================================
// CashRegisterScreen.jsx (antes RegisterCount.jsx — nombre corregido: este
// archivo siempre fue el cierre de caja real, no un "conteo de registro";
// AccountingScreen.jsx era en realidad el historial, ver SalesHistoryScreen.jsx)
// -----------------------------------------------------------------------------
// "Cierre Diario" real: Abrir Caja (monto inicial, solo dentro del horario
// configurado) → operar el día registrando gastos reales vinculados a la
// sesión → Cerrar Caja (solo disponible al llegar la hora de cierre, o de
// inmediato si no hay horario configurado), con un paso previo opcional de
// "¿gasto pendiente?" antes del monto contado. No existe opción de extender
// el horario de cierre: al llegar la hora, las ventas se bloquean sin
// excepción (ver SalesSection.jsx) y "Cerrar Caja" queda disponible aquí —
// el dueño lo confirma manualmente cuando esté listo, sin ningún aviso
// automático de por medio.
//
// El estado de la caja (cashStatus) y sus acciones vienen del hook
// useCashSession(), compartido con el resto de Ventas PYME y montado una
// sola vez en el shell (salesPyme.jsx).
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

import styles from './styles/cashRegister.style';
import colors from '../../../../theme/colors';
import cashService from '../../services/cashService';
import expensesService from '../../services/expensesService';

const money = (value) => `$${(Number(value) || 0).toFixed(2)}`;

const CashRegisterScreen = ({ cashStatus, loadingCash, openSession, closeSession, registerExpense }) => {
  const [sessionExpenses, setSessionExpenses] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);

  const [openingAmount, setOpeningAmount] = useState('');
  const [openingSession, setOpeningSession] = useState(false);

  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [savingExpense, setSavingExpense] = useState(false);

  const [closeModalVisible, setCloseModalVisible] = useState(false);
  const [closeStep, setCloseStep] = useState('expense'); // 'expense' | 'counted' | 'result'
  const [closeExpenseAmount, setCloseExpenseAmount] = useState('');
  const [closeExpenseDescription, setCloseExpenseDescription] = useState('');
  const [countedAmount, setCountedAmount] = useState('');
  const [closingSession, setClosingSession] = useState(false);
  const [closeResult, setCloseResult] = useState(null);

  const sessionId = cashStatus?.session?.id ?? null;

  const loadExpenses = useCallback(async () => {
    if (!sessionId) {
      setSessionExpenses([]);
      return;
    }
    const list = await expensesService.getExpenses({ cashSessionId: sessionId }).catch(() => []);
    setSessionExpenses(Array.isArray(list) ? list : []);
  }, [sessionId]);

  const loadPastSessions = useCallback(async () => {
    const list = await cashService.getSessions(5).catch(() => []);
    setPastSessions(Array.isArray(list) ? list.filter((s) => s.status === 'closed') : []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
      loadPastSessions();
    }, [loadExpenses, loadPastSessions])
  );

  const handleOpenSession = async () => {
    const amount = Number(openingAmount);
    if (openingAmount.trim() === '' || Number.isNaN(amount) || amount < 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto inicial válido (0 o mayor).');
      return;
    }

    setOpeningSession(true);
    try {
      await openSession(amount);
      setOpeningAmount('');
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
      await registerExpense({ amount, description: expenseDescription.trim() || null });
      setExpenseAmount('');
      setExpenseDescription('');
      await loadExpenses();
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
    setCloseStep('expense');
    setCloseExpenseAmount('');
    setCloseExpenseDescription('');
    setCountedAmount('');
    setCloseResult(null);
    setCloseModalVisible(true);
  };

  const handleContinueFromExpenseStep = async () => {
    const amount = Number(closeExpenseAmount);
    if (closeExpenseAmount.trim() !== '' && !Number.isNaN(amount) && amount > 0) {
      try {
        await registerExpense({ amount, description: closeExpenseDescription.trim() || null });
        await loadExpenses();
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'No se pudo registrar el gasto',
          text2: error?.message || 'Intenta de nuevo.',
        });
        return;
      }
    }
    setCloseStep('counted');
  };

  const handleConfirmClose = async () => {
    const amount = Number(countedAmount);
    if (countedAmount.trim() === '' || Number.isNaN(amount) || amount < 0) {
      Alert.alert('Monto inválido', 'Ingresa el monto contado físicamente.');
      return;
    }

    setClosingSession(true);
    try {
      const result = await closeSession(amount);
      setCloseResult(result);
      setCloseStep('result');
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

  const handleFinishClose = () => {
    setCloseModalVisible(false);
    setCloseResult(null);
  };

  if (loadingCash) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // ─── Sin caja abierta: pantalla "Abrir Caja" ─────────────────────────────
  if (!cashStatus?.is_open) {
    const canOpen = cashStatus?.can_open ?? true;
    const schedule = cashStatus?.schedule;

    return (
      <ScrollView style={styles.scrollFlex} contentContainerStyle={styles.content}>
        <View style={styles.generalRegisterCard}>
          <Text style={styles.productsSectionTitle}>Abrir Caja</Text>

          {schedule && !canOpen && (
            <View style={styles.scheduleNotice}>
              <Text style={styles.scheduleNoticeText}>
                Fuera de horario de ventas. El negocio abre a las {schedule.opening_time}.
              </Text>
            </View>
          )}

          <Text style={styles.generalLabel}>Monto inicial en caja</Text>
          <TextInput
            style={styles.generalInput}
            keyboardType="numeric"
            placeholder="$0.00"
            value={openingAmount}
            onChangeText={setOpeningAmount}
            editable={canOpen}
          />

          <TouchableOpacity
            style={[styles.saveButton, (openingSession || !canOpen) && { opacity: 0.6 }]}
            onPress={handleOpenSession}
            disabled={openingSession || !canOpen}
          >
            {openingSession ? (
              <ActivityIndicator color={colors.textButton} />
            ) : (
              <Text style={styles.saveButtonText}>Abrir Caja</Text>
            )}
          </TouchableOpacity>
        </View>

        {pastSessions.length > 0 && (
          <View style={[styles.generalRegisterCard, styles.historySection]}>
            <Text style={styles.productsSectionTitle}>Cajas anteriores</Text>
            {pastSessions.map((session, index) => {
              const diff = Number(session.closing_amount ?? 0) - Number(session.opening_amount ?? 0);
              return (
                <View
                  key={session.id}
                  style={[styles.historyItem, index === pastSessions.length - 1 && styles.historyItemLast]}
                >
                  <View>
                    <Text style={styles.historyItemDate}>
                      {new Date(session.opened_at).toLocaleDateString('es-PA')}
                    </Text>
                    <Text style={styles.historyItemAmounts}>
                      Apertura {money(session.opening_amount)} · Cierre {money(session.closing_amount)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    );
  }

  // ─── Caja abierta: operar el día + cerrar ────────────────────────────────
  const canClose = cashStatus?.can_close ?? false;
  const schedule = cashStatus?.schedule;

  return (
    <ScrollView style={styles.scrollFlex} contentContainerStyle={styles.content}>
      <View style={styles.sessionCard}>
        <Text style={styles.productsSectionTitle}>Caja abierta</Text>

        <View style={styles.sessionRow}>
          <Text style={styles.sessionLabel}>Monto de apertura</Text>
          <Text style={styles.sessionValue}>{money(cashStatus.opening_amount)}</Text>
        </View>
        <View style={styles.sessionRow}>
          <Text style={styles.sessionLabel}>Ventas en efectivo</Text>
          <Text style={styles.sessionValue}>{money(cashStatus.cash_income)}</Text>
        </View>
        <View style={styles.sessionRow}>
          <Text style={styles.sessionLabel}>Gastos registrados</Text>
          <Text style={styles.sessionValue}>{money(cashStatus.expenses)}</Text>
        </View>
        <View style={[styles.sessionRow, styles.sessionRowLast]}>
          <Text style={styles.sessionLabel}>Esperado en caja ahora</Text>
          <Text style={styles.sessionValue}>{money(cashStatus.expected_amount)}</Text>
        </View>

        {schedule && !canClose && (
          <View style={styles.scheduleNotice}>
            <Text style={styles.scheduleNoticeText}>
              La caja se podrá cerrar a partir de las {schedule.closing_time}.
            </Text>
          </View>
        )}
        {schedule && canClose && (
          <View style={styles.scheduleNotice}>
            <Text style={styles.scheduleNoticeText}>
              Llegó la hora de cierre ({schedule.closing_time}). Ya no se pueden registrar ventas — cierra la caja cuando estés listo.
            </Text>
          </View>
        )}
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

      {canClose && (
        <TouchableOpacity style={styles.saveButton} onPress={openCloseModal}>
          <Text style={styles.saveButtonText}>Cerrar Caja</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={closeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCloseModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {closeStep === 'expense' && (
              <>
                <Text style={styles.modalTitle}>Antes de cerrar</Text>
                <Text style={styles.modalSubtitle}>
                  ¿Hubo algún gasto pendiente de registrar hoy? Es opcional.
                </Text>

                <Text style={styles.generalLabel}>Monto</Text>
                <TextInput
                  style={styles.generalInput}
                  keyboardType="numeric"
                  placeholder="$0.00"
                  value={closeExpenseAmount}
                  onChangeText={setCloseExpenseAmount}
                />

                <Text style={styles.generalLabel}>Descripción (opcional)</Text>
                <TextInput
                  style={styles.generalInput}
                  placeholder="Ej. Compra de bolsas"
                  value={closeExpenseDescription}
                  onChangeText={setCloseExpenseDescription}
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
                    onPress={handleContinueFromExpenseStep}
                  >
                    <Text style={styles.saveButtonText}>Continuar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {closeStep === 'counted' && (
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
            )}

            {closeStep === 'result' && closeResult && (
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

export default CashRegisterScreen;
