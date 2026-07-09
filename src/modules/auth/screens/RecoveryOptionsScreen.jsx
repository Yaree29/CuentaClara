import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthLayout from '../../../views/layouts/AuthLayout';
import colors from '../../../theme/colors';
import styles from '../styles/recoveryOptions.styles';
import { useAuth } from '../hooks/useAuth';
import { validateEmail } from '../utils/validation';

// Recuperación por correo vía Supabase (resetPasswordForEmail). El enlace del
// correo abre la app por deep link (cuentaclara://reset-password) y aterriza en
// ResetPasswordScreen para fijar la nueva contraseña.
const RecoveryOptionsScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { resetPassword, loading } = useAuth();

  const handleSend = async () => {
    const validation = validateEmail(email);
    if (!validation.valid) {
      Alert.alert('Correo inválido', validation.error);
      return;
    }
    // Se muestra el mismo mensaje exista o no el correo (anti-enumeración).
    try {
      await resetPassword(email.trim().toLowerCase());
    } catch (e) {
      // ignorado a propósito
    }
    setSent(true);
  };

  return (
    <AuthLayout>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>

        <Text style={styles.title}>Recuperar contraseña</Text>

        {sent ? (
          <>
            <Ionicons name="mail-outline" size={48} color={colors.primary} style={styles.icon} />
            <Text style={styles.subtitle}>
              Si el correo está registrado, te enviamos un enlace para crear una nueva
              contraseña. Ábrelo desde este teléfono y volverás a la app.
            </Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
              <Text style={styles.buttonText}>Volver al inicio</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>
              Ingresa el correo de tu cuenta y te enviaremos un enlace para restablecer
              tu contraseña.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            <TouchableOpacity
              style={[styles.button, (loading || !email) && styles.buttonDisabled]}
              onPress={handleSend}
              disabled={loading || !email}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Enviar enlace</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </AuthLayout>
  );
};

export default RecoveryOptionsScreen;
