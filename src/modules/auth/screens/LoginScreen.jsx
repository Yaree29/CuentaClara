import React, { useEffect, useState } from 'react';
import { Alert, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import AuthLayout from '../../../views/layouts/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/Login.styles';
import { validateEmail, validatePassword } from '../utils/validation';
import biometricService from '../services/biometricService';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Flujo C: disponibilidad de hardware + bandera guardada + nombre recordado.
  // Las tres se leen sin disparar ningún prompt nativo.
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [rememberedUser, setRememberedUser] = useState(null);
  const [biometricLoading, setBiometricLoading] = useState(false);

  const { login, loginWithBiometrics, linkBiometricSession, loading, error } = useAuth();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const [available, flag, remembered] = await Promise.all([
        biometricService.isAvailable(),
        biometricService.getBiometricFlag(),
        biometricService.getRememberedUser(),
      ]);
      if (!isMounted) return;
      setBiometricAvailable(available);
      setBiometricEnabled(flag === 'true');
      setRememberedUser(remembered);
    })();
    return () => { isMounted = false; };
  }, []);

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

    Alert.alert('No se pudo verificar', 'Intenta de nuevo o usa tu correo y contraseña.');
  };

  const handleEnableBiometrics = async (user, token) => {
    try {
      await linkBiometricSession(user, token);
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
          { text: 'Sí', onPress: () => handleEnableBiometrics(response.user, response.token) },
        ]
      );
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
            <TextInput
              style={[styles.input, passwordError && styles.inputError]}
              placeholder="Contraseña"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (text) setPasswordError('');
              }}
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              importantForAutofill="yes"
            />
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
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          {biometricAvailable && biometricEnabled && (
            <View style={styles.biometricSection}>
              {rememberedUser?.name ? (
                <Text style={styles.helloText}>Hola, {rememberedUser.name}</Text>
              ) : null}
              <TouchableOpacity
                style={[styles.biometricButton, biometricLoading && styles.buttonDisabled]}
                onPress={handleBiometricLogin}
                disabled={biometricLoading}
              >
                {biometricLoading ? (
                  <ActivityIndicator color="#0F2747" />
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
    </AuthLayout>
  );
};

export default LoginScreen;
