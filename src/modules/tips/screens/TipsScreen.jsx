// =============================================================================
// TipsScreen.jsx
// -----------------------------------------------------------------------------
// Gestión: registrar propina (automática = divide entre asistentes activos
// del día; manual = montos por asistente que deben sumar el total).
// Reportes: total del período, historial y resumen mensual.
// =============================================================================
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DashboardHeader from '../../dashboard/components/shared/DashboardHeader';
import colors from '../../../theme/colors';
import tipsService from '../services/tipsService';
import assistantsService from '../../assistants/services/assistantsService';
import useTips from '../hooks/useTips';
import styles from '../styles/tipsScreen.styles';

const money = (value) => `$${Number(value || 0).toFixed(2)}`;
const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const DISTRIBUTION_OPTIONS = [
  { key: 'automatic', label: 'Automática' },
  { key: 'manual', label: 'Manual' },
];

const TipsScreen = () => {
  const { tips, summary, monthlySummary, loading, refetch } = useTips();

  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [distributionType, setDistributionType] = useState('automatic');
  const [activeAssistants, setActiveAssistants] = useState([]);
  const [manualAmounts, setManualAmounts] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (modalVisible) {
      assistantsService.getActiveAssistants().then((data) => {
        setActiveAssistants(Array.isArray(data) ? data : []);
      }).catch(() => setActiveAssistants([]));
    }
  }, [modalVisible]);

  const openModal = () => {
    setAmount('');
    setDistributionType('automatic');
    setManualAmounts({});
    setError(null);
    setModalVisible(true);
  };

  const manualTotal = Object.values(manualAmounts).reduce((sum, v) => sum + (Number(v) || 0), 0);

  const handleRegister = async () => {
    const parsedAmount = Number(amount);
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Ingresa un monto válido.');
      return;
    }

    let payload = { amount: parsedAmount, distribution_type: distributionType };

    if (distributionType === 'manual') {
      const distributions = activeAssistants
        .map((a) => ({ assistant_id: a.id, amount: Number(manualAmounts[a.id]) || 0 }))
        .filter((d) => d.amount > 0);

      if (distributions.length === 0) {
        setError('Asigna al menos un monto a un asistente.');
        return;
      }
      const sum = distributions.reduce((s, d) => s + d.amount, 0);
      if (Math.abs(sum - parsedAmount) > 0.009) {
        setError(`La suma de los montos (${money(sum)}) debe ser igual al total (${money(parsedAmount)}).`);
        return;
      }
      payload.distributions = distributions;
    }

    setSaving(true);
    setError(null);
    try {
      await tipsService.createTip(payload);
      setModalVisible(false);
      await refetch();
    } catch (err) {
      setError(err?.message || 'No se pudo registrar la propina.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <DashboardHeader title="Propinas" variant="default" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroKicker}>Propinas</Text>
          <Text style={styles.heroTitle}>Registra y distribuye las propinas de tu equipo.</Text>
          <Text style={styles.heroSubtitle}>Distribución automática o manual entre tus asistentes activos.</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total este mes</Text>
            <Text style={styles.summaryValue}>{money(summary.total)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Registros</Text>
            <Text style={styles.summaryValue}>{summary.count}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={openModal}>
          <Text style={styles.addButtonText}>+ Registrar propina</Text>
        </TouchableOpacity>

        {loading ? (
          <View style={{ paddingVertical: 24, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionKicker}>HISTORIAL</Text>
                <Text style={styles.sectionTitle}>Propinas registradas</Text>
              </View>

              {tips.length === 0 ? (
                <Text style={styles.emptyText}>Aún no registras propinas.</Text>
              ) : (
                tips.map((t, index) => (
                  <View key={t.id} style={[styles.row, index === tips.length - 1 && styles.rowLast]}>
                    <View style={styles.rowTopLine}>
                      <Text style={styles.rowDate}>
                        {new Date(t.created_at).toLocaleDateString()} · {t.distribution_type === 'automatic' ? 'Automática' : 'Manual'}
                      </Text>
                      <Text style={styles.rowAmount}>{money(t.amount)}</Text>
                    </View>
                    <Text style={styles.rowDistribution}>
                      {t.distributions.map((d) => `${d.assistant_name || 'N/A'}: ${money(d.amount)}`).join(' · ')}
                    </Text>
                  </View>
                ))
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionKicker}>REPORTES</Text>
                <Text style={styles.sectionTitle}>Resumen mensual</Text>
              </View>
              {monthlySummary.map((m) => (
                <View key={m.month} style={styles.monthRow}>
                  <Text style={styles.monthLabel}>{MONTH_NAMES[m.month - 1]}</Text>
                  <Text style={styles.monthValue}>{money(m.total)} · {m.count} registros</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Registrar propina</Text>
              <Text style={styles.modalSubtitle}>Ingresa el monto total y cómo distribuirlo.</Text>

              <Text style={styles.fieldLabel}>Monto total</Text>
              <TextInput
                style={styles.textInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="Ej. 20.00"
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
              />

              <Text style={styles.fieldLabel}>Distribución</Text>
              <View style={styles.segmentedControl}>
                {DISTRIBUTION_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[styles.segmentButton, distributionType === option.key && styles.segmentButtonActive]}
                    onPress={() => setDistributionType(option.key)}
                  >
                    <Text style={[styles.segmentButtonText, distributionType === option.key && styles.segmentButtonTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {distributionType === 'manual' && (
                <>
                  {activeAssistants.length === 0 ? (
                    <Text style={styles.emptyText}>No tienes asistentes activos.</Text>
                  ) : (
                    activeAssistants.map((a) => (
                      <View key={a.id} style={styles.manualRow}>
                        <Text style={styles.manualName}>{a.name}</Text>
                        <TextInput
                          style={styles.manualInput}
                          value={manualAmounts[a.id] || ''}
                          onChangeText={(v) => setManualAmounts((prev) => ({ ...prev, [a.id]: v }))}
                          placeholder="0.00"
                          placeholderTextColor={colors.placeholder}
                          keyboardType="numeric"
                        />
                      </View>
                    ))
                  )}
                  <Text style={styles.manualTotal}>Asignado: {money(manualTotal)}</Text>
                </>
              )}

              {error && <Text style={styles.errorText}>{error}</Text>}

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalButton, styles.modalButtonSecondary]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, saving ? styles.modalButtonDisabled : styles.modalButtonPrimary]}
                  onPress={handleRegister}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={colors.textButton} />
                  ) : (
                    <Text style={styles.modalButtonTextPrimary}>Registrar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default TipsScreen;
