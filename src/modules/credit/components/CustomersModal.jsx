// =============================================================================
// CustomersModal.jsx
// -----------------------------------------------------------------------------
// Gestión de la libreta de clientes del fiado: listar, editar y eliminar.
//
// Vive en un modal aparte (y no dentro de InformalCredit.jsx) porque ese
// componente ya supera las 800 líneas y esto es un CRUD completo con su propia
// vista de lista y de formulario.
//
// Reglas que la UI refleja:
//   · Un cliente con saldo pendiente NO se puede eliminar. El backend lo valida
//     igual (deactivate_customer), acá solo se anticipa para no ofrecer una
//     acción que va a fallar.
//   · Eliminar es baja lógica: el historial de fiados se conserva.
// =============================================================================
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, Modal, Alert, ActivityIndicator,
} from 'react-native';
import { XMarkIcon, MagnifyingGlassIcon } from 'react-native-heroicons/solid';
import { Ionicons } from '@expo/vector-icons';

import styles from '../styles/informalCredit.styles';
import colors from '../../../theme/colors';

const CustomersModal = ({
  visible,
  customers = [],
  editingCustomer,
  setEditingCustomer,
  onSave,
  onDelete,
  onClose,
}) => {
  const [search, setSearch] = useState('');

  // Formulario
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Precargar la ficha al entrar en modo edición
  useEffect(() => {
    if (editingCustomer) {
      setName(editingCustomer.name || '');
      setPhone((editingCustomer.phone || '').replace('+507', ''));
      setNotes(editingCustomer.notes || '');
    }
    setFormError('');
  }, [editingCustomer]);

  // Limpiar el buscador al cerrar, para no reabrir con un filtro viejo puesto
  useEffect(() => {
    if (!visible) {
      setSearch('');
      setFormError('');
    }
  }, [visible]);

  const filtered = search
    ? customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : customers;

  const handleSave = async () => {
    if (saving) return;

    setSaving(true);
    const result = await onSave(editingCustomer.id, { name, phone, notes });
    setSaving(false);

    if (!result?.ok) {
      setFormError(result?.error || 'No pudimos guardar los cambios.');
      return;
    }

    setEditingCustomer(null);
  };

  const handleDelete = (customer) => {
    if (!customer.canDelete) {
      Alert.alert(
        'No se puede eliminar',
        `${customer.name} todavía debe $${customer.totalDebt.toFixed(2)}. ` +
        'Registra el pago o cancela sus fiados antes de eliminarlo.'
      );
      return;
    }

    Alert.alert(
      'Eliminar cliente',
      `¿Eliminar a ${customer.name} de tu libreta?\n\nSus fiados ya pagados se conservan en el historial.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(customer.id);
            const result = await onDelete(customer.id);
            setDeletingId(null);

            if (!result?.ok) {
              Alert.alert('No se pudo eliminar', result?.error || 'Inténtalo de nuevo.');
            }
          },
        },
      ]
    );
  };

  // ─── Ficha en edición ──────────────────────────────────────────────────────
  const renderForm = () => (
    <>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={() => setEditingCustomer(null)}>
          <Ionicons name="arrow-back" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>Editar Cliente</Text>
        <TouchableOpacity onPress={onClose}>
          <XMarkIcon size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Nombre *</Text>
        <TextInput
          style={[styles.formInput, formError && styles.formInputError]}
          value={name}
          onChangeText={(v) => { setName(v); if (formError) setFormError(''); }}
          placeholder="Nombre del cliente"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>WhatsApp</Text>
        <View style={styles.phoneInputContainer}>
          <Text style={styles.phonePrefix}>+507</Text>
          <TextInput
            style={styles.phoneInput}
            value={phone}
            onChangeText={(v) => { setPhone(v); if (formError) setFormError(''); }}
            keyboardType="phone-pad"
            placeholder="60000000"
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Nota del cliente</Text>
        <TextInput
          style={[styles.formInput, { height: 90, textAlignVertical: 'top', paddingTop: 12 }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Ej: pasa los viernes, vive por la esquina..."
          placeholderTextColor={colors.textMuted}
          multiline
        />
      </View>

      {formError ? (
        <View style={styles.inlineErrorBox}>
          <Ionicons name="alert-circle" size={16} color={colors.danger} />
          <Text style={styles.inlineErrorText}>{formError}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.primaryBtn, saving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color={colors.textButton} />
        ) : (
          <Text style={styles.primaryBtnText}>Guardar Cambios</Text>
        )}
      </TouchableOpacity>
    </>
  );

  // ─── Fila de la lista ──────────────────────────────────────────────────────
  const renderCustomer = ({ item }) => {
    const debe = item.totalDebt > 0;

    return (
      <View style={styles.customerRow}>
        <View style={styles.customerAvatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>

        <View style={styles.customerInfo}>
          <Text style={styles.customerName} numberOfLines={1}>{item.name}</Text>

          {item.phone ? (
            <Text style={styles.customerMeta}>{item.phone}</Text>
          ) : (
            <Text style={styles.customerMetaMuted}>Sin WhatsApp</Text>
          )}

          <Text style={debe ? styles.customerDebt : styles.customerNoDebt}>
            {debe
              ? `Debe $${item.totalDebt.toFixed(2)} · ${item.openDebts} fiado${item.openDebts !== 1 ? 's' : ''}`
              : 'Sin deuda pendiente'}
          </Text>
        </View>

        <View style={styles.customerActions}>
          <TouchableOpacity
            style={styles.customerActionBtn}
            onPress={() => setEditingCustomer(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.customerActionBtn}
            onPress={() => handleDelete(item)}
            disabled={deletingId === item.id}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {deletingId === item.id ? (
              <ActivityIndicator size="small" color={colors.danger} />
            ) : (
              <Ionicons
                name="trash-outline"
                size={20}
                color={item.canDelete ? colors.danger : colors.textMuted}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ─── Lista ─────────────────────────────────────────────────────────────────
  const renderList = () => (
    <>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Mis Clientes ({customers.length})</Text>
        <TouchableOpacity onPress={onClose}>
          <XMarkIcon size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {customers.length > 0 && (
        <View style={[styles.searchContainer, { marginBottom: 12 }]}>
          <MagnifyingGlassIcon size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar cliente..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <XMarkIcon size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderCustomer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.customerSeparator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={44} color={colors.textMuted} />
            <Text style={styles.emptyStateTitle}>
              {customers.length === 0 ? 'Sin clientes todavía' : 'Sin resultados'}
            </Text>
            <Text style={styles.emptyStateText}>
              {customers.length === 0
                ? 'Los clientes se crean solos al anotar un fiado.'
                : 'Prueba con otro nombre.'}
            </Text>
          </View>
        }
      />
    </>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '85%' }]}>
          {editingCustomer ? renderForm() : renderList()}
        </View>
      </View>
    </Modal>
  );
};

export default CustomersModal;
