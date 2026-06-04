import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, ScrollView, Alert } from 'react-native';
import { MagnifyingGlassIcon, PlusIcon, CurrencyDollarIcon, XMarkIcon, PencilIcon } from 'react-native-heroicons/solid';
import { FontAwesome } from '@expo/vector-icons';
import { useInformalCredit, MOCK_INVENTORY_QUICK_ADD } from '../hooks/useInformalCredit';
import styles from '../styles/informalCredit.styles';
import colors from '../../../theme/colors';

const InformalCredit = () => {
  const {
    searchQuery, setSearchQuery, filteredCredits,
    isFormModalVisible, setIsFormModalVisible, editingCredit,
    isPaymentModalVisible, setIsPaymentModalVisible,
    selectedClient, openPaymentModal, openAddModal, openEditModal,
    saveCredit, registerPayment, sendWhatsAppReminder, deleteCredit
  } = useInformalCredit();

  // Estados del Formulario
  const [formClientName, setFormClientName] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formItems, setFormItems] = useState('');
  const [formPhone, setFormPhone] = useState('');

  // Precargar datos si se está editando o limpiar si es nuevo
  useEffect(() => {
    if (editingCredit) {
      setFormClientName(editingCredit.clientName);
      setFormAmount(editingCredit.totalDebt.toString());
      setFormItems(editingCredit.items);
      // Extraemos el +507 visualmente si ya lo tiene para no duplicarlo en la UI
      setFormPhone(editingCredit.phone ? editingCredit.phone.replace('+507', '') : '');
    } else {
      setFormClientName(''); setFormAmount(''); setFormItems(''); setFormPhone('');
    }
  }, [editingCredit, isFormModalVisible]);

  // Manejar el guardado (Crear/Editar)
  const handleFormSubmit = () => {
    if (!formClientName || !formAmount) return;
    saveCredit({
      clientName: formClientName,
      totalDebt: parseFloat(formAmount),
      items: formItems,
      phone: formPhone ? `+507${formPhone}` : '+507' // Armamos el teléfono final aquí
    });
  };

  // Función estrella: Agrega producto al texto y suma su precio al monto automáticamente
  const handleQuickAddProduct = (product) => {
    setFormItems(prev => prev ? `${prev}, ${product.name}` : product.name);
    const currentAmount = parseFloat(formAmount || '0');
    setFormAmount((currentAmount + product.price).toFixed(2));
  };

  const [paymentAmount, setPaymentAmount] = useState('');
  const handlePaymentSubmit = () => {
    if (!paymentAmount) return;
    registerPayment(selectedClient.id, parseFloat(paymentAmount));
    setPaymentAmount('');
  };

  // Renderización de Tarjeta
  const renderCreditCard = ({ item }) => (
    <View style={styles.creditCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.clientName}>{item.clientName}</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.debtAmount}>${item.totalDebt.toFixed(2)}</Text>
          <TouchableOpacity style={styles.editIconBtn} onPress={() => openEditModal(item)}>
            <PencilIcon size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.itemsText} numberOfLines={2}>Fiado: {item.items}</Text>
      
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.payBtn} onPress={() => openPaymentModal(item)}>
          <CurrencyDollarIcon size={18} color={colors.success} />
          <Text style={styles.payBtnText}>Abonar / Pagar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.waBtn} onPress={() => sendWhatsAppReminder(item.clientName, item.phone, item.totalDebt)}>
          <FontAwesome name="whatsapp" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* BUSCADOR */}
      <View style={styles.headerWrapper}>
        <View style={styles.searchContainer}>
          <MagnifyingGlassIcon size={20} color={colors.textSecondary} />
          <TextInput style={styles.searchInput} placeholder="Buscar por nombre..." placeholderTextColor={colors.textMuted} value={searchQuery} onChangeText={setSearchQuery} />
        </View>
      </View>

      <FlatList
        data={filteredCredits}
        keyExtractor={(item) => item.id}
        renderItem={renderCreditCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fabButton} onPress={openAddModal}>
          <PlusIcon size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* MODAL: Crear / Editar Fiado */}
      <Modal visible={isFormModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16}}>
              <Text style={styles.modalTitle}>{editingCredit ? 'Editar Fiado' : 'Anotar Nuevo Fiado'}</Text>
              <TouchableOpacity onPress={() => setIsFormModalVisible(false)}><XMarkIcon size={24} color={colors.textSecondary}/></TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}><Text style={styles.formLabel}>Nombre del Cliente *</Text><TextInput style={styles.formInput} value={formClientName} onChangeText={setFormClientName} /></View>
            
            <View style={{flexDirection: 'row', gap: 12}}>
              <View style={[styles.formGroup, {flex: 1}]}>
                <Text style={styles.formLabel}>Monto ($) *</Text>
                <TextInput style={[styles.formInput, { backgroundColor: '#f0f0f0', color: '#888' }]} value={formAmount} editable={false} placeholder="0.00" />
              </View>
              <View style={[styles.formGroup, {flex: 1}]}>
                <Text style={styles.formLabel}>WhatsApp</Text>
                {/* PREFIJO FIJO VISUALMENTE */}
                <View style={styles.phoneInputContainer}>
                  <Text style={styles.phonePrefix}>+507</Text>
                  <TextInput style={styles.phoneInput} value={formPhone} onChangeText={setFormPhone} keyboardType="phone-pad" placeholder="60000000"/>
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>¿Qué llevó? (Selecciona de la lista)</Text>
              {/* SELECTOR ESTRICTO (Tocar suma automático) */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickAddScroll}>
                {MOCK_INVENTORY_QUICK_ADD.map(prod => (
                  <TouchableOpacity key={prod.id} style={styles.quickAddPill} onPress={() => handleQuickAddProduct(prod)}>
                    <Text style={styles.quickAddPillText}>+ {prod.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TextInput style={[styles.formInput, { backgroundColor: '#f0f0f0', color: '#888' }]} value={formItems} editable={false} placeholder="Seleccione productos arriba..." />
            </View>

            {editingCredit && (
              <TouchableOpacity 
                style={[styles.primaryBtn, { backgroundColor: colors.danger }]} 
                onPress={() => {
                  Alert.alert(
                    "Eliminar Fiado",
                    "¿Estás seguro que deseas eliminar este fiado?",
                    [
                      { text: "Cancelar", style: "cancel" },
                      { text: "Eliminar", style: "destructive", onPress: () => deleteCredit(editingCredit.id) }
                    ]
                  );
                }}
              >
                <Text style={styles.primaryBtnText}>Eliminar Fiado</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.primaryBtn} onPress={handleFormSubmit}>
              <Text style={styles.primaryBtnText}>{editingCredit ? 'Actualizar Fiado' : 'Registrar Deuda'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL: Registrar Pago*/}
      <Modal visible={isPaymentModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16}}>
              <Text style={styles.modalTitle}>Registrar Pago de {selectedClient?.clientName}</Text>
              <TouchableOpacity onPress={() => setIsPaymentModalVisible(false)}><XMarkIcon size={24} color={colors.textSecondary}/></TouchableOpacity>
            </View>
            <Text style={{color: colors.textSecondary, marginBottom: 16}}>Deuda actual: <Text style={{fontWeight: 'bold', color: colors.danger}}>${selectedClient?.totalDebt.toFixed(2)}</Text></Text>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>¿Cuánto abonó? ($)</Text>
              <TextInput style={styles.formInput} value={paymentAmount} onChangeText={setPaymentAmount} keyboardType="numeric" placeholder="0.00" />
            </View>
            <TouchableOpacity style={[styles.primaryBtn, {backgroundColor: colors.success}]} onPress={handlePaymentSubmit}>
              <Text style={styles.primaryBtnText}>Confirmar Pago</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default InformalCredit;