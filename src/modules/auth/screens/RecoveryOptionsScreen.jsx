import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthLayout from '../../../views/layouts/AuthLayout';
import colors from '../../../theme/colors';
import styles from '../styles/recoveryOptions.styles';

// Placeholder intencional: aquí irán las distintas formas de recuperar la
// cuenta (una de ellas será enviar un correo, ya soportado por el backend
// vía POST /auth/reset-password — falta diseñar esta pantalla a fondo).
const RecoveryOptionsScreen = ({ navigation }) => {
  return (
    <AuthLayout>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>

        <Text style={styles.title}>Formas de recuperación</Text>
        <Text style={styles.subtitle}>Próximamente</Text>
      </View>
    </AuthLayout>
  );
};

export default RecoveryOptionsScreen;
