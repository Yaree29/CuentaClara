// =============================================================================
// MonthlyGoalScreen.jsx
// -----------------------------------------------------------------------------
// Pantalla "Meta Mensual", navegable desde ProfileScreen (MenuItem dentro de
// "Ajustes de Negocio", sección exclusiva de PYME). Antes la meta se
// configuraba desde una tarjeta en el propio dashboard; se movió aquí porque
// es un ajuste que se define una vez, no algo que se consulte a diario. En el
// dashboard queda únicamente la REPRESENTACIÓN del avance, dentro del banner
// de "Ventas del Día".
//
// La meta se guarda en business_configs.settings.monthlyGoal. El backend
// REEMPLAZA `settings` entero (ver business_service.update_business_config),
// así que se envía fusionado con lo que ya había para no borrar otros ajustes.
//
// El monto es un ENTERO: se filtran los separadores al escribir porque
// admitirlos volvía ambiguo si "6.000" son seis mil o seis (ese parseo llegó a
// guardar 6 cuando se escribía 6000).
// =============================================================================
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import businessService from '../../../services/businessService';
import colors from '../../../theme/colors';
import styles from '../styles/profile.styles';
import goalStyles from '../styles/monthlyGoal.styles';

const MonthlyGoalScreen = () => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({});
  const [goal, setGoal] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const config = await businessService.getBusinessConfig();
        const current = config?.settings || {};
        setSettings(current);

        const saved = Number(current.monthlyGoal) || 0;
        if (saved > 0) setGoal(String(Math.round(saved)));
      } catch (error) {
        // Sin conexión o sin config todavía: se deja el campo vacío para que
        // el usuario escriba su meta desde cero.
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    const value = Number(goal);
    if (!Number.isFinite(value) || value <= 0) {
      Alert.alert('Meta inválida', 'Escribe un monto mayor a 0.');
      return;
    }

    setSaving(true);
    try {
      await businessService.updateBusinessConfig({
        settings: { ...settings, monthlyGoal: value },
      });
      Alert.alert('Meta guardada', 'Verás tu avance en el inicio, sobre las ventas del día.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('No se pudo guardar', error?.message || 'Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setSaving(true);
    try {
      const { monthlyGoal, ...rest } = settings;
      await businessService.updateBusinessConfig({ settings: rest });
      setSettings(rest);
      setGoal('');
      Alert.alert('Meta eliminada', 'Ya no se mostrará el avance en el inicio.');
    } catch (error) {
      Alert.alert('No se pudo eliminar', error?.message || 'Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const hasSavedGoal = Number(settings?.monthlyGoal) > 0;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Meta Mensual</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          <View style={styles.bodyContainer}>
            {loading ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : (
              <View style={styles.menuSection}>
                <Text style={styles.menuSectionTitle}>Objetivo de ventas</Text>
                <View style={styles.menuSectionContent}>
                  <View style={[styles.menuItem, styles.menuItemLast, { flexDirection: 'column', alignItems: 'stretch' }]}>
                    <Text style={goalStyles.hint}>
                      ¿Cuánto quieres vender este mes? El avance aparece en el inicio,
                      sobre las ventas del día.
                    </Text>

                    <View style={goalStyles.inputRow}>
                      <Text style={goalStyles.currencyPrefix}>$</Text>
                      <TextInput
                        style={goalStyles.input}
                        placeholder="6000"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="number-pad"
                        value={goal}
                        onChangeText={(val) => setGoal(val.replace(/[^0-9]/g, ''))}
                      />
                    </View>

                    <Text style={goalStyles.note}>
                      Se compara con lo vendido desde el día 1 del mes hasta hoy.
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[goalStyles.saveButton, saving && goalStyles.saveButtonDisabled]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color={colors.textWhite} size="small" />
                  ) : (
                    <Text style={goalStyles.saveButtonText}>Guardar meta</Text>
                  )}
                </TouchableOpacity>

                {hasSavedGoal && (
                  <TouchableOpacity
                    style={goalStyles.removeButton}
                    onPress={handleRemove}
                    disabled={saving}
                  >
                    <Text style={goalStyles.removeButtonText}>Quitar meta</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default MonthlyGoalScreen;
