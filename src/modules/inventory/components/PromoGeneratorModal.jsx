import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, Linking } from 'react-native';
import { XMarkIcon, ChatBubbleLeftEllipsisIcon } from 'react-native-heroicons/solid';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from '../styles/informalInventory.styles';
import colors from '../../../theme/colors';

const PromoGeneratorModal = ({ visible, onClose, selectedProducts, onGenerate }) => {
  const [customMessage, setCustomMessage] = useState('');

  // Sin este inset, "Enviar por WhatsApp" queda tapado por la barra de
  // navegación de Android. Mismo patrón que ProductFormModal.jsx (que ya lo
  // aplica): requiere navigationBarTranslucent para que el inset no llegue en 0.
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      navigationBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { paddingBottom: 24 + insets.bottom }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={styles.modalTitle}>Crear Publicidad</Text>
            <TouchableOpacity onPress={onClose}>
              <XMarkIcon size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={{ color: colors.textSecondary, marginBottom: 8, fontSize: 13 }}>
            Se enviará el siguiente catálogo por WhatsApp:
          </Text>

          <ScrollView style={{ maxHeight: 150, marginBottom: 10 }}>
            {selectedProducts.map((p) => (
              <View key={p.id} style={styles.selectedItemRow}>
                <Text style={{ color: colors.textPrimary, fontWeight: '500' }}>{p.name}</Text>
                <Text style={{ color: colors.success, fontWeight: '700' }}>${p.price.toFixed(2)}</Text>
              </View>
            ))}
          </ScrollView>

          <TextInput
            style={styles.modalInput}
            placeholder="Ej: ¡Lleva 2 por el precio de 1! / Entrega gratis en la estación..."
            placeholderTextColor={colors.textMuted}
            multiline
            value={customMessage}
            onChangeText={setCustomMessage}
          />

          <TouchableOpacity
            style={[styles.generatePromoBtn, { marginTop: 20 }]}
            onPress={() => {
              // Local logic to format message and open WhatsApp
              const productsText = selectedProducts.map(p => `- ${p.name}: $${p.price.toFixed(2)}`).join('\n');
              const text = `${customMessage}\n\nCatálogo:\n${productsText}`;
              const url = `whatsapp://send?text=${encodeURIComponent(text)}`;

              Linking.openURL(url).catch(() => alert('No se pudo abrir WhatsApp. Asegúrate de tenerlo instalado en este dispositivo/simulador.'));

              // Execute parent logic and clean up
              onGenerate(customMessage);
              setCustomMessage('');
            }}
          >
            <ChatBubbleLeftEllipsisIcon size={20} color="#FFF" />
            <Text style={styles.generatePromoBtnText}>Enviar por WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default PromoGeneratorModal;
