import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import MainLayout from '../../../views/layouts/MainLayout';
import { useInventory } from '../hooks/useInventory';
import styles from '../styles/inventory.styles';

const InventoryScreen = () => {
  const { products, loading, refreshing, error, handleRefresh, addProduct, saving, saveError } = useInventory();
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    sku: '',
    price: '',
    unitType: '',
    quantity: '',
    unit: '',
    minStock: '',
  });

  const resetForm = () => {
    setForm({
      name: '',
      sku: '',
      price: '',
      unitType: '',
      quantity: '',
      unit: '',
      minStock: '',
    });
  };

  const handleSaveProduct = async () => {
    try {
      await addProduct(form);
      Alert.alert('Producto guardado', 'El producto se agregó correctamente.');
      resetForm();
      setShowAddModal(false);
    } catch (err) {
      Alert.alert('Error', err?.message || saveError || 'No se pudo guardar el producto.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.productCard}>
      <View>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productCategory}>
          {item.category}
          {item.sku ? ` - ${item.sku}` : ''}
        </Text>
      </View>
      <View style={styles.productRight}>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
        <Text style={[
          styles.productStock, 
          item.stock <= item.minStock ? styles.lowStock : null
        ]}>
          Stock: {item.stock} {item.unit}
        </Text>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <MainLayout>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <View style={styles.header}>
        <Text style={styles.title}>Inventario</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addButtonText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} color="#2563eb" />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay productos registrados.</Text>
        }
      />

      <Modal
        transparent
        visible={showAddModal}
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nuevo producto</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nombre del producto"
              value={form.name}
              onChangeText={(val) => setForm((prev) => ({ ...prev, name: val }))}
            />

            <View style={styles.modalRow}>
              <TextInput
                style={[styles.modalInput, styles.modalInputHalf]}
                placeholder="SKU (opcional)"
                value={form.sku}
                onChangeText={(val) => setForm((prev) => ({ ...prev, sku: val }))}
              />
              <TextInput
                style={[styles.modalInput, styles.modalInputHalf, styles.modalInputRight]}
                placeholder="Precio"
                keyboardType="numeric"
                value={form.price}
                onChangeText={(val) => setForm((prev) => ({ ...prev, price: val }))}
              />
            </View>

            <View style={styles.modalRow}>
              <TextInput
                style={[styles.modalInput, styles.modalInputHalf]}
                placeholder="Unidad (ej: kg)"
                value={form.unitType}
                onChangeText={(val) => setForm((prev) => ({ ...prev, unitType: val }))}
              />
              <TextInput
                style={[styles.modalInput, styles.modalInputHalf, styles.modalInputRight]}
                placeholder="Stock inicial"
                keyboardType="numeric"
                value={form.quantity}
                onChangeText={(val) => setForm((prev) => ({ ...prev, quantity: val }))}
              />
            </View>

            <View style={styles.modalRow}>
              <TextInput
                style={[styles.modalInput, styles.modalInputHalf]}
                placeholder="Unidad stock (opcional)"
                value={form.unit}
                onChangeText={(val) => setForm((prev) => ({ ...prev, unit: val }))}
              />
              <TextInput
                style={[styles.modalInput, styles.modalInputHalf, styles.modalInputRight]}
                placeholder="Stock mínimo"
                keyboardType="numeric"
                value={form.minStock}
                onChangeText={(val) => setForm((prev) => ({ ...prev, minStock: val }))}
              />
            </View>

            {saveError && <Text style={styles.modalError}>{saveError}</Text>}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => {
                  resetForm();
                  setShowAddModal(false);
                }}
                disabled={saving}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalPrimary, saving && styles.modalButtonDisabled]}
                onPress={handleSaveProduct}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[styles.modalButtonText, styles.modalPrimaryText]}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </MainLayout>
  );
};

export default InventoryScreen;
