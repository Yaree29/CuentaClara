import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MagnifyingGlassIcon } from 'react-native-heroicons/solid';
import colors from '../../../src/theme/colors';
import { scannerCatalogMock } from '../mocks/inventoryMocks';

const ProductScannerWidget = ({ catalog = scannerCatalogMock, onScan }) => {
  const [manualCode, setManualCode] = useState('CAR-001');
  const [scanResult, setScanResult] = useState(catalog[0] || null);

  const helperText = useMemo(() => {
    if (!scanResult) {
      return 'Escribe un código y ejecuta una simulación para ver el resultado del escaneo.';
    }

    return `Escaneo simulado listo para ${scanResult.name}.`;
  }, [scanResult]);

  const handleSimulatedScan = () => {
    const normalizedCode = manualCode.trim().toUpperCase();
    const detectedProduct = catalog.find((item) => item.code.toUpperCase() === normalizedCode) || null;

    const nextResult = detectedProduct || {
      code: normalizedCode || 'SIN-CODIGO',
      name: 'Producto no encontrado',
      category: 'Sin coincidencia',
      stock: 0,
      unit: 'und',
    };

    setScanResult(nextResult);

    if (typeof onScan === 'function') {
      onScan(nextResult, normalizedCode);
    }
  };

  return (
    <View style={styles.widget}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>ESCÁNER</Text>
          <Text style={styles.title}>Escaneo de productos</Text>
          <Text style={styles.subtitle}>Preparado para una futura integración con cámara o backend.</Text>
        </View>
        <View style={styles.livePill}>
          <Text style={styles.livePillText}>Mock</Text>
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

      <Text style={styles.inputLabel}>Código manual</Text>
      <TextInput
        style={styles.input}
        value={manualCode}
        onChangeText={setManualCode}
        placeholder="Ej. CAR-001"
        placeholderTextColor={colors.placeholder}
        autoCapitalize="characters"
      />

      <TouchableOpacity style={styles.button} onPress={handleSimulatedScan} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Simular escaneo</Text>
      </TouchableOpacity>

      {scanResult ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Último resultado</Text>
          <Text style={styles.resultName}>{scanResult.name}</Text>
          <Text style={styles.resultMeta}>
            {scanResult.code} · {scanResult.category}
          </Text>
          <Text style={styles.resultStock}>
            Stock actual: {scanResult.stock} {scanResult.unit}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  widget: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  kicker: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 3,
    lineHeight: 18,
  },
  livePill: {
    backgroundColor: colors.successLight,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  livePillText: {
    color: colors.successDark,
    fontSize: 11,
    fontWeight: '800',
  },
  scannerFrame: {
    backgroundColor: colors.cardSecondary,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  cornerLine: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 48,
    height: 48,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.primary,
    borderTopLeftRadius: 10,
  },
  cornerLineRight: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    width: 48,
    height: 48,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.primary,
    borderBottomRightRadius: 10,
  },
  previewCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  previewTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  previewText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  inputLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.backgroundSecondary,
    color: colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: colors.textWhite,
    fontSize: 14,
    fontWeight: '800',
  },
  resultCard: {
    marginTop: 16,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 14,
  },
  resultLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  resultName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  resultMeta: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 3,
  },
  resultStock: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
});

export default ProductScannerWidget;
