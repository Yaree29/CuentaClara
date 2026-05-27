import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput, ScrollView, ActivityIndicator, Modal } from 'react-native';

// 1. Reemplazamos MainLayout por SafeAreaView para igualar la altura del Header
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../../theme/colors';

import { useSales } from '../hooks/useSales';
import styles from '../styles/sales.styles';
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

  const {
    processSale, loading, error, fetchProfitsAndExpenses, profitsData, inventory, historyList
  } = useSales();

  useEffect(() => {
    const today = new Date();
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    setDateFrom(lastMonth.toISOString().split('T')[0]);
    setDateTo(today.toISOString().split('T')[0]);
  }, []);

    {/* aumentar cantidad en el carrito */}
  const handleQuickAdd = (amount) => {
    setCartCount((prev) => prev + 1);
    setTotal((prev) => prev + amount);
  };

    {/* Revisar el carrito */}
  const handleCheckout = async () => {
    if (cartCount === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos antes de registrar una venta.');
      return;
    }

    try {
      await processSale([], total, description, paymentMethod);

      Alert.alert('Éxito', `Venta registrada correctamente por $${total.toFixed(2)}`);

      setCartCount(0);
      setTotal(0);
      setDescription('');
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
                    {inventory.length === 0 ? (
                      <Text style={{ padding: 12, color: '#64748b' }}>No hay productos en tu inventario.</Text>
                    ) : (
                      (showAllProducts
                        ? inventory
                        : inventory.slice(0, 5)
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
                    )))}
                    {/* VER MÁS */}
                    {inventory.length > 5 && !showAllProducts && (
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
        {activeTab === 'history' && (
          <>
            <Text style={styles.reportTitle}>
              Historial Financiero
            </Text>

            {/* RESUMEN */}
            <View style={styles.historySummary}>

              <View style={styles.summaryCardIncome}>
                <Text style={styles.summaryLabel}>
                  Ganancias
                </Text>

                <Text style={styles.summaryIncome}>
                  $
                  {historyList
                    .filter((item) => item.type === 'income')
                    .reduce((acc, item) => acc + item.amount, 0)
                    .toFixed(2)}
                </Text>
              </View>

              <View style={styles.summaryCardExpense}>
                <Text style={styles.summaryLabel}>
                  Pérdidas
                </Text>

                <Text style={styles.summaryExpense}>
                  $
                  {historyList
                    .filter((item) => item.type === 'expense')
                    .reduce((acc, item) => acc + item.amount, 0)
                    .toFixed(2)}
                </Text>
              </View>

            </View>

            {/* HISTORIAL */}
            <View style={styles.historyContainer}>
              {historyList.length === 0 ? (
                <Text style={{ textAlign: 'center', color: '#64748b', marginTop: 20 }}>No hay historial registrado en los últimos 30 días.</Text>
              ) : (
                historyList.map((item) => (
                <View
                  key={item.id}
                  style={styles.historyCard}
                >
                  <View>
                    <Text style={styles.historyTitle}>
                      {item.title}
                    </Text>

                    <Text style={styles.historyDate}>
                      {item.date}
                    </Text>
                  </View>

                  <Text
                    style={
                      item.type === 'income'
                        ? styles.historyIncome
                        : styles.historyExpense
                    }
                  >
                    {item.type === 'income' ? '+' : '-'}$
                    {item.amount.toFixed(2)}
                  </Text>
                </View>
              )))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SalesScreen;