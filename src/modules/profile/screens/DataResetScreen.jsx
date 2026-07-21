import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import profileService from '../services/profileService';
import colors from '../../../theme/colors';
import styles from '../styles/profile.styles';
import securityStyles from '../styles/security.styles';

// Frase exacta que el usuario debe escribir para habilitar el borrado.
const CONFIRM_PHRASE = 'ELIMINAR TODOS MIS DATOS';

const MenuSection = ({ title, children }) => (
  <View style={styles.menuSection}>
    <Text style={styles.menuSectionTitle}>{title}</Text>
    <View style={styles.menuSectionContent}>
      {children}
    </View>
  </View>
);

const DataResetScreen = () => {
  const navigation = useNavigation();
  const [confirmText, setConfirmText] = useState('');
  const [busy, setBusy] = useState(false);

  const phraseMatches = confirmText.trim().toUpperCase() === CONFIRM_PHRASE;

  const handleDelete = () => {
    if (!phraseMatches || busy) return;

    Alert.alert(
      'Borrar todos los datos',
      'Se eliminarán de forma permanente todas tus ventas, fiados, clientes, productos e inventario. Tu cuenta y tu configuración se mantienen. Esta acción no se puede deshacer.\n\n¿Deseas continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar todo',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await profileService.deleteAllData();
              Alert.alert(
                'Datos eliminados',
                'Todos tus datos fueron borrados correctamente.',
                [{ text: 'Entendido', onPress: () => navigation.goBack() }]
              );
            } catch (err) {
              Alert.alert('Error', err?.message || 'No se pudieron borrar los datos. Intenta de nuevo.');
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Borrar datos</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={securityStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={securityStyles.descriptionText}>
          Esta herramienta reinicia tu negocio: elimina todo el historial de ventas, fiados,
          clientes, productos e inventario. Tu cuenta, tu perfil y tu configuración no se tocan.
          Es útil para dejar todo en cero antes de empezar de nuevo o hacer pruebas.
        </Text>

        {/* Aviso de riesgo */}
        <View style={localStyles.warningBox}>
          <Ionicons name="warning-outline" size={22} color={colors.danger} style={{ marginRight: 10 }} />
          <Text style={localStyles.warningText}>
            Esta acción es permanente e irreversible. Los datos borrados no se pueden recuperar.
          </Text>
        </View>

        <MenuSection title="Confirmación de seguridad">
          <View style={{ paddingVertical: 6 }}>
            <Text style={localStyles.confirmLabel}>
              Para continuar, escribe exactamente:
            </Text>
            <Text style={localStyles.confirmPhrase}>{CONFIRM_PHRASE}</Text>

            <TextInput
              style={[localStyles.input, phraseMatches && localStyles.inputValid]}
              value={confirmText}
              onChangeText={setConfirmText}
              placeholder="Escribe la frase aquí"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!busy}
            />
          </View>
        </MenuSection>

        <TouchableOpacity
          style={[localStyles.deleteButton, (!phraseMatches || busy) && localStyles.deleteButtonDisabled]}
          onPress={handleDelete}
          disabled={!phraseMatches || busy}
          activeOpacity={0.8}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={localStyles.deleteButtonText}>Eliminar todos mis datos</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {busy && (
        <View style={securityStyles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </SafeAreaView>
  );
};

// Estilos locales de esta pantalla (no se reutilizan en otras vistas).
const localStyles = StyleSheet.create({
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: (colors.danger || '#dc2626') + '15',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: colors.danger,
    lineHeight: 18,
  },
  confirmLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  confirmPhrase: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  inputValid: {
    borderColor: colors.danger,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  deleteButtonDisabled: {
    opacity: 0.4,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default DataResetScreen;
