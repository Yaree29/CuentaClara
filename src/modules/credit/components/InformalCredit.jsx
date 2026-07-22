import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, Modal,
  ScrollView, Alert, Animated, ActivityIndicator, TouchableWithoutFeedback,
} from 'react-native';
import {
  MagnifyingGlassIcon, PlusIcon, CurrencyDollarIcon,
  XMarkIcon,
} from 'react-native-heroicons/solid';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInformalCredit, SORT_CATEGORIES } from '../hooks/useInformalCredit';
import { buildDebtDescription } from '../services/debtService';
import CustomersModal from './CustomersModal';
import styles from '../styles/informalCredit.styles';
import colors from '../../../theme/colors';

const InformalCredit = () => {
  const {
    searchQuery, setSearchQuery, filteredCredits,
    isFormModalVisible, setIsFormModalVisible, editingCredit,
    isPaymentModalVisible, setIsPaymentModalVisible,
    selectedClient, openPaymentModal, openAddModal, openEditModal,
    saveCredit, registerPayment, sendWhatsAppReminder, deleteCredit,
    inventoryProducts,
    // Nuevas features
    sortCategory, setSortCategory,
    isDetailModalVisible, detailCredit, detailPayments, loadingPayments,
    openDetailModal, closeDetailModal,
    isNoteModalVisible, noteCredit, openNoteModal, closeNoteModal, saveNote,
    // Gestión de clientes
    customersWithStats, isCustomersModalVisible, openCustomersModal, closeCustomersModal,
    editingCustomer, setEditingCustomer, saveCustomer, removeCustomer,
  } = useInformalCredit();

  // Los modales de esta pantalla son bottom-sheets: sin este inset, su botón
  // de acción (Registrar Abono / Confirmar Pago / Guardar) queda tapado por la
  // barra de navegación de Android. Mismo patrón que ProductFormModal.jsx —
  // requiere además navigationBarTranslucent en cada <Modal>, si no el inset
  // llega en 0 dentro del modal.
  const insets = useSafeAreaInsets();
  const sheetPadding = { paddingBottom: 24 + insets.bottom };

  // --- Estados del Formulario ---
  const [formClientName, setFormClientName] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formNotes, setFormNotes] = useState(''); // Notas adicionales (items)
  const [formPhone, setFormPhone] = useState('');
  
  const [selectedProducts, setSelectedProducts] = useState({}); // { [id]: { product, qty } }

  // --- Menú contextual (tres puntos) ---
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuCredit, setMenuCredit] = useState(null); // crédito seleccionado para el menú

  // --- Nota ---
  const [noteText, setNoteText] = useState('');

  // Precargar datos si se está editando o limpiar si es nuevo
  useEffect(() => {
    if (editingCredit) {
      setFormClientName(editingCredit.clientName);
      setFormPhone(editingCredit.phone ? editingCredit.phone.replace('+507', '') : '');
      
      // Productos y nota ya vienen separados desde el hook
      const rawItems = editingCredit.products || '';
      let parsedNotes = editingCredit.debtNote || rawItems;
      let parsedProducts = {};

      if (rawItems && inventoryProducts.length > 0) {
        let matchedCount = 0;
        const segments = rawItems.split(', ');
        segments.forEach(segment => {
          const match = segment.trim().match(/^(\d+)\s+(.+)$/); // Ej: "2 Empanada"
          if (match) {
            const qty = parseInt(match[1]);
            const name = match[2];
            const product = inventoryProducts.find(p => p.name === name);
            if (product) {
              parsedProducts[product.id] = { product, qty };
              matchedCount++;
            }
          }
        });
        
        // Si todo el string eran productos (no había "| Nota: "), la nota real está vacía
        if (matchedCount > 0 && parsedNotes === rawItems) {
          parsedNotes = '';
        }
      }

      setFormNotes(parsedNotes);
      setSelectedProducts(parsedProducts);
      // formAmount se calculará automáticamente en el otro useEffect si hay productos
      if (Object.keys(parsedProducts).length === 0) {
        setFormAmount(editingCredit.totalDebt.toString());
      }
    } else {
      setFormClientName(''); setFormAmount(''); setFormNotes(''); setFormPhone('');
      setSelectedProducts({});
    }
  }, [editingCredit, isFormModalVisible, inventoryProducts]);

  // Recalcular monto e items seleccionados cuando cambian los productos
  const computedItemsStr = Object.values(selectedProducts)
    .map(({ product, qty }) => `${qty} ${product.name}`)
    .join(', ');

  useEffect(() => {
    let total = 0;
    Object.values(selectedProducts).forEach(({ product, qty }) => {
      total += product.price * qty;
    });
    
    // Si hay productos seleccionados, el total manda.
    // Si no hay productos y estamos editando, mantenemos el monto original a menos que el usuario lo cambie (está deshabilitado pero por si acaso).
    if (Object.keys(selectedProducts).length > 0) {
      setFormAmount(total > 0 ? total.toFixed(2) : '0.00');
    } else if (!editingCredit) {
      setFormAmount('');
    }
  }, [selectedProducts, editingCredit]);

  // Precargar nota
  useEffect(() => {
    if (noteCredit) {
      setNoteText(noteCredit.notes || '');
    }
  }, [noteCredit]);

  const handleFormSubmit = () => {
    if (!formClientName || (!formAmount && !editingCredit)) return;
    
    if (formPhone && formPhone.trim().length !== 8) {
      Alert.alert('Número inválido', 'El número de teléfono debe tener exactamente 8 dígitos.');
      return;
    }
    
    // Productos seleccionados + nota, en el formato compartido con Ventas
    const finalItems = buildDebtDescription(computedItemsStr, formNotes);

    saveCredit({
      clientName: formClientName,
      totalDebt: parseFloat(formAmount || '0'),
      items: finalItems,
      phone: formPhone ? `+507${formPhone}` : '+507'
    });
  };

  const handleQuickAddProduct = (product) => {
    setSelectedProducts(prev => {
      const currentQty = prev[product.id] ? prev[product.id].qty : 0;
      if (currentQty >= 99) return prev; // max 99 limit
      return { ...prev, [product.id]: { product, qty: currentQty + 1 } };
    });
  };
  
  const handleRemoveProduct = (product) => {
    setSelectedProducts(prev => {
      const currentQty = prev[product.id] ? prev[product.id].qty : 0;
      if (currentQty <= 1) {
        const next = { ...prev };
        delete next[product.id];
        return next;
      }
      return { ...prev, [product.id]: { product, qty: currentQty - 1 } };
    });
  };

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [savingPayment, setSavingPayment] = useState(false);

  // Al abrir/cerrar el modal de pago limpiamos el formulario y el error previo
  useEffect(() => {
    setPaymentAmount('');
    setPaymentError('');
  }, [isPaymentModalVisible, selectedClient?.id]);

  const remainingDebt = Number(selectedClient?.totalDebt) || 0;
  const typedAmount = Number(paymentAmount.replace(',', '.'));
  const exceedsDebt = Number.isFinite(typedAmount) && typedAmount > remainingDebt;

  const handlePaymentChange = (value) => {
    setPaymentAmount(value);
    if (paymentError) setPaymentError('');
  };

  const handlePaymentSubmit = async () => {
    if (savingPayment) return;

    setSavingPayment(true);
    const result = await registerPayment(
      selectedClient.id,
      paymentAmount.replace(',', '.'),
      remainingDebt
    );
    setSavingPayment(false);

    if (!result?.ok) {
      setPaymentError(result?.error || 'No pudimos guardar el abono. Inténtalo de nuevo.');
      return;
    }

    setPaymentAmount('');
    setPaymentError('');
  };

  // Formatear método de pago
  const formatPaymentMethod = (method) => {
    const methods = { cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia', other: 'Otro' };
    return methods[method] || method;
  };

  // Formatear fecha
  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    const d = new Date(isoDate);
    return d.toLocaleDateString('es-PA', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Menú de tres puntos
  const toggleMenu = (credit) => {
    if (menuVisible && menuCredit?.id === credit.id) {
      setMenuVisible(false);
      setMenuCredit(null);
    } else {
      setMenuCredit(credit);
      setMenuVisible(true);
    }
  };

  const closeMenu = () => {
    setMenuVisible(false);
    setMenuCredit(null);
  };

  const handleMenuAction = (action) => {
    const credit = menuCredit;
    closeMenu();
    if (!credit) return;
    switch (action) {
      case 'notify':
        sendWhatsAppReminder(credit.clientName, credit.phone, credit.totalDebt);
        break;
      case 'edit':
        openEditModal(credit);
        break;
      case 'note':
        openNoteModal(credit);
        break;
      case 'delete':
        Alert.alert(
          "Eliminar Fiado",
          "¿Estás seguro que deseas eliminar este fiado?",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Eliminar", style: "destructive", onPress: () => deleteCredit(credit.id) }
          ]
        );
        break;
      case 'pay':
        openPaymentModal(credit);
        break;
    }
  };

  // --- Status badge ---
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return { label: 'Pendiente', color: colors.warning, bg: colors.warning + '15' };
      case 'partial':
        return { label: 'Abonado', color: colors.info, bg: colors.info + '15' };
      case 'overdue':
        return { label: 'Vencido', color: colors.danger, bg: colors.danger + '15' };
      default:
        return { label: status, color: colors.textSecondary, bg: colors.border };
    }
  };

  // --- Renderización de Tarjeta ---
  const renderCreditCard = ({ item }) => {
    const badge = getStatusBadge(item.status);
    const progressPercent = item.originalAmount > 0
      ? ((item.paidAmount / item.originalAmount) * 100)
      : 0;

    return (
      <View style={styles.creditCard}>
        <TouchableOpacity
          onPress={() => openDetailModal(item)}
          activeOpacity={0.7}
        >
          {/* Header */}
          <View style={[styles.cardHeader, { paddingRight: 30 }]}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {item.clientName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.cardHeaderInfo}>
                <Text style={styles.clientName} numberOfLines={1}>{item.clientName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: badge.color }]}>{badge.label}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Productos fiados */}
          {item.products ? (
            <Text style={styles.itemsText} numberOfLines={2}>{item.products}</Text>
          ) : null}

          {/* Nota de este fiado */}
          {item.debtNote ? (
            <View style={styles.notePreview}>
              <Ionicons name="pricetag-outline" size={14} color={colors.info} />
              <View style={{ flex: 1 }}>
                <Text style={styles.noteLabelText}>Nota del fiado</Text>
                <Text style={styles.notePreviewText} numberOfLines={2}>{item.debtNote}</Text>
              </View>
            </View>
          ) : null}

          {/* Nota del cliente */}
          {item.notes ? (
            <View style={styles.notePreview}>
              <Ionicons name="person-outline" size={14} color={colors.textMuted} />
              <View style={{ flex: 1 }}>
                <Text style={styles.noteLabelText}>Nota del cliente</Text>
                <Text style={styles.notePreviewText} numberOfLines={2}>{item.notes}</Text>
              </View>
            </View>
          ) : null}

          {/* Monto + barra de progreso */}
          <View style={styles.debtInfoRow}>
            <View>
              <Text style={styles.debtLabel}>Deuda pendiente</Text>
              <Text style={styles.debtAmount}>${item.totalDebt.toFixed(2)}</Text>
            </View>
            {item.paidAmount > 0 && (
              <View style={styles.paidInfo}>
                <Text style={styles.paidLabel}>Abonado</Text>
                <Text style={styles.paidAmount}>${item.paidAmount.toFixed(2)}</Text>
              </View>
            )}
          </View>

          {/* Barra de progreso */}
          {item.paidAmount > 0 && (
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${Math.min(progressPercent, 100)}%` }]} />
            </View>
          )}
        </TouchableOpacity>

        {/* Botón menú flotante */}
        <TouchableOpacity
          style={[styles.menuBtn, { position: 'absolute', top: 16, right: 16 }]}
          onPress={() => toggleMenu(item)}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* BUSCADOR + CATEGORÍAS */}
      <View style={styles.headerWrapper}>
        <View style={styles.searchRow}>
          <View style={[styles.searchContainer, { flex: 1 }]}>
            <MagnifyingGlassIcon size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre o producto..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <XMarkIcon size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Acceso a la libreta de clientes (editar / eliminar) */}
          <TouchableOpacity
            style={styles.customersBtn}
            onPress={openCustomersModal}
            accessibilityLabel="Ver mis clientes"
          >
            <Ionicons name="people" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Categorías de ordenamiento */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {SORT_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.categoryPill,
                sortCategory === cat.key && styles.categoryPillActive,
              ]}
              onPress={() => setSortCategory(cat.key)}
            >
              <Text style={[
                styles.categoryPillText,
                sortCategory === cat.key && styles.categoryPillTextActive,
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Resumen rápido */}
      {filteredCredits.length > 0 && (
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>
            {filteredCredits.length} fiado{filteredCredits.length !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.summaryTotal}>
            Total: ${filteredCredits.reduce((acc, c) => acc + c.totalDebt, 0).toFixed(2)}
          </Text>
        </View>
      )}

      <FlatList
        data={filteredCredits}
        keyExtractor={(item) => item.id}
        renderItem={renderCreditCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyStateTitle}>Sin fiados registrados</Text>
            <Text style={styles.emptyStateText}>
              Toca el botón + para anotar un nuevo fiado
            </Text>
          </View>
        }
      />

      {/* ========== FAB: Anotar nuevo fiado ==========
          Se había perdido en un refactor previo: openAddModal quedó
          destructurado del hook pero sin ningún disparador en la UI, así que
          no había forma de crear un fiado (pese a que el estado vacío decía
          "Toca el botón + para anotar un nuevo fiado"). Mismo patrón/estilos
          que el FAB de Inventario informal. */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fabButton}
          activeOpacity={0.8}
          onPress={openAddModal}
          accessibilityLabel="Anotar nuevo fiado"
        >
          <PlusIcon size={28} color={colors.textWhite} />
        </TouchableOpacity>
      </View>

      {/* ========== MODAL: Menú Contextual ========== */}
      <Modal visible={menuVisible} animationType="slide" transparent={true} statusBarTranslucent={true} navigationBarTranslucent={true} onRequestClose={closeMenu}>
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, paddingBottom: 24 + insets.bottom, elevation: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 12, textAlign: 'center' }}>
                  {menuCredit ? menuCredit.clientName : 'Opciones'}
                </Text>
                <TouchableOpacity style={styles.contextMenuItem} onPress={() => handleMenuAction('pay')}>
                  <Ionicons name="cash-outline" size={20} color={colors.success} />
                  <Text style={[styles.contextMenuText, { color: colors.success, fontSize: 16 }]}>Pagar fiado</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contextMenuItem} onPress={() => handleMenuAction('notify')}>
                  <Ionicons name="notifications-outline" size={20} color={colors.info} />
                  <Text style={[styles.contextMenuText, { fontSize: 16 }]}>Notificar fiado</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contextMenuItem} onPress={() => handleMenuAction('edit')}>
                  <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
                  <Text style={[styles.contextMenuText, { fontSize: 16 }]}>Editar fiado</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contextMenuItem} onPress={() => handleMenuAction('note')}>
                  <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
                  <Text style={[styles.contextMenuText, { fontSize: 16 }]}>
                    {menuCredit?.notes ? 'Editar nota del cliente' : 'Añadir nota del cliente'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contextMenuItem} onPress={() => handleMenuAction('delete')}>
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                  <Text style={[styles.contextMenuText, { color: colors.danger, fontSize: 16 }]}>Eliminar fiado</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ========== MODAL: Crear / Editar Fiado ========== */}
      <Modal visible={isFormModalVisible} animationType="slide" transparent={true} statusBarTranslucent={true} navigationBarTranslucent={true} onRequestClose={() => setIsFormModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, sheetPadding]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCredit ? 'Editar Fiado' : 'Anotar Nuevo Fiado'}
              </Text>
              <TouchableOpacity onPress={() => setIsFormModalVisible(false)}>
                <XMarkIcon size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* KeyboardAwareScrollView (no ScrollView): desplaza el contenido
                para que el campo enfocado quede visible sobre el teclado —
                antes el teclado tapaba lo que se estaba escribiendo. Mismo
                componente y configuración que ProductFormModal.jsx. */}
            <KeyboardAwareScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              enableOnAndroid={true}
              extraScrollHeight={20}
            >
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Nombre del Cliente *</Text>
                <TextInput style={styles.formInput} value={formClientName} onChangeText={setFormClientName} />
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Monto ($) *</Text>
                  <TextInput
                    style={[styles.formInput, { backgroundColor: '#f0f0f0', color: '#888' }]}
                    value={formAmount}
                    editable={false}
                    keyboardType="numeric"
                    placeholder="0.00"
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>WhatsApp</Text>
                  <View style={styles.phoneInputContainer}>
                    <Text style={styles.phonePrefix}>+507</Text>
                    <TextInput
                      style={styles.phoneInput}
                      value={formPhone}
                      onChangeText={setFormPhone}
                      keyboardType="phone-pad"
                      placeholder="60000000"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Productos Seleccionados</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickAddScroll}>
                  {inventoryProducts.length === 0 ? (
                    <Text style={{ color: colors.textMuted, paddingVertical: 8, fontSize: 13 }}>
                      Sin productos en inventario
                    </Text>
                  ) : (
                    inventoryProducts.map(prod => {
                      const isSelected = selectedProducts[prod.id];
                      const qty = isSelected ? isSelected.qty : 0;
                      return (
                        <View 
                          key={prod.id} 
                          style={[
                            styles.quickAddPill, 
                            { paddingHorizontal: 0, paddingVertical: 0, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
                            isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }
                          ]}
                        >
                          <TouchableOpacity 
                            style={{ paddingHorizontal: 12, paddingVertical: 6, flexDirection: 'row', alignItems: 'center' }}
                            onPress={() => handleQuickAddProduct(prod)}
                          >
                            <Text style={[styles.quickAddPillText, isSelected && { color: colors.textButton }]}>
                              {prod.name} {qty > 0 && <Text style={{fontWeight: '900'}}>{qty}</Text>}
                            </Text>
                          </TouchableOpacity>
                          
                          {isSelected && (
                            <TouchableOpacity 
                              style={{ paddingHorizontal: 10, paddingVertical: 6, borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.3)', justifyContent: 'center' }}
                              onPress={() => handleRemoveProduct(prod)}
                            >
                              <XMarkIcon size={14} color={colors.textButton} />
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })
                  )}
                </ScrollView>
                
                <Text style={[styles.formLabel, { marginTop: 12 }]}>Notas del fiado / Detalles</Text>
                <TextInput
                  style={styles.formInput}
                  value={formNotes}
                  onChangeText={setFormNotes}
                  placeholder={editingCredit ? 'Qué se llevó...' : 'Añade una nota adicional (opcional)...'}
                  multiline
                />
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
                <Text style={styles.primaryBtnText}>
                  {editingCredit ? 'Actualizar Fiado' : 'Registrar Deuda'}
                </Text>
              </TouchableOpacity>
            </KeyboardAwareScrollView>
          </View>
        </View>
      </Modal>

      {/* ========== MODAL: Registrar Pago ========== */}
      <Modal visible={isPaymentModalVisible} animationType="slide" transparent={true} statusBarTranslucent={true} navigationBarTranslucent={true} onRequestClose={() => setIsPaymentModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, sheetPadding]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Registrar Pago</Text>
              <TouchableOpacity onPress={() => setIsPaymentModalVisible(false)}>
                <XMarkIcon size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.paymentClientInfo}>
              <View style={styles.paymentAvatarCircle}>
                <Text style={styles.paymentAvatarText}>
                  {selectedClient?.clientName?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.paymentClientName}>{selectedClient?.clientName}</Text>
                <Text style={styles.paymentDebtLabel}>
                  Deuda actual: <Text style={{ fontWeight: 'bold', color: colors.danger }}>
                    ${selectedClient?.totalDebt.toFixed(2)}
                  </Text>
                </Text>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>¿Cuánto abonó? ($)</Text>
              <TextInput
                style={[
                  styles.formInput,
                  (paymentError || exceedsDebt) && styles.formInputError,
                ]}
                value={paymentAmount}
                onChangeText={handlePaymentChange}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
              />

              {/* Aviso en vivo mientras escribe: evita que llegue al backend */}
              {exceedsDebt && !paymentError ? (
                <View style={styles.inlineErrorBox}>
                  <Ionicons name="alert-circle" size={16} color={colors.danger} />
                  <Text style={styles.inlineErrorText}>
                    Ese monto es mayor que la deuda. {selectedClient?.clientName} solo debe{' '}
                    ${remainingDebt.toFixed(2)}.
                  </Text>
                </View>
              ) : null}

              {paymentError ? (
                <View style={styles.inlineErrorBox}>
                  <Ionicons name="alert-circle" size={16} color={colors.danger} />
                  <Text style={styles.inlineErrorText}>{paymentError}</Text>
                </View>
              ) : null}

              {/* Atajo para saldar el fiado completo */}
              {remainingDebt > 0 && (
                <TouchableOpacity
                  style={styles.payFullBtn}
                  onPress={() => handlePaymentChange(remainingDebt.toFixed(2))}
                >
                  <Text style={styles.payFullBtnText}>
                    Pagó todo (${remainingDebt.toFixed(2)})
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                { backgroundColor: colors.success },
                (exceedsDebt || savingPayment || !paymentAmount) && { opacity: 0.5 },
              ]}
              onPress={handlePaymentSubmit}
              disabled={exceedsDebt || savingPayment || !paymentAmount}
            >
              {savingPayment ? (
                <ActivityIndicator size="small" color={colors.textButton} />
              ) : (
                <Text style={styles.primaryBtnText}>Confirmar Pago</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========== MODAL: Detalle del Fiado ========== */}
      <Modal visible={isDetailModalVisible} animationType="slide" transparent={true} statusBarTranslucent={true} navigationBarTranslucent={true} onRequestClose={closeDetailModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "85%" }, sheetPadding]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Resumen del Fiado</Text>
              <TouchableOpacity onPress={closeDetailModal}>
                <XMarkIcon size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {detailCredit && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Info del cliente */}
                <View style={styles.detailClientSection}>
                  <View style={styles.detailAvatarCircle}>
                    <Text style={styles.detailAvatarText}>
                      {detailCredit.clientName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.detailClientName}>{detailCredit.clientName}</Text>
                  {detailCredit.phone && detailCredit.phone !== '+507' && (
                    <Text style={styles.detailPhone}>{detailCredit.phone}</Text>
                  )}
                </View>

                {/* Resumen financiero */}
                <View style={styles.detailFinanceRow}>
                  <View style={styles.detailFinanceItem}>
                    <Text style={styles.detailFinanceLabel}>Deuda original</Text>
                    <Text style={styles.detailFinanceValue}>${detailCredit.originalAmount.toFixed(2)}</Text>
                  </View>
                  <View style={styles.detailFinanceDivider} />
                  <View style={styles.detailFinanceItem}>
                    <Text style={styles.detailFinanceLabel}>Abonado</Text>
                    <Text style={[styles.detailFinanceValue, { color: colors.success }]}>
                      ${detailCredit.paidAmount.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.detailFinanceDivider} />
                  <View style={styles.detailFinanceItem}>
                    <Text style={styles.detailFinanceLabel}>Pendiente</Text>
                    <Text style={[styles.detailFinanceValue, { color: colors.danger }]}>
                      ${detailCredit.totalDebt.toFixed(2)}
                    </Text>
                  </View>
                </View>

                {/* Productos */}
                {detailCredit.products ? (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>
                      <Ionicons name="cart-outline" size={16} color={colors.textSecondary} /> Productos
                    </Text>
                    <View style={styles.detailItemsList}>
                      {detailCredit.products.split(',').map((item, idx) => (
                        <View key={idx} style={styles.detailItemPill}>
                          <Text style={styles.detailItemText}>{item.trim()}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}

                {/* Nota del fiado */}
                {detailCredit.debtNote ? (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>
                      <Ionicons name="pricetag-outline" size={16} color={colors.textSecondary} /> Nota del fiado
                    </Text>
                    <Text style={styles.detailNoteText}>{detailCredit.debtNote}</Text>
                  </View>
                ) : null}

                {/* Nota del cliente (siempre visible, para poder crearla) */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>
                    <Ionicons name="person-outline" size={16} color={colors.textSecondary} /> Nota del cliente
                  </Text>
                  {detailCredit.notes ? (
                    <Text style={styles.detailNoteText}>{detailCredit.notes}</Text>
                  ) : (
                    <Text style={styles.detailEmptyPayments}>Sin nota para este cliente</Text>
                  )}
                  <TouchableOpacity
                    style={styles.payFullBtn}
                    onPress={() => {
                      const credit = detailCredit;
                      closeDetailModal();
                      openNoteModal(credit);
                    }}
                  >
                    <Text style={styles.payFullBtnText}>
                      {detailCredit.notes ? 'Editar nota' : 'Añadir nota'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Historial de pagos */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>
                    <Ionicons name="time-outline" size={16} color={colors.textSecondary} /> Historial de abonos
                  </Text>

                  {loadingPayments ? (
                    <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 12 }} />
                  ) : detailPayments.length === 0 ? (
                    <Text style={styles.detailEmptyPayments}>Sin abonos registrados</Text>
                  ) : (
                    detailPayments.map((payment) => (
                      <View key={payment.id} style={styles.detailPaymentRow}>
                        <View style={styles.detailPaymentLeft}>
                          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                          <View style={{ marginLeft: 10 }}>
                            <Text style={styles.detailPaymentAmount}>
                              ${Number(payment.amount).toFixed(2)}
                            </Text>
                            <Text style={styles.detailPaymentMethod}>
                              {formatPaymentMethod(payment.method)}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.detailPaymentDate}>{formatDate(payment.paid_at)}</Text>
                      </View>
                    ))
                  )}
                </View>

                {/* Botón de acción rápida */}
                {detailCredit.totalDebt > 0 && (
                  <TouchableOpacity
                    style={[styles.primaryBtn, { backgroundColor: colors.success }]}
                    onPress={() => {
                      closeDetailModal();
                      openPaymentModal(detailCredit);
                    }}
                  >
                    <CurrencyDollarIcon size={18} color={colors.textButton} />
                    <Text style={[styles.primaryBtnText, { marginLeft: 8 }]}>Registrar Abono</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ========== MODAL: Añadir / Editar Nota ========== */}
      <Modal visible={isNoteModalVisible} animationType="slide" transparent={true} statusBarTranslucent={true} navigationBarTranslucent={true} onRequestClose={closeNoteModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, sheetPadding]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {noteCredit?.notes ? 'Editar Nota' : 'Añadir Nota'}
              </Text>
              <TouchableOpacity onPress={closeNoteModal}>
                <XMarkIcon size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.noteClientLabel}>
              Nota para: <Text style={{ fontWeight: '700' }}>{noteCredit?.clientName}</Text>
            </Text>

            <View style={styles.formGroup}>
              <TextInput
                style={[styles.formInput, { height: 100, textAlignVertical: 'top', paddingTop: 12 }]}
                value={noteText}
                onChangeText={setNoteText}
                placeholder="Escribe una nota sobre este cliente..."
                placeholderTextColor={colors.textMuted}
                multiline
              />
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => noteCredit && saveNote(noteCredit.customerId, noteText)}
            >
              <Text style={styles.primaryBtnText}>Guardar Nota</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========== MODAL: Mis Clientes ========== */}
      <CustomersModal
        visible={isCustomersModalVisible}
        customers={customersWithStats}
        editingCustomer={editingCustomer}
        setEditingCustomer={setEditingCustomer}
        onSave={saveCustomer}
        onDelete={removeCustomer}
        onClose={closeCustomersModal}
      />
    </View>
  );
};

export default InformalCredit;
