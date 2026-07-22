import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { CameraIcon, MagnifyingGlassIcon } from 'react-native-heroicons/solid';
import colors from '../../../theme/colors';
import inventoryService from '../services/inventoryService';
import BarcodeScannerModal from './BarcodeScannerModal';
import styles from '../styles/productScannerWidget.styles';

// Busca un producto por código (SKU/código de barras) sobre el catálogo real
// (GET /inventory/products). La cámara NO se enciende sola: se abre bajo
// demanda con el botón "Escanear producto" (BarcodeScannerModal). El input
// manual queda como respaldo (producto sin código legible o sin cámara).
//
// Al leer/buscar un código:
//   - Si existe el producto, se muestra su información (nombre, stock, etc.).
//   - Si NO existe y el padre pasó onCreateNew, se invoca con el código para
//     que abra el formulario de creación con ese código ya prellenado.
const ProductScannerWidget = ({ onScan, onCreateNew }) => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await inventoryService.getProducts();
        if (active) setProducts(data);
      } catch (error) {
        if (active) setProducts([]);
      } finally {
        if (active) setLoadingProducts(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const lookupByCode = (rawCode, { allowCreate = false } = {}) => {
    const normalizedCode = rawCode.trim().toUpperCase();
    if (!normalizedCode) return;
    const match = products.find((item) => (item.sku || '').toUpperCase() === normalizedCode) || null;

    setScanResult(match);
    setNotFound(!match);

    if (typeof onScan === 'function') {
      onScan(match, normalizedCode);
    }

    // No encontrado tras un escaneo real -> ofrecer crear el producto con el
    // código ya prellenado (el flujo lo decide el padre, PymeInventory).
    if (!match && allowCreate && typeof onCreateNew === 'function') {
      onCreateNew(normalizedCode);
    }
  };

  const handleScanned = (code) => {
    setScannerVisible(false);
    lookupByCode(code, { allowCreate: true });
  };

  const handleManualSearch = () => {
    lookupByCode(manualCode);
  };

  const helperText = useMemo(() => {
    if (loadingProducts) return 'Cargando catálogo de productos...';
    if (scanResult) return `Producto encontrado: ${scanResult.name}.`;
    if (notFound) return 'No se encontró ningún producto con ese código.';
    return 'Escanea el código de barras del producto o búscalo por su SKU.';
  }, [scanResult, notFound, loadingProducts]);

  const canSearchManual = !loadingProducts && manualCode.trim().length > 0;

  return (
    <View style={styles.widget}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>ESCÁNER</Text>
          <Text style={styles.title}>Escaneo de productos</Text>
          <Text style={styles.subtitle}>{helperText}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.scanButton, loadingProducts && styles.buttonDisabled]}
        onPress={() => setScannerVisible(true)}
        activeOpacity={0.85}
        disabled={loadingProducts}
      >
        <CameraIcon size={18} color={colors.textWhite} />
        <Text style={styles.buttonText}>Escanear producto</Text>
      </TouchableOpacity>

      {/* KeyboardAvoidingView solo alrededor de este bloque: el widget vive
          dentro del ScrollView normal de PymeInventory.jsx, así que sin esto
          el teclado tapaba el input al estar cerca del final de la pantalla. */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 80}>
        
        <Text style={styles.inputLabel}>O busca por código (SKU)</Text>
        <View style={styles.manualRow}>
          <TextInput
            style={[styles.input, styles.manualInput]}
            value={manualCode}
            onChangeText={setManualCode}
            placeholder="Ej. CAR-001"
            placeholderTextColor={colors.placeholder}
            autoCapitalize="characters"
            editable={!loadingProducts}
            onSubmitEditing={handleManualSearch}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={[styles.searchIconButton, !canSearchManual && styles.buttonDisabled]}
            onPress={handleManualSearch}
            activeOpacity={0.85}
            disabled={!canSearchManual}
          >
            {loadingProducts ? (
              <ActivityIndicator size="small" color={colors.textWhite} />
            ) : (
              <MagnifyingGlassIcon size={18} color={colors.textWhite} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {scanResult ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Último resultado</Text>
          <Text style={styles.resultName}>{scanResult.name}</Text>
          <Text style={styles.resultMeta}>
            {scanResult.sku || 'Sin SKU'} · {scanResult.category}
          </Text>
          <Text style={styles.resultStock}>
            Stock actual: {scanResult.stock ?? '—'} {scanResult.unit}
          </Text>
        </View>
      ) : null}

      <BarcodeScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScanned={handleScanned}
      />
    </View>
  );
};

export default ProductScannerWidget;
