// =============================================================================
// AssistantSelectScreen.jsx
// -----------------------------------------------------------------------------
// Pantalla de entrada al Modo Asistente: selector de nombres + verificación de PIN
// Pensada para pantalla compartida en el mostrador: tarjetas grandes, texto
// legible a distancia, teclado numérico propio en vez del teclado del sistema.
//
// El dueño llega aquí desde el kebab (DashboardHeader → "Entrar a Modo
// Asistente", que ya llamó enableMode()). Esta pantalla NO debe permitir
// volver atrás sin contraseña — se bloquea el gesto de swipe y el botón físico de back en
// Android.
//
// Al verificar el PIN correctamente se guarda el asistente activo en el store
// y se navega a Home.
// =============================================================================
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import assistantsService from '../services/assistantsService';
import useAssistantModeStore from '../../../store/useAssistantModeStore';
import ExitAssistantModeModal from '../components/ExitAssistantModeModal';
import colors from '../../../theme/colors';
import styles from '../styles/assistantSelect.styles';

const ACCESS_LABELS = {
  sales: 'Ventas',
  inventory: 'Inventario',
  both: 'Ventas e Inventario',
};

const KEYPAD_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'back'],
];

const AssistantSelectScreen = () => {
  const navigation = useNavigation();
  const selectAssistant = useAssistantModeStore((state) => state.selectAssistant);

  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pinTarget, setPinTarget] = useState(null); // {id, name, access_type}
  const [pinValue, setPinValue] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [pinError, setPinError] = useState(null);

  // Salida por contraseña (hallazgo de la prueba: esta pantalla no tenía
  // forma de salir sin PIN si el dueño entró por error). activeAssistant
  // todavía es null aquí, así que disableMode() solo apaga isActive.
  const [exitModalVisible, setExitModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await assistantsService.getActiveAssistants();
        setAssistants(Array.isArray(data) ? data : []);
      } catch {
        setAssistants([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Bloquea el back físico de Android mientras esta pantalla está en foco —
  // el asistente no debe poder "regresar" a la sesión del dueño sin PIN.
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => subscription.remove();
    }, [])
  );

  const openPinPad = (assistant) => {
    setPinTarget(assistant);
    setPinValue('');
    setPinError(null);
  };

  const closePinPad = () => {
    setPinTarget(null);
    setPinValue('');
    setPinError(null);
  };

  const submitPin = useCallback(async (pin) => {
    setVerifying(true);
    setPinError(null);
    try {
      const result = await assistantsService.verifyPin(pinTarget.id, pin);
      selectAssistant(result);
      closePinPad();
      navigation.navigate('MainTabs', { screen: 'dashboard' });
    } catch (error) {
      // Extraemos el código de estado HTTP
      const statusCode = error?.status || error?.response?.status;

      if (statusCode === 403) {
        setPinError('Este asistente está bloqueado. Contacta al dueño del negocio.');
      } else {
        // Para 401, 500 o cualquier otro fallo
        setPinError('PIN incorrecto. Inténtalo de nuevo.');
      }
      setPinValue('');
    } finally {
      setVerifying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinTarget, selectAssistant, navigation]);

  const handleDigit = (digit) => {
    if (verifying || pinValue.length >= 6) return;
    const next = pinValue + digit;
    setPinError(null);
    setPinValue(next);
    if (next.length === 6) {
      submitPin(next);
    }
  };

  const handleBackspace = () => {
    if (verifying) return;
    setPinValue((prev) => prev.slice(0, -1));
  };

  const handleExitSuccess = () => {
    setExitModalVisible(false);
    navigation.navigate('MainTabs', { screen: 'dashboard' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>¿Quién va a registrar?</Text>
        <Text style={styles.subtitle}>Toca tu nombre para continuar</Text>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : assistants.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No hay asistentes activos todavía. Pídele al dueño que agregue uno desde
              Configuración → Equipo.
            </Text>
          </View>
        ) : (
          assistants.map((assistant) => (
            <TouchableOpacity
              key={assistant.id}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => openPinPad(assistant)}
            >
              <View style={styles.cardAvatar}>
                <Text style={styles.cardAvatarText}>{assistant.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardName}>{assistant.name}</Text>
                <Text style={styles.cardAccess}>
                  {ACCESS_LABELS[assistant.access_type] || assistant.access_type}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity
          style={styles.exitLinkButton}
          onPress={() => setExitModalVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.exitLinkText}>Salir del Modo Asistente</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={!!pinTarget} transparent animationType="fade" onRequestClose={closePinPad}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Bienvenido, {pinTarget?.name}</Text>
            <Text style={styles.modalSubtitle}>Ingresa tu PIN de 6 dígitos</Text>

            <View style={styles.pinDotsRow}>
              {Array.from({ length: 6 }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.pinDot,
                    index < pinValue.length && styles.pinDotFilled,
                    pinError && styles.pinDotError,
                  ]}
                />
              ))}
            </View>

            {pinError && <Text style={styles.errorText}>{pinError}</Text>}

            <View style={styles.keypad}>
              {KEYPAD_ROWS.flat().map((key, index) => {
                if (key === '') {
                  return <View key={`empty-${index}`} style={styles.keypadKey} />;
                }
                if (key === 'back') {
                  return (
                    <TouchableOpacity
                      key="back"
                      style={styles.keypadKey}
                      onPress={handleBackspace}
                      disabled={verifying}
                    >
                      <Ionicons name="backspace-outline" size={22} color={colors.textPrimary} />
                    </TouchableOpacity>
                  );
                }
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.keypadKey, verifying && styles.keypadKeyDisabled]}
                    onPress={() => handleDigit(key)}
                    disabled={verifying}
                  >
                    <Text style={styles.keypadKeyText}>{key}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.cancelLink} onPress={closePinPad} disabled={verifying}>
              <Text style={styles.cancelLinkText}>Cancelar</Text>
            </TouchableOpacity>

            {verifying && (
              <View style={styles.verifyingOverlay}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
          </View>
        </View>
      </Modal>

      <ExitAssistantModeModal
        visible={exitModalVisible}
        onClose={() => setExitModalVisible(false)}
        onSuccess={handleExitSuccess}
      />
    </SafeAreaView>
  );
};

export default AssistantSelectScreen;