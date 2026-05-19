import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import MainLayout from '../../../views/layouts/MainLayout';
import { useSales } from '../hooks/useSales';
import styles from '../styles/sales.styles';

const SalesScreen = () => {
  const [cartCount, setCartCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [activeTab, setActiveTab] = useState('sales'); // 'sales' o 'reports'
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const { processSale, loading, error, fetchProfitsAndExpenses, profitsData } = useSales();

  // Inicializar fechas con valores por defecto
  useEffect(() => {
    const today = new Date();
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    setDateFrom(lastMonth.toISOString().split('T')[0]);
    setDateTo(today.toISOString().split('T')[0]);
  }, []);

  const handleQuickAdd = (price) => {
    setCartCount(prev => prev + 1);
    setTotal(prev => prev + price);
  };

  const handleCheckout = async () => {
    if (cartCount === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos antes de registrar una venta.');
      return;
    }
    
    try {
      await processSale([], total, description, paymentMethod);
      Alert.alert('Éxito', 'Venta registrada correctamente');
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

  return (
    <MainLayout>
      <ScrollView style={styles.container}>
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'sales' && styles.tabActive]}
            onPress={() => setActiveTab('sales')}
          >
            <Text style={[styles.tabText, activeTab === 'sales' && styles.tabTextActive]}>
              Registrar Venta
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reports' && styles.tabActive]}
            onPress={() => setActiveTab('reports')}
          >
            <Text style={[styles.tabText, activeTab === 'reports' && styles.tabTextActive]}>
              Reportes
            </Text>
          </TouchableOpacity>
        </View>

        {/* PESTAÑA: REGISTRAR VENTA */}
        {activeTab === 'sales' && (
          <>
            <Text style={styles.title}>Registro de Ventas</Text>
            
            <View style={styles.display}>
              <Text style={styles.displayLabel}>Total a cobrar:</Text>
              <Text style={styles.displayValue}>${total.toFixed(2)}</Text>
              <Text style={styles.displaySub}>{cartCount} productos en carrito</Text>
            </View>

            <View style={styles.quickActions}>
              {[1, 5, 10, 20].map((amount) => (
                <TouchableOpacity 
                  key={amount} 
                  style={styles.amountBtn}
                  onPress={() => handleQuickAdd(amount)}
                >
                  <Text style={styles.amountBtnText}>+${amount}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Método de pago:</Text>
            <View style={styles.methodContainer}>
              {['cash', 'card', 'transfer'].map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.methodBtn,
                    paymentMethod === method && styles.methodBtnActive
                  ]}
                  onPress={() => setPaymentMethod(method)}
                >
                  <Text style={[
                    styles.methodBtnText,
                    paymentMethod === method && styles.methodBtnTextActive
                  ]}>
                    {method === 'cash' ? 'Efectivo' : method === 'card' ? 'Tarjeta' : 'Transferencia'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Descripción (opcional)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}
            
            <TouchableOpacity 
              style={[styles.checkoutBtn, (cartCount === 0 || loading) && styles.disabledBtn]}
              onPress={handleCheckout}
              disabled={cartCount === 0 || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.checkoutBtnText}>Registrar Venta</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.clearBtn}
              onPress={() => {
                setCartCount(0);
                setTotal(0);
                setDescription('');
              }}
            >
              <Text style={styles.clearBtnText}>Limpiar</Text>
            </TouchableOpacity>
          </>
        )}

        {/* PESTAÑA: REPORTES */}
        {activeTab === 'reports' && (
          <>
            <Text style={styles.title}>Reportes de Ganancias</Text>

            <Text style={styles.label}>Desde:</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={dateFrom}
              onChangeText={setDateFrom}
            />

            <Text style={styles.label}>Hasta:</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={dateTo}
              onChangeText={setDateTo}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity 
              style={[styles.reportBtn, loading && styles.disabledBtn]}
              onPress={handleGetReport}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.reportBtnText}>Generar Reporte</Text>
              )}
            </TouchableOpacity>

            {profitsData && (
              <View style={styles.reportCard}>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Período:</Text>
                  <Text style={styles.reportValue}>
                    {profitsData.period?.from} a {profitsData.period?.to}
                  </Text>
                </View>

                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Ingresos:</Text>
                  <Text style={[styles.reportValue, { color: '#10b981' }]}>
                    ${profitsData.income?.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Gastos:</Text>
                  <Text style={[styles.reportValue, { color: '#ef4444' }]}>
                    ${profitsData.expenses?.toFixed(2)}
                  </Text>
                </View>

                <View style={[styles.reportRow, styles.reportRowHighlight]}>
                  <Text style={styles.reportLabel}>Ganancia neta:</Text>
                  <Text style={[styles.reportValue, { color: '#3b82f6', fontWeight: 'bold' }]}>
                    ${profitsData.profit?.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Facturas:</Text>
                  <Text style={styles.reportValue}>{profitsData.invoices_count}</Text>
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