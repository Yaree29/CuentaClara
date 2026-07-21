import React, { useCallback, useState } from 'react';
import { Alert, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, Modal, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AuthLayout from '../../../views/layouts/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import colors from '../../../theme/colors';
import styles from '../styles/Login.styles';
import { validateEmail, validatePassword } from '../utils/validation';
import biometricService from '../services/biometricService';
import mfaService from '../services/mfaService';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Flujo C: disponibilidad de hardware + bandera guardada. Ambas se leen sin
  // disparar ningún prompt nativo.
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);

  // Reto 2FA en login (cuando la cuenta tiene MFA y la sesión está en aal1).
  const [mfaVisible, setMfaVisible] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [mfaBusy, setMfaBusy] = useState(false);

  const { login, completeMfaLogin, loginWithBiometrics, linkBiometricSession, loading, error } = useAuth();

  // Se re-lee cada vez que la pantalla toma el foco (no solo al montar): así, al
  // volver a Login tras un logout —que ya borró la huella con disableBiometric()—
  // la bandera se refresca a 'false' y el botón desaparece de inmediato, sin
  // quedarse mostrando el estado viejo de la sesión anterior.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const [available, flag] = await Promise.all([
          biometricService.isAvailable(),
          biometricService.getBiometricFlag(),
        ]);
        if (!active) return;
        setBiometricAvailable(available);
        setBiometricEnabled(flag === 'true');
      })();
      return () => { active = false; };
    }, [])
  );

  const handleBiometricLogin = async () => {
    setBiometricLoading(true);
    const result = await loginWithBiometrics();
    setBiometricLoading(false);

    if (result.success) return; // RootNavigator cambia de stack solo

    if (result.reason === 'user_cancel') return; // se queda en Login, sin aviso

    if (result.reason === 'lockout') {
      Alert.alert(
        'Huella bloqueada',
        'Se bloqueó por demasiados intentos. Desbloquea tu teléfono o inicia sesión con tu correo y contraseña.'
      );
      return;
    }

    if (result.reason === 'expired' || result.reason === 'no_session') {
      Alert.alert(
        'Sesión expirada',
        'Tu sesión guardada venció. Inicia con tu correo y contraseña; luego podrás volver a activar la huella.'
      );
      return;
    }

    Alert.alert('No se pudo verificar', 'Intenta de nuevo o usa tu correo y contraseña.');
  };

  const handleEnableBiometrics = async (user) => {
    try {
      await linkBiometricSession(user);
    } catch (err) {
      Alert.alert('No se pudo habilitar', 'Ocurrió un problema al vincular tu huella. Intenta nuevamente.');
    }
  };

  const handleLogin = async () => {
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setEmailError(emailValidation.error);
      setPasswordError('');
      Alert.alert('Correo inválido', emailValidation.error);
      return;
    }

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

    // Cuenta con 2FA: pedir el código antes de completar el login.
    if (response.mfaRequired) {
      setMfaCode('');
      setMfaError('');
      setMfaVisible(true);
      return;
    }

    await biometricService.setRememberedUser({ name: response.user?.name, email: response.user?.email });

    if (!biometricAvailable) return;

    // Solo se pregunta si nunca se decidió antes (flag null) — ni al aceptar
    // ni al declinar se vuelve a preguntar en logins posteriores.
    const flag = await biometricService.getBiometricFlag();
    if (flag === null) {
      Alert.alert(
        'Activar huella',
        '¿Deseas activar el ingreso con huella para la próxima vez?',
        [
          { text: 'Ahora no', style: 'cancel', onPress: () => biometricService.declineBiometric() },
          { text: 'Sí', onPress: () => handleEnableBiometrics(response.user) },
        ]
      );
    }
  };

  const handleMfaConfirm = async () => {
    if (mfaCode.length !== 6) {
      setMfaError('Ingresa el código de 6 dígitos.');
      return;
    }
    setMfaBusy(true);
    setMfaError('');
    try {
      const ok = await mfaService.verifyChallenge(mfaCode);
      if (!ok) {
        setMfaError('Código incorrecto. Verifica la hora de tu dispositivo.');
        return;
      }
      await completeMfaLogin(); // RootNavigator cambia de stack solo
      setMfaVisible(false);
    } catch (e) {
      setMfaError('No se pudo verificar. Intenta de nuevo.');
    } finally {
      setMfaBusy(false);
    }
  };

  return (
    <AuthLayout>
      <View style={styles.container}>
        <Image
          source={require('../../../utils/images/icon.png')}
          style={styles.logo}
        />
        <Text style={styles.brandTitle}>CuentaClara</Text>

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
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="username"
              importantForAutofill="yes"
            />
            {emailError ? <Text style={styles.errorMessage}>{emailError}</Text> : null}
          </View>

          <View>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.input, styles.passwordInput, passwordError && styles.inputError]}
                placeholder="Contraseña"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (text) setPasswordError('');
                }}
                secureTextEntry={!showPassword}
                autoComplete="password"
                textContentType="password"
                importantForAutofill="yes"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorMessage}>{passwordError}</Text> : null}
          </View>

          <TouchableOpacity style={styles.forgotPasswordLink} onPress={() => navigation.navigate('RecoveryOptions')}>
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, (loading || !email || !password) && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading || !email || !password}
          >
            {loading ? (
              <ActivityIndicator color={colors.textButton} />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          {biometricAvailable && biometricEnabled && (
            <View style={styles.biometricSection}>
              <TouchableOpacity
                style={[styles.biometricButton, biometricLoading && styles.buttonDisabled]}
                onPress={handleBiometricLogin}
                disabled={biometricLoading}
              >
                {biometricLoading ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Text style={styles.biometricButtonText}>Iniciar con Huella</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerLinkText}>
            ¿No tienes una cuenta? <Text style={styles.registerLinkTextBold}>Regístrate</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={mfaVisible} transparent animationType="fade" onRequestClose={() => setMfaVisible(false)}>
        <View style={mfaModalStyles.overlay}>
          <View style={mfaModalStyles.card}>
            <Text style={mfaModalStyles.title}>Verificación en dos pasos</Text>
            <Text style={mfaModalStyles.subtitle}>
              Ingresa el código de 6 dígitos de tu app autenticadora.
            </Text>
            <TextInput
              style={mfaModalStyles.input}
              placeholder="000000"
              value={mfaCode}
              onChangeText={(t) => { setMfaCode(t.replace(/\D/g, '').slice(0, 6)); setMfaError(''); }}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />
            {mfaError ? <Text style={mfaModalStyles.error}>{mfaError}</Text> : null}
            <TouchableOpacity
              style={[mfaModalStyles.button, (mfaBusy || mfaCode.length !== 6) && { opacity: 0.5 }]}
              onPress={handleMfaConfirm}
              disabled={mfaBusy || mfaCode.length !== 6}
            >
              {mfaBusy ? <ActivityIndicator color={colors.textButton} /> : <Text style={mfaModalStyles.buttonText}>Verificar</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMfaVisible(false)} style={mfaModalStyles.cancel}>
              <Text style={mfaModalStyles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AuthLayout>
  );
};

const mfaModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#5b6b7f',
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d7e2',
    borderRadius: 12,
    paddingVertical: 12,
    fontSize: 22,
    letterSpacing: 8,
    textAlign: 'center',
    color: colors.primary,
  },
  error: {
    color: '#d9534f',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: colors.textButton,
    fontSize: 15,
    fontWeight: '600',
  },
  cancel: {
    marginTop: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#5b6b7f',
    fontSize: 14,
  },
});

export default LoginScreen;
