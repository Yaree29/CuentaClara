import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput, ScrollView, ActivityIndicator, Modal, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';

// 1. Reemplazamos MainLayout por SafeAreaView para igualar la altura del Header
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../../../theme/colors';

import { useSales } from '../../hooks/useSales';
import styles from '../styles/salesInformal.style';
import inventoryService from '../../../inventory/services/inventoryService';
import debtService, { buildDebtDescription } from '../../../credit/services/debtService';
import billingService from '../../../Invoice/services/billingService';
import expensesService from '../../services/expensesService';
import LinkCustomerModal from '../LinkCustomerModal';
import {UserPlusIcon,ShoppingBagIcon,DocumentTextIcon,XMarkIcon} from 'react-native-heroicons/solid';

// Importación del HEADER
import DashboardHeader from '../../../dashboard/components/shared/DashboardHeader';

// MODIFICADO: Mantenemos 'cash' y mapeamos 'transfer' de la DB a 'yappy' en la UI
const PAYMENT_LABELS = { cash: 'efectivo', yappy: 'yappy', transfer: 'yappy' };



const SalesInformal = () => {
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
  const [totalExpenses, setTotalExpenses] = useState(0);
  // Detalle de los gastos del período (hoy: compras y reposiciones de stock)
  const [expenseDetail, setExpenseDetail] = useState([]);

  const [linkedCustomer, setLinkedCustomer] = useState(null); // {id, name} | null — null = venta al contado
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [receiptVisible, setReceiptVisible] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // Shortcut "Anotar Fiado" del dashboard: navega acá con openFiado=true y
  // abre directo el selector de cliente. Se limpia el param en el mismo tick
  // para que no se vuelva a disparar si el usuario cierra el modal y cambia
  // de tab / vuelve.
  const navigation = useNavigation();
  const route = useRoute();
  useEffect(() => {
    if (route.params?.openFiado) {
      setLinkModalVisible(true);
      navigation.setParams({ openFiado: undefined });
    }
  }, [route.params?.openFiado, navigation]);

  const {
    processSale,loading,error,fetchProfitsAndExpenses,profitsData} = useSales();

  useEffect(() => {
    const today = new Date();
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    setDateFrom(lastMonth.toISOString().split('T')[0]);
    setDateTo(today.toISOString().split('T')[0]);
  }, []);

  // Cargas extraídas a useCallback para poder reusarlas desde el
  // pull-to-refresh. `silent` evita el spinner en las recargas de fondo, para
  // que la lista no parpadee cada vez que se vuelve a la pantalla.
  const loadProducts = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setProductsLoading(true);
    try {
      const data = await inventoryService.getProducts();
      setProducts(data || []);
    } catch (err) {
      console.error('Error al cargar productos para venta:', err);
    } finally {
      if (!silent) setProductsLoading(false);
    }
  }, []);

  const loadReportData = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setSalesHistoryLoading(true);
    try {
      const [invoices, profits, expensesData] = await Promise.all([
        billingService.getInvoices(null, { limit: 30 }),
        fetchProfitsAndExpenses(dateFrom, dateTo),
        // Detalle de los gastos del período: hasta ahora solo se mostraba el
        // total agregado, sin decir en qué se fue esa plata.
        expensesService
          .getExpenses({ dateFrom, dateTo, limit: 50 })
          .catch((e) => {
            console.error('Error al cargar gastos:', e);
            return [];
          }),
      ]);
      setSalesHistory(Array.isArray(invoices) ? invoices : []);
      setTotalExpenses(Number(profits?.expenses) || 0);
      setExpenseDetail(Array.isArray(expensesData) ? expensesData : []);
    } catch (err) {
      console.error('Error al cargar datos de reportes:', err);
    } finally {
      if (!silent) setSalesHistoryLoading(false);
    }
  }, [dateFrom, dateTo]);

  // Se recarga en CADA foco de la pantalla, no solo al montar: las pestañas del
  // navegador quedan montadas, así que con un useEffect([]) un producto recién
  // creado en Inventario no aparecía aquí hasta reiniciar la app por completo.
  //
  // La primera vez muestra spinner; las siguientes son silenciosas para no
  // parpadear la lista al volver de otra pestaña.
  const hasLoadedProductsRef = useRef(false);
  useFocusEffect(
    useCallback(() => {
      loadProducts({ silent: hasLoadedProductsRef.current });
      hasLoadedProductsRef.current = true;
    }, [loadProducts])
  );

  useEffect(() => {
    if (activeTab !== 'history') return;
    loadReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Pull-to-refresh: recarga lo que corresponde a la pestaña visible.
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadProducts({ silent: true }),
        activeTab === 'history' ? loadReportData({ silent: true }) : Promise.resolve(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [activeTab, loadProducts, loadReportData]);

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

      // Guardamos la nota antes de procesar
      const finalNote = saleNote || '';

      // Mapeamos 'yappy' a 'transfer' para que la base de datos lo acepte (restricción CHECK en method)
      const apiPaymentMethod = paymentMethod === 'yappy' ? 'transfer' : paymentMethod;

      const result = await processSale(items, total, finalNote, apiPaymentMethod, isCredit);

      if (isCredit) {
        // La nota de la venta se guarda también en el fiado, para que aparezca
        // como "Nota del fiado" en la libreta y no se quede solo en la factura.
        await debtService.createDebt({
          customer_id: linkedCustomer.id,
          amount: total,
          description: buildDebtDescription(itemsSummary, finalNote),
          invoice_id: result?.invoice_id,
        });
      }

      setReceiptData({
        items: itemsSnapshot,
        total,
        isCredit,
        customerName: linkedCustomer?.name,
        paymentMethod,
        note: finalNote,
      });
      setReceiptVisible(true);

      // Limpiar todo después de registrar
      setCartCount(0);
      setTotal(0);
      setDescription('');
      setSaleNote('');
      setSelectedProducts([]);
      setSelectedProduct(null);
      setLinkedCustomer(null);

      // La venta descontó inventario en el backend: sin esto, el stock que se
      // muestra en el selector queda con el valor previo hasta cambiar de
      // pantalla y volver.
      loadProducts();
    } catch (err) {
      Alert.alert('Error', error || 'No se pudo registrar la venta');
    }
  };

  // Función para eliminar la nota
  const clearNote = () => {
    setSaleNote('');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>

      <DashboardHeader title="Venta Rápida" />

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
              Reportes
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            title="Actualizando..."
          />
        }
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
                    setSaleNote(''); // Limpiar nota también
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

              {/* NOTA GUARDADA - SE MUESTRA EN TIEMPO REAL DEBAJO DE "SELECCIONAR PRODUCTO" */}
              {saleNote ? (
                <View style={styles.savedNoteContainer}>
                  <Text style={styles.savedNoteLabel}>Nota:</Text>
                  <Text style={styles.savedNoteText}>{saleNote}</Text>
                </View>
              ) : null}

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
                  {/* MODIFICADO: Solo Efectivo y Yappy */}
                  <TouchableOpacity
                    style={[
                      styles.methodBtn,
                      paymentMethod === 'cash' &&
                        styles.methodBtnActive,
                    ]}
                    onPress={() => setPaymentMethod('cash')}
                  >
                    <Text
                      style={[
                        styles.methodBtnText,
                        paymentMethod === 'cash' &&
                          styles.methodBtnTextActive,
                      ]}
                    >
                      Efectivo
                    </Text>
                  </TouchableOpacity>

                  {/* NUEVO: Botón Yappy */}
                  <TouchableOpacity
                    style={[
                      styles.methodBtn,
                      paymentMethod === 'yappy' &&
                        styles.methodBtnActive,
                    ]}
                    onPress={() => setPaymentMethod('yappy')}
                  >
                    <Text
                      style={[
                        styles.methodBtnText,
                        paymentMethod === 'yappy' &&
                          styles.methodBtnTextActive,
                      ]}
                    >
                      Yappy
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* BOTONES EXTRA */}
              <View style={styles.actionsRow}>

                {/* Agregar Nota / Editar Nota / Eliminar Nota */}
                <TouchableOpacity
                  style={styles.secondaryBtnGray}
                  onPress={() => {
                    if (saleNote) {
                      // Si hay nota, mostrar opción de eliminar
                      Alert.alert(
                        'Nota actual',
                        `"${saleNote}"`,
                        [
                          {
                            text: 'Eliminar nota',
                            style: 'destructive',
                            onPress: () => {
                              setSaleNote('');
                            },
                          },
                          {
                            text: 'Editar',
                            onPress: () => setNoteModalVisible(true),
                          },
                          {
                            text: 'Cancelar',
                            style: 'cancel',
                          },
                        ]
                      );
                    } else {
                      // Si no hay nota, abrir modal para crear
                      setNoteModalVisible(true);
                    }
                  }}
                >
                  <DocumentTextIcon size={18} color="#0F2747" style={styles.secondaryBtnIcon}/>

                  <Text style={styles.secondaryBtnTextGray}>
                    {saleNote ? 'Nota ✓' : 'Agregar Nota'}
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
                            setNoteModalVisible(false);
                          }}
                        >
                          <Text style={styles.deleteNoteText}>
                            Eliminar nota
                          </Text>
                        </TouchableOpacity>

                        {/* GUARDAR / CERRAR */}
                        <TouchableOpacity
                          style={styles.closeNoteBtn}
                          onPress={() => setNoteModalVisible(false)}
                        >
                          <Text style={styles.closeNoteText}>
                            Guardar
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
            // MODIFICADO: Soporte para 'yappy' en el historial
            return `Pagado en ${PAYMENT_LABELS[method] || 'efectivo'}`;
          };
          const salesCount = salesHistory.length;
          const fiadoCount = salesHistory.filter((inv) => inv.status === 'pending').length;
          const salesTotal = salesHistory.filter((inv) => inv.status === 'paid').reduce((sum, inv) => sum + Number(inv.total), 0);
          const fiadoTotal = salesHistory.filter((inv) => inv.status === 'pending').reduce((sum, inv) => sum + Number(inv.total), 0);

          const balance = salesTotal - totalExpenses;
          const balancePositivo = balance >= 0;

          return (
            <>
              {/* BALANCE DEL PERÍODO — el número que resume todo.
                  Antes había que restar mentalmente ventas menos gastos: los
                  tres montos vivían en filas de 14px del mismo peso. */}
              <View style={styles.heroCard}>
                <Text style={styles.heroLabel}>Balance de los últimos 30 días</Text>
                <Text
                  style={[
                    styles.heroAmount,
                    { color: balancePositivo ? colors.success : colors.danger },
                  ]}
                >
                  {balancePositivo ? '' : '-'}${Math.abs(balance).toFixed(2)}
                </Text>
                <Text style={styles.heroHint}>
                  {balancePositivo
                    ? 'Entró más dinero del que salió.'
                    : 'Salió más dinero del que entró.'}
                </Text>

                {/* El fiado NO se suma al balance a propósito: todavía no es
                    dinero recibido, así que incluirlo inflaría la ganancia con
                    plata que aún te deben. */}
                {fiadoTotal > 0 && (
                  <Text style={styles.heroHint}>
                    No incluye ${fiadoTotal.toFixed(2)} en fiados por cobrar.
                  </Text>
                )}
              </View>

              {/* DESGLOSE — cada monto con su conteo debajo */}
              <View style={styles.kpiRow}>
                <View style={styles.kpiTile}>
                  <View style={[styles.kpiDot, { backgroundColor: colors.success }]} />
                  <Text style={styles.kpiLabel}>Ventas</Text>
                  <Text style={styles.kpiValue}>${salesTotal.toFixed(2)}</Text>
                  <Text style={styles.kpiMeta}>
                    {salesCount} venta{salesCount !== 1 ? 's' : ''}
                  </Text>
                </View>

                <View style={styles.kpiTile}>
                  <View style={[styles.kpiDot, { backgroundColor: colors.danger }]} />
                  <Text style={styles.kpiLabel}>Gastos</Text>
                  <Text style={styles.kpiValue}>${totalExpenses.toFixed(2)}</Text>
                  <Text style={styles.kpiMeta}>
                    {expenseDetail.length} compra{expenseDetail.length !== 1 ? 's' : ''}
                  </Text>
                </View>

                {/* Por cobrar NO es una pérdida: es plata que te deben. Antes
                    salía en rojo, el mismo color que los gastos. */}
                <View style={styles.kpiTile}>
                  <View style={[styles.kpiDot, { backgroundColor: colors.warning }]} />
                  <Text style={styles.kpiLabel}>Por cobrar</Text>
                  <Text style={styles.kpiValue}>${fiadoTotal.toFixed(2)}</Text>
                  <Text style={styles.kpiMeta}>
                    {fiadoCount} fiado{fiadoCount !== 1 ? 's' : ''}
                  </Text>
                </View>

              </View>

              <Text style={styles.reportTitle}>
                Historial de Ventas
              </Text>

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
                  salesHistory.map((invoice) => {
                    // Un fiado no está "mal": es una venta cuyo cobro quedó
                    // pendiente. Va en ámbar, no en el rojo de los gastos.
                    const esFiado = invoice.status === 'pending';

                    return (
                      <View key={invoice.id} style={styles.historyCard}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                          <Text style={styles.historyTitle} numberOfLines={1}>
                            {itemsSummary(invoice)}
                          </Text>

                          <View style={styles.historyMetaRow}>
                            <View
                              style={[
                                styles.historyBadge,
                                { backgroundColor: (esFiado ? colors.warning : colors.success) + '1A' },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.historyBadgeText,
                                  { color: esFiado ? '#92400E' : '#166534' },
                                ]}
                              >
                                {statusLabel(invoice)}
                              </Text>
                            </View>
                            <Text style={styles.historyDate}>{formatDate(invoice.created_at)}</Text>
                          </View>
                        </View>

                        <Text style={esFiado ? styles.historyPending : styles.historyIncome}>
                          ${Number(invoice.total).toFixed(2)}
                        </Text>
                      </View>
                    );
                  })
                )}
              </View>

              {/* COMPRAS Y REPOSICIONES DE MERCANCÍA
                  Salidas de dinero del período. Antes solo se veía el total
                  agregado en "Total Gastos", sin decir en qué se fue la plata. */}
              {!salesHistoryLoading && expenseDetail.length > 0 && (
                <>
                  <Text style={styles.reportTitle}>
                    Compras de Mercancía
                  </Text>

                  <View style={styles.historyContainer}>
                    {expenseDetail.map((exp) => (
                      <View key={exp.id} style={styles.historyCard}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                          <Text style={styles.historyTitle} numberOfLines={1}>
                            {exp.description || 'Gasto sin descripción'}
                          </Text>

                          <View style={styles.historyMetaRow}>
                            <View
                              style={[
                                styles.historyBadge,
                                { backgroundColor: colors.danger + '1A' },
                              ]}
                            >
                              <Text style={[styles.historyBadgeText, { color: '#991B1B' }]}>
                                Salida de caja
                              </Text>
                            </View>
                            <Text style={styles.historyDate}>{formatDate(exp.created_at)}</Text>
                          </View>
                        </View>

                        <Text style={styles.historyExpense}>
                          -${(Number(exp.amount) || 0).toFixed(2)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
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

                {/* Mostrar nota en el comprobante si existe */}
                {receiptData.note ? (
                  <View style={styles.receiptNoteContainer}>
                    <Text style={styles.receiptNoteLabel}>Nota:</Text>
                    <Text style={styles.receiptNoteText}>{receiptData.note}</Text>
                  </View>
                ) : null}
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

export default SalesInformal;