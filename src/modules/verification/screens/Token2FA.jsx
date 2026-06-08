import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Modal, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../theme/colors';
import styles from '../styles/mfaStyles';

const emptyDigits = () => ['', '', '', '', '', ''];

export default function Token2FA({ navigation, route }) {
  // Parámetros: actionLabel (ej: 'Borrar cuenta'), description (opcional), actionType (opcional)
  const { 
    actionLabel = 'Verificación de Identidad', 
    description = 'Ingresa el código de 6 dígitos enviado a tu correo electrónico.',
    actionType = 'generic'
  } = route?.params || {};

  const [digits, setDigits] = useState(emptyDigits());
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estado para el modal de Google Authenticator
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authDigits, setAuthDigits] = useState(emptyDigits());
  const [authError, setAuthError] = useState('');
  
  const digitRefs = useRef([]);
  const authDigitRefs = useRef([]);

  const isDestructive = 
    actionLabel.toLowerCase().includes('borrar cuenta') || 
    actionLabel.toLowerCase().includes('borrar datos') ||
    actionType === 'delete_account';

  const enteredCode = digits.join('');
  const isComplete = enteredCode.length === 6;
  const authCode = authDigits.join('');
  const authComplete = authCode.length === 6;

  // Habilitar botón si el código está completo y (si es destructivo) el texto es 'ELIMINAR'
  const canConfirm = isComplete && (!isDestructive || confirmText.toUpperCase() === 'ELIMINAR');

  useEffect(() => {
    if (authModalOpen) {
      setTimeout(() => authDigitRefs.current[0]?.focus(), 250);
    } else {
      setTimeout(() => digitRefs.current[0]?.focus(), 250);
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
      return;
    }
    if (idx > 0) {
      next[idx - 1] = '';
      setter(next);
      refs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (!canConfirm) return;

    setLoading(true);
    // Simulación de verificación de código de correo
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);

    // Demo: Aceptamos cualquier código de 6 dígitos por ahora
    Alert.alert('Acción autorizada', `La operación "${actionLabel}" ha sido validada correctamente.`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const handleAuthenticatorConfirm = () => {
    if (!authComplete) {
      setAuthError('Ingresa el código de 6 dígitos provisto por la app.');
      return;
    }
    setAuthModalOpen(false);
    setAuthDigits(emptyDigits());
    Alert.alert('Conectado', 'App de autenticación validada correctamente.', [
      { text: 'OK', onPress: () => navigation.navigate('profile') },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Seguridad</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={[styles.iconWrap, isDestructive && styles.iconWrapDestructive]}>
            <Ionicons 
              name={isDestructive ? "alert-triangle-outline" : "shield-checkmark-outline"} 
              size={48} 
              color={isDestructive ? colors.danger : colors.success} 
            />
          </View>

          <Text style={styles.title}>{actionLabel}</Text>
          <Text style={styles.subtitle}>{description}</Text>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Ingresa el código enviado al correo</Text>
            <View style={styles.digitRow}>
              {digits.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(input) => { digitRefs.current[index] = input; }}
                  style={[
                    styles.digitBox, 
                    digit && styles.digitFilled, 
                    error && styles.digitError
                  ]}
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
          </View>

          {isDestructive && (
            <View style={styles.criticalBox}>
              <Text style={styles.criticalText}>
                Esta acción es irreversible. Escribe <Text style={{ fontWeight: '800' }}>ELIMINAR</Text> para confirmar.
              </Text>
              <TextInput
                style={[
                  styles.criticalInput, 
                  confirmText.toUpperCase() === 'ELIMINAR' && styles.criticalInputSuccess
                ]}
                placeholder="Escribe ELIMINAR"
                value={confirmText}
                onChangeText={setConfirmText}
                autoCapitalize="characters"
              />
            </View>
          )}

          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[
              styles.verifyBtn, 
              !canConfirm && styles.verifyBtnDisabled
            ]}
            onPress={handleVerify}
            disabled={!canConfirm || loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.textWhite || "#fff"} />
            ) : (
              <Text style={styles.verifyBtnText}>Confirmar Acción</Text>
            )}
          </TouchableOpacity>

          {/* Botón Google Authenticator*/}
          <TouchableOpacity style={styles.googleBtn} onPress={() => setAuthModalOpen(true)}>
            <Ionicons name="logo-google" size={18} color="#DB4437" />
            <Text style={styles.googleText}>Usar Google Authenticator</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Modal Google Authenticator*/}
        <Modal visible={authModalOpen} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.authScreen}>
              <View style={styles.iconWrapSmall}>
                <Ionicons name="keypad-outline" size={34} color={colors.success} />
              </View>
              <Text style={styles.modalTitle}>Google Authenticator</Text>
              <Text style={styles.modalSub}>Ingresa el código de 6 dígitos provisto por la app.</Text>

              <View style={styles.digitRow}>
                {authDigits.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(input) => { authDigitRefs.current[index] = input; }}
                    style={[
                      styles.digitBox, 
                      digit && styles.digitFilled, 
                      authError && styles.digitError
                    ]}
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

              {authError ? <Text style={styles.authError}>{authError}</Text> : null}

              <TouchableOpacity
                style={[
                  styles.verifyBtn, 
                  !authComplete && styles.verifyBtnDisabled
                ]}
                onPress={handleAuthenticatorConfirm}
                disabled={!authComplete}
              >
                <Text style={styles.verifyBtnText}>Confirmar Código</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.backBtn} onPress={() => setAuthModalOpen(false)}>
                <Text style={styles.backText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
