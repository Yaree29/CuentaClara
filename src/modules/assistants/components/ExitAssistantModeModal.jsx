// =============================================================================
// ExitAssistantModeModal.jsx
// --------------------------
// Modal de "confirmar contraseña para salir del Modo Asistente" — extraído de
// DashboardHeader.jsx para reutilizarlo también en AssistantSelectScreen.jsx
// (hallazgo de la prueba: esa pantalla no tenía forma de salir sin PIN).
//
// Autocontenido: pide la contraseña, llama authService.verifyPassword() y,
// si es correcta, disableMode() del store — el padre solo decide qué hacer
// después (onSuccess) y cómo cerrarse si el dueño cancela (onClose).
//
// Bloquea el back físico de Android mientras está visible, sin importar si
// la pantalla que lo monta ya tiene su propio bloqueo (AssistantSelectScreen)
// o no (Home/DashboardHeader) — dos listeners que devuelven true no chocan.
// =============================================================================
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, ActivityIndicator, BackHandler } from 'react-native';
import authService from '../../auth/services/authService';
import useAssistantModeStore from '../../../store/useAssistantModeStore';
import colors from '../../../theme/colors';
import styles from '../styles/team.styles';

const ExitAssistantModeModal = ({ visible, onClose, onSuccess }) => {
  const disableMode = useAssistantModeStore((state) => state.disableMode);

  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!visible) return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, [visible]);

  useEffect(() => {
    if (visible) {
      setPassword('');
      setError(null);
    }
  }, [visible]);

  const handleConfirm = async () => {
    if (!password) return;

    setVerifying(true);
    setError(null);

    const isValid = await authService.verifyPassword(password);
    if (!isValid) {
      setError('Contraseña incorrecta.');
      setVerifying(false);
      return;
    }

    disableMode();
    setVerifying(false);
    setPassword('');
    onSuccess?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Salir del Modo Asistente</Text>
          <Text style={styles.modalSubtitle}>
            Confirma la contraseña de tu cuenta para volver a tu sesión normal.
          </Text>

          <TextInput
            style={styles.textInput}
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              setError(null);
            }}
            placeholder="Tu contraseña"
            placeholderTextColor={colors.placeholder}
            secureTextEntry
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSecondary]}
              onPress={onClose}
              disabled={verifying}
            >
              <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                password && !verifying ? styles.modalButtonPrimary : styles.modalButtonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={!password || verifying}
            >
              {verifying ? (
                <ActivityIndicator size="small" color={colors.textButton} />
              ) : (
                <Text style={styles.modalButtonTextPrimary}>Confirmar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ExitAssistantModeModal;
