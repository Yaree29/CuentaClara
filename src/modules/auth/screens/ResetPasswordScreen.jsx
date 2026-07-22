import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AuthLayout from '../../../views/layouts/AuthLayout';
import styles from '../styles/recoveryOptions.styles';
import { supabase } from '../../../services/supabaseClient';
import { validatePassword } from '../utils/validation';

// Destino del deep link cuentaclara://reset-password. Para cuando se abre esta
// pantalla, App.js ya canjeó el `code` del enlace por una sesión de recuperación
// (exchangeCodeForSession), así que updateUser puede fijar la nueva contraseña.
const ResetPasswordScreen = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    const validation = validatePassword(password);
    if (!validation.valid) {
      Alert.alert('Contraseña inválida', validation.error);
      return;
    }
    if (password !== confirm) {
      Alert.alert('No coincide', 'Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      // La sesión de recuperación la establece App.js (setSession con los tokens
      // del deep link). Si no hay sesión, el problema SÍ es el enlace; se
      // distingue explícitamente para no culpar al enlace de otros errores.
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert(
          'Enlace no válido',
          'No se pudo abrir tu sesión de recuperación. Solicita un enlace nuevo desde "¿Olvidaste tu contraseña?" y ábrelo directamente desde el correo.'
        );
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      // Cerrar la sesión de recuperación para forzar un login limpio con la nueva clave.
      await supabase.auth.signOut();
      Alert.alert(
        'Contraseña actualizada',
        'Tu contraseña se cambió correctamente. Inicia sesión con la nueva.',
        [{ text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }) }]
      );
    } catch (e) {
      // Antes CUALQUIER fallo se reportaba como "el enlace expiró", lo que
      // ocultaba la causa real. El caso más común no tiene nada que ver con el
      // enlace: Supabase rechaza reutilizar la contraseña actual.
      const msg = (e?.message || '').toLowerCase();
      const code = e?.code || '';

      if (code === 'same_password' || msg.includes('should be different')) {
        Alert.alert(
          'Elige otra contraseña',
          'La nueva contraseña debe ser distinta a la que ya tenías.'
        );
      } else if (
        msg.includes('session') || msg.includes('jwt') ||
        msg.includes('expired') || msg.includes('token')
      ) {
        Alert.alert(
          'No se pudo actualizar',
          'El enlace de recuperación pudo haber expirado. Solicita uno nuevo desde "¿Olvidaste tu contraseña?".'
        );
      } else {
        // Se muestra el mensaje real: sin esto, un fallo distinto (red, política
        // de contraseñas del proyecto, etc.) queda indistinguible del anterior.
        Alert.alert('No se pudo actualizar', e?.message || 'Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <View style={styles.container}>
        <Text style={styles.title}>Nueva contraseña</Text>
        <Text style={styles.subtitle}>Crea una nueva contraseña para tu cuenta.</Text>

        <TextInput
          style={styles.input}
          placeholder="Nueva contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmar contraseña"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.button, (loading || !password || !confirm) && styles.buttonDisabled]}
          onPress={handleUpdate}
          disabled={loading || !password || !confirm}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Guardar contraseña</Text>
          )}
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
};

export default ResetPasswordScreen;
