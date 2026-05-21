// SalesScreen.js
import React, { useState, useEffect } from 'react';
import {View,Text,TouchableOpacity,Alert,TextInput,ScrollView,ActivityIndicator} from 'react-native';
import MainLayout from '../../../views/layouts/MainLayout';
import { useSales } from '../hooks/useSales';
import styles from '../styles/sales.styles';

const SalesScreen = () => {
  const [cartCount, setCartCount] = useState(4);
  const [total, setTotal] = useState(185.0);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [activeTab, setActiveTab] = useState('sales');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const {
    processSale,loading,error,fetchProfitsAndExpenses,profitsData} = useSales();

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
      Alert.alert(
        'Carrito vacío',
        'Agrega productos antes de registrar una venta.'
      );
      return;
    }

    try {
      await processSale([], total, description, paymentMethod);

      Alert.alert(
        'Éxito',
        `Venta registrada correctamente por $${total.toFixed(2)}`
      );

      setCartCount(0);
      setTotal(0);
      setDescription('');
    } catch (err) {
      Alert.alert('Error', error || 'No se pudo registrar la venta');
    }
  };

  const handleGetReport = async () => {
    if (!dateFrom || !dateTo) {
      Alert.alert(
        'Campos requeridos',
        'Completa ambas fechas para generar el reporte.'
      );
      return;
    }

    try {
      await fetchProfitsAndExpenses(dateFrom, dateTo);

      Alert.alert(
        'Reporte cargado',
        'Los datos se han actualizado correctamente.'
      );
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
    <MainLayout>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Venta Rápida</Text>

          <TouchableOpacity style={styles.headerDocButton}>
            <View style={styles.docIcon} />
          </TouchableOpacity>
        </View>

        {/* CONTENIDO */}
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* TABS */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'sales' && styles.tabActive,
              ]}
              onPress={() => setActiveTab('sales')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'sales' && styles.tabTextActive,
                ]}
              >
                Ventas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'history' && styles.tabActive,
              ]}
              onPress={() => setActiveTab('history')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'history' && styles.tabTextActive,
                ]}
              >
                Historial
              </Text>
            </TouchableOpacity>
          </View>

          {/* PANTALLA VENTAS */}
          {activeTab === 'sales' && (
            <>
              {/* CARD TOTAL */}
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
                  <Text style={styles.badgeIcon}>🛍️</Text>

                  <Text style={styles.badgeText}>
                    {cartCount} artículos seleccionados
                  </Text>
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
                    <Text style={styles.amountBtnText}>
                      ${btn.amount}
                    </Text>

                    <Text style={styles.amountSubtext}>
                      {btn.label}
                    </Text>
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
                  <Text style={styles.clearAmountText}>
                    Limpiar monto
                  </Text>
                </TouchableOpacity>

                {/* DROPDOWN PRODUCTOS */}
                <TouchableOpacity
                  style={styles.productDropdown}
                >
                  <Text style={styles.productDropdownText}>
                    Seleccionar producto
                  </Text>

                  <Text style={styles.dropdownArrow}>
                    ▼
                  </Text>
                </TouchableOpacity>

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

              {/* INPUT */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Monto Personalizado"
                  placeholderTextColor="#A3A3A3"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                />

                <Text style={styles.editIcon}>✏️</Text>
              </View>

              {/* BOTONES EXTRA */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.secondaryBtnGray}
                >
                  <Text style={styles.secondaryBtnIcon}>
                    🗒️
                  </Text>

                  <Text style={styles.secondaryBtnTextGray}>
                    Agregar Nota
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryBtnBlue}
                >
                  <Text style={styles.secondaryBtnIconBlue}>
                    👤+
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

              {/* BOTÓN */}
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
            </>
          )}

          {/* PANTALLA REPORTES */}
          {activeTab === 'history' && (
            <>
              <Text style={styles.reportTitle}>
                Historia de Ganancias
              </Text>

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

              {profitsData && (
                <View style={styles.reportCard}>
                  <View style={styles.reportRow}>
                    <Text style={styles.reportLabel}>
                      Ingresos
                    </Text>

                    <Text style={styles.reportIncome}>
                      ${profitsData.income?.toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.reportRow}>
                    <Text style={styles.reportLabel}>
                      Gastos
                    </Text>

                    <Text style={styles.reportExpense}>
                      ${profitsData.expenses?.toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.reportRow}>
                    <Text style={styles.reportLabel}>
                      Ganancia
                    </Text>

                    <Text style={styles.reportProfit}>
                      ${profitsData.profit?.toFixed(2)}
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
    </MainLayout>
  );
};

export default SalesScreen;