import React, { useEffect, useRef, useState } from 'react';
import { Alert, Modal, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import AuthLayout from '../../../views/layouts/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/Login.styles';
import { validateEmail, validatePassword } from '../utils/validation';

// 1. IMPORTACIONES NUEVAS: Mocks y Stores
import users from '../../../data/users';
import useUserStore from '../../../store/useUserStore';
import useAuthStore from '../../../store/useAuthStore';
import loginService from '../services/loginService';

const LoginScreen = () => {
  // Usuario de prueba
  const [email, setEmail] = useState('prueba2@gmail.com');
  const [password, setPassword] = useState('Prueba456*');
  
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricChecked, setBiometricChecked] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [showSaveBiometricPrompt, setShowSaveBiometricPrompt] = useState(false);

  // Refs para evitar múltiples intentos
  const biometricAttemptedRef = useRef(false);
  const biometricPromptedRef = useRef(false);
  const biometricAutoAttemptRef = useRef(false);
  // Almacena temporalmente las credenciales usadas en el login manual
  const pendingCredentialsRef = useRef(null);

  const { 
    loginWithStoredCredentials,
    saveCredentialsForBiometric,
    hasStoredCredentials,
    isBiometricAvailable,
    isBiometricEnabled,
    resetPassword,
    loading, 
    error 
  } = useAuth();

  // 2. HOOKS DE ZUSTAND: Para inyectar los datos en toda la app
  const setUserType = useUserStore((state) => state.setUserType);
  const setBusinessData = useUserStore((state) => state.setBusinessData);
  const setLogin = useAuthStore((state) => state.setLogin);

  // Verificar disponibilidad biométrica al montar
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

  // Auto-trigger: si el modal biométrico se abre y hay credenciales guardadas, intentar login
  const handleBiometricLogin = async() => {
    biometricAttemptedRef.current = true;
    try {
      const result = await loginWithStoredCredentials();
      if (result) {
        setShowBiometricModal(false);
        Alert.alert('¡Bienvenido!', 'Inicio de sesión exitoso');
      }
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

  // Login manual con email + password
  const handleLogin = async () => {
    if (!email.trim()) {
      setEmailError('El correo es requerido');
      Alert.alert('Correo requerido', 'Por favor ingresa tu correo');
      return;
    }

    if (!password.trim()) {
      setPasswordError('La contraseña es requerida');
      Alert.alert('Contraseña requerida', 'Por favor ingresa tu contraseña');
      return;
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setEmailError(emailValidation.error);
      Alert.alert('Correo inválido', emailValidation.error);
      return;
    }

    setEmailError('');
    setPasswordError('');

    try {
      const result = await loginService.login(email, password);

      setUserType(result.user?.role || 'user');
      setBusinessData(result.business || null);

      // Guardar temporalmente las credenciales para posible vinculación biométrica
      pendingCredentialsRef.current = { email: email.trim().toLowerCase(), password };

      // Verificar si ya tiene biometría habilitada
      const alreadyEnabled = await hasStoredCredentials();
      const hwAvailable = await isBiometricAvailable();

      if (hwAvailable && !alreadyEnabled) {
        // Primera vez: preguntar si quiere guardar credenciales con huella
        setShowSaveBiometricPrompt(true);
        // No hacemos setLogin todavía, esperamos respuesta del prompt
        // Pero guardamos result para usarlo después
        pendingCredentialsRef.current.loginResult = result;
      } else {
        // Ya tiene huella habilitada o no hay biometría → actualizar credenciales silenciosamente
        if (hwAvailable && alreadyEnabled) {
          try {
            await saveCredentialsForBiometric(email.trim().toLowerCase(), password);
          } catch (_) { /* no bloquear login si falla actualización */ }
        }
        setLogin(result.user, result.token, null);
        Alert.alert('¡Bienvenido!', 'Inicio de sesión exitoso');
      }
    } catch (error) {
      let errorMessage = 'Error desconocido';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      console.error('Error en login:', errorMessage);
      setPasswordError('Credenciales incorrectas');
      Alert.alert('Credenciales incorrectas', 'El correo o la contraseña son incorrectos.');
    }
  };

  // Confirmar guardar credenciales con huella
  const handleConfirmSaveBiometric = async () => {
    setShowSaveBiometricPrompt(false);
    const creds = pendingCredentialsRef.current;
    if (!creds) return;

    try {
      await saveCredentialsForBiometric(creds.email, creds.password);
      setBiometricEnabled(true);
      Alert.alert(
        '¡Huella vinculada!',
        'La próxima vez podrás iniciar sesión solo con tu huella dactilar.'
      );
    } catch (err) {
      Alert.alert(
        'No se pudo vincular',
        'Ocurrió un problema al guardar tus credenciales. Podrás intentarlo después.'
      );
    }

    // Completar el login con el resultado guardado
    if (creds.loginResult) {
      setLogin(creds.loginResult.user, creds.loginResult.token, null);
    }
    pendingCredentialsRef.current = null;
  };

  // Rechazar guardar credenciales con huella
  const handleDeclineSaveBiometric = () => {
    setShowSaveBiometricPrompt(false);
    const creds = pendingCredentialsRef.current;
    if (creds?.loginResult) {
      setLogin(creds.loginResult.user, creds.loginResult.token, null);
      Alert.alert('¡Bienvenido!', 'Inicio de sesión exitoso');
    }
    pendingCredentialsRef.current = null;
  };

  const handleResetPassword = async () => {
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      Alert.alert('Correo inválido', emailValidation.error);
      return;
    }

    try {
      await loginService.resetPassword(email.trim().toLowerCase());
      Alert.alert(
        'Correo enviado',
        'Revisa tu correo para continuar con la recuperación de contraseña.'
      );
    } catch (err) {
      const errorMessage = err?.message || String(err);
      Alert.alert(
        'No se pudo enviar',
        errorMessage || 'Verifica tu correo e intenta nuevamente.'
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
       <View style={styles.headerContainer}>
          <Image
            source={require('../../../utils/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>CuentaClara</Text>
        </View>
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
            style={[styles.button, (!email || !password) && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={!email || !password}
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
              <Text style={styles.biometricButtonText}>🔒 Entrar con huella</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Modal: Prompt biométrico para login rápido */}
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

      {/* Modal: ¿Guardar credenciales con huella? */}
      <Modal
        transparent
        visible={showSaveBiometricPrompt}
        animationType="fade"
        onRequestClose={handleDeclineSaveBiometric}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🔐 Acceso rápido</Text>
            <Text style={styles.modalText}>
              ¿Deseas guardar tus credenciales de forma segura para iniciar sesión
              con tu huella dactilar la próxima vez?
            </Text>
            <Text style={[styles.modalText, { fontSize: 12, color: '#888', marginTop: 4 }]}>
              Tus datos se almacenan cifrados dentro del dispositivo y solo se
              liberan al verificar tu identidad biométrica.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalPrimaryButton}
                onPress={handleConfirmSaveBiometric}
              >
                <Text style={styles.modalPrimaryButtonText}>Sí, vincular huella</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSecondaryButton}
                onPress={handleDeclineSaveBiometric}
              >
                <Text style={styles.modalSecondaryButtonText}>No, gracias</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </AuthLayout>
  );
};

export default LoginScreen;