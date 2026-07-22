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
import { XMarkIcon, CameraIcon, SparklesIcon } from 'react-native-heroicons/solid';
import styles from '../styles/informalInventory.styles';
import colors from '../../../theme/colors';
import BarcodeScannerModal from './BarcodeScannerModal';

// Código de barras autogenerado: timestamp de 12 dígitos (numérico, así puede
// imprimirse/leerse como CODE128). Simple y único en la práctica — evita la
// necesidad de una secuencia consultada al backend.
const generateBarcode = () => String(Date.now()).slice(-12);

// Opciones fijas del selector de unidad de medida (unit_type) — reemplaza el
// texto libre por un control simple cuando el negocio tiene control_peso activo.
const WEIGHT_UNIT_OPTIONS = [
  { value: 'kg', label: 'Kg' },
  { value: 'lb', label: 'Libra' },
  { value: 'unidad', label: 'Unidad' },
];

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
 *  showCostPrice  – boolean — muestra "Costo de Producción" (cost_price) solo
 *                   cuando el negocio es category_group === 'comida_preparada'
 *                   (el costo alimenta el cálculo de recetas, una función
 *                   propia de ese grupo). Para el resto de categorías no aparece.
 *  prefillBarcode – string | null — código ya leído por el escáner al crear un
 *                   producto que no existía; rellena el campo Código de barras.
 *  showWeightControl – boolean (business_inventory_config.control_peso) —
 *                   muestra el selector de unidad de medida (kg/libra/unidad)
 *                   para unit_type. Si el negocio no tiene este flag activo,
 *                   el campo no aparece (unitType se guarda como null).
 */
const ProductFormModal = ({ visible, onClose, initialData, onSave, onDelete, categories = [], showExpiration = false, showCostPrice = false, prefillBarcode = null, showWeightControl = false }) => {
  const [name, setName]         = useState('');
  const [price, setPrice]       = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock]       = useState('');
  const [minStock, setMinStock] = useState('');
  const [purchaseType, setPurchaseType] = useState('register_only');
  const [expirationDate, setExpirationDate] = useState('');
  const [barcode, setBarcode] = useState('');
  const [barcodeScannerVisible, setBarcodeScannerVisible] = useState(false);
  const [unitType, setUnitType] = useState('');

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
      setBarcode(initialData.sku ?? '');
      setUnitType(initialData.unitType ?? '');
    } else {
      setName('');
      setPrice('');
      setCostPrice('');
      setCategory(categories[0] || '');
      setStock('');
      setMinStock('');
      setPurchaseType('register_only');
      setExpirationDate('');
      // Al crear desde un escaneo "no encontrado", el código leído llega por
      // prefillBarcode y arranca ya cargado en el campo.
      setBarcode(prefillBarcode ?? '');
      setUnitType('');
    }
  }, [initialData, visible, categories, prefillBarcode]);

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

  const handleSave = () => {
    // Ejecutar todas las validaciones antes de guardar
    const nErr  = !name.trim()
      ? 'El nombre es obligatorio.'
      : name.trim().length < 2
        ? 'El nombre es demasiado corto.'
        : null;
    const pErr  = validatePrice(price);
    const cpErr = showCostPrice ? validateCostPrice(costPrice) : null;
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
      // Solo se envía cost_price cuando el campo está visible para este negocio
      // (comida_preparada); para el resto se omite y no se sobreescribe.
      ...(showCostPrice ? { costPrice: costPrice !== '' ? parseFloat(costPrice) : null } : {}),
      category: category || null,
      // El "Código de barras" se guarda en la columna sku (no hay columna
      // barcode separada — ver products.sku). null si quedó vacío.
      sku: barcode.trim() !== '' ? barcode.trim() : null,
      // unit_type solo se captura si el negocio tiene control_peso activo;
      // para el resto se omite (no se sobreescribe con null sin querer).
      ...(showWeightControl ? { unitType: unitType || null } : {}),
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

              {/* ── Costo de producción (solo comida_preparada — insumo para Recetas) ── */}
              {showCostPrice && (
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
              )}

              {/* ── Código de barras (columna sku): generar automático o escanear/teclear ── */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Código de barras (SKU)</Text>
                <TextInput
                  style={styles.formInput}
                  value={barcode}
                  onChangeText={setBarcode}
                  placeholder="Opcional — escanéalo, genéralo o escríbelo"
                  placeholderTextColor={colors.placeholder}
                  autoCapitalize="characters"
                />
                <View style={styles.barcodeActionsRow}>
                  <TouchableOpacity
                    style={styles.barcodeActionBtn}
                    onPress={() => setBarcode(generateBarcode())}
                    activeOpacity={0.85}
                  >
                    <SparklesIcon size={16} color={colors.primary} />
                    <Text style={styles.barcodeActionText}>Generar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.barcodeActionBtn}
                    onPress={() => setBarcodeScannerVisible(true)}
                    activeOpacity={0.85}
                  >
                    <CameraIcon size={16} color={colors.primary} />
                    <Text style={styles.barcodeActionText}>Escanear</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* ── Unidad de medida (solo si el negocio tiene "Control por peso" activo) ── */}
              {showWeightControl && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Unidad de medida</Text>
                  <View style={styles.purchaseTypeContainer}>
                    {WEIGHT_UNIT_OPTIONS.map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        style={[styles.purchaseTypePill, unitType === opt.value && styles.purchaseTypePillActive]}
                        onPress={() => setUnitType(opt.value)}
                      >
                        <Text style={[styles.purchaseTypeText, unitType === opt.value && styles.purchaseTypeTextActive]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

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

      {/* Escáner para rellenar el campo Código de barras con la cámara. */}
      <BarcodeScannerModal
        visible={barcodeScannerVisible}
        onClose={() => setBarcodeScannerVisible(false)}
        onScanned={(code) => {
          setBarcode(code);
          setBarcodeScannerVisible(false);
        }}
      />
    </Modal>
  );
};

export default ProductFormModal;
