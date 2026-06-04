import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Modal, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const G = '#00A86B';
const N = '#002366';
const DEMO_TOKEN = '482931';
const INTERVAL = 30;

const ACTIONS = {
  generic: {
    title: 'Activar autenticacion',
    detail: 'Configura un Soft Token para proteger acciones sensibles.',
    role: 'Dueno del negocio',
    needsOwnerApproval: false,
    critical: false,
  },
  delete_sale: {
    title: 'Borrar venta sensible',
    detail: 'Un asistente intenta borrar una venta que afecta datos delicados.',
    role: 'Asistente',
    needsOwnerApproval: true,
    critical: false,
  },
  delete_assistant: {
    title: 'Eliminar asistente',
    detail: 'El dueno quiere eliminar a un asistente o sus datos.',
    role: 'Dueno del negocio',
    needsOwnerApproval: false,
    critical: false,
  },
  delete_service: {
    title: 'Borrar servicio sensible',
    detail: 'Un asistente intenta borrar un servicio que afecta datos delicados del reporte.',
    role: 'Asistente',
    needsOwnerApproval: true,
    critical: false,
  },
  delete_account: {
    title: 'Borrar cuenta',
    detail: 'Esta accion eliminara la cuenta y datos importantes del sistema.',
    role: 'Dueno del negocio',
    needsOwnerApproval: false,
    critical: true,
  },
};

const generateToken = () => String(Math.floor(100000 + Math.random() * 900000));
const emptyDigits = () => ['', '', '', '', '', ''];

export default function Token2FA({ navigation, route }) {
  const initialType = route?.params?.actionType || 'generic';
  const initialAction = ACTIONS[initialType] || ACTIONS.generic;

  const [actionType, setActionType] = useState(initialType);
  const [token, setToken] = useState(DEMO_TOKEN);
  const [countdown, setCountdown] = useState(INTERVAL);
  const [digits, setDigits] = useState(emptyDigits());
  const [confirmText, setConfirmText] = useState('');
  const [ownerApproved, setOwnerApproved] = useState(!initialAction.needsOwnerApproval);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authDigits, setAuthDigits] = useState(emptyDigits());
  const [authError, setAuthError] = useState('');
  const [modeModal, setModeModal] = useState(false);
  const digitRefs = useRef([]);
  const authDigitRefs = useRef([]);

  const actionBase = ACTIONS[actionType] || ACTIONS.generic;
  const action = {
    ...actionBase,
    title: route?.params?.actionLabel || actionBase.title,
    detail: route?.params?.targetName
      ? `${actionBase.detail} Objetivo: ${route.params.targetName}.`
      : actionBase.detail,
  };
  const enteredCode = digits.join('');
  const authCode = authDigits.join('');
  const isComplete = enteredCode.length === 6;
  const authComplete = authCode.length === 6;
  const progressPct = (countdown / INTERVAL) * 100;

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          setToken(generateToken());
          return INTERVAL;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (authModalOpen) {
      setTimeout(() => authDigitRefs.current[0]?.focus(), 250);
    }
  }, [authModalOpen]);

  const handleDigit = (text, idx, setter, currentDigits, refs) => {
    const clean = text.replace(/\D/g, '');
    const next = [...currentDigits];

    if (clean.length > 1) {
      clean.slice(0, 6 - idx).split('').forEach((digit, offset) => {
        next[idx + offset] = digit;
      });
      const nextIndex = Math.min(idx + clean.length, 5);
      setter(next);
      refs.current[nextIndex]?.focus();
      setError('');
      setAuthError('');
      return;
    }

    next[idx] = clean;
    setter(next);
    if (clean && idx < 5) {
      refs.current[idx + 1]?.focus();
    }
    setError('');
    setAuthError('');
  };

  const handleBackspace = (idx, setter, currentDigits, refs) => {
    const next = [...currentDigits];

    if (next[idx]) {
      next[idx] = '';
      setter(next);
      if (idx > 0) {
        refs.current[idx - 1]?.focus();
      }
      return;
    }

    if (idx > 0) {
      next[idx - 1] = '';
      setter(next);
      refs.current[idx - 1]?.focus();
    }
  };

  const resetAction = (type) => {
    const nextAction = ACTIONS[type] || ACTIONS.generic;
    setActionType(type);
    setOwnerApproved(!nextAction.needsOwnerApproval);
    setDigits(emptyDigits());
    setConfirmText('');
    setError('');
    setModeModal(false);
  };

  const handleVerify = async () => {
    if (action.needsOwnerApproval && !ownerApproved) {
      setError('Esta accion necesita aprobacion del dueno del negocio.');
      return;
    }

    if (!isComplete) {
      setError('Ingresa los 6 digitos del Soft Token.');
      return;
    }

    if (action.critical && confirmText.toLowerCase() !== 'eliminar') {
      setError('Escribe "eliminar" exactamente para continuar.');
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (enteredCode !== DEMO_TOKEN && enteredCode !== token) {
      setLoading(false);
      setError(`Token incorrecto. Demo: usa ${DEMO_TOKEN}`);
      setDigits(emptyDigits());
      return;
    }

    setLoading(false);

    if (actionType === 'delete_service') {
      Alert.alert(
        'Confirmar borrado',
        `La accion fue autorizada. Deseas borrar "${route?.params?.targetName}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Borrar',
            style: 'destructive',
            onPress: () => navigation.navigate('Main', {
              screen: route?.params?.returnScreen || 'Reportes',
              params: { authorizedDeleteServiceId: route?.params?.targetId },
            }),
          },
        ],
      );
      return;
    }

    Alert.alert('Accion autorizada', `"${action.title}" confirmada correctamente.`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const handleAuthenticatorConfirm = () => {
    if (!authComplete) {
      setAuthError('Ingresa el codigo de 6 digitos proveido por la app.');
      return;
    }

    setAuthModalOpen(false);
    setAuthDigits(emptyDigits());
    Alert.alert('Conectado', 'App de autenticacion conectado correctamente.', [
      { text: 'OK', onPress: () => navigation.navigate('Main', { screen: 'Perfil' }) },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
      >
      <TouchableOpacity style={s.demoBtn} onPress={() => setModeModal(true)}>
        <Ionicons name="settings-outline" size={14} color="#fff" />
        <Text style={s.demoBtnText}>Demo: cambiar accion</Text>
      </TouchableOpacity>

      <View style={s.iconWrap}>
        <Ionicons name="shield-checkmark-outline" size={48} color={G} />
      </View>

      <Text style={s.title}>Verification de Seguridad</Text>
      <Text style={s.subtitle}>{action.detail}</Text>

      <View style={s.contextCard}>
        <View style={s.contextRow}>
          <Text style={s.contextLabel}>Accion</Text>
          <Text style={s.contextValue}>{action.title}</Text>
        </View>
        <View style={s.contextRow}>
          <Text style={s.contextLabel}>Solicita</Text>
          <Text style={s.contextValue}>{action.role}</Text>
        </View>
      </View>

      {action.needsOwnerApproval && (
        <View style={s.approvalCard}>
          <View style={{ flex: 1 }}>
            <Text style={s.approvalTitle}>Aprobacion del dueno requerida</Text>
            <Text style={s.approvalText}>Se notifico al dueno para autorizar esta accion delicada.</Text>
          </View>
          <TouchableOpacity
            style={[s.approvalBtn, ownerApproved && s.approvalBtnDone]}
            onPress={() => setOwnerApproved(true)}
          >
            <Text style={s.approvalBtnText}>{ownerApproved ? 'Aprobado' : 'Aprobar'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={s.tokenCard}>
        <View style={s.tokenTopRow}>
          <Text style={s.tokenLabel}>Soft Token</Text>
          <Text style={s.countdown}>{countdown}s</Text>
        </View>
        <Text style={s.tokenCode}>{token.slice(0, 3)} {token.slice(3)}</Text>
        <View style={s.progressBg}>
          <View style={[s.progressFill, { width: `${progressPct}%` }]} />
        </View>
        <Text style={s.tokenHint}>Cambia cada {INTERVAL} segundos</Text>
      </View>

      <Text style={s.inputLabel}>Ingresa el codigo de 6 digitos</Text>
      <View style={s.digitRow}>
        {digits.map((digit, index) => (
          <TextInput
            key={index}
            ref={(input) => { digitRefs.current[index] = input; }}
            style={[s.digitBox, digit && s.digitFilled, error && s.digitError]}
            value={digit}
            onChangeText={(text) => handleDigit(text, index, setDigits, digits, digitRefs)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Backspace') {
                handleBackspace(index, setDigits, digits, digitRefs);
              }
            }}
            keyboardType="number-pad"
            maxLength={6}
            selectTextOnFocus
          />
        ))}
      </View>

      {action.critical && (
        <View style={s.criticalBox}>
          <Text style={s.criticalText}>
            Para confirmar esta accion critica, escribe <Text style={{ fontWeight: '800' }}>eliminar</Text>.
          </Text>
          <TextInput
            style={[s.criticalInput, confirmText.toLowerCase() === 'eliminar' && { borderColor: G }]}
            placeholder="eliminar"
            value={confirmText}
            onChangeText={setConfirmText}
            autoCapitalize="none"
          />
        </View>
      )}

      {error ? (
        <View style={s.errorBanner}>
          <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
          <Text style={s.errorText}>{error}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[s.verifyBtn, (!isComplete || loading) && { backgroundColor: '#94A3B8' }]}
        onPress={handleVerify}
        disabled={!isComplete || loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.verifyBtnText}>Confirmar accion</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={s.googleBtn} onPress={() => setAuthModalOpen(true)}>
        <Ionicons name="logo-google" size={18} color="#DB4437" />
        <Text style={s.googleText}>Conectar con Google Authenticator</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
        <Text style={s.backText}>Volver</Text>
      </TouchableOpacity>

      <Modal visible={authModalOpen} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.authScreen}>
            <View style={s.iconWrapSmall}>
              <Ionicons name="keypad-outline" size={34} color={G} />
            </View>
            <Text style={s.modalTitle}>Google Authenticator</Text>
            <Text style={s.modalSub}>Ingresa el codigo de 6 digitos proveido por la app.</Text>

            <View style={s.digitRow}>
              {authDigits.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(input) => { authDigitRefs.current[index] = input; }}
                  style={[s.digitBox, digit && s.digitFilled, authError && s.digitError]}
                  value={digit}
                  onChangeText={(text) => handleDigit(text, index, setAuthDigits, authDigits, authDigitRefs)}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === 'Backspace') {
                      handleBackspace(index, setAuthDigits, authDigits, authDigitRefs);
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  selectTextOnFocus
                />
              ))}
            </View>

            {authError ? <Text style={s.authError}>{authError}</Text> : null}

            <TouchableOpacity
              style={[s.verifyBtn, !authComplete && { backgroundColor: '#94A3B8' }]}
              onPress={handleAuthenticatorConfirm}
              disabled={!authComplete}
            >
              <Text style={s.verifyBtnText}>Confirmar codigo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.backBtn} onPress={() => setAuthModalOpen(false)}>
              <Text style={s.backText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modeModal} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Tipo de accion</Text>
            {Object.entries(ACTIONS).map(([type, item]) => (
              <TouchableOpacity
                key={type}
                style={[s.presetBtn, actionType === type && { backgroundColor: G, borderColor: G }]}
                onPress={() => resetAction(type)}
              >
                <Text style={[s.presetText, actionType === type && { color: '#fff' }]}>{item.title}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={s.backBtn} onPress={() => setModeModal(false)}>
              <Text style={s.backText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4FBF3' },
  content: { padding: 24, paddingBottom: 48 },
  demoBtn: { backgroundColor: '#94a3b8', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', marginBottom: 16 },
  demoBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  iconWrap: { alignSelf: 'center', width: 88, height: 88, borderRadius: 44, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center', marginBottom: 16, marginTop: 8 },
  iconWrapSmall: { alignSelf: 'center', width: 68, height: 68, borderRadius: 34, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  title: { fontSize: 22, fontWeight: '800', color: N, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  contextCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  contextRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 14, paddingVertical: 6 },
  contextLabel: { fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase' },
  contextValue: { flex: 1, fontSize: 13, fontWeight: '700', color: '#1e293b', textAlign: 'right' },
  approvalCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#EFF6FF', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#BFDBFE' },
  approvalTitle: { fontSize: 14, fontWeight: '800', color: '#1D4ED8', marginBottom: 3 },
  approvalText: { fontSize: 12, color: '#1D4ED8', lineHeight: 17 },
  approvalBtn: { backgroundColor: N, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 },
  approvalBtnDone: { backgroundColor: G },
  approvalBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  tokenCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', elevation: 2 },
  tokenTopRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
  tokenLabel: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  countdown: { fontSize: 13, color: G, fontWeight: '700' },
  tokenCode: { fontSize: 40, fontWeight: '800', color: N, letterSpacing: 8, marginBottom: 12 },
  progressBg: { width: '100%', height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, marginBottom: 8 },
  progressFill: { height: 4, backgroundColor: G, borderRadius: 2 },
  tokenHint: { fontSize: 11, color: '#94a3b8' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 10 },
  digitRow: { flexDirection: 'row', gap: 8, marginBottom: 16, justifyContent: 'center' },
  digitBox: { width: 44, height: 54, borderRadius: 10, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#fff', textAlign: 'center', fontSize: 22, fontWeight: '700', color: N },
  digitFilled: { borderColor: G, backgroundColor: '#F0FDF4' },
  digitError: { borderColor: '#EF4444', backgroundColor: '#FFF1F2' },
  criticalBox: { backgroundColor: '#FEF2F2', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#FECACA' },
  criticalText: { fontSize: 13, color: '#DC2626', marginBottom: 10, lineHeight: 18 },
  criticalInput: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#FECACA', borderRadius: 10, padding: 12, fontSize: 15 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#FECACA' },
  errorText: { flex: 1, fontSize: 13, color: '#DC2626', marginLeft: 8 },
  verifyBtn: { backgroundColor: G, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 14 },
  verifyBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, backgroundColor: '#fff', marginBottom: 12 },
  googleText: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginLeft: 10 },
  backBtn: { alignItems: 'center', paddingVertical: 10 },
  backText: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  authScreen: { backgroundColor: '#fff', minHeight: '74%', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: N, marginBottom: 10, textAlign: 'center' },
  modalSub: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  authError: { fontSize: 13, color: '#DC2626', textAlign: 'center', marginBottom: 12 },
  presetBtn: { borderRadius: 12, padding: 14, marginBottom: 8, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  presetText: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
});
