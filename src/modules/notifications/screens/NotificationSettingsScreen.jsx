// =============================================================================
// NotificationSettingsScreen.jsx
// -----------------------------------------------------------------------------
// Pantalla "Notificaciones", navegable desde SettingsScreen (MenuItem
// "Notificaciones" dentro de "Ajustes de Negocio"). Permite al dueño PYME
// activar/desactivar los avisos push que llegan cuando un asistente (Modo
// Asistente) registra una venta o modifica inventario, y da acceso al
// historial de notificaciones ya recibidas.
// =============================================================================
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import useNotificationPreferences, {
  NOTIFICATION_PREF_LABELS,
  ALL_NOTIFICATION_PREF_FLAGS,
} from '../hooks/useNotificationPreferences';
import colors from '../../../theme/colors';
import styles from '../../profile/styles/profile.styles';

const MenuSection = ({ title, children }) => (
  <View style={styles.menuSection}>
    <Text style={styles.menuSectionTitle}>{title}</Text>
    <View style={styles.menuSectionContent}>
      {children}
    </View>
  </View>
);

const NotificationSettingsScreen = () => {
  const navigation = useNavigation();
  const { prefs, loading, updatePref } = useNotificationPreferences();

  const handleToggle = async (flag, value) => {
    try {
      await updatePref(flag, value);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la preferencia de notificación.');
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notificaciones</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          {/* Cuerpo del Menú */}
          <View style={styles.bodyContainer}>
            <MenuSection title="Alertas de asistentes">
              {loading ? (
                <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : (
                ALL_NOTIFICATION_PREF_FLAGS.map((flag, index) => (
                  <View
                    key={flag}
                    style={[styles.menuItem, index === ALL_NOTIFICATION_PREF_FLAGS.length - 1 && styles.menuItemLast]}
                  >
                    <View style={styles.menuTextContainer}>
                      <Text style={styles.menuLabel}>{NOTIFICATION_PREF_LABELS[flag].label}</Text>
                      <Text style={styles.menuSubLabel}>{NOTIFICATION_PREF_LABELS[flag].description}</Text>
                    </View>
                    <Switch
                      value={!!prefs[flag]}
                      onValueChange={(value) => handleToggle(flag, value)}
                      trackColor={{ false: colors.border, true: colors.primary }}
                    />
                  </View>
                ))
              )}
            </MenuSection>

            <MenuSection title="Historial">
              <TouchableOpacity
                style={[styles.menuItem, styles.menuItemLast]}
                onPress={() => navigation.navigate('Notifications')}
                activeOpacity={0.7}
              >
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuLabel}>Ver historial de notificaciones</Text>
                  <Text style={styles.menuSubLabel}>Todas las alertas que has recibido</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </MenuSection>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default NotificationSettingsScreen;
