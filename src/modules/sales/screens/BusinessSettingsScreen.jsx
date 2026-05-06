import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useBusiness } from '../hooks/useBusiness';

const BusinessSettingsScreen = ({ navigation }) => {
  const { businessInfo, businessConfig, loading, error, updateInfo, updateConfig } = useBusiness();

  // Estados para edición
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(businessInfo?.name || '');
  const [phone, setPhone] = useState(businessInfo?.phone || '');
  const [address, setAddress] = useState(businessInfo?.address || '');
  const [taxRate, setTaxRate] = useState(businessConfig?.tax_rate?.toString() || '7');
  const [currency, setCurrency] = useState(businessConfig?.currency || 'USD');
  const [weightUnit, setWeightUnit] = useState(businessConfig?.weight_unit || 'kg');

  // Sincronizar cuando llegan datos
  React.useEffect(() => {
    if (businessInfo) {
      setName(businessInfo.name || '');
      setPhone(businessInfo.phone || '');
      setAddress(businessInfo.address || '');
    }
  }, [businessInfo]);

  React.useEffect(() => {
    if (businessConfig) {
      setTaxRate(businessConfig.tax_rate?.toString() || '7');
      setCurrency(businessConfig.currency || 'USD');
      setWeightUnit(businessConfig.weight_unit || 'kg');
    }
  }, [businessConfig]);

  const handleSaveChanges = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre del negocio es requerido');
      return;
    }

    try {
      // Actualizar información del negocio
      await updateInfo({
        name: name.trim(),
        phone: phone.trim() || null,
        address: address.trim() || null,
      });

      // Actualizar configuración
      await updateConfig({
        tax_rate: parseFloat(taxRate) || 7,
        currency: currency.trim() || 'USD',
        weight_unit: weightUnit.trim() || 'kg',
      });

      Alert.alert('Éxito', 'Cambios guardados correctamente');
      setEditMode(false);
    } catch (err) {
      Alert.alert('Error', error || 'No se pudieron guardar los cambios');
    }
  };

  if (loading && !businessInfo) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Cargando datos del negocio...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Configuración del Negocio</Text>
        <TouchableOpacity
          onPress={() => setEditMode(!editMode)}
          style={[styles.editBtn, editMode && styles.editBtnActive]}
        >
          <Text style={[styles.editBtnText, editMode && styles.editBtnTextActive]}>
            {editMode ? 'Cancelar' : 'Editar'}
          </Text>
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información General</Text>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Nombre del negocio</Text>
          {editMode ? (
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nombre del negocio"
              editable={!loading}
            />
          ) : (
            <Text style={styles.displayValue}>{name}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Teléfono</Text>
          {editMode ? (
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Teléfono (opcional)"
              keyboardType="phone-pad"
              editable={!loading}
            />
          ) : (
            <Text style={styles.displayValue}>{phone || 'No registrado'}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Dirección</Text>
          {editMode ? (
            <TextInput
              style={[styles.input, { minHeight: 80 }]}
              value={address}
              onChangeText={setAddress}
              placeholder="Dirección (opcional)"
              multiline
              numberOfLines={3}
              editable={!loading}
            />
          ) : (
            <Text style={styles.displayValue}>{address || 'No registrada'}</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuración Fiscal</Text>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Tasa de impuesto (%)</Text>
          {editMode ? (
            <TextInput
              style={styles.input}
              value={taxRate}
              onChangeText={setTaxRate}
              placeholder="Ej: 7"
              keyboardType="decimal-pad"
              editable={!loading}
            />
          ) : (
            <Text style={styles.displayValue}>{taxRate}%</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Moneda</Text>
          {editMode ? (
            <TextInput
              style={styles.input}
              value={currency}
              onChangeText={setCurrency}
              placeholder="Ej: USD"
              maxLength={3}
              editable={!loading}
            />
          ) : (
            <Text style={styles.displayValue}>{currency}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Unidad de peso</Text>
          {editMode ? (
            <TextInput
              style={styles.input}
              value={weightUnit}
              onChangeText={setWeightUnit}
              placeholder="Ej: kg"
              editable={!loading}
            />
          ) : (
            <Text style={styles.displayValue}>{weightUnit}</Text>
          )}
        </View>
      </View>

      {editMode && (
        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
          onPress={handleSaveChanges}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Guardar Cambios</Text>
          )}
        </TouchableOpacity>
      )}

      <View style={styles.spacer} />
    </ScrollView>
  );
};

export default BusinessSettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  editBtnActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  editBtnTextActive: {
    color: '#fff',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fee2e2',
    borderRadius: 6,
  },
  section: {
    marginTop: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1e293b',
  },
  displayValue: {
    fontSize: 14,
    color: '#1e293b',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  saveBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  saveBtnDisabled: {
    backgroundColor: '#cbd5e1',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  spacer: {
    height: 20,
  },
});
