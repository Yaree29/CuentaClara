import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import AuthLayout from '../../../views/layouts/AuthLayout';
import useMfaVerification from '../hooks/useMfaVerification';
import styles from '../styles/mfaStyles';

const MfaVerifyScreen = ({ route, navigation }) => {
  const {
    method = 'email',
    maskedContact = 'j***@gmail.com',
    returnToProfile = false,
  } = route?.params ?? {};

  const {
    codeLength,
    digits,
    loading,
    error,
    resendCooldown,
    inputRefs,
    isComplete,
    handleDigitChange,
    handleKeyPress,
    handleVerify,
    handleResend,
  } = useMfaVerification(navigation, { returnToProfile });

  const methodLabel = method === 'totp' ? 'tu aplicación de autenticación' : 'tu correo electrónico';

  return (
    <AuthLayout>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.iconWrapper}>
            <Text style={styles.iconEmoji}>🔐</Text>
          </View>
          <Text style={styles.title}>Verificación en dos pasos</Text>
          <Text style={styles.subtitle}>
            Ingresa el código de 6 dígitos enviado a {methodLabel}
            {maskedContact ? ` (${maskedContact})` : ''}.
          </Text>
          <Text style={styles.demoHint}>💡 Demo: usa el código 1 2 3 4 5 6</Text>

          <View style={styles.codeRow}>
            {digits.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[styles.digitBox, digit ? styles.digitBoxFilled : null, error ? styles.digitBoxError : null]}
                value={digit}
                onChangeText={(text) => handleDigitChange(text, index)}
                onKeyPress={(event) => handleKeyPress(event, index)}
                keyboardType="number-pad"
                maxLength={codeLength}
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                returnKeyType={index === codeLength - 1 ? 'done' : 'next'}
                autoFocus={index === 0}
                selectTextOnFocus
              />
            ))}
          </View>

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.verifyButton, (!isComplete || loading) && styles.verifyButtonDisabled]}
            onPress={handleVerify}
            disabled={!isComplete || loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.verifyButtonText}>Verificar código</Text>}
          </TouchableOpacity>

          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>¿No recibiste el código? </Text>
            <TouchableOpacity onPress={handleResend} disabled={resendCooldown > 0}>
              <Text style={[styles.resendLink, resendCooldown > 0 && styles.resendLinkDisabled]}>
                {resendCooldown > 0 ? `Reenviar (${resendCooldown}s)` : 'Reenviar'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.backRow} onPress={() => navigation?.goBack()}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthLayout>
  );
};

export default MfaVerifyScreen;