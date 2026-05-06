import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, AppState } from 'react-native';
import { useBiometrics } from '../hooks/useBiometrics';
import useAuthStore from '../../../store/useAuthStore';

const BiometricLockScreen = ({ navigation }) => {
  const { verifyIdentity, isAuthenticating } = useBiometrics();
  const { setBiometricVerified } = useAuthStore();
  const { user } = useAuthStore();

  const handleAuth = async () => {
    const success = await verifyIdentity();

    if (success) {
      setBiometricVerified(true); // 🔥 desbloquea la app
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
        if (state === 'background') {
        useAuthStore.getState().resetBiometric();
        }
    });

    return () => subscription.remove();
    }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CuentaClara</Text>
      <Text style={styles.subtitle}>Hola, {user?.name || 'Usuario'}</Text>
      
      <View style={styles.iconContainer}>
        <Text style={styles.fingerprintIcon}>☝️</Text>
      </View>

      <Text style={styles.instruction}>Usa tu huella para entrar de forma segura</Text>

      <TouchableOpacity 
        style={styles.button}
        onPress={handleAuth}
        disabled={isAuthenticating}
      >
        <Text style={styles.buttonText}>
          {isAuthenticating ? "Verificando..." : "Intentar de nuevo"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.link}
        onPress={() => navigation.replace('Login')}
      >
        <Text style={styles.linkText}>Usar contraseña en su lugar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#e2e8f0',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  fingerprintIcon: {
    fontSize: 50,
  },
  instruction: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    marginTop: 20,
  },
  linkText: {
    color: '#2563eb',
    fontSize: 14,
  },
});

export default BiometricLockScreen;