import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XMarkIcon } from 'react-native-heroicons/solid';
import styles from '../styles/informalInventory.styles';
import colors from '../../../theme/colors';

// ─── Reglas de validación ──────────────────────────────────────────────────────

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
  const [purchaseType, setPurchaseType] = useState('register_only');

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
      setPurchaseType('register_only');
    } else {
      setName('');
      setPrice('');
      setCategory(categories[0] || '');
      setStock('');
      setMinStock('');
      setPurchaseType('register_only');
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
    if (val.trim().length > 0 && val.trim().length < 2) {
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
      : name.trim().length < 2
        ? 'El nombre es demasiado corto.'
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
      purchaseType: purchaseType,
    });
  };

  const hasErrors = !!nameError || !!priceError || !!stockError || !!minStockError;
  const insets = useSafeAreaInsets();

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
      navigationBarTranslucent={true}
      onRequestClose={onClose}
    >
      {/* Misma estructura que el modal de fiado (InformalCredit): overlay a
          pantalla completa + contenido anclado abajo, SIN KeyboardAvoidingView.
          El adjustResize nativo de Android (AndroidManifest) sube el contenido
          sobre el teclado; meter un KeyboardAvoidingView aquí peleaba con ese
          resize y despegaba el formulario del borde inferior. */}
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { paddingBottom: 24 + insets.bottom }]}>
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

              {/* ── ¿Cómo adquiriste este producto? ── */}
              {!initialData && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>¿Cómo adquiriste este producto?</Text>
                  <View style={styles.purchaseTypeContainer}>
                    <TouchableOpacity
                      style={[
                        styles.purchaseTypePill,
                        purchaseType === 'register_only' && styles.purchaseTypePillActive,
                      ]}
                      onPress={() => setPurchaseType('register_only')}
                    >
                      <Text
                        style={[
                          styles.purchaseTypeText,
                          purchaseType === 'register_only' && styles.purchaseTypeTextActive,
                        ]}
                      >
                        Solo registrar stock
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.purchaseTypePill,
                        purchaseType === 'use_gains' && styles.purchaseTypePillActive,
                      ]}
                      onPress={() => setPurchaseType('use_gains')}
                    >
                      <Text
                        style={[
                          styles.purchaseTypeText,
                          purchaseType === 'use_gains' && styles.purchaseTypeTextActive,
                        ]}
                      >
                        Compré con dinero de mis ganancias
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

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
    </Modal>
  );
};

export default ProductFormModal;
