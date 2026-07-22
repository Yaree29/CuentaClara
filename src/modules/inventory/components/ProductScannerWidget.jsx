import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MagnifyingGlassIcon, CameraIcon, PencilSquareIcon } from 'react-native-heroicons/solid';
import colors from '../../../theme/colors';
import inventoryService from '../services/inventoryService';
import styles from '../styles/productScannerWidget.styles';

// Lookup real: busca por SKU/código de barras sobre el catálogo real
// (GET /inventory/products vía inventoryService.getProducts()). El modo
// cámara usa expo-camera (CameraView + onBarcodeScanned) para leer el código
// real del dispositivo; el input manual de SKU se mantiene como respaldo
// (ej. producto sin código legible, o dispositivo sin cámara disponible).
const ProductScannerWidget = ({ onScan }) => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [mode, setMode] = useState('camera'); // 'camera' | 'manual'

  const [permission, requestPermission] = useCameraPermissions();
  // Evita procesar el mismo frame de código de barras varias veces mientras
  // la cámara sigue enfocando el mismo código físico.
  const lastScannedRef = useRef(null);

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

  const lookupByCode = (rawCode) => {
    const normalizedCode = rawCode.trim().toUpperCase();
    const match = products.find((item) => (item.sku || '').toUpperCase() === normalizedCode) || null;

    setScanResult(match);
    setNotFound(!match);

    if (typeof onScan === 'function') {
      onScan(match, normalizedCode);
    }

    return match;
  };

  const handleBarcodeScanned = ({ data }) => {
    if (!data || data === lastScannedRef.current || loadingProducts) return;
    lastScannedRef.current = data;
    lookupByCode(data);
    // Libera el candado a los 2s para permitir re-escanear el mismo código
    // (ej. si el resultado fue "no encontrado" y el usuario corrige el catálogo).
    setTimeout(() => {
      if (lastScannedRef.current === data) lastScannedRef.current = null;
    }, 2000);
  };

  const handleManualScan = () => {
    lookupByCode(manualCode);
  };

  const helperText = useMemo(() => {
    if (loadingProducts) {
      return 'Cargando catálogo de productos...';
    }
    if (!scanResult) {
      return notFound
        ? 'No se encontró ningún producto con ese código.'
        : mode === 'camera'
          ? 'Apunta la cámara al código de barras del producto.'
          : 'Escribe el SKU de un producto y presiona buscar.';
    }
    return `Producto encontrado: ${scanResult.name}.`;
  }, [scanResult, notFound, loadingProducts, mode]);

  const canScanManual = !loadingProducts && manualCode.trim().length > 0;

  return (
    <View style={styles.widget}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>ESCÁNER</Text>
          <Text style={styles.title}>Escaneo de productos</Text>
          <Text style={styles.subtitle}>Lectura por cámara del código de barras, con búsqueda manual por SKU como respaldo.</Text>
        </View>
        <View style={styles.livePill}>
          <Text style={styles.livePillText}>Live</Text>
        </View>
      </View>

      <View style={styles.modeSwitch}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'camera' && styles.modeButtonActive]}
          onPress={() => setMode('camera')}
          activeOpacity={0.8}
        >
          <CameraIcon size={16} color={mode === 'camera' ? colors.textButton : colors.textSecondary} />
          <Text style={[styles.modeButtonText, mode === 'camera' && styles.modeButtonTextActive]}>Cámara</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'manual' && styles.modeButtonActive]}
          onPress={() => setMode('manual')}
          activeOpacity={0.8}
        >
          <PencilSquareIcon size={16} color={mode === 'manual' ? colors.textButton : colors.textSecondary} />
          <Text style={[styles.modeButtonText, mode === 'manual' && styles.modeButtonTextActive]}>Manual</Text>
        </TouchableOpacity>
      </View>

      {mode === 'camera' ? (
        !permission ? (
          <View style={styles.scannerFrame}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : !permission.granted ? (
          <View style={styles.scannerFrame}>
            <View style={styles.previewCircle}>
              <CameraIcon size={28} color={colors.primary} />
            </View>
            <Text style={styles.previewTitle}>Permiso de cámara requerido</Text>
            <Text style={styles.previewText}>
              Actívalo para escanear códigos de barras directamente con la cámara.
            </Text>
            <TouchableOpacity style={styles.button} onPress={requestPermission} activeOpacity={0.8}>
              <Text style={styles.buttonText}>Conceder permiso</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cameraFrame}>
            <CameraView
              style={styles.cameraView}
              facing="back"
              onBarcodeScanned={handleBarcodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'qr'],
              }}
            />
            <View style={styles.cornerLine} />
            <View style={styles.cornerLineRight} />
          </View>
        )
      ) : (
        <View style={styles.scannerFrame}>
          <View style={styles.previewCircle}>
            <MagnifyingGlassIcon size={28} color={colors.primary} />
          </View>
          <Text style={styles.previewTitle}>Búsqueda manual</Text>
          <Text style={styles.previewText}>{helperText}</Text>
        </View>
      )}

      {mode === 'camera' && permission?.granted && (
        <Text style={styles.previewText}>{helperText}</Text>
      )}

      {mode === 'manual' && (
        <>
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
            style={[styles.button, !canScanManual && styles.buttonDisabled]}
            onPress={handleManualScan}
            activeOpacity={0.8}
            disabled={!canScanManual}
          >
            {loadingProducts ? (
              <ActivityIndicator size="small" color={colors.textWhite} />
            ) : (
              <Text style={styles.buttonText}>Buscar producto</Text>
            )}
          </TouchableOpacity>
        </>
      )}

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
