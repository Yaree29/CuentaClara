import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, FlatList,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import debtService from '../../credit/services/debtService';
import colors from '../../../theme/colors';

/**
 * Selector de cliente para vincular una venta a fiado. Reusa debtService
 * (mismo servicio que ya usa el módulo de crédito) — no duplica lógica de
 * clientes. onSelect recibe {id, name} del cliente elegido o recién creado.
 */
const LinkCustomerModal = ({ visible, onClose, onSelect }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;
    setSearch('');
    setError('');
    (async () => {
      setLoading(true);
      try {
        const data = await debtService.getCustomers();
        setCustomers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('No se pudieron cargar los clientes.');
      } finally {
        setLoading(false);
      }
    })();
  }, [visible]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => c.name.toLowerCase().includes(q));
  }, [customers, search]);

  const exactMatch = customers.some(
    (c) => c.name.toLowerCase() === search.trim().toLowerCase()
  );

  const handleCreateNew = async () => {
    const name = search.trim();
    if (!name) return;
    setCreating(true);
    setError('');
    try {
      const customer = await debtService.createCustomer({ name });
      onSelect({ id: customer.id, name: customer.name });
    } catch (err) {
      setError('No se pudo crear el cliente.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Vincular a Fiado</Text>
          <Text style={styles.subtitle}>Elige un cliente o crea uno nuevo</Text>

          <TextInput
            style={styles.input}
            placeholder="Buscar o escribir nombre nuevo..."
            value={search}
            onChangeText={setSearch}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />
          ) : (
            <FlatList
              style={styles.list}
              data={filtered}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.customerRow}
                  onPress={() => onSelect({ id: item.id, name: item.name })}
                >
                  <Text style={styles.customerName}>{item.name}</Text>
                  {item.phone ? <Text style={styles.customerPhone}>{item.phone}</Text> : null}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {search ? 'Sin coincidencias.' : 'Aún no tienes clientes registrados.'}
                </Text>
              }
            />
          )}

          {search.trim() && !exactMatch && (
            <TouchableOpacity
              style={[styles.createButton, creating && styles.buttonDisabled]}
              onPress={handleCreateNew}
              disabled={creating}
            >
              <Text style={styles.createButtonText}>
                {creating ? 'Creando...' : `+ Crear y vincular a "${search.trim()}"`}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '80%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  list: {
    maxHeight: 220,
    marginBottom: 8,
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  customerName: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  customerPhone: {
    fontSize: 12,
    color: colors.textMuted,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    paddingVertical: 20,
    fontSize: 13,
  },
  createButton: {
    backgroundColor: colors.success,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: colors.textWhite,
    fontWeight: '700',
    fontSize: 14,
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});

export default LinkCustomerModal;
