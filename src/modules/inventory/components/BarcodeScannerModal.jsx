import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { XMarkIcon, CameraIcon, BoltIcon, BoltSlashIcon } from 'react-native-heroicons/solid';
import colors from '../../../theme/colors';
import styles from '../styles/barcodeScannerModal.styles';

// Escáner de código de barras/QR reutilizable (cámara bajo demanda): se monta
// solo mientras el modal está visible, así que la cámara nunca queda encendida
// en segundo plano. Lo usan tanto ProductScannerWidget (buscar producto por
// código) como ProductFormModal (rellenar el campo "Código de barras"
// escaneando). Devuelve el código leído por onScanned(code) — quien lo use
// decide qué hacer (buscar en catálogo, prellenar formulario, etc.).
//
// CameraView no tiene ningún filtro/tinte propio aplicado (cameraView solo
// trae position:absolute + inset:0, ver barcodeScannerModal.styles.js) — el
// tono oscuro/rojizo que se ve en poca luz es el sensor sin suficiente luz,
// no un estilo; el botón de flash de abajo es la solución real para eso.
const BARCODE_TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'qr'];

const BarcodeScannerModal = ({ visible, onClose, onScanned }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);
  const insets = useSafeAreaInsets();

  // Evita procesar el mismo código varias veces mientras la cámara sigue
  // enfocándolo. Se reinicia cada vez que se abre el modal.
  const lastScannedRef = useRef(null);
  useEffect(() => {
    if (visible) {
      lastScannedRef.current = null;
      setTorchOn(false);
    }
  }, [visible]);

  const handleBarcodeScanned = ({ data }) => {
    if (!data || data === lastScannedRef.current) return;
    lastScannedRef.current = data;
    onScanned(data);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* paddingBottom con el inset real del dispositivo — sin esto, en
            Android con barra de navegación gestual/botones, la parte de
            abajo del sheet (el hint de texto) quedaba tapada. */}
        <View style={[styles.sheet, { paddingBottom: 24 + insets.bottom }]}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Escanear código</Text>
            <TouchableOpacity onPress={onClose}>
              <XMarkIcon size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {!permission ? (
            <View style={styles.stateBox}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : !permission.granted ? (
            <View style={styles.stateBox}>
              <View style={styles.permCircle}>
                <CameraIcon size={28} color={colors.primary} />
              </View>
              <Text style={styles.permTitle}>Permiso de cámara requerido</Text>
              <Text style={styles.permText}>
                Actívalo para escanear el código de barras del producto con la cámara.
              </Text>
              <TouchableOpacity style={styles.permButton} onPress={requestPermission} activeOpacity={0.85}>
                <Text style={styles.permButtonText}>Conceder permiso</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cameraFrame}>
              <CameraView
                style={styles.cameraView}
                facing="back"
                enableTorch={torchOn}
                onBarcodeScanned={handleBarcodeScanned}
                barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
              />
              <View style={styles.cornerTopLeft} />
              <View style={styles.cornerBottomRight} />

              {/* Flash/linterna — la imagen sale casi negra en poca luz sin esto. */}
              <TouchableOpacity
                style={styles.torchButton}
                onPress={() => setTorchOn((prev) => !prev)}
                activeOpacity={0.8}
              >
                {torchOn ? (
                  <BoltIcon size={20} color={colors.primary} />
                ) : (
                  <BoltSlashIcon size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.hint}>Apunta la cámara al código de barras del producto.</Text>
        </View>
      </View>
    </Modal>
  );
};

export default BarcodeScannerModal;
