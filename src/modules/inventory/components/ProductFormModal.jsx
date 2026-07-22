import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
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

/** El costo es opcional, pero si viene no puede ser negativo */
const validateCostPrice = (val) => {
  if (val === '') return null;
  const n = parseFloat(val);
  if (isNaN(n)) return 'El costo debe ser un número.';
  if (n < 0) return 'El costo no puede ser negativo.';
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

/** Fecha de vencimiento opcional, formato YYYY-MM-DD */
const EXPIRATION_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const validateExpirationDate = (val) => {
  if (val === '') return null;
  if (!EXPIRATION_DATE_RE.test(val)) return 'Usa el formato AAAA-MM-DD.';
  if (Number.isNaN(new Date(val).getTime())) return 'Fecha inválida.';
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
 *  showExpiration – boolean (business_inventory_config.caducidad) — muestra el
 *                   campo opcional de fecha de vencimiento cuando el negocio
 *                   tiene ese flag activo.
 */
const ProductFormModal = ({ visible, onClose, initialData, onSave, onDelete, categories = [], showExpiration = false }) => {
  const [name, setName]         = useState('');
  const [price, setPrice]       = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock]       = useState('');
  const [minStock, setMinStock] = useState('');
  const [purchaseType, setPurchaseType] = useState('register_only');
  const [expirationDate, setExpirationDate] = useState('');

  // Errores por campo
  const [nameError, setNameError]       = useState(null);
  const [priceError, setPriceError]     = useState(null);
  const [costPriceError, setCostPriceError] = useState(null);
  const [stockError, setStockError]     = useState(null);
  const [minStockError, setMinStockError] = useState(null);
  const [expirationDateError, setExpirationDateError] = useState(null);

  const clearErrors = () => {
    setNameError(null);
    setPriceError(null);
    setCostPriceError(null);
    setStockError(null);
    setMinStockError(null);
    setExpirationDateError(null);
  };

  // Llenar / limpiar al abrir
  useEffect(() => {
    clearErrors();
    if (initialData) {
      setName(initialData.name ?? '');
      setPrice(initialData.price?.toString() ?? '');
      setCostPrice(initialData.costPrice !== null && initialData.costPrice !== undefined ? initialData.costPrice.toString() : '');
      setCategory(initialData.category ?? (categories[0] || ''));
      setStock(initialData.stock !== null && initialData.stock !== undefined ? initialData.stock.toString() : '');
      setMinStock(initialData.minStock !== null && initialData.minStock !== undefined ? initialData.minStock.toString() : '');
      setPurchaseType('register_only');
      setExpirationDate(initialData.expirationDate ? initialData.expirationDate.slice(0, 10) : '');
    } else {
      setName('');
      setPrice('');
      setCostPrice('');
      setCategory(categories[0] || '');
      setStock('');
      setMinStock('');
      setPurchaseType('register_only');
      setExpirationDate('');
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

  const handleCostPriceChange = (val) => {
    const cleaned = val.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    setCostPrice(cleaned);
    setCostPriceError(validateCostPrice(cleaned));
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

  const handleExpirationDateChange = (val) => {
    const cleaned = val.replace(/[^0-9-]/g, '');
    setExpirationDate(cleaned);
    setExpirationDateError(validateExpirationDate(cleaned));
  };

  // ─── Guardar ─────────────────────────────────────────────────────────────────

  // Unidades que esta edición SUMA al stock actual. Solo cuando entra
  // mercancía tiene sentido preguntar si salió plata del negocio: bajar el
  // stock (una merma, un conteo a la baja) nunca es un gasto.
  const previousStock = initialData ? Number(initialData.stock) || 0 : 0;
  const typedStock = stock !== '' ? parseInt(stock, 10) : 0;
  const addedUnits = Number.isFinite(typedStock) ? typedStock - previousStock : 0;

  // Al crear, cualquier stock inicial cuenta como mercancía que entra.
  const isAddingStock = initialData ? addedUnits > 0 : typedStock > 0;

  const handleSave = () => {
    // Ejecutar todas las validaciones antes de guardar
    const nErr  = !name.trim()
      ? 'El nombre es obligatorio.'
      : name.trim().length < 2
        ? 'El nombre es demasiado corto.'
        : null;
    const pErr  = validatePrice(price);

    // Si dice que pagó la mercancía, el costo deja de ser opcional: es el dato
    // con el que se calcula cuánto dinero salió. Sin él el gasto se estimaba
    // con el precio de VENTA e inflaba los reportes (90 unidades que se venden
    // a $99 figuraban como $8910 gastados).
    const costoRequerido =
      isAddingStock &&
      purchaseType === 'use_gains' &&
      (costPrice === '' || parseFloat(costPrice) <= 0);

    const cpErr = costoRequerido
      ? 'Escribe cuánto te costó cada unidad para poder registrar el gasto.'
      : validateCostPrice(costPrice);

    const sErr  = validateNonNegativeInt(stock, 'La cantidad');
    const msErr = validateNonNegativeInt(minStock, 'El stock mínimo');
    const edErr = showExpiration ? validateExpirationDate(expirationDate) : null;

    setNameError(nErr);
    setPriceError(pErr);
    setCostPriceError(cpErr);
    setStockError(sErr);
    setMinStockError(msErr);
    setExpirationDateError(edErr);

    if (nErr || pErr || cpErr || sErr || msErr || edErr) return; // hay errores → no guardar

    onSave({
      name: name.trim(),
      price: parseFloat(price),
      costPrice: costPrice !== '' ? parseFloat(costPrice) : null,
      category: category || null,
      stock: stock !== '' ? parseInt(stock, 10) : null,
      minStock: minStock !== '' ? parseInt(minStock, 10) : 0,
      purchaseType: purchaseType,
      ...(showExpiration ? { expirationDate: expirationDate !== '' ? expirationDate : null } : {}),
    });
  };

  const hasErrors = !!nameError || !!priceError || !!costPriceError || !!stockError || !!minStockError || !!expirationDateError;
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
      {/* Modal bottom-sheet: overlay a pantalla completa + contenido anclado
          abajo. KeyboardAwareScrollView desplaza el contenido para que el
          campo enfocado quede visible sobre el teclado, sin pelear con el
          adjustResize nativo de Android. */}
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { paddingBottom: 24 + insets.bottom }]}>
            {/* Encabezado */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={styles.modalTitle}>{initialData ? 'Editar Producto' : 'Producto Nuevo'}</Text>
              <TouchableOpacity onPress={onClose}>
                <XMarkIcon size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <KeyboardAwareScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              enableOnAndroid={true}
              extraScrollHeight={20}
            >

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

              {/* ── Costo (insumo, usado por Recetas) ── */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Costo de Producción ($)</Text>
                <TextInput
                  style={[styles.formInput, costPriceError && styles.inputError]}
                  value={costPrice}
                  onChangeText={handleCostPriceChange}
                  keyboardType="decimal-pad"
                  placeholder="Opcional — para calcular costo de recetas"
                  placeholderTextColor={colors.placeholder}
                />
                {costPriceError ? <Text style={styles.errorText}>{costPriceError}</Text> : null}
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

              {/* ── ¿Cómo adquiriste este producto? ──
                  Al crear se pregunta por el stock inicial. Al editar se
                  pregunta solo si esta edición SUMA unidades: antes, subir la
                  cantidad disponible no preguntaba nada y la mercancía entraba
                  sin dejar movimiento ni gasto. */}
              {isAddingStock && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>
                    {initialData
                      ? `Vas a añadir ${addedUnits} unidad${addedUnits !== 1 ? 'es' : ''}. ¿Cómo las conseguiste?`
                      : '¿Cómo adquiriste este producto?'}
                  </Text>
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

                  {/* Adelanta cuánto se va a descontar, para que el número no
                      sea una sorpresa en el reporte. */}
                  {purchaseType === 'use_gains' && (
                    <Text style={styles.purchaseHint}>
                      {costPrice !== '' && parseFloat(costPrice) > 0
                        ? `Se registrará un gasto de $${(
                            (initialData ? addedUnits : typedStock) * parseFloat(costPrice)
                          ).toFixed(2)} (${initialData ? addedUnits : typedStock} × $${parseFloat(costPrice).toFixed(2)} de costo).`
                        : 'Escribe el Costo de Producción para calcular el gasto.'}
                    </Text>
                  )}
                </View>
              )}

              {/* ── Fecha de vencimiento (solo si el negocio tiene caducidad activa) ── */}
              {showExpiration && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Fecha de vencimiento</Text>
                  <TextInput
                    style={[styles.formInput, expirationDateError && styles.inputError]}
                    value={expirationDate}
                    onChangeText={handleExpirationDateChange}
                    keyboardType="numbers-and-punctuation"
                    placeholder="Opcional — AAAA-MM-DD"
                    placeholderTextColor={colors.placeholder}
                  />
                  {expirationDateError ? <Text style={styles.errorText}>{expirationDateError}</Text> : null}
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
            </KeyboardAwareScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ProductFormModal;
