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
import { useInformalCredit, SORT_CATEGORIES } from '../hooks/useInformalCredit';
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
  } = useInformalCredit();

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
      
      // Intentar parsear productos y notas desde el string 'items'
      let rawItems = editingCredit.items || '';
      let parsedNotes = rawItems;
      let parsedProducts = {};
      
      if (rawItems.includes('| Nota: ')) {
        const parts = rawItems.split('| Nota: ');
        rawItems = parts[0].trim();
        parsedNotes = parts[1].trim();
      }

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
    
    // Concatenar productos seleccionados + notas
    let finalItems = computedItemsStr;
    if (formNotes.trim()) {
      finalItems = finalItems ? `${finalItems} | Nota: ${formNotes.trim()}` : formNotes.trim();
    }

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
  const handlePaymentSubmit = () => {
    if (!paymentAmount) return;
    registerPayment(selectedClient.id, parseFloat(paymentAmount));
    setPaymentAmount('');
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

          {/* Descripción */}
          {item.items ? (
            <Text style={styles.itemsText} numberOfLines={2}>{item.items}</Text>
          ) : null}

          {/* Nota preview */}
          {item.notes ? (
            <View style={styles.notePreview}>
              <Ionicons name="document-text-outline" size={14} color={colors.textMuted} />
              <Text style={styles.notePreviewText} numberOfLines={1}>{item.notes}</Text>
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
        <View style={styles.searchContainer}>
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

      {/* ========== MODAL: Menú Contextual ========== */}
      <Modal visible={menuVisible} animationType="slide" transparent={true}>
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, paddingBottom: 40, elevation: 10 }}>
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
      <Modal visible={isFormModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCredit ? 'Editar Fiado' : 'Anotar Nuevo Fiado'}
              </Text>
              <TouchableOpacity onPress={() => setIsFormModalVisible(false)}>
                <XMarkIcon size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
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
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========== MODAL: Registrar Pago ========== */}
      <Modal visible={isPaymentModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
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
                style={styles.formInput}
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                keyboardType="numeric"
                placeholder="0.00"
              />
            </View>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.success }]}
              onPress={handlePaymentSubmit}
            >
              <Text style={styles.primaryBtnText}>Confirmar Pago</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========== MODAL: Detalle del Fiado ========== */}
      <Modal visible={isDetailModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
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
                {detailCredit.items ? (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>
                      <Ionicons name="cart-outline" size={16} color={colors.textSecondary} /> Productos
                    </Text>
                    <View style={styles.detailItemsList}>
                      {detailCredit.items.split(',').map((item, idx) => (
                        <View key={idx} style={styles.detailItemPill}>
                          <Text style={styles.detailItemText}>{item.trim()}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}

                {/* Nota */}
                {detailCredit.notes ? (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>
                      <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} /> Nota
                    </Text>
                    <Text style={styles.detailNoteText}>{detailCredit.notes}</Text>
                  </View>
                ) : null}

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
      <Modal visible={isNoteModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
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
    </View>
  );
};

export default InformalCredit;
