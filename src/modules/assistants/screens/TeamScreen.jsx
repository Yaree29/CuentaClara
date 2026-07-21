// =============================================================================
// TeamScreen.jsx
// -----------------------------------------------------------------------------
// Gestión CRUD de asistentes alta/edición/bloqueo/regeneración
// de PIN, consumiendo assistantsService.js.
//
// Nota de seguridad importante: el PIN nunca se guarda en texto plano en el
// backend (solo pin_hash/pin_salt) ni viaja de vuelta en ninguna respuesta.
// Por eso solo puede "compartirse" en el instante en que se genera —
// al crear un asistente o al regenerar su PIN. No existe forma de recuperar
// el PIN de un asistente ya creado sin regenerarlo (y regenerar exige
// confirmar la contraseña del dueño).
// =============================================================================
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Switch,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import assistantsService from '../services/assistantsService';
import authService from '../../auth/services/authService';
import colors from '../../../theme/colors';
import profileStyles from '../../profile/styles/profile.styles';
import styles from '../styles/team.styles';

const MAX_ASSISTANTS = 3;

const ACCESS_OPTIONS = [
  { key: 'sales', label: 'Ventas' },
  { key: 'inventory', label: 'Inventario' },
  // Solo cambia la etiqueta visible — el valor almacenado sigue siendo
  // 'both' (backend ACCESS_TYPES, ver auditoría: no hace falta migrar la DB).
  { key: 'both', label: 'Supervisor' },
];

const accessLabel = (key) => ACCESS_OPTIONS.find((o) => o.key === key)?.label || key;

// PIN de 6 dígitos. Se genera en el cliente porque el backend nunca devuelve
// el PIN en texto plano (solo lo hashea) — esta es la única oportunidad de
// conocerlo para poder compartirlo.
const generatePin = () => String(Math.floor(100000 + Math.random() * 900000));

// Rol obligatorio: trim, colapsa espacios internos múltiples a uno solo y
// capitaliza cada palabra (title case) antes de enviarlo al backend.
const normalizeRole = (value) =>
  value
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

const MenuSection = ({ title, children }) => (
  <View style={profileStyles.menuSection}>
    {title ? <Text style={profileStyles.menuSectionTitle}>{title}</Text> : null}
    <View style={profileStyles.menuSectionContent}>{children}</View>
  </View>
);

const AssistantRow = ({ assistant, onPress, isLast }) => (
  <TouchableOpacity
    style={[profileStyles.menuItem, isLast && profileStyles.menuItemLast]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[profileStyles.iconContainer, profileStyles.iconContainerBusiness]}>
      <Ionicons name="person-outline" size={20} color={colors.primary} />
    </View>
    <View style={profileStyles.menuTextContainer}>
      <Text style={profileStyles.menuLabel}>{assistant.name}</Text>
      <Text style={profileStyles.menuSubLabel}>
        {assistant.role ? `${assistant.role} · ` : ''}{accessLabel(assistant.access_type)}
      </Text>
    </View>
    <View style={styles.rowRight}>
      <View style={[styles.badge, assistant.is_blocked ? styles.badgeBlocked : styles.badgeActive]}>
        <Text style={assistant.is_blocked ? styles.badgeTextBlocked : styles.badgeTextActive}>
          {assistant.is_blocked ? 'Bloqueado' : 'Activo'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </View>
  </TouchableOpacity>
);

const AccessTypeSelector = ({ value, onChange }) => (
  <View style={styles.segmentedControl}>
    {ACCESS_OPTIONS.map((option) => {
      const active = value === option.key;
      return (
        <TouchableOpacity
          key={option.key}
          style={[styles.segmentButton, active && styles.segmentButtonActive]}
          onPress={() => onChange(option.key)}
        >
          <Text style={[styles.segmentButtonText, active && styles.segmentButtonTextActive]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const TeamScreen = () => {
  const navigation = useNavigation();

  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal: crear asistente
  const [createVisible, setCreateVisible] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createRole, setCreateRole] = useState('');
  const [createAccessType, setCreateAccessType] = useState('sales');
  const [createConfirmed, setCreateConfirmed] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Modal: gestionar asistente existente
  const [manageVisible, setManageVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editAccessType, setEditAccessType] = useState('sales');
  const [savingEdit, setSavingEdit] = useState(false);
  const [togglingBlock, setTogglingBlock] = useState(false);

  // Modal: confirmar contraseña antes de regenerar/revelar un PIN nuevo
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [verifyingPassword, setVerifyingPassword] = useState(false);

  // Modal: PIN recién generado (creación o regeneración)
  const [pinResult, setPinResult] = useState({ visible: false, pin: null, name: null });

  // Modal: eliminar asistente (exige escribir la frase de confirmación)
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fetchAssistants = useCallback(async () => {
    try {
      const data = await assistantsService.getAssistants();
      setAssistants(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert('Error', error?.message || 'No se pudieron cargar los asistentes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAssistants();
    }, [fetchAssistants])
  );

  const activeCount = assistants.filter((a) => !a.is_blocked).length;
  const canAddMore = activeCount < MAX_ASSISTANTS;

  /* ============================= Crear asistente ============================= */

  const resetCreateForm = () => {
    setCreateName('');
    setCreateRole('');
    setCreateAccessType('sales');
    setCreateConfirmed(false);
    setCreateError(null);
  };

  const openCreateModal = () => {
    resetCreateForm();
    setCreateVisible(true);
  };

  const createNameValid = createName.trim().length >= 2;
  const createRoleValid = normalizeRole(createRole).length > 0;
  const canSubmitCreate =
    createNameValid && createRoleValid && createAccessType && createConfirmed && !createSubmitting;

  const handleCreate = async () => {
    if (!canSubmitCreate) return;

    setCreateSubmitting(true);
    setCreateError(null);
    const pin = generatePin();
    const name = createName.trim();
    const role = normalizeRole(createRole);

    try {
      await assistantsService.createAssistant({
        name,
        pin,
        access_type: createAccessType,
        role,
      });
      setCreateVisible(false);
      resetCreateForm();
      await fetchAssistants();
      setPinResult({ visible: true, pin, name });
    } catch (error) {
      setCreateError(error?.message || 'No se pudo crear el asistente.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  /* ======================= Gestionar asistente existente ======================= */

  const openManageModal = (assistant) => {
    setSelected(assistant);
    setEditName(assistant.name);
    setEditRole(assistant.role || '');
    setEditAccessType(assistant.access_type);
    setManageVisible(true);
  };

  const editNameValid = editName.trim().length >= 2;
  const editRoleValid = normalizeRole(editRole).length > 0;

  const handleSaveEdit = async () => {
    if (!editNameValid || !editRoleValid || !selected) return;

    setSavingEdit(true);
    try {
      const updated = await assistantsService.updateAssistant(selected.id, {
        name: editName.trim(),
        access_type: editAccessType,
        role: normalizeRole(editRole),
      });
      setAssistants((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setSelected(updated);
      Alert.alert('Guardado', 'Los datos del asistente se actualizaron.');
    } catch (error) {
      Alert.alert('Error', 'No se pudieron guardar los cambios. Inténtalo de nuevo.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleBlocked = async (nextBlocked) => {
    if (!selected) return;

    setTogglingBlock(true);
    try {
      const updated = await assistantsService.updateAssistant(selected.id, {
        is_blocked: nextBlocked,
      });
      setAssistants((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setSelected(updated);
    } catch (error) {
      // Analizamos si superó el límite
      const rawError = String(error?.message || '').toLowerCase();
      const isMaxActiveError = rawError.includes('asistentes activos') || rawError.includes('límite') || rawError.includes('max');

      if (isMaxActiveError) {
        Alert.alert('Límite de asistentes', 'Ya alcanzaste el límite máximo de asistentes activos.');
      } else {
        Alert.alert('Error', 'No se pudo actualizar el estado del asistente.');
      }
    } finally {
      setTogglingBlock(false);
    }
  };

  /* ==================== Regenerar PIN (exige contraseña) ==================== */

  const openPasswordPrompt = () => {
    setPasswordInput('');
    setPasswordError(null);
    setPasswordVisible(true);
  };

  const handleConfirmPasswordAndRegenerate = async () => {
    if (!passwordInput || !selected) return;

    setVerifyingPassword(true);
    setPasswordError(null);

    const isValid = await authService.verifyPassword(passwordInput);
    if (!isValid) {
      setPasswordError('Contraseña incorrecta.');
      setVerifyingPassword(false);
      return;
    }

    const newPin = generatePin();
    try {
      const updated = await assistantsService.updateAssistant(selected.id, { new_pin: newPin });
      setAssistants((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setPasswordVisible(false);
      setManageVisible(false);
      setPinResult({ visible: true, pin: newPin, name: updated.name });
    } catch (error) {
      setPasswordError(error?.message || 'No se pudo regenerar el PIN.');
    } finally {
      setVerifyingPassword(false);
    }
  };

  /* ==================== Eliminar asistente (exige frase exacta) ==================== */

  const DELETE_PHRASE = 'eliminar asistente';

  const openDeletePrompt = () => {
    setDeleteConfirmText('');
    setDeleteError(null);
    setDeleteVisible(true);
  };

  const closeDeletePrompt = () => {
    setDeleteVisible(false);
    setDeleteConfirmText('');
    setDeleteError(null);
  };

  const deletePhraseMatches = deleteConfirmText.trim().toLowerCase() === DELETE_PHRASE;

  const handleConfirmDelete = async () => {
    if (!deletePhraseMatches || !selected) return;

    setDeleting(true);
    setDeleteError(null);
    try {
      await assistantsService.deleteAssistant(selected.id);
      setAssistants((prev) => prev.filter((a) => a.id !== selected.id));
      closeDeletePrompt();
      setManageVisible(false);
      setSelected(null);
    } catch (error) {
      setDeleteError(error?.message || 'No se pudo eliminar el asistente.');
    } finally {
      setDeleting(false);
    }
  };

  /* ============================ Compartir / copiar ============================ */

  const sharePinViaWhatsapp = (pin, name) => {
    const message =
      `Hola ${name}, este es tu código de acceso para registrar tus ventas en la app: *${pin}*\n\n` +
      `Ingrésalo cuando la app te lo pida. No lo compartas con nadie más.`;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch(() => {
      Alert.alert('No se pudo abrir WhatsApp', 'Asegúrate de tenerlo instalado en este dispositivo.');
    });
  };

  const copyPin = async (pin) => {
    await Clipboard.setStringAsync(pin);
    Alert.alert('Copiado', 'El código se copió al portapapeles.');
  };

  const closePinResult = () => setPinResult({ visible: false, pin: null, name: null });

  /* ================================== Render ================================== */

  return (
    <SafeAreaView style={profileStyles.safeArea}>
      <View style={profileStyles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={profileStyles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={profileStyles.headerTitle}>Equipo</Text>
        <View style={profileStyles.headerPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={profileStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={profileStyles.bodyContainer}>
          {!canAddMore && (
            <View style={styles.banner}>
              <Text style={styles.bannerText}>
                Ya tienes {MAX_ASSISTANTS} asistentes activos, el máximo permitido. Bloquea o Elimina uno
                existente para poder agregar otro.
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.addButton, !canAddMore && styles.addButtonDisabled]}
            onPress={openCreateModal}
            disabled={!canAddMore}
          >
            <Text style={styles.addButtonText}>+ Agregar Asistente</Text>
          </TouchableOpacity>

          <MenuSection title={`Asistentes (${assistants.length})`}>
            {loading ? (
              <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : assistants.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Aún no tienes asistentes registrados. Agrega uno para que pueda registrar
                  ventas o inventario sin necesitar su propia cuenta.
                </Text>
              </View>
            ) : (
              assistants.map((assistant, index) => (
                <AssistantRow
                  key={assistant.id}
                  assistant={assistant}
                  isLast={index === assistants.length - 1}
                  onPress={() => openManageModal(assistant)}
                />
              ))
            )}
          </MenuSection>
        </View>
      </ScrollView>

      {/* ============================ Modal: crear ============================ */}
      <Modal visible={createVisible} transparent animationType="fade" onRequestClose={() => setCreateVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Nuevo asistente</Text>
              <Text style={styles.modalSubtitle}>
                El PIN se genera automáticamente. Deberás compartirlo con el asistente al terminar.
              </Text>

              <Text style={styles.fieldLabel}>Nombre</Text>
              <TextInput
                style={styles.textInput}
                value={createName}
                onChangeText={(v) => {
                  setCreateName(v);
                  setCreateConfirmed(false);
                }}
                placeholder="Ej. Juan Pérez"
                placeholderTextColor={colors.placeholder}
              />

              <Text style={styles.fieldLabel}>Rol *</Text>
              <TextInput
                style={styles.textInput}
                value={createRole}
                onChangeText={(v) => {
                  setCreateRole(v);
                  setCreateConfirmed(false);
                }}
                placeholder="Ej. Barbero, Mesero"
                placeholderTextColor={colors.placeholder}
              />

              <Text style={styles.fieldLabel}>Tipo de acceso</Text>
              <AccessTypeSelector
                value={createAccessType}
                onChange={(v) => {
                  setCreateAccessType(v);
                  setCreateConfirmed(false);
                }}
              />

              {createNameValid && createRoleValid && (
                <>
                  <View style={styles.summaryBox}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Nombre</Text>
                      <Text style={styles.summaryValue}>{createName.trim()}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Acceso</Text>
                      <Text style={styles.summaryValue}>{accessLabel(createAccessType)}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setCreateConfirmed((v) => !v)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, createConfirmed && styles.checkboxChecked]}>
                      {createConfirmed && <Ionicons name="checkmark" size={14} color={colors.textButton} />}
                    </View>
                    <Text style={styles.checkboxLabel}>
                      Confirmo que estos datos son correctos.
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {createError && <Text style={styles.errorText}>{createError}</Text>}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                  onPress={() => setCreateVisible(false)}
                >
                  <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    canSubmitCreate ? styles.modalButtonPrimary : styles.modalButtonDisabled,
                  ]}
                  onPress={handleCreate}
                  disabled={!canSubmitCreate}
                >
                  {createSubmitting ? (
                    <ActivityIndicator size="small" color={colors.textButton} />
                  ) : (
                    <Text style={styles.modalButtonTextPrimary}>Crear</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ======================== Modal: gestionar asistente ======================== */}
      <Modal visible={manageVisible} transparent animationType="fade" onRequestClose={() => setManageVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{selected?.name}</Text>
              <Text style={styles.modalSubtitle}>Editar datos, bloquear o regenerar el PIN.</Text>

              <Text style={styles.fieldLabel}>Nombre</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Nombre del asistente"
                placeholderTextColor={colors.placeholder}
              />

              <Text style={styles.fieldLabel}>Rol *</Text>
              <TextInput
                style={styles.textInput}
                value={editRole}
                onChangeText={setEditRole}
                placeholder="Ej. Barbero, Mesero"
                placeholderTextColor={colors.placeholder}
              />

              <Text style={styles.fieldLabel}>Tipo de acceso</Text>
              <AccessTypeSelector value={editAccessType} onChange={setEditAccessType} />

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, { marginTop: 16 }]}
                onPress={handleSaveEdit}
                disabled={!editNameValid || !editRoleValid || savingEdit}
              >
                {savingEdit ? (
                  <ActivityIndicator size="small" color={colors.textButton} />
                ) : (
                  <Text style={styles.modalButtonTextPrimary}>Guardar cambios</Text>
                )}
              </TouchableOpacity>

              <View
                style={[
                  profileStyles.menuItem,
                  { marginTop: 20, borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: 16 },
                ]}
              >
                <View style={profileStyles.menuTextContainer}>
                  <Text style={profileStyles.menuLabel}>Bloqueado</Text>
                  <Text style={profileStyles.menuSubLabel}>
                    Un asistente bloqueado no puede entrar al Modo Asistente.
                  </Text>
                </View>
                <Switch
                  value={!!selected?.is_blocked}
                  onValueChange={handleToggleBlocked}
                  disabled={togglingBlock}
                  trackColor={{ false: colors.border, true: colors.danger }}
                />
              </View>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDanger, { marginTop: 16 }]}
                onPress={openPasswordPrompt}
              >
                <Text style={styles.modalButtonTextDanger}>Regenerar PIN</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDanger, { marginTop: 12 }]}
                onPress={openDeletePrompt}
              >
                <Text style={styles.modalButtonTextDanger}>Eliminar asistente</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ marginTop: 8 }}
                onPress={() => setManageVisible(false)}
              >
                <Text style={styles.linkText}>Cerrar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ==================== Modal: eliminar asistente (frase exacta) ==================== */}
      <Modal visible={deleteVisible} transparent animationType="fade" onRequestClose={closeDeletePrompt}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Eliminar a {selected?.name}</Text>
            <Text style={styles.modalSubtitle}>
              Esta acción no se puede deshacer. Para confirmar, escribe exactamente{' '}
              <Text style={{ fontWeight: '700', color: colors.textPrimary }}>
                "{DELETE_PHRASE}"
              </Text>{' '}
              en el campo de abajo.
            </Text>

            <TextInput
              style={styles.textInput}
              value={deleteConfirmText}
              onChangeText={(v) => {
                setDeleteConfirmText(v);
                setDeleteError(null);
              }}
              placeholder={DELETE_PHRASE}
              placeholderTextColor={colors.placeholder}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {deleteError && <Text style={styles.errorText}>{deleteError}</Text>}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={closeDeletePrompt}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  deletePhraseMatches && !deleting ? styles.modalButtonDanger : styles.modalButtonDisabled,
                ]}
                onPress={handleConfirmDelete}
                disabled={!deletePhraseMatches || deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color={colors.danger} />
                ) : (
                  <Text style={deletePhraseMatches ? styles.modalButtonTextDanger : styles.modalButtonTextSecondary}>
                    Eliminar
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* =================== Modal: confirmar contraseña (regenerar PIN) =================== */}
      <Modal visible={passwordVisible} transparent animationType="fade" onRequestClose={() => setPasswordVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirma tu contraseña</Text>
            <Text style={styles.modalSubtitle}>
              Por seguridad, para generar y ver un PIN nuevo debes confirmar la contraseña de tu cuenta.
            </Text>

            <TextInput
              style={styles.textInput}
              value={passwordInput}
              onChangeText={setPasswordInput}
              placeholder="Tu contraseña"
              placeholderTextColor={colors.placeholder}
              secureTextEntry
            />

            {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setPasswordVisible(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  passwordInput && !verifyingPassword ? styles.modalButtonPrimary : styles.modalButtonDisabled,
                ]}
                onPress={handleConfirmPasswordAndRegenerate}
                disabled={!passwordInput || verifyingPassword}
              >
                {verifyingPassword ? (
                  <ActivityIndicator size="small" color={colors.textButton} />
                ) : (
                  <Text style={styles.modalButtonTextPrimary}>Confirmar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ==================== Modal: PIN generado (crear/regenerar) ==================== */}
      <Modal visible={pinResult.visible} transparent animationType="fade" onRequestClose={closePinResult}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>PIN de {pinResult.name}</Text>
            <Text style={styles.modalSubtitle}>
              Este código solo se muestra una vez. Compártelo ahora — no podrás volver a verlo
              después sin generar uno nuevo.
            </Text>

            <View style={styles.pinDisplay}>
              <Text style={styles.pinDigits}>{pinResult.pin}</Text>
            </View>

            <Text style={styles.pinHint}>
              Compártelo solo con {pinResult.name}. Cualquier persona con este código puede entrar
              al Modo Asistente con el acceso asignado.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => copyPin(pinResult.pin)}
              >
                <Text style={styles.modalButtonTextSecondary}>Copiar</Text>
              </TouchableOpacity>
              <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonPrimary,{ backgroundColor: '#25D366' }]}
              onPress={() => sharePinViaWhatsapp(pinResult.pin, pinResult.name)}
              >
                <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.modalButtonTextPrimary}>Compartir</Text>
            </TouchableOpacity>
            </View>

            <TouchableOpacity style={{ marginTop: 8 }} onPress={closePinResult}>
              <Text style={styles.linkText}>Listo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default TeamScreen;
