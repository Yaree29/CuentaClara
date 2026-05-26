import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput } from 'react-native';
import { XMarkIcon } from 'react-native-heroicons/solid';
import { CONTROLLED_CATEGORIES } from '../hooks/useInformalInventory';
import styles from '../styles/informalInventory.styles';
import colors from '../../../theme/colors';

const ProductFormModal = ({ visible, onClose, initialData, onSave, onDelete }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(CONTROLLED_CATEGORIES[0]);
  const [stock, setStock] = useState('');

  // Si recibimos datos iniciales (Modo Editar), llenamos los campos
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPrice(initialData.price.toString());
      setCategory(initialData.category);
      setStock(initialData.stock ? initialData.stock.toString() : '');
    } else {
      // Limpiar formulario para Modo Crear
      setName('');
      setPrice('');
      setCategory(CONTROLLED_CATEGORIES[0]);
      setStock('');
    }
  }, [initialData, visible]);

  const handleSave = () => {
    if (!name || !price) return;
    onSave({
      name,
      price: parseFloat(price),
      category,
      stock: stock ? parseInt(stock) : null
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={styles.modalTitle}>{initialData ? 'Editar Producto' : 'Nuevo Producto'}</Text>
            <TouchableOpacity onPress={onClose}>
              <XMarkIcon size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Nombre del producto/servicio *</Text>
            <TextInput style={styles.formInput} value={name} onChangeText={setName} placeholder="Ej. Recarga $5 / Lotería" />
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.formLabel}>Precio ($) *</Text>
              <TextInput style={styles.formInput} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="0.00" />
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.formLabel}>Cant. Disponible</Text>
              <TextInput style={styles.formInput} value={stock} onChangeText={setStock} keyboardType="numeric" placeholder="Opcional" />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Categoría</Text>
            <View style={styles.categoryGrid}>
              {CONTROLLED_CATEGORIES.map((cat) => (
                <TouchableOpacity 
                  key={cat} 
                  style={[styles.formCategoryPill, category === cat && styles.formCategoryPillActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.formCategoryText, category === cat && styles.formCategoryTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Guardar</Text>
          </TouchableOpacity>

          {initialData && (
            <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(initialData.id)}>
              <Text style={styles.deleteBtnText}>Eliminar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ProductFormModal;