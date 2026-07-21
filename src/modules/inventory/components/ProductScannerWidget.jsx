import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MagnifyingGlassIcon } from 'react-native-heroicons/solid';
import colors from '../../../theme/colors';
import inventoryService from '../services/inventoryService';
import styles from '../styles/productScannerWidget.styles';

// Lookup real: busca por SKU sobre el catálogo real (GET /inventory/products
// vía inventoryService.getProducts()). No hay endpoint de búsqueda dedicado
// ni lectura de cámara — "escaneo" sigue siendo la simulación de teclear un
// código, pero ya no compara contra un catálogo mock.
const ProductScannerWidget = ({ onScan }) => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [notFound, setNotFound] = useState(false);

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

  const helperText = useMemo(() => {
    if (loadingProducts) {
      return 'Cargando catálogo de productos...';
    }
    if (!scanResult) {
      return notFound
        ? 'No se encontró ningún producto con ese SKU.'
        : 'Escribe el SKU de un producto y ejecuta una simulación para ver el resultado del escaneo.';
    }
    return `Escaneo simulado listo para ${scanResult.name}.`;
  }, [scanResult, notFound, loadingProducts]);

  const handleSimulatedScan = () => {
    const normalizedCode = manualCode.trim().toUpperCase();
    const match = products.find((item) => (item.sku || '').toUpperCase() === normalizedCode) || null;

    setScanResult(match);
    setNotFound(!match);

    if (typeof onScan === 'function') {
      onScan(match, normalizedCode);
    }
  };

  const canScan = !loadingProducts && manualCode.trim().length > 0;

  return (
    <View style={styles.widget}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>ESCÁNER</Text>
          <Text style={styles.title}>Escaneo de productos</Text>
          <Text style={styles.subtitle}>Búsqueda por SKU sobre tu catálogo real, preparada para una futura integración con cámara.</Text>
        </View>
        <View style={styles.livePill}>
          <Text style={styles.livePillText}>Live</Text>
        </View>
      </View>

      <View style={styles.scannerFrame}>
        <View style={styles.cornerLine} />
        <View style={styles.cornerLineRight} />
        <View style={styles.previewCircle}>
          <MagnifyingGlassIcon size={28} color={colors.primary} />
        </View>
        <Text style={styles.previewTitle}>Área de lectura simulada</Text>
        <Text style={styles.previewText}>{helperText}</Text>
      </View>

      <Text style={styles.inputLabel}>Código manual (SKU)</Text>
      <TextInput
        style={styles.input}
        value={manualCode}
        onChangeText={setManualCode}
        placeholder="Ej. CAR-001"
        placeholderTextColor={colors.placeholder}
        autoCapitalize="characters"
        editable={!loadingProducts}
      />

      <TouchableOpacity
        style={[styles.button, !canScan && styles.buttonDisabled]}
        onPress={handleSimulatedScan}
        activeOpacity={0.8}
        disabled={!canScan}
      >
        {loadingProducts ? (
          <ActivityIndicator size="small" color={colors.textWhite} />
        ) : (
          <Text style={styles.buttonText}>Simular escaneo</Text>
        )}
      </TouchableOpacity>

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
    </View>
  );
};

export default ProductScannerWidget;
