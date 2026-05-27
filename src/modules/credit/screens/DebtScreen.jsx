// =============================================================================
// MODIFICADO: 2026-05-26
// Propósito: Pantalla del módulo credit/fiado. Antes era solo lectura sobre
//            datos mock; ahora consume la API real y agrega flujos para:
//              - Crear cliente
//              - Registrar nuevo fiado (deuda)
//              - Registrar abono parcial o total
//            Mantiene el resumen "Total por Cobrar" y la lista de deudas
//            abiertas (pending/partial/overdue).
// =============================================================================
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import MainLayout from '../../../views/layouts/MainLayout';
import { useDebts } from '../hooks/useDebts';
import styles from '../styles/Debt.styles';

// Formato corto de fecha para listar deudas (YYYY-MM-DD -> DD/MM/YYYY)
const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso.slice(0, 10);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
};

const DebtScreen = () => {
  const {
    debts,
    customers,
    loading,
    error,
    totalReceivable,
    refresh,
    createCustomer,
    createDebt,
    registerPayment,
  } = useDebts();

  // --- Modales ---
  const [newDebtVisible, setNewDebtVisible] = useState(false);
  const [newCustomerVisible, setNewCustomerVisible] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);

  // Form: nueva deuda
  const [debtCustomerId, setDebtCustomerId] = useState(null);
  const [debtAmount, setDebtAmount] = useState('');
  const [debtDescription, setDebtDescription] = useState('');
  const [debtDueDate, setDebtDueDate] = useState('');

  // Form: nuevo cliente
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custNotes, setCustNotes] = useState('');

  // Form: abono
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('cash');
  const [payNotes, setPayNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // --- Handlers ---

  const resetDebtForm = () => {
    setDebtCustomerId(null);
    setDebtAmount('');
    setDebtDescription('');
    setDebtDueDate('');
  };

  const resetCustomerForm = () => {
    setCustName('');
    setCustPhone('');
    setCustNotes('');
  };

  const resetPaymentForm = () => {
    setSelectedDebt(null);
    setPayAmount('');
    setPayMethod('cash');
    setPayNotes('');
  };

  const handleCreateCustomer = async () => {
    if (!custName.trim()) {
      Alert.alert('Falta el nombre', 'El cliente debe tener un nombre.');
      return;
    }
    setSubmitting(true);
    try {
      const newC = await createCustomer({
        name: custName.trim(),
        phone: custPhone.trim(),
        notes: custNotes.trim(),
      });
      // Preselecciona el cliente recién creado en el modal de fiado
      setDebtCustomerId(newC.id);
      resetCustomerForm();
      setNewCustomerVisible(false);
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo crear el cliente');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateDebt = async () => {
    const amountNum = parseFloat(debtAmount);
    if (!debtCustomerId) {
      Alert.alert('Cliente requerido', 'Selecciona o crea un cliente.');
      return;
    }
    if (!amountNum || amountNum <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto mayor a 0.');
      return;
    }
    setSubmitting(true);
    try {
      await createDebt({
        customer_id: debtCustomerId,
        amount: amountNum,
        description: debtDescription.trim() || null,
        due_date: debtDueDate.trim() || null,
      });
      resetDebtForm();
      setNewDebtVisible(false);
      Alert.alert('Fiado registrado', `Se registró el fiado por $${amountNum.toFixed(2)}.`);
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo registrar el fiado');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterPayment = async () => {
    const amountNum = parseFloat(payAmount);
    if (!amountNum || amountNum <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto mayor a 0.');
      return;
    }
    if (amountNum > Number(selectedDebt.remaining_amount)) {
      Alert.alert(
        'Monto excede saldo',
        `El abono no puede ser mayor al saldo pendiente ($${Number(selectedDebt.remaining_amount).toFixed(2)}).`
      );
      return;
    }
    setSubmitting(true);
    try {
      const result = await registerPayment(selectedDebt.id, {
        amount: amountNum,
        method: payMethod,
        notes: payNotes.trim() || null,
      });
      resetPaymentForm();
      setPaymentVisible(false);
      const msg = result.debt_status === 'paid'
        ? 'Fiado saldado completamente.'
        : `Saldo restante: $${Number(result.remaining_amount).toFixed(2)}`;
      Alert.alert('Abono registrado', msg);
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo registrar el abono');
    } finally {
      setSubmitting(false);
    }
  };

  const openPaymentModal = (debt) => {
    setSelectedDebt(debt);
    setPayAmount('');
    setPayMethod('cash');
    setPayNotes('');
    setPaymentVisible(true);
  };

  // --- Render ---

  const renderDebtItem = ({ item }) => {
    const remaining = Number(item.remaining_amount);
    const isOverdue = item.status === 'overdue';
    return (
      <View style={styles.debtCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.customerName}>{item.customer_name}</Text>
          <Text style={styles.date}>
            Creado: {formatDate(item.created_at)}
            {item.due_date ? `  ·  Vence: ${formatDate(item.due_date)}` : ''}
          </Text>
          {item.description ? (
            <Text style={[styles.date, { marginTop: 2 }]} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
        </View>
        <View style={styles.amountContainer}>
          <Text style={[styles.amount, isOverdue && styles.overdueText]}>
            ${remaining.toFixed(2)}
          </Text>
          <TouchableOpacity
            style={styles.payButton}
            onPress={() => openPaymentModal(item)}
          >
            <Text style={styles.payButtonText}>Abonar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total por Cobrar</Text>
        <Text style={styles.summaryValue}>${totalReceivable.toFixed(2)}</Text>
      </View>

      <View style={localStyles.actionsRow}>
        <Text style={styles.sectionTitle}>Clientes con Saldo</Text>
        <TouchableOpacity
          style={localStyles.newBtn}
          onPress={() => setNewDebtVisible(true)}
        >
          <Text style={localStyles.newBtnText}>+ Nuevo fiado</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={localStyles.errorText}>{error}</Text> : null}

      <FlatList
        data={debts}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderDebtItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay cuentas pendientes.</Text>
        }
        onRefresh={refresh}
        refreshing={loading}
      />

      {/* ─── Modal: nuevo fiado ───────────────────────────────────────── */}
      <Modal visible={newDebtVisible} transparent animationType="fade">
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalCard}>
            <View style={localStyles.modalHeader}>
              <Text style={localStyles.modalTitle}>Nuevo fiado</Text>
              <TouchableOpacity onPress={() => setNewDebtVisible(false)}>
                <Text style={localStyles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 480 }}>
              <Text style={localStyles.label}>Cliente</Text>
              <View style={localStyles.customerList}>
                {customers.length === 0 ? (
                  <Text style={styles.emptyText}>Aún no hay clientes registrados.</Text>
                ) : (
                  customers.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        localStyles.customerItem,
                        debtCustomerId === c.id && localStyles.customerItemActive,
                      ]}
                      onPress={() => setDebtCustomerId(c.id)}
                    >
                      <Text
                        style={[
                          localStyles.customerItemText,
                          debtCustomerId === c.id && localStyles.customerItemTextActive,
                        ]}
                      >
                        {c.name}
                      </Text>
                      {c.phone ? (
                        <Text style={localStyles.customerItemSub}>{c.phone}</Text>
                      ) : null}
                    </TouchableOpacity>
                  ))
                )}
              </View>

              <TouchableOpacity
                style={localStyles.secondaryBtn}
                onPress={() => setNewCustomerVisible(true)}
              >
                <Text style={localStyles.secondaryBtnText}>+ Agregar cliente</Text>
              </TouchableOpacity>

              <Text style={localStyles.label}>Monto</Text>
              <TextInput
                style={localStyles.input}
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={debtAmount}
                onChangeText={setDebtAmount}
              />

              <Text style={localStyles.label}>Descripción (opcional)</Text>
              <TextInput
                style={[localStyles.input, { minHeight: 60 }]}
                placeholder="Concepto del fiado"
                multiline
                value={debtDescription}
                onChangeText={setDebtDescription}
              />

              <Text style={localStyles.label}>Fecha de vencimiento (opcional)</Text>
              <TextInput
                style={localStyles.input}
                placeholder="YYYY-MM-DD"
                value={debtDueDate}
                onChangeText={setDebtDueDate}
              />
            </ScrollView>

            <TouchableOpacity
              style={[localStyles.primaryBtn, submitting && localStyles.disabledBtn]}
              onPress={handleCreateDebt}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={localStyles.primaryBtnText}>Registrar fiado</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── Modal: nuevo cliente ─────────────────────────────────────── */}
      <Modal visible={newCustomerVisible} transparent animationType="fade">
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalCard}>
            <View style={localStyles.modalHeader}>
              <Text style={localStyles.modalTitle}>Nuevo cliente</Text>
              <TouchableOpacity onPress={() => setNewCustomerVisible(false)}>
                <Text style={localStyles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={localStyles.label}>Nombre</Text>
            <TextInput
              style={localStyles.input}
              placeholder="Nombre del cliente"
              value={custName}
              onChangeText={setCustName}
            />

            <Text style={localStyles.label}>Teléfono (opcional)</Text>
            <TextInput
              style={localStyles.input}
              placeholder="+58 ..."
              keyboardType="phone-pad"
              value={custPhone}
              onChangeText={setCustPhone}
            />

            <Text style={localStyles.label}>Notas (opcional)</Text>
            <TextInput
              style={[localStyles.input, { minHeight: 60 }]}
              placeholder="Información adicional"
              multiline
              value={custNotes}
              onChangeText={setCustNotes}
            />

            <TouchableOpacity
              style={[localStyles.primaryBtn, submitting && localStyles.disabledBtn]}
              onPress={handleCreateCustomer}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={localStyles.primaryBtnText}>Guardar cliente</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── Modal: registrar abono ───────────────────────────────────── */}
      <Modal visible={paymentVisible} transparent animationType="fade">
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalCard}>
            <View style={localStyles.modalHeader}>
              <Text style={localStyles.modalTitle}>Registrar abono</Text>
              <TouchableOpacity onPress={() => setPaymentVisible(false)}>
                <Text style={localStyles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedDebt && (
              <View style={localStyles.debtSummary}>
                <Text style={localStyles.debtSummaryCustomer}>{selectedDebt.customer_name}</Text>
                <Text style={localStyles.debtSummarySub}>
                  Saldo: ${Number(selectedDebt.remaining_amount).toFixed(2)}
                </Text>
              </View>
            )}

            <Text style={localStyles.label}>Monto del abono</Text>
            <TextInput
              style={localStyles.input}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={payAmount}
              onChangeText={setPayAmount}
            />

            <Text style={localStyles.label}>Método de pago</Text>
            <View style={localStyles.methodRow}>
              {[
                { key: 'cash', label: 'Efectivo' },
                { key: 'card', label: 'Tarjeta' },
                { key: 'transfer', label: 'Transferencia' },
              ].map((m) => (
                <TouchableOpacity
                  key={m.key}
                  style={[
                    localStyles.methodBtn,
                    payMethod === m.key && localStyles.methodBtnActive,
                  ]}
                  onPress={() => setPayMethod(m.key)}
                >
                  <Text
                    style={[
                      localStyles.methodBtnText,
                      payMethod === m.key && localStyles.methodBtnTextActive,
                    ]}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={localStyles.label}>Notas (opcional)</Text>
            <TextInput
              style={[localStyles.input, { minHeight: 50 }]}
              placeholder="Referencia, observaciones..."
              multiline
              value={payNotes}
              onChangeText={setPayNotes}
            />

            <TouchableOpacity
              style={[localStyles.primaryBtn, submitting && localStyles.disabledBtn]}
              onPress={handleRegisterPayment}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={localStyles.primaryBtnText}>Confirmar abono</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </MainLayout>
  );
};

export default DebtScreen;

// Estilos locales — modales y controles que no estaban en Debt.styles.js
const localStyles = StyleSheet.create({
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  newBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalClose: {
    fontSize: 18,
    color: '#64748b',
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1e293b',
  },
  customerList: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    maxHeight: 160,
    backgroundColor: '#f8fafc',
  },
  customerItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  customerItemActive: {
    backgroundColor: '#dbeafe',
  },
  customerItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  customerItemTextActive: {
    color: '#1d4ed8',
  },
  customerItemSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  secondaryBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginTop: 6,
  },
  secondaryBtnText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 13,
  },
  primaryBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  debtSummary: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  debtSummaryCustomer: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  debtSummarySub: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 6,
  },
  methodBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
  },
  methodBtnActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  methodBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  methodBtnTextActive: {
    color: '#fff',
  },
});
