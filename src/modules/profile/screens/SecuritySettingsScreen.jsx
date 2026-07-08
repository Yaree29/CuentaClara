import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../../store/useAuthStore';
import biometricService from '../../auth/services/biometricService';
import colors from '../../../theme/colors';
import styles from '../styles/profile.styles';
import securityStyles from '../styles/security.styles';

const MenuSection = ({ title, children }) => (
  <View style={styles.menuSection}>
    <Text style={styles.menuSectionTitle}>{title}</Text>
    <View style={styles.menuSectionContent}>
      {children}
    </View>
  </View>
);

const SecuritySettingsScreen = () => {
  const navigation = useNavigation();
  const { user, updateUser } = useAuthStore();

  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [biometricBusy, setBiometricBusy] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.mfa_enabled ?? user?.is2FAEnabled ?? false);

  useEffect(() => {
    checkBiometricStatus();
  }, []);

  const checkBiometricStatus = async () => {
    const enabled = await biometricService.isBiometricEnabled();
    setIsBiometricEnabled(enabled);
  };

  // Flujo B: el propio guardado protegido (enableBiometric) ya pide la huella
  // como parte de la operación — un solo prompt, sin pasos extra.
  const toggleBiometrics = async (value) => {
    setBiometricBusy(true);
    try {
      if (value) {
        const { token } = useAuthStore.getState();
        await biometricService.enableBiometric({ user, token });
        setIsBiometricEnabled(true);
        Alert.alert('Éxito', 'Huella biométrica activada correctamente.');
      } else {
        await biometricService.disableBiometric();
        setIsBiometricEnabled(false);
        Alert.alert('Info', 'Huella biométrica desactivada.');
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo actualizar la huella.');
    } finally {
      setBiometricBusy(false);
    }
  };

  const toggle2FA = (value) => {
    if (value) {
      navigation.navigate('Token2FA', {
        actionLabel: 'Activar 2FA',
        description: 'Escanea el código QR con tu app autenticadora (Google Authenticator, Authy) e ingresa el código de 6 dígitos que genera.',
        actionType: 'enable_mfa',
        onSuccess: () => {
          setIs2FAEnabled(true);
          updateUser({ is2FAEnabled: true });
        }
      });
    } else {
      Alert.alert(
        'Desactivar 2FA',
        '¿Estás seguro de que deseas desactivar la verificación en dos pasos?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Desactivar',
            style: 'destructive',
            onPress: () => {
              setIs2FAEnabled(false);
              updateUser({ is2FAEnabled: false });
            },
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seguridad</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={securityStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={securityStyles.descriptionText}>
          Configura las capas adicionales de seguridad para proteger tu cuenta y tus datos financieros.
        </Text>

        {/* Sección: Acceso */}
        <MenuSection title="Acceso">
          <View style={securityStyles.switchItem}>
            <View style={securityStyles.switchTextContainer}>
              <Text style={securityStyles.switchLabel}>Huella biométrica</Text>
              <Text style={securityStyles.switchSubLabel}>Usa TouchID para entrar rápido</Text>
            </View>
            <Switch
              value={isBiometricEnabled}
              onValueChange={toggleBiometrics}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={Platform.OS === 'ios' ? undefined : (isBiometricEnabled ? colors.secondary : '#f4f3f4')}
            />
          </View>
        </MenuSection>

        {/* Sección: 2FA */}
        <MenuSection title="Verificación en dos pasos (2FA)">
          <View style={securityStyles.switchItem}>
            <View style={securityStyles.switchTextContainer}>
              <Text style={securityStyles.switchLabel}>Activar 2FA</Text>
              <Text style={securityStyles.switchSubLabel}>Manten tu cuenta segura con verificación adicional</Text>
            </View>
            <Switch
              value={is2FAEnabled}
              onValueChange={toggle2FA}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={Platform.OS === 'ios' ? undefined : (is2FAEnabled ? colors.secondary : '#f4f3f4')}
            />
          </View>
        </MenuSection>

        {/* Sección: Cuenta */}
        <MenuSection title="Cuenta">
          <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]} onPress={() => Alert.alert('Info', 'Funcionalidad de cambiar contraseña en desarrollo.')}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuLabel}>Cambiar contraseña</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </MenuSection>
      </ScrollView>

      {biometricBusy && (
        <View style={securityStyles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </SafeAreaView>
  );
};

export default SecuritySettingsScreen;
