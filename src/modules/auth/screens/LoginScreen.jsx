import React, { useEffect, useRef, useState } from 'react';
import { Alert, Modal, View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import AuthLayout from '../../../views/layouts/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/Login.styles';
import { validateEmail, validatePassword } from '../utils/validation';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricChecked, setBiometricChecked] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const biometricAttemptedRef = useRef(false);
  const biometricPromptedRef = useRef(false);
  const biometricAutoAttemptRef = useRef(false);

  const { 
    login, 
    loginWithBiometrics, 
    linkBiometricSession, 
    isBiometricAvailable,
    isBiometricEnabled,
    resetPassword,
    loading, 
    error 
  } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const loadBiometricState = async() => {
      const available = await isBiometricAvailable();
      if (!isMounted) return;
      setBiometricAvailable(available);

      if (available) {
        const enabled = await isBiometricEnabled();
        if (isMounted) setBiometricEnabled(enabled);
      } else if (isMounted) {
        setBiometricEnabled(false);
      }
      if (isMounted) setBiometricChecked(true);
    };

    loadBiometricState();
    return () => { isMounted = false; };
  }, []);

  const handleBiometricLogin = async() => {
    biometricAttemptedRef.current = true;
    try {
      await loginWithBiometrics();
    } catch (err) {
      // Error manejado por el hook
    }
  };

  useEffect(() => {
    if (!showBiometricModal || !biometricChecked) return;
    if (!biometricAvailable || !biometricEnabled) return;
    if (!biometricAutoAttemptRef.current) return;
    if (biometricAttemptedRef.current) return;
    handleBiometricLogin();
  }, [showBiometricModal, biometricChecked, biometricAvailable, biometricEnabled]);

  const handleEnableBiometrics = async(user, token) => {
    try {
      await linkBiometricSession(user, token);
      setBiometricEnabled(true);
    } catch (err) {
      Alert.alert(
        'No se pudo habilitar',
        'Ocurrió un problema al vincular tu huella. Intenta nuevamente.'
      );
    }
  };

  const handleLogin = async () => {
    // Validar email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setEmailError(emailValidation.error);
      setPasswordError('');
      Alert.alert('Correo inválido', emailValidation.error);
      return;
    }

    // Validar contraseña
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setPasswordError(passwordValidation.error);
      setEmailError('');
      Alert.alert('Contraseña inválida', passwordValidation.error);
      return;
    }

    setEmailError('');
    setPasswordError('');

    const response = await login(email.trim().toLowerCase(), password).catch(() => null);
    if (!response) return;

    if (biometricAvailable && response?.user && response?.token) {
      const enabled = await isBiometricEnabled();
      if (enabled) {
        await handleEnableBiometrics(response.user, response.token);
      } else {
        Alert.alert(
          'Habilitar huella',
          '¿Deseas vincular tu huella para un inicio de sesión rápido?',
          [
            { text: 'Ahora no', style: 'cancel' },
            { text: 'Habilitar', onPress: () => handleEnableBiometrics(response.user, response.token) }
          ]
        );
      }
    }
  };

  const handleResetPassword = async () => {
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      Alert.alert('Correo inválido', emailValidation.error);
      return;
    }

    try {
      await resetPassword(email.trim().toLowerCase());
      Alert.alert(
        'Correo enviado',
        'Revisa tu correo para continuar con la recuperación de contraseña.'
      );
    } catch (err) {
      Alert.alert(
        'No se pudo enviar',
        'Verifica tu correo e intenta nuevamente.'
      );
    }
  };

  const handleOpenBiometricModal = () => {
    biometricAttemptedRef.current = false;
    biometricAutoAttemptRef.current = true;
    setShowBiometricModal(true);
  };

  const handleOpenBiometricPrompt = () => {
    if (!biometricChecked) return;
    if (!biometricAvailable || !biometricEnabled) return;
    if (biometricPromptedRef.current) return;
    biometricPromptedRef.current = true;
    biometricAttemptedRef.current = false;
    biometricAutoAttemptRef.current = false;
    setShowBiometricModal(true);
  };

  const handleUseCredentials = () => {
    setShowBiometricModal(false);
  };

  return (
    <AuthLayout>
      <View style={styles.container}>
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>Ingresa tus credenciales para continuar</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.form}>
          <View>
            <TextInput
              style={[styles.input, emailError && styles.inputError]}
              placeholder="Correo electrónico"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (text) setEmailError('');
              }}
              onFocus={handleOpenBiometricPrompt}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="username"
              importantForAutofill="yes"
            />
            {emailError ? <Text style={styles.errorMessage}>{emailError}</Text> : null}
          </View>

          <View>
            <TextInput
              style={[styles.input, passwordError && styles.inputError]}
              placeholder="Contraseña"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (text) setPasswordError('');
              }}
              onFocus={handleOpenBiometricPrompt}
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              importantForAutofill="yes"
            />
            {passwordError ? <Text style={styles.errorMessage}>{passwordError}</Text> : null}
          </View>

          <TouchableOpacity style={styles.forgotPasswordLink} onPress={handleResetPassword}>
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, (loading || !email || !password) && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading || !email || !password}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          {biometricAvailable && biometricEnabled && (
            <TouchableOpacity
              style={[styles.biometricButton, loading && styles.buttonDisabled]}
              onPress={handleOpenBiometricModal}
              disabled={loading}
            >
              <Text style={styles.biometricButtonText}>Entrar con huella</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Modal
        transparent
        visible={showBiometricModal}
        animationType="fade"
        onRequestClose={handleUseCredentials}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Inicio rápido</Text>
            <Text style={styles.modalText}>
              {!biometricChecked
                ? 'Verificando disponibilidad biométrica...'
                : biometricAvailable
                  ? biometricEnabled
                    ? 'Usa tu huella para iniciar sesión.'
                    : 'Aún no tienes huella vinculada. Puedes continuar con credenciales.'
                  : 'Este dispositivo no tiene biometría disponible.'}
            </Text>

            {error && <Text style={styles.modalErrorText}>{error}</Text>}

            <View style={styles.modalActions}>
              {biometricChecked && biometricAvailable && biometricEnabled && (
                <TouchableOpacity
                  style={[styles.modalPrimaryButton, loading && styles.modalButtonDisabled]}
                  onPress={handleBiometricLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.modalPrimaryButtonText}>Usar huella</Text>
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.modalSecondaryButton}
                onPress={handleUseCredentials}
              >
                <Text style={styles.modalSecondaryButtonText}>Usar credenciales</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </AuthLayout>
  );
};


export default LoginScreen;
