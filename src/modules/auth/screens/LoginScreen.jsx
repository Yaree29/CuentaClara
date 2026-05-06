import React, { useEffect, useRef, useState } from 'react';
import { Alert, Modal, View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import AuthLayout from '../../../views/layouts/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/Login.styles';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricChecked, setBiometricChecked] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(true);
  const biometricAttemptedRef = useRef(false);

  const { 
    login, 
    loginWithBiometrics, 
    linkBiometricSession, 
    isBiometricAvailable,
    isBiometricEnabled,
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
    if (!email || !password) return;
    const response = await login(email, password).catch(() => null);
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

  const handleOpenBiometricModal = () => {
    biometricAttemptedRef.current = false;
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
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
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