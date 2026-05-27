import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput, ScrollView, ActivityIndicator, Modal } from 'react-native';

// 1. Reemplazamos MainLayout por SafeAreaView para igualar la altura del Header
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../../theme/colors';

import { useSales } from '../hooks/useSales';
import styles from '../styles/sales.styles';
import inventoryService from '../../inventory/services/inventoryService';
import {UserPlusIcon,ShoppingBagIcon,DocumentTextIcon} from 'react-native-heroicons/solid';

// Importación del HEADER
import DashboardHeader from '../../dashboard/components/shared/DashboardHeader';



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

  const [movements, setMovements] = useState([]);
  const [movementsLoading, setMovementsLoading] = useState(false);

  const {
    processSale,loading,error,fetchProfitsAndExpenses,profitsData} = useSales();

  useEffect(() => {
    const today = new Date();
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    setDateFrom(lastMonth.toISOString().split('T')[0]);
    setDateTo(today.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setProductsLoading(true);
      try {
        const data = await inventoryService.getProducts();
        setProducts(data || []);
      } catch (err) {
        console.error('Error al cargar productos para venta:', err);
      } finally {
        setProductsLoading(false);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (activeTab !== 'history') return;
    const loadMovements = async () => {
      setMovementsLoading(true);
      try {
        const data = await inventoryService.getMovements(50);
        setMovements(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error al cargar movimientos:', err);
      } finally {
        setMovementsLoading(false);
      }
    };
    loadMovements();
  }, [activeTab]);

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

    try {
      const items = selectedProducts.map((p) => ({
        product_id: p.id,
        quantity: p.quantity,
        unit_price: p.price,
      }));

      await processSale(items, total, saleNote, paymentMethod);

      Alert.alert('Éxito', `Venta registrada correctamente por $${total.toFixed(2)}`);

      setCartCount(0);
      setTotal(0);
      setDescription('');
      setSaleNote('');
      setSelectedProducts([]);
      setSelectedProduct(null);
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
                >
                  <Text style={styles.secondaryBtnIconBlue}>
                      <UserPlusIcon size={18} color="#1E3A8A" style={styles.secondaryBtnIconBlue} />
                  </Text>

                  <Text style={styles.secondaryBtnTextBlue}>
                    Vincular Fiado
                  </Text>
                </TouchableOpacity>

              </View>

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
          const REASON_LABEL = {
            sale: 'Venta',
            purchase: 'Compra',
            waste: 'Pérdida',
            return: 'Devolución',
            manual: 'Ajuste',
          };
          const formatDate = (iso) => {
            if (!iso) return '';
            const d = new Date(iso);
            return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
          };
          const entriesCount = movements.filter((m) => m.type === 'in').length;
          const salidasCount = movements.filter((m) => m.type === 'out').length;

          return (
            <>
              <Text style={styles.reportTitle}>
                Historial de Movimientos
              </Text>

              {/* RESUMEN */}
              <View style={styles.historySummary}>
                <View style={styles.summaryCardIncome}>
                  <Text style={styles.summaryLabel}>Entradas</Text>
                  <Text style={styles.summaryIncome}>{entriesCount}</Text>
                </View>
                <View style={styles.summaryCardExpense}>
                  <Text style={styles.summaryLabel}>Salidas</Text>
                  <Text style={styles.summaryExpense}>{salidasCount}</Text>
                </View>
              </View>

              {/* LISTA */}
              <View style={styles.historyContainer}>
                {movementsLoading ? (
                  <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                ) : movements.length === 0 ? (
                  <Text style={{ textAlign: 'center', color: colors.textSecondary, paddingVertical: 40 }}>
                    Aún no tienes movimientos. El historial se mostrará aquí cuando registres ventas.
                  </Text>
                ) : (
                  movements.map((item) => (
                    <View key={item.id} style={styles.historyCard}>
                      <View>
                        <Text style={styles.historyTitle}>
                          {item.product_name}
                        </Text>
                        <Text style={styles.historyDate}>
                          {REASON_LABEL[item.reason] || item.reason} · {formatDate(item.created_at)}
                        </Text>
                      </View>
                      <Text style={item.type === 'in' ? styles.historyIncome : styles.historyExpense}>
                        {item.type === 'in' ? '+' : '-'}{item.quantity % 1 === 0 ? item.quantity.toFixed(0) : item.quantity.toFixed(2)}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </>
          );
        })()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SalesScreen;
