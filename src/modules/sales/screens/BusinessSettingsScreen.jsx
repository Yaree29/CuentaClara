import React, { useState } from 'react';
import {View,Text,TouchableOpacity,Alert,TextInput,ScrollView,ActivityIndicator,} from 'react-native';
import { useBusiness } from '../hooks/useBusiness';
import styles from '../styles/businessSettings.styles';

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
