import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput, ScrollView, ActivityIndicator } from 'react-native';

// 1. Reemplazamos MainLayout por SafeAreaView para igualar la altura del Header
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../../theme/colors';

import { useSales } from '../hooks/useSales';
import styles from '../styles/sales.styles';
import products from '../../../data/products';

// Importación del HEADER
import DashboardHeader from '../../dashboard/components/shared/DashboardHeader';

const SalesScreen = () => {
  const [cartCount, setCartCount] = useState(4);
  const [total, setTotal] = useState(185.0);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [activeTab, setActiveTab] = useState('sales');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProducts, setShowProducts] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);

  const {
    processSale,
    loading,
    error,
    fetchProfitsAndExpenses,
    profitsData
  } = useSales();

  useEffect(() => {
    const today = new Date();
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    setDateFrom(lastMonth.toISOString().split('T')[0]);
    setDateTo(today.toISOString().split('T')[0]);
  }, []);

  const handleQuickAdd = (amount) => {
    setCartCount((prev) => prev + 1);
    setTotal((prev) => prev + amount);
  };

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

  const handleGetReport = async () => {
    if (!dateFrom || !dateTo) {
      Alert.alert('Campos requeridos', 'Completa ambas fechas para generar el reporte.');
      return;
    }

    try {
      await fetchProfitsAndExpenses(dateFrom, dateTo);
      Alert.alert('Reporte cargado', 'Los datos se han actualizado correctamente.');
    } catch (err) {
      Alert.alert('Error', error || 'No se pudo obtener el reporte');
    }
  };

  const quickButtons = [
    { amount: 5, label: 'Billete' },
    { amount: 10, label: 'Efectivo' },
    { amount: 20, label: 'Sencillo' },
    { amount: 30, label: 'Combo' },
    { amount: 50, label: 'Fijo' },
    { amount: 100, label: 'Max' },
  ];

  return (
    // 2. Usamos SafeAreaView en lugar de MainLayout
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      
      <DashboardHeader title="Venta Rápida" isHome={false} />

      {/* CONTENIDO PRINCIPAL */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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

        {/* PANTALLA DE VENTAS (TAB 1) */}
        {activeTab === 'sales' && (
          <>
            {/* CARD TOTAL */}
            <View style={styles.displayCard}>
              <Text style={styles.displayLabel}>TOTAL ACUMULADO</Text>
              <View style={styles.totalRow}>
                <Text style={styles.currency}>$</Text>
                <Text style={styles.displayValue}>{total.toFixed(2)}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeIcon}>🛍️</Text>
                <Text style={styles.badgeText}>{cartCount} artículos seleccionados</Text>
              </View>
            </View>

            {/* BOTONES RÁPIDOS */}
            <View style={styles.quickGrid}>
              {quickButtons.map((btn) => (
                <TouchableOpacity
                  key={btn.amount}
                  style={styles.amountBtn}
                  onPress={() => handleQuickAdd(btn.amount)}
                >
                  <Text style={styles.amountBtnText}>${btn.amount}</Text>
                  <Text style={styles.amountSubtext}>{btn.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ACCIONES EXTRA */}
            <View style={styles.actionsTopRow}>
              {/* LIMPIAR MONTO */}
              <TouchableOpacity
                style={styles.clearAmountBtn}
                onPress={() => {
                  setTotal(0);
                  setCartCount(0);
                }}
              >
                <Text style={styles.clearAmountText}>Limpiar monto</Text>
              </TouchableOpacity>

              {/* BOTÓN DROPDOWN */}
              <TouchableOpacity
                style={styles.productDropdown}
                onPress={() => setShowProducts(!showProducts)}
              >
                <Text style={styles.productDropdownText}>
                  {selectedProduct ? selectedProduct.name : 'Seleccionar producto'}
                </Text>
                <Text style={styles.dropdownArrow}>{showProducts ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {/* LISTA PRODUCTOS DESPLEGABLE */}
              {showProducts && (
                <View style={styles.productsContainer}>
                  {(showAllProducts ? products : products.slice(0, 5)).map((product) => (
                    <TouchableOpacity
                      key={product.id}
                      style={styles.productItem}
                      onPress={() => {
                        setSelectedProduct(product);
                        setShowProducts(false);
                        setCartCount((prev) => prev + 1);
                        setTotal((prev) => prev + product.price);
                      }}
                    >
                      <View>
                        <Text style={styles.productName}>{product.name}</Text>
                        <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}

                  {/* VER MÁS */}
                  {products.length > 5 && !showAllProducts && (
                    <TouchableOpacity
                      style={styles.showMoreBtn}
                      onPress={() => setShowAllProducts(true)}
                    >
                      <Text style={styles.showMoreText}>Ver más productos</Text>
                    </TouchableOpacity>
                  )}

                  {/* VER MENOS */}
                  {showAllProducts && (
                    <TouchableOpacity
                      style={styles.showMoreBtn}
                      onPress={() => setShowAllProducts(false)}
                    >
                      <Text style={styles.showMoreText}>Ver menos</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            {/* MÉTODO DE PAGO */}
            <Text style={styles.label}>Método de pago</Text>
            <View style={styles.methodContainer}>
              {['cash', 'card', 'transfer'].map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[styles.methodBtn, paymentMethod === method && styles.methodBtnActive]}
                  onPress={() => setPaymentMethod(method)}
                >
                  <Text
                    style={[
                      styles.methodBtnText,
                      paymentMethod === method && styles.methodBtnTextActive,
                    ]}
                  >
                    {method === 'cash' ? 'Efectivo' : method === 'card' ? 'Tarjeta' : 'Transferencia'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* INPUT DE NOTA */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Monto Personalizado / Nota de Venta"
                placeholderTextColor="#A3A3A3"
                value={description}
                onChangeText={setDescription}
                multiline
              />
              <Text style={styles.editIcon}>✏️</Text>
            </View>

            {/* BOTONES EXTRA (Vincular Fiado, etc.) */}
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.secondaryBtnGray}>
                <Text style={styles.secondaryBtnIcon}>🗒️</Text>
                <Text style={styles.secondaryBtnTextGray}>Agregar Nota</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryBtnBlue}>
                <Text style={styles.secondaryBtnIconBlue}>👤+</Text>
                <Text style={styles.secondaryBtnTextBlue}>Vincular Fiado</Text>
              </TouchableOpacity>
            </View>

            {/* MANEJO DE ERRORES */}
            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* BOTÓN REGISTRAR VENTA */}
            <TouchableOpacity
              style={[
                styles.checkoutBtn,
                (cartCount === 0 || loading) && styles.disabledBtn,
              ]}
              onPress={handleCheckout}
              disabled={cartCount === 0 || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.checkoutBtnContent}>
                  <Text style={styles.checkMark}>✓</Text>
                  <Text style={styles.checkoutBtnText}>Registrar Venta</Text>
                </View>
              )}
            </TouchableOpacity>
          </>
        )}

        {/* PANTALLA REPORTES / HISTORIAL (TAB 2) */}
        {activeTab === 'history' && (
          <>
            <Text style={styles.reportTitle}>Historia de Ganancias</Text>

            <Text style={styles.label}>Desde</Text>
            <TextInput
              style={styles.reportInput}
              placeholder="YYYY-MM-DD"
              value={dateFrom}
              onChangeText={setDateFrom}
            />

            <Text style={styles.label}>Hasta</Text>
            <TextInput
              style={styles.reportInput}
              placeholder="YYYY-MM-DD"
              value={dateTo}
              onChangeText={setDateTo}
            />

            <TouchableOpacity style={styles.checkoutBtn} onPress={handleGetReport}>
              <Text style={styles.checkoutBtnText}>Generar Reporte</Text>
            </TouchableOpacity>

            {profitsData && (
              <View style={styles.reportCard}>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Ingresos</Text>
                  <Text style={styles.reportIncome}>${profitsData.income?.toFixed(2)}</Text>
                </View>

                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Gastos</Text>
                  <Text style={styles.reportExpense}>${profitsData.expenses?.toFixed(2)}</Text>
                </View>

                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Ganancia</Text>
                  <Text style={styles.reportProfit}>${profitsData.profit?.toFixed(2)}</Text>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SalesScreen;