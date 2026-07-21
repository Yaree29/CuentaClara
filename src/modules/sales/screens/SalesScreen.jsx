import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// 1. Reemplazamos MainLayout por SafeAreaView para igualar la altura del Header
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../../theme/colors';

import { useSales } from '../hooks/useSales';
import styles from '../styles/sales.styles';
import inventoryService from '../../inventory/services/inventoryService';
import debtService from '../../credit/services/debtService';
import billingService from '../../Invoice/services/billingService';
import LinkCustomerModal from '../components/LinkCustomerModal';
import {UserPlusIcon,ShoppingBagIcon,DocumentTextIcon,XMarkIcon} from 'react-native-heroicons/solid';

// Importación del HEADER
import DashboardHeader from '../../dashboard/components/shared/DashboardHeader';

const PAYMENT_LABELS = { cash: 'efectivo', card: 'tarjeta', transfer: 'transferencia' };



const SalesScreen = () => {
  const [cartCount, setCartCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [activeTab, setActiveTab] = useState('sales');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProducts, setShowProducts] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [saleNote, setSaleNote] = useState('');

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const [salesHistory, setSalesHistory] = useState([]);
  const [salesHistoryLoading, setSalesHistoryLoading] = useState(false);

  const [linkedCustomer, setLinkedCustomer] = useState(null); // {id, name} | null — null = venta al contado
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [receiptVisible, setReceiptVisible] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const {
    processSale,loading,error,fetchProfitsAndExpenses,profitsData} = useSales();

  useEffect(() => {
    const today = new Date();
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    setDateFrom(lastMonth.toISOString().split('T')[0]);
    setDateTo(today.toISOString().split('T')[0]);
  }, []);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const data = await inventoryService.getProducts();
      setProducts(data || []);
    } catch (err) {
      console.error('Error al cargar productos para venta:', err);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const loadSalesHistory = useCallback(async () => {
    setSalesHistoryLoading(true);
    try {
      const data = await billingService.getInvoices(null, { limit: 30 });
      setSalesHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar historial de ventas:', err);
    } finally {
      setSalesHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (activeTab === 'history') loadSalesHistory();
  }, [activeTab, loadSalesHistory]);

  // Al volver a enfocar la pestaña de Ventas (p.ej. tras borrar los datos desde
  // Perfil), recargar el catálogo del dropdown y, si se está viendo, el
  // historial, para no mostrar productos/ventas ya eliminados.
  useFocusEffect(
    useCallback(() => {
      loadProducts();
      if (activeTab === 'history') loadSalesHistory();
    }, [loadProducts, loadSalesHistory, activeTab])
  );

    {/* aumentar cantidad en el carrito */}
  const handleQuickAdd = (amount) => {
    setCartCount((prev) => prev + 1);
    setTotal((prev) => prev + amount);
  };

    {/* Revisar el carrito */}
  const handleCheckout = async () => {
    if (selectedProducts.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos antes de registrar una venta.');
      return;
    }

    const itemsSnapshot = selectedProducts;
    const itemsSummary = itemsSnapshot.map((p) => `${p.quantity}x ${p.name}`).join(', ');
    const isCredit = !!linkedCustomer;

    try {
      const items = itemsSnapshot.map((p) => ({
        product_id: p.id,
        quantity: p.quantity,
        unit_price: p.price,
      }));

      const result = await processSale(items, total, saleNote, paymentMethod, isCredit);

      if (isCredit) {
        await debtService.createDebt({
          customer_id: linkedCustomer.id,
          amount: total,
          description: itemsSummary,
          invoice_id: result?.invoice_id,
        });
      }

      setReceiptData({
        items: itemsSnapshot,
        total,
        isCredit,
        customerName: linkedCustomer?.name,
        paymentMethod,
      });
      setReceiptVisible(true);

      setCartCount(0);
      setTotal(0);
      setDescription('');
      setSaleNote('');
      setSelectedProducts([]);
      setSelectedProduct(null);
      setLinkedCustomer(null);
    } catch (err) {
      Alert.alert('Error', error || 'No se pudo registrar la venta');
    }
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>

      <DashboardHeader title="Venta Rápida" isHome={false} />

      {/* TABS DE NAVEGACIÓN INTERNA */}
      <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'sales' && styles.tabActive]}
            onPress={() => setActiveTab('sales')}
          >
            <Text style={[styles.tabText, activeTab === 'sales' && styles.tabTextActive]}>
              Ventas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.tabActive]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
              Historial
            </Text>
          </TouchableOpacity>
      </View>

      {activeTab === 'sales' && (
        <View style={styles.displayCard}>
          <Text style={styles.displayLabel}>
            TOTAL ACUMULADO
          </Text>

          <View style={styles.totalRow}>
            <Text style={styles.currency}>$</Text>

            <Text style={styles.displayValue}>
              {total.toFixed(2)}
            </Text>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>
                <ShoppingBagIcon size={16} color="#64748B" />
            </Text>

            <Text style={styles.badgeText}>
                {cartCount} artículos seleccionados
            </Text>
          </View>
        </View>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

          {/* PANTALLA VENTAS */}
          {activeTab === 'sales' && (
            <View>

              {/* CARRITO DE PRODUCTOS */}
              <View style={styles.quickGrid}>
                  <ScrollView
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{paddingBottom: 4,}}
                  >
                    {selectedProducts.length === 0 ? (
                      <View style={styles.emptyProducts}>
                        <Text style={styles.emptyProductsText}>
                          No hay productos seleccionados
                        </Text>
                      </View>
                    ) : (
                      selectedProducts.map((product) => (
                        <View
                          key={product.id}
                          style={styles.selectedProductCard}
                        >
                          <View>
                            <Text style={styles.selectedProductName}>
                              {product.name}
                            </Text>

                            <Text style={styles.selectedProductPrice}>
                              ${product.price}
                            </Text>
                          </View>

                          <View style={styles.selectedProductRight}>
                            <Text style={styles.selectedProductQty}>
                              x{product.quantity}
                            </Text>

                            <TouchableOpacity
                              style={styles.removeBtn}
                              onPress={() => {
                                setSelectedProducts((prev) =>
                                  prev
                                    .map((item) => {
                                      if (item.id === product.id) {
                                        return {
                                          ...item,
                                          quantity: item.quantity - 1,
                                        };
                                      }

                                      return item;
                                    })
                                    .filter((item) => item.quantity > 0)
                                );

                                setCartCount((prev) =>
                                  Math.max(prev - 1, 0)
                                );

                                setTotal((prev) =>
                                  Math.max(prev - product.price, 0)
                                );
                              }}
                            >
                              <Text style={styles.removeBtnText}>
                                −
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.addBtn}
                              onPress={() => {
                                setSelectedProducts((prev) =>
                                  prev.map((item) => {
                                    if (item.id === product.id) {
                                      return {
                                        ...item,
                                        quantity: item.quantity + 1,
                                      };
                                    }

                                    return item;
                                  })
                                );

                                setCartCount((prev) => prev + 1);

                                setTotal((prev) => prev + product.price);
                              }}
                            >
                              <Text style={styles.addBtnText}>
                                +
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))
                    )}
                  </ScrollView>
              </View>

              {/* ACCIONES EXTRA */}
              <View style={styles.actionsTopRow}>

                {/* LIMPIAR MONTO */}
                <TouchableOpacity
                  style={styles.clearAmountBtn}
                  onPress={() => {
                    setTotal(0);
                    setCartCount(0);
                    setSelectedProduct(null);
                    setSelectedProducts([]);
                    setShowProducts(false);
                    setShowAllProducts(false);
                  }}
                >
                  <Text style={styles.clearAmountText}>
                    Limpiar monto
                  </Text>
                </TouchableOpacity>

                 {/* BOTÓN DROPDOWN */}
                <TouchableOpacity
                  style={styles.productDropdown}
                  onPress={() => setShowProducts(!showProducts)}
                >
                  <Text style={styles.productDropdownText}>
                    {selectedProduct
                      ? selectedProduct.name
                      : 'Seleccionar producto'}
                  </Text>

                  <Text style={styles.dropdownArrow}>
                    {showProducts ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>

                {/* LISTA PRODUCTOS */}
                {showProducts && (
                  <View style={styles.productsContainer}>
                    {productsLoading ? (
                      <View style={{ padding: 20, alignItems: 'center' }}>
                        <ActivityIndicator size="small" color={colors.primary} />
                      </View>
                    ) : products.length === 0 ? (
                      <View style={{ padding: 20, alignItems: 'center' }}>
                        <Text style={styles.emptyProductsText}>
                          No tienes productos en tu catálogo. Agrégalos desde el módulo de inventario.
                        </Text>
                      </View>
                    ) : (
                      <>
                        {(showAllProducts
                          ? products
                          : products.slice(0, 5)
                        ).map((product) => (
                          <TouchableOpacity
                            key={product.id}
                            style={styles.productItem}
                            onPress={() => {
                              setSelectedProducts((prev) => {
                                const existing = prev.find(
                                  (item) => item.id === product.id
                                );

                                if (existing) {
                                  return prev.map((item) =>
                                    item.id === product.id
                                      ? {
                                          ...item,
                                          quantity: item.quantity + 1,
                                        }
                                      : item
                                  );
                                }

                                return [
                                  ...prev,
                                  {
                                    ...product,
                                    quantity: 1,
                                  },
                                ];
                              });

                              setShowProducts(false);

                              // AGREGAR PRECIO AUTOMÁTICAMENTE
                              setCartCount((prev) => prev + 1);
                              setTotal((prev) => prev + product.price);
                            }}
                          >
                            <View>
                              <Text style={styles.productName}>
                                {product.name}
                              </Text>

                              <Text style={styles.productPrice}>
                                ${product.price}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}

                        {/* VER MÁS */}
                        {products.length > 5 && !showAllProducts && (
                          <TouchableOpacity
                            style={styles.showMoreBtn}
                            onPress={() => setShowAllProducts(true)}
                          >
                            <Text style={styles.showMoreText}>
                              Ver más productos
                            </Text>
                          </TouchableOpacity>
                        )}

                        {/* VER MENOS */}
                        {showAllProducts && (
                          <TouchableOpacity
                            style={styles.showMoreBtn}
                            onPress={() => setShowAllProducts(false)}
                          >
                            <Text style={styles.showMoreText}>
                              Ver menos
                            </Text>
                          </TouchableOpacity>
                        )}
                      </>
                    )}
                  </View>
                )}
              </View>

              {/* MÉTODO DE PAGO */}
              <Text style={styles.label}>
                Método de pago
              </Text>

              {linkedCustomer ? (
                <View style={styles.creditNoticeBox}>
                  <Text style={styles.creditNoticeText}>
                    Venta a fiado para {linkedCustomer.name} — se cobra después
                  </Text>
                </View>
              ) : (
                <View style={styles.methodContainer}>
                  {['cash', 'card', 'transfer'].map((method) => (
                    <TouchableOpacity
                      key={method}
                      style={[
                        styles.methodBtn,
                        paymentMethod === method &&
                          styles.methodBtnActive,
                      ]}
                      onPress={() => setPaymentMethod(method)}
                    >
                      <Text
                        style={[
                          styles.methodBtnText,
                          paymentMethod === method &&
                            styles.methodBtnTextActive,
                        ]}
                      >
                        {method === 'cash'
                          ? 'Efectivo'
                          : method === 'card'
                          ? 'Tarjeta'
                          : 'Transferencia'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* BOTONES EXTRA */}
              <View style={styles.actionsRow}>

                {/* Agregar Nota */}
                <TouchableOpacity
                  style={styles.secondaryBtnGray}
                  onPress={() => setNoteModalVisible(true)}
                >
                  <DocumentTextIcon size={18} color="#0F2747" style={styles.secondaryBtnIcon}/>

                  <Text style={styles.secondaryBtnTextGray}>
                    {saleNote ? 'Editar Nota' : 'Agregar Nota'}
                  </Text>
                </TouchableOpacity>

                <Modal
                  visible={noteModalVisible}
                  transparent
                  animationType="fade"
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.noteModal}>

                      <View style={styles.noteHeader}>

                        <Text style={styles.noteModalTitle}>
                          Nota de la venta
                        </Text>

                        <TouchableOpacity
                          style={styles.closeIconBtn}
                          onPress={() => setNoteModalVisible(false)}
                        >
                          <Text style={styles.closeIconText}>
                            ✕
                          </Text>
                        </TouchableOpacity>

                      </View>

                      <TextInput
                        style={styles.noteInput}
                        placeholder="Escribe una nota..."
                        placeholderTextColor="#94A3B8"
                        multiline
                        value={saleNote}
                        onChangeText={setSaleNote}
                      />

                      <View style={styles.noteActions}>

                        {/* ELIMINAR */}
                        <TouchableOpacity
                          style={styles.deleteNoteBtn}
                          onPress={() => {
                            setSaleNote('');
                          }}
                        >
                          <Text style={styles.deleteNoteText}>
                            Eliminar nota
                          </Text>
                        </TouchableOpacity>

                        {/* CERRAR */}
                        <TouchableOpacity
                          style={styles.closeNoteBtn}
                          onPress={() => setNoteModalVisible(false)}
                        >
                          <Text style={styles.closeNoteText}>
                            Listo
                          </Text>
                        </TouchableOpacity>

                      </View>
                    </View>
                  </View>
                </Modal>

                {/* Vincular Fiado */}
                <TouchableOpacity
                  style={styles.secondaryBtnBlue}
                  onPress={() => {
                    if (linkedCustomer) {
                      setLinkedCustomer(null);
                    } else {
                      setLinkModalVisible(true);
                    }
                  }}
                >
                  {linkedCustomer ? (
                    <XMarkIcon size={18} color="#1E3A8A" style={styles.secondaryBtnIconBlue} />
                  ) : (
                    <UserPlusIcon size={18} color="#1E3A8A" style={styles.secondaryBtnIconBlue} />
                  )}

                  <Text style={styles.secondaryBtnTextBlue} numberOfLines={1}>
                    {linkedCustomer ? linkedCustomer.name : 'Vincular Fiado'}
                  </Text>
                </TouchableOpacity>

              </View>

              <LinkCustomerModal
                visible={linkModalVisible}
                onClose={() => setLinkModalVisible(false)}
                onSelect={(customer) => {
                  setLinkedCustomer(customer);
                  setLinkModalVisible(false);
                }}
              />

              {/* ERROR */}
              {error && (
                <Text style={styles.errorText}>
                  {error}
                </Text>
              )}

              {/* BOTÓN REGISTRAR VENTA */}
              <TouchableOpacity
                style={[
                  styles.checkoutBtn,
                  (cartCount === 0 || loading) &&
                    styles.disabledBtn,
                ]}
                onPress={handleCheckout}
                disabled={cartCount === 0 || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={styles.checkoutBtnContent}>
                    <Text style={styles.checkMark}>✓</Text>

                    <Text style={styles.checkoutBtnText}>
                      Registrar Venta
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
        )}

          {/* PANTALLA REPORTES / HISTORIAL */}
        {activeTab === 'history' && (() => {
          const formatDate = (iso) => {
            if (!iso) return '';
            const d = new Date(iso);
            return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
          };
          const itemsSummary = (invoice) => {
            const items = invoice.invoice_items || [];
            if (items.length === 0) return 'Venta sin detalle';
            return items
              .map((it) => `${it.quantity % 1 === 0 ? it.quantity.toFixed(0) : it.quantity}x ${it.products?.name || 'Producto'}`)
              .join(', ');
          };
          const statusLabel = (invoice) => {
            if (invoice.status === 'pending') return 'Fiado';
            const method = invoice.payments?.[0]?.method;
            return `Pagado en ${PAYMENT_LABELS[method] || 'efectivo'}`;
          };
          const salesCount = salesHistory.length;
          const fiadoCount = salesHistory.filter((inv) => inv.status === 'pending').length;

          return (
            <>
              <Text style={styles.reportTitle}>
                Historial de Ventas
              </Text>

              {/* RESUMEN */}
              <View style={styles.historySummary}>
                <View style={styles.summaryCardIncome}>
                  <Text style={styles.summaryLabel}>Ventas</Text>
                  <Text style={styles.summaryIncome}>{salesCount}</Text>
                </View>
                <View style={styles.summaryCardExpense}>
                  <Text style={styles.summaryLabel}>Fiadas</Text>
                  <Text style={styles.summaryExpense}>{fiadoCount}</Text>
                </View>
              </View>

              {/* LISTA */}
              <View style={styles.historyContainer}>
                {salesHistoryLoading ? (
                  <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                ) : salesHistory.length === 0 ? (
                  <Text style={{ textAlign: 'center', color: colors.textSecondary, paddingVertical: 40 }}>
                    Aún no tienes ventas. El historial se mostrará aquí cuando registres una.
                  </Text>
                ) : (
                  salesHistory.map((invoice) => (
                    <View key={invoice.id} style={styles.historyCard}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.historyTitle} numberOfLines={1}>
                          {itemsSummary(invoice)}
                        </Text>
                        <Text style={styles.historyDate}>
                          {statusLabel(invoice)} · {formatDate(invoice.created_at)}
                        </Text>
                      </View>
                      <Text style={invoice.status === 'pending' ? styles.historyExpense : styles.historyIncome}>
                        ${Number(invoice.total).toFixed(2)}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </>
          );
        })()}
      </ScrollView>

      {/* COMPROBANTE DE VENTA */}
      <Modal visible={receiptVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.noteModal}>
            <View style={styles.noteHeader}>
              <Text style={styles.noteModalTitle}>Venta registrada</Text>
              <TouchableOpacity
                style={styles.closeIconBtn}
                onPress={() => setReceiptVisible(false)}
              >
                <Text style={styles.closeIconText}>✕</Text>
              </TouchableOpacity>
            </View>

            {receiptData && (
              <>
                {receiptData.items.map((item) => (
                  <View key={item.id} style={styles.selectedProductCard}>
                    <Text style={styles.selectedProductName}>
                      {item.quantity}x {item.name}
                    </Text>
                    <Text style={styles.selectedProductPrice}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                ))}

                <Text style={[styles.displayValue, { marginTop: 16, textAlign: 'center' }]}>
                  ${receiptData.total.toFixed(2)}
                </Text>

                <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 4, marginBottom: 16 }}>
                  {receiptData.isCredit
                    ? `Fiado a nombre de ${receiptData.customerName}`
                    : `Pagado en ${PAYMENT_LABELS[receiptData.paymentMethod] || 'efectivo'}`}
                </Text>
              </>
            )}

            <TouchableOpacity
              style={styles.closeNoteBtn}
              onPress={() => setReceiptVisible(false)}
            >
              <Text style={styles.closeNoteText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SalesScreen;
