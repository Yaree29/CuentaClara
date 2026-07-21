// =============================================================================
// CommissionsScreen.jsx
// -----------------------------------------------------------------------------
// Gestión: fija commission_type/commission_value por asistente.
// Reportes: comisión calculada por asistente en el período (ventas reales) +
// registro e historial de pagos (commission_payments) — pagar es una acción
// explícita del dueño, no automática.
// =============================================================================
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DashboardHeader from '../../dashboard/components/shared/DashboardHeader';
import colors from '../../../theme/colors';
import commissionsService from '../services/commissionsService';
import useCommissions from '../hooks/useCommissions';
import styles from '../styles/commissionsScreen.styles';

const money = (value) => `$${Number(value || 0).toFixed(2)}`;

const TYPE_OPTIONS = [
  { key: 'percentage', label: 'Porcentaje' },
  { key: 'fixed', label: 'Fija' },
];

const CommissionsScreen = () => {
  const { configs, report, payments, totalPaid, loading, period, refetch } = useCommissions();

  const [configModal, setConfigModal] = useState({ visible: false, assistant: null });
  const [configType, setConfigType] = useState('percentage');
  const [configValue, setConfigValue] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);
  const [configError, setConfigError] = useState(null);

  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentAssistantId, setPaymentAssistantId] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const openConfigModal = (assistant) => {
    setConfigModal({ visible: true, assistant });
    setConfigType(assistant.commission_type || 'percentage');
    setConfigValue(assistant.commission_value != null ? String(assistant.commission_value) : '');
    setConfigError(null);
  };

  const handleSaveConfig = async () => {
    const value = Number(configValue);
    if (!configValue || Number.isNaN(value) || value < 0) {
      setConfigError('Ingresa un valor válido.');
      return;
    }
    setSavingConfig(true);
    setConfigError(null);
    try {
      await commissionsService.setConfig(configModal.assistant.assistant_id, {
        commission_type: configType,
        commission_value: value,
      });
      setConfigModal({ visible: false, assistant: null });
      await refetch();
    } catch (error) {
      setConfigError(error?.message || 'No se pudo guardar la configuración.');
    } finally {
      setSavingConfig(false);
    }
  };

  const openPaymentModal = (assistantId) => {
    setPaymentAssistantId(assistantId);
    setPaymentAmount('');
    setPaymentError(null);
    setPaymentModal(true);
  };

  const handleRegisterPayment = async () => {
    const amount = Number(paymentAmount);
    if (!paymentAmount || Number.isNaN(amount) || amount <= 0) {
      setPaymentError('Ingresa un monto válido.');
      return;
    }
    setSavingPayment(true);
    setPaymentError(null);
    try {
      await commissionsService.registerPayment({
        assistant_id: paymentAssistantId,
        period_from: period.from,
        period_to: period.to,
        amount,
      });
      setPaymentModal(false);
      await refetch();
    } catch (error) {
      setPaymentError(error?.message || 'No se pudo registrar el pago.');
    } finally {
      setSavingPayment(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <DashboardHeader title="Comisiones" variant="default" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroKicker}>Comisiones</Text>
          <Text style={styles.heroTitle}>Configura y paga las comisiones de tu equipo.</Text>
          <Text style={styles.heroSubtitle}>Calculadas sobre las ventas reales del período actual.</Text>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 24, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <>
            {/* ============================ Gestión ============================ */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionKicker}>GESTIÓN</Text>
                <Text style={styles.sectionTitle}>Configuración por asistente</Text>
                <Text style={styles.sectionSubtitle}>Porcentaje sobre ventas o monto fijo.</Text>
              </View>

              {configs.length === 0 ? (
                <Text style={styles.emptyText}>No tienes asistentes registrados en Equipo.</Text>
              ) : (
                configs.map((c, index) => (
                  <View key={c.assistant_id} style={[styles.row, index === configs.length - 1 && styles.rowLast]}>
                    <View style={styles.rowLeft}>
                      <Text style={styles.rowName}>{c.name}</Text>
                      <Text style={styles.rowMeta}>
                        {c.commission_type
                          ? `${c.commission_type === 'percentage' ? 'Porcentaje' : 'Fija'}: ${
                              c.commission_type === 'percentage' ? `${c.commission_value}%` : money(c.commission_value)
                            }`
                          : 'No configurado'}
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.editButton} onPress={() => openConfigModal(c)}>
                      <Text style={styles.editButtonText}>Editar</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>

            {/* ============================ Reporte ============================ */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionKicker}>REPORTES</Text>
                <Text style={styles.sectionTitle}>Comisión del período</Text>
                <Text style={styles.sectionSubtitle}>{period.from} — {period.to}</Text>
              </View>

              {report.length === 0 ? (
                <Text style={styles.emptyText}>No hay datos para este período.</Text>
              ) : (
                report.map((r, index) => (
                  <View key={r.assistant_id} style={[styles.row, index === report.length - 1 && styles.rowLast]}>
                    <View style={styles.rowLeft}>
                      <Text style={styles.rowName}>{r.name}</Text>
                      <Text style={styles.rowMeta}>Ventas: {money(r.income)}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      {r.commission_amount !== null ? (
                        <Text style={styles.rowValue}>{money(r.commission_amount)}</Text>
                      ) : (
                        <Text style={styles.rowValueMuted}>No configurado</Text>
                      )}
                      <TouchableOpacity style={[styles.editButton, { marginTop: 6 }]} onPress={() => openPaymentModal(r.assistant_id)}>
                        <Text style={styles.editButtonText}>Registrar pago</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* ======================= Historial de pagos ======================= */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionKicker}>HISTORIAL</Text>
                <Text style={styles.sectionTitle}>Pagos de comisión</Text>
                <Text style={styles.sectionSubtitle}>Total pagado: {money(totalPaid)}</Text>
              </View>

              {payments.length === 0 ? (
                <Text style={styles.emptyText}>Aún no registras pagos de comisión.</Text>
              ) : (
                payments.map((p, index) => (
                  <View key={p.id} style={[styles.row, index === payments.length - 1 && styles.rowLast]}>
                    <View style={styles.rowLeft}>
                      <Text style={styles.rowName}>{p.assistant_name || 'Asistente eliminado'}</Text>
                      <Text style={styles.rowMeta}>{p.period_from} — {p.period_to}</Text>
                    </View>
                    <Text style={styles.rowValue}>{money(p.amount)}</Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* ==================== Modal: configurar comisión ==================== */}
      <Modal visible={configModal.visible} transparent animationType="fade" onRequestClose={() => setConfigModal({ visible: false, assistant: null })}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Comisión de {configModal.assistant?.name}</Text>
            <Text style={styles.modalSubtitle}>Elige el tipo y el valor de la comisión.</Text>

            <Text style={styles.fieldLabel}>Tipo</Text>
            <View style={styles.segmentedControl}>
              {TYPE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[styles.segmentButton, configType === option.key && styles.segmentButtonActive]}
                  onPress={() => setConfigType(option.key)}
                >
                  <Text style={[styles.segmentButtonText, configType === option.key && styles.segmentButtonTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>{configType === 'percentage' ? 'Porcentaje (%)' : 'Monto fijo'}</Text>
            <TextInput
              style={styles.textInput}
              value={configValue}
              onChangeText={setConfigValue}
              placeholder={configType === 'percentage' ? 'Ej. 10' : 'Ej. 50'}
              placeholderTextColor={colors.placeholder}
              keyboardType="numeric"
            />

            {configError && <Text style={styles.errorText}>{configError}</Text>}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setConfigModal({ visible: false, assistant: null })}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, savingConfig ? styles.modalButtonDisabled : styles.modalButtonPrimary]}
                onPress={handleSaveConfig}
                disabled={savingConfig}
              >
                {savingConfig ? (
                  <ActivityIndicator size="small" color={colors.textButton} />
                ) : (
                  <Text style={styles.modalButtonTextPrimary}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ==================== Modal: registrar pago ==================== */}
      <Modal visible={paymentModal} transparent animationType="fade" onRequestClose={() => setPaymentModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Registrar pago</Text>
            <Text style={styles.modalSubtitle}>Período {period.from} — {period.to}</Text>

            <Text style={styles.fieldLabel}>Monto pagado</Text>
            <TextInput
              style={styles.textInput}
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              placeholder="Ej. 50.00"
              placeholderTextColor={colors.placeholder}
              keyboardType="numeric"
            />

            {paymentError && <Text style={styles.errorText}>{paymentError}</Text>}

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonSecondary]} onPress={() => setPaymentModal(false)}>
                <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, savingPayment ? styles.modalButtonDisabled : styles.modalButtonPrimary]}
                onPress={handleRegisterPayment}
                disabled={savingPayment}
              >
                {savingPayment ? (
                  <ActivityIndicator size="small" color={colors.textButton} />
                ) : (
                  <Text style={styles.modalButtonTextPrimary}>Registrar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CommissionsScreen;
