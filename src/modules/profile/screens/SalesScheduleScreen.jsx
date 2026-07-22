// =============================================================================
// SalesScheduleScreen.jsx
// -----------------------------------------------------------------------------
// Pantalla "Horario de Ventas", navegable desde ProfileScreen (MenuItem dentro
// de "Ajustes de Negocio", solo dueño PYME — ver require_role("owner") en
// PUT /businesses/me/sales-schedule). Configura el horario fijo diario que
// gobierna cuándo se puede abrir la caja y registrar ventas (ver
// useCashSession.js / cash_service.py). Ambos campos en null (switch
// apagado) desactiva la restricción horaria — la caja obligatoria para
// vender sigue aplicando de todos modos.
//
// Los selectores de hora/minuto usan react-native-element-dropdown (ya es
// dependencia del proyecto, sin código nativo) para evitar agregar un
// date/time picker nativo nuevo y con eso otro rebuild nativo del dev client.
// =============================================================================
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Dropdown } from 'react-native-element-dropdown';
import businessService from '../../../services/businessService';
import colors from '../../../theme/colors';
import styles from '../styles/profile.styles';
import scheduleStyles from '../styles/salesSchedule.styles';

const HOURS = Array.from({ length: 24 }, (_, h) => {
  const value = String(h).padStart(2, '0');
  return { label: value, value };
});
const MINUTES = ['00', '15', '30', '45'].map((m) => ({ label: m, value: m }));

const splitTime = (value, fallback) => {
  if (!value) return fallback;
  const [hour, minute] = value.split(':');
  return { hour, minute: MINUTES.some((m) => m.value === minute) ? minute : '00' };
};

const SalesScheduleScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restricted, setRestricted] = useState(false);
  const [opening, setOpening] = useState({ hour: '07', minute: '00' });
  const [closing, setClosing] = useState({ hour: '20', minute: '00' });

  useEffect(() => {
    const load = async () => {
      try {
        const schedule = await businessService.getSalesSchedule();
        if (schedule) {
          setRestricted(true);
          setOpening(splitTime(schedule.opening_time, opening));
          setClosing(splitTime(schedule.closing_time, closing));
        }
      } catch (error) {
        // Sin horario configurado o error de red — se deja el formulario con
        // los valores por defecto (07:00–20:00) y el switch apagado.
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      if (!restricted) {
        await businessService.updateSalesSchedule({ opening_time: null, closing_time: null });
        Alert.alert('Horario guardado', 'Se desactivó la restricción de horario de ventas.');
      } else {
        const opening_time = `${opening.hour}:${opening.minute}`;
        const closing_time = `${closing.hour}:${closing.minute}`;
        if (opening_time >= closing_time) {
          Alert.alert('Horario inválido', 'La hora de apertura debe ser anterior a la hora de cierre.');
          return;
        }
        await businessService.updateSalesSchedule({ opening_time, closing_time });
        Alert.alert('Horario guardado', `Las ventas quedarán restringidas de ${opening_time} a ${closing_time}.`);
      }
    } catch (error) {
      Alert.alert('No se pudo guardar', error?.message || 'Intenta de nuevo.');
    } finally {
      setSaving(false);
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
            <Text style={styles.headerTitle}>Horario de Ventas</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          <View style={styles.bodyContainer}>
            {loading ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : (
              <View style={styles.menuSection}>
                <Text style={styles.menuSectionTitle}>Restricción horaria</Text>
                <View style={styles.menuSectionContent}>
                  <View style={styles.menuItem}>
                    <View style={styles.menuTextContainer}>
                      <Text style={styles.menuLabel}>Restringir horario de ventas</Text>
                      <Text style={styles.menuSubLabel}>
                        Fuera de este horario no se podrán registrar ventas.
                      </Text>
                    </View>
                    <Switch
                      value={restricted}
                      onValueChange={setRestricted}
                      trackColor={{ false: colors.border, true: colors.primary }}
                    />
                  </View>

                  {restricted && (
                    <View style={[styles.menuItem, styles.menuItemLast, { flexDirection: 'column', alignItems: 'stretch' }]}>
                      <Text style={scheduleStyles.hint}>
                        La caja solo se podrá abrir dentro de este horario, y no se podrá cerrar antes de la hora de cierre.
                      </Text>

                      <View style={scheduleStyles.timeRow}>
                        <Text style={scheduleStyles.timeLabel}>Apertura</Text>
                        <Dropdown
                          style={scheduleStyles.dropdown}
                          selectedTextStyle={scheduleStyles.dropdownText}
                          data={HOURS}
                          labelField="label"
                          valueField="value"
                          value={opening.hour}
                          onChange={(item) => setOpening((prev) => ({ ...prev, hour: item.value }))}
                        />
                        <Text style={scheduleStyles.separator}>:</Text>
                        <Dropdown
                          style={scheduleStyles.dropdown}
                          selectedTextStyle={scheduleStyles.dropdownText}
                          data={MINUTES}
                          labelField="label"
                          valueField="value"
                          value={opening.minute}
                          onChange={(item) => setOpening((prev) => ({ ...prev, minute: item.value }))}
                        />
                      </View>

                      <View style={scheduleStyles.timeRow}>
                        <Text style={scheduleStyles.timeLabel}>Cierre</Text>
                        <Dropdown
                          style={scheduleStyles.dropdown}
                          selectedTextStyle={scheduleStyles.dropdownText}
                          data={HOURS}
                          labelField="label"
                          valueField="value"
                          value={closing.hour}
                          onChange={(item) => setClosing((prev) => ({ ...prev, hour: item.value }))}
                        />
                        <Text style={scheduleStyles.separator}>:</Text>
                        <Dropdown
                          style={scheduleStyles.dropdown}
                          selectedTextStyle={scheduleStyles.dropdownText}
                          data={MINUTES}
                          labelField="label"
                          valueField="value"
                          value={closing.minute}
                          onChange={(item) => setClosing((prev) => ({ ...prev, minute: item.value }))}
                        />
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}

            {!loading && (
              <TouchableOpacity
                style={[scheduleStyles.saveButton, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={colors.textButton} />
                ) : (
                  <Text style={scheduleStyles.saveButtonText}>Guardar</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default SalesScheduleScreen;
