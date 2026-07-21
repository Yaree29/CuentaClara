// =============================================================================
// AppSettingsScreen.jsx
// -----------------------------------------------------------------------------
// Pantalla "Aplicación", navegable desde SettingsScreen (MenuItem "Aplicación"
// dentro de "Ajustes de Negocio"). Aloja bloques de configuración agrupados
// por dominio — Inventario hoy, más módulos activables/desactivables después
// — cada uno en su propia MenuSection, sin rehacer el layout al agregar más.
// =============================================================================
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import useInventoryConfig, { FLAG_LABELS } from '../../inventory/hooks/useInventoryConfig';
import useBusinessConfig from '../hooks/useBusinessConfig';
import colors from '../../../theme/colors';
import styles from '../styles/profile.styles';
import businessStyles from '../styles/appSettingsScreen.styles';

const MenuSection = ({ title, children }) => (
  <View style={styles.menuSection}>
    <Text style={styles.menuSectionTitle}>{title}</Text>
    <View style={styles.menuSectionContent}>
      {children}
    </View>
  </View>
);

const AppSettingsScreen = () => {
  const navigation = useNavigation();
  const { visibleFlags, config, loading: loadingInventoryConfig, updateFlag } = useInventoryConfig();
  const { config: businessConfig, loading: loadingBusinessConfig, updateConfig: updateBusinessConfig } = useBusinessConfig();

  const [currencyInput, setCurrencyInput] = useState('');
  const [taxRateInput, setTaxRateInput] = useState('');
  const [savingBusinessConfig, setSavingBusinessConfig] = useState(false);
  const [businessConfigError, setBusinessConfigError] = useState(null);

  useEffect(() => {
    if (businessConfig) {
      setCurrencyInput(businessConfig.currency || '');
      setTaxRateInput(String(businessConfig.tax_rate ?? ''));
    }
  }, [businessConfig]);

  const handleToggleFlag = async (flag, value) => {
    try {
      await updateFlag(flag, value);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la configuración de inventario.');
    }
  };

  const handleSaveBusinessConfig = async () => {
    const parsedTaxRate = Number(taxRateInput);
    if (taxRateInput !== '' && Number.isNaN(parsedTaxRate)) {
      setBusinessConfigError('La tasa de impuesto debe ser un número.');
      return;
    }

    setSavingBusinessConfig(true);
    setBusinessConfigError(null);
    try {
      await updateBusinessConfig({
        currency: currencyInput.trim() || undefined,
        tax_rate: taxRateInput !== '' ? parsedTaxRate : undefined,
      });
    } catch (error) {
      setBusinessConfigError(error?.message || 'No se pudo guardar la configuración de negocio.');
    } finally {
      setSavingBusinessConfig(false);
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
            <Text style={styles.headerTitle}>Aplicación</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          {/* Cuerpo del Menú */}
          <View style={styles.bodyContainer}>
            <MenuSection title="Configuración de Inventario">
              {loadingInventoryConfig ? (
                <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : visibleFlags.length === 0 ? (
                <Text style={styles.menuSubLabel}>No aplica para tu categoría de negocio.</Text>
              ) : (
                visibleFlags.map((flag, index) => (
                  <View
                    key={flag}
                    style={[styles.menuItem, index === visibleFlags.length - 1 && styles.menuItemLast]}
                  >
                    <View style={styles.menuTextContainer}>
                      <Text style={styles.menuLabel}>{FLAG_LABELS[flag].label}</Text>
                      <Text style={styles.menuSubLabel}>{FLAG_LABELS[flag].description}</Text>
                    </View>
                    <Switch
                      value={!!config[flag]}
                      onValueChange={(value) => handleToggleFlag(flag, value)}
                      trackColor={{ false: colors.border, true: colors.primary }}
                    />
                  </View>
                ))
              )}
            </MenuSection>

            <MenuSection title="Configuración de Negocio">
              <Text style={businessStyles.sectionSubtitle}>Moneda e impuestos</Text>
              {loadingBusinessConfig ? (
                <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : (
                <>
                  <Text style={businessStyles.fieldLabel}>Moneda</Text>
                  <TextInput
                    style={businessStyles.textInput}
                    value={currencyInput}
                    onChangeText={setCurrencyInput}
                    placeholder="Ej. USD"
                    placeholderTextColor={colors.placeholder}
                    autoCapitalize="characters"
                  />

                  <Text style={businessStyles.fieldLabel}>Tasa de impuesto (%)</Text>
                  <TextInput
                    style={businessStyles.textInput}
                    value={taxRateInput}
                    onChangeText={setTaxRateInput}
                    placeholder="Ej. 7"
                    placeholderTextColor={colors.placeholder}
                    keyboardType="numeric"
                  />

                  {businessConfigError && <Text style={businessStyles.errorText}>{businessConfigError}</Text>}

                  <TouchableOpacity
                    style={[businessStyles.saveButton, savingBusinessConfig && businessStyles.saveButtonDisabled]}
                    onPress={handleSaveBusinessConfig}
                    disabled={savingBusinessConfig}
                  >
                    {savingBusinessConfig ? (
                      <ActivityIndicator size="small" color={colors.textButton} />
                    ) : (
                      <Text style={businessStyles.saveButtonText}>Guardar cambios</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </MenuSection>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default AppSettingsScreen;
