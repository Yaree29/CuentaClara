import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { XMarkIcon } from 'react-native-heroicons/solid';
import styles from '../styles/informalInventory.styles';
import colors from '../../../theme/colors';

// ─── Reglas de validación ──────────────────────────────────────────────────────

/** El nombre NO puede contener dígitos */
const NAME_HAS_DIGIT = /\d/;

/** El precio debe ser un número positivo mayor que cero */
const validatePrice = (val) => {
  const n = parseFloat(val);
  if (val === '' || isNaN(n)) return 'El precio es obligatorio.';
  if (n <= 0) return 'El precio debe ser mayor a $0.00.';
  return null;
};

/** Stock y stock mínimo no pueden ser negativos */
const validateNonNegativeInt = (val, fieldLabel) => {
  if (val === '') return null; // campo opcional
  const n = parseInt(val, 10);
  if (isNaN(n)) return `${fieldLabel} debe ser un número entero.`;
  if (n < 0) return `${fieldLabel} no puede ser negativo.`;
  return null;
};

// ─── Componente ────────────────────────────────────────────────────────────────

/**
 * ProductFormModal
 *
 * Props:
 *  visible        – boolean
 *  onClose        – () => void
 *  initialData    – product object | null  (null = modo Crear)
 *  onSave         – (productData) => void
 *  onDelete       – (id) => void
 *  categories     – string[]  (categorías del negocio cargadas desde Supabase)
 */
const ProductFormModal = ({ visible, onClose, initialData, onSave, onDelete, categories = [] }) => {
  const [name, setName]         = useState('');
  const [price, setPrice]       = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock]       = useState('');
  const [minStock, setMinStock] = useState('');

  // Errores por campo
  const [nameError, setNameError]       = useState(null);
  const [priceError, setPriceError]     = useState(null);
  const [stockError, setStockError]     = useState(null);
  const [minStockError, setMinStockError] = useState(null);

  const clearErrors = () => {
    setNameError(null);
    setPriceError(null);
    setStockError(null);
    setMinStockError(null);
  };

  // Llenar / limpiar al abrir
  useEffect(() => {
    clearErrors();
    if (initialData) {
      setName(initialData.name ?? '');
      setPrice(initialData.price?.toString() ?? '');
      setCategory(initialData.category ?? (categories[0] || ''));
      setStock(initialData.stock !== null && initialData.stock !== undefined ? initialData.stock.toString() : '');
      setMinStock(initialData.minStock !== null && initialData.minStock !== undefined ? initialData.minStock.toString() : '');
    } else {
      setName('');
      setPrice('');
      setCategory(categories[0] || '');
      setStock('');
      setMinStock('');
    }
  }, [initialData, visible, categories]);

  // Si categorías cargan después de abrir el modal
  useEffect(() => {
    if (!category && categories.length > 0) {
      setCategory(categories[0]);
    }
  }, [categories]);

  // ─── Handlers con validación en tiempo real ──────────────────────────────────

  const handleNameChange = (val) => {
    setName(val);
    if (NAME_HAS_DIGIT.test(val)) {
      setNameError('El nombre no puede contener números.');
    } else if (val.trim().length > 0 && val.trim().length < 2) {
      setNameError('El nombre es demasiado corto.');
    } else {
      setNameError(null);
    }
  };

  const handlePriceChange = (val) => {
    // Solo permitir dígitos y un punto decimal
    const cleaned = val.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    setPrice(cleaned);
    setPriceError(validatePrice(cleaned));
  };

  const handleStockChange = (val) => {
    // Solo dígitos (sin negativos posibles desde teclado numérico)
    const cleaned = val.replace(/[^0-9]/g, '');
    setStock(cleaned);
    setStockError(validateNonNegativeInt(cleaned, 'La cantidad'));
  };

  const handleMinStockChange = (val) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    setMinStock(cleaned);
    setMinStockError(validateNonNegativeInt(cleaned, 'El stock mínimo'));
  };

  // ─── Guardar ─────────────────────────────────────────────────────────────────

  const handleSave = () => {
    // Ejecutar todas las validaciones antes de guardar
    const nErr  = !name.trim()
      ? 'El nombre es obligatorio.'
      : NAME_HAS_DIGIT.test(name)
        ? 'El nombre no puede contener números.'
        : null;
    const pErr  = validatePrice(price);
    const sErr  = validateNonNegativeInt(stock, 'La cantidad');
    const msErr = validateNonNegativeInt(minStock, 'El stock mínimo');

    setNameError(nErr);
    setPriceError(pErr);
    setStockError(sErr);
    setMinStockError(msErr);

    if (nErr || pErr || sErr || msErr) return; // hay errores → no guardar

    onSave({
      name: name.trim(),
      price: parseFloat(price),
      category: category || null,
      stock: stock !== '' ? parseInt(stock, 10) : null,
      minStock: minStock !== '' ? parseInt(minStock, 10) : 0,
    });
  };

  const hasErrors = !!nameError || !!priceError || !!stockError || !!minStockError;

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Encabezado */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={styles.modalTitle}>{initialData ? 'Editar Producto' : 'Nuevo Producto'}</Text>
              <TouchableOpacity onPress={onClose}>
                <XMarkIcon size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              {/* ── Nombre ── */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Nombre del producto/servicio *</Text>
                <TextInput
                  style={[styles.formInput, nameError && styles.inputError]}
                  value={name}
                  onChangeText={handleNameChange}
                  placeholder="Ej. Recarga / Lotería / Snickers"
                  placeholderTextColor={colors.placeholder}
                />
                {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
              </View>

              {/* ── Precio ── */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Precio ($) *</Text>
                <TextInput
                  style={[styles.formInput, priceError && styles.inputError]}
                  value={price}
                  onChangeText={handlePriceChange}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.placeholder}
                />
                {priceError ? <Text style={styles.errorText}>{priceError}</Text> : null}
              </View>

              {/* ── Stock disponible + Stock mínimo ── */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Cant. Disponible</Text>
                  <TextInput
                    style={[styles.formInput, stockError && styles.inputError]}
                    value={stock}
                    onChangeText={handleStockChange}
                    keyboardType="number-pad"
                    placeholder="Opcional"
                    placeholderTextColor={colors.placeholder}
                  />
                  {stockError ? <Text style={styles.errorText}>{stockError}</Text> : null}
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Stock mínimo</Text>
                  <TextInput
                    style={[styles.formInput, minStockError && styles.inputError]}
                    value={minStock}
                    onChangeText={handleMinStockChange}
                    keyboardType="number-pad"
                    placeholder="Ej. 5"
                    placeholderTextColor={colors.placeholder}
                  />
                  {minStockError ? <Text style={styles.errorText}>{minStockError}</Text> : null}
                </View>
              </View>

              {/* ── Categoría ── */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Categoría</Text>
                {categories.length === 0 ? (
                  <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>
                    Aún no tienes categorías. Créalas usando el botón + en el filtro.
                  </Text>
                ) : (
                  <View style={styles.categoryGrid}>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.formCategoryPill, category === cat && styles.formCategoryPillActive]}
                        onPress={() => setCategory(cat)}
                      >
                        <Text style={[styles.formCategoryText, category === cat && styles.formCategoryTextActive]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* ── Guardar ── */}
              <TouchableOpacity
                style={[styles.saveBtn, hasErrors && { opacity: 0.5 }]}
                onPress={handleSave}
              >
                <Text style={styles.saveBtnText}>Guardar</Text>
              </TouchableOpacity>

              {/* ── Eliminar (solo en modo editar) ── */}
              {initialData && (
                <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(initialData.id)}>
                  <Text style={styles.deleteBtnText}>Eliminar producto</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ProductFormModal;