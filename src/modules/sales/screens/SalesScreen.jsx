import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView, ActivityIndicator } from 'react-native';
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
      <ScrollView style={localStyles.container}>
        {/* Tabs */}
        <View style={localStyles.tabsContainer}>
          <TouchableOpacity
            style={[localStyles.tab, activeTab === 'sales' && localStyles.tabActive]}
            onPress={() => setActiveTab('sales')}
          >
            <Text style={[localStyles.tabText, activeTab === 'sales' && localStyles.tabTextActive]}>
              Registrar Venta
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[localStyles.tab, activeTab === 'reports' && localStyles.tabActive]}
            onPress={() => setActiveTab('reports')}
          >
            <Text style={[localStyles.tabText, activeTab === 'reports' && localStyles.tabTextActive]}>
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

            <Text style={localStyles.label}>Método de pago:</Text>
            <View style={localStyles.methodContainer}>
              {['cash', 'card', 'transfer'].map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    localStyles.methodBtn,
                    paymentMethod === method && localStyles.methodBtnActive
                  ]}
                  onPress={() => setPaymentMethod(method)}
                >
                  <Text style={[
                    localStyles.methodBtnText,
                    paymentMethod === method && localStyles.methodBtnTextActive
                  ]}>
                    {method === 'cash' ? 'Efectivo' : method === 'card' ? 'Tarjeta' : 'Transferencia'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={localStyles.input}
              placeholder="Descripción (opcional)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            {error && <Text style={localStyles.errorText}>{error}</Text>}
            
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

            <Text style={localStyles.label}>Desde:</Text>
            <TextInput
              style={localStyles.input}
              placeholder="YYYY-MM-DD"
              value={dateFrom}
              onChangeText={setDateFrom}
            />

            <Text style={localStyles.label}>Hasta:</Text>
            <TextInput
              style={localStyles.input}
              placeholder="YYYY-MM-DD"
              value={dateTo}
              onChangeText={setDateTo}
            />

            {error && <Text style={localStyles.errorText}>{error}</Text>}

            <TouchableOpacity 
              style={[localStyles.reportBtn, loading && styles.disabledBtn]}
              onPress={handleGetReport}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={localStyles.reportBtnText}>Generar Reporte</Text>
              )}
            </TouchableOpacity>

            {profitsData && (
              <View style={localStyles.reportCard}>
                <View style={localStyles.reportRow}>
                  <Text style={localStyles.reportLabel}>Período:</Text>
                  <Text style={localStyles.reportValue}>
                    {profitsData.period?.from} a {profitsData.period?.to}
                  </Text>
                </View>

                <View style={localStyles.reportRow}>
                  <Text style={localStyles.reportLabel}>Ingresos:</Text>
                  <Text style={[localStyles.reportValue, { color: '#10b981' }]}>
                    ${profitsData.income?.toFixed(2)}
                  </Text>
                </View>

                <View style={localStyles.reportRow}>
                  <Text style={localStyles.reportLabel}>Gastos:</Text>
                  <Text style={[localStyles.reportValue, { color: '#ef4444' }]}>
                    ${profitsData.expenses?.toFixed(2)}
                  </Text>
                </View>

                <View style={[localStyles.reportRow, localStyles.reportRowHighlight]}>
                  <Text style={localStyles.reportLabel}>Ganancia neta:</Text>
                  <Text style={[localStyles.reportValue, { color: '#3b82f6', fontWeight: 'bold' }]}>
                    ${profitsData.profit?.toFixed(2)}
                  </Text>
                </View>

                <View style={localStyles.reportRow}>
                  <Text style={localStyles.reportLabel}>Facturas:</Text>
                  <Text style={localStyles.reportValue}>{profitsData.invoices_count}</Text>
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

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#2563eb',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    fontSize: 14,
  },
  methodContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  methodBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
  },
  methodBtnActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  methodBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  methodBtnTextActive: {
    color: '#fff',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  reportBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  reportBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reportCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  reportRowHighlight: {
    backgroundColor: '#f0f9ff',
    borderRadius: 6,
    paddingHorizontal: 12,
    marginVertical: 8,
    borderBottomWidth: 0,
  },
  reportLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  reportValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
});