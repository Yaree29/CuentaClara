import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Toast from 'react-native-toast-message';

import styles from '../styles/salesPyme.style';
import colors from '../../../../theme/colors';
import useAuthStore from '../../../../store/useAuthStore';
import useSalesStore from '../../../../store/useSaleStore';
import useAssistantModeStore from '../../../../store/useAssistantModeStore';
import inventoryService from '../../../inventory/services/inventoryService';
import salesService from '../../services/salesService';

// Ciclo de vida de caja (ver plan "horario de operación + caja"): esta es la
// ÚNICA de las 3 pestañas de Ventas PYME que se bloquea fuera de horario o
// sin caja abierta — "Registro de Ventas" y "Cierre Diario" siguen viéndose
// con normalidad (decisión explícita del usuario). cashStatus/onGoToCashRegister
// vienen del shell (salesPyme.jsx), que monta useCashSession() una sola vez.
const SalesPyme = ({ cashStatus, onGoToCashRegister }) => {
  const user = useAuthStore((state) => state.user);
  const businessData = user?.business;
  const activeAssistant = useAssistantModeStore((state) => state.activeAssistant);

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsLoadError, setProductsLoadError] = useState(false);
  const [savingSale, setSavingSale] = useState(false);

  const addSaleToAccounting = useSalesStore((state) => state.addSale);
  const sales = useSalesStore((state) => state.openSales);
  const setSales = useSalesStore((state) => state.setOpenSales);
  const selectedSale = useSalesStore((state) => state.selectedSale);
  const setSelectedSale = useSalesStore((state) => state.setSelectedSale);

  const currentSale =
    sales.find((sale) => sale.id === selectedSale) ||
    sales[0] || {
      id: 1,
      products: [],
      note: '',
    };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        setProductsLoadError(false);

        const data = await inventoryService.getProducts();
        setProducts(data || []);
      } catch (error) {
        console.error('Error cargando productos:', error);
        setProducts([]);
        setProductsLoadError(true);
        Toast.show({
          type: 'error',
          text1: 'No se pudieron cargar los productos',
          text2: error?.message || 'Revisa tu conexión e intenta de nuevo.',
        });
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  const dropdownProducts = products.map((product) => ({
    label: `${product.name} - $${product.price}`,
    value: product.id,
    product,
  }));

  const calculateTotal = () =>
    currentSale.products.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

  const addNewSale = () => {
    const emptySale = sales.find((sale) => sale.products.length === 0);

    if (emptySale) {
      setSelectedSale(emptySale.id);

      Toast.show({
        type: 'info',
        text1: 'Ya existe una venta vacía',
        text2: `Complete primero la Venta #${emptySale.id}`,
      });

      return;
    }

    const newId =
      sales.length > 0
        ? Math.max(...sales.map((sale) => sale.id)) + 1
        : 1;

    const newSale = {
      id: newId,
      products: [],
      note: '',
      status: 'open',
      saved: false,
    };

    setSales([...sales, newSale]);
    setSelectedSale(newId);

    Toast.show({
      type: 'success',
      text1: 'Nueva venta creada',
      text2: `Venta #${newId}`,
    });
  };

  const addProduct = (product) => {
    const updatedSales = sales.map((sale) => {
      if (sale.id !== selectedSale) return sale;

      const existing = sale.products.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return {
          ...sale,
          products: sale.products.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }

      return {
        ...sale,
        products: [...sale.products, { ...product, quantity: 1 }],
      };
    });

    setSales(updatedSales);
  };

  const updateQuantity = (productId, change) => {
    const updatedSales = sales.map((sale) => {
      if (sale.id !== selectedSale) return sale;

      return {
        ...sale,
        products: sale.products
          .map((item) =>
            item.id === productId
              ? { ...item, quantity: item.quantity + change }
              : item
          )
          .filter((item) => item.quantity > 0),
      };
    });

    setSales(updatedSales);
  };

  const saveSale = async () => {
    if (!currentSale.products || currentSale.products.length === 0) {
      Alert.alert(
        'Venta vacía',
        'Agregue al menos un producto.'
      );
      return;
    }

    if (currentSale.saved) {
      Alert.alert(
        'Venta ya guardada',
        'Esta venta ya fue guardada anteriormente.'
      );
      return;
    }

    if (savingSale) return;

    const items = currentSale.products.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
    }));

    setSavingSale(true);

    try {
      await salesService.createSale(items, 'cash', 1, currentSale.note, false, activeAssistant?.id ?? null);
    } catch (error) {
      setSavingSale(false);
      Toast.show({
        type: 'error',
        text1: 'No se pudo guardar la venta',
        text2: error?.message || 'Intente de nuevo.',
      });
      return;
    }

    setSavingSale(false);

    const saleData = {
      id: currentSale.id,
      products: currentSale.products,
      note: currentSale.note,
      total: calculateTotal(),
      totalProducts: currentSale.products.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),

      userId: user?.id,

      userName: user?.name || 'Administrador',

      userRole: user?.role || 'owner',

      businessId: businessData?.id,

      createdAt: new Date().toISOString(),
    };

    addSaleToAccounting(saleData);

    const updatedSales = sales.map((sale) =>
      sale.id === selectedSale
        ? {
            ...sale,
            saved: true,
          }
        : sale
    );

    setSales(updatedSales);

    Toast.show({
      type: 'success',
      text1: 'Venta guardada',
      text2: `Venta #${selectedSale}`,
    });
  };

  if (!cashStatus) {
    return (
      <View style={[styles.content, { flex: 1, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!cashStatus.is_open) {
    return (
      <ScrollView style={styles.scrollFlex} contentContainerStyle={styles.content}>
        <View style={styles.emptyStateCard}>
          <Text style={styles.emptyStateTitle}>Debes abrir la caja antes de vender</Text>
          <Text style={styles.emptyStateText}>
            Registra el monto inicial en "Cierre Diario" para empezar a registrar ventas de hoy.
          </Text>
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={onGoToCashRegister}>
          <Text style={styles.saveButtonText}>Ir a Cierre Diario</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (!cashStatus.can_sell) {
    const schedule = cashStatus.schedule;
    return (
      <ScrollView style={styles.scrollFlex} contentContainerStyle={styles.content}>
        <View style={styles.emptyStateCard}>
          <Text style={styles.emptyStateTitle}>Fuera de horario de ventas</Text>
          <Text style={styles.emptyStateText}>
            {schedule
              ? `Abrimos de ${schedule.opening_time} a ${schedule.closing_time}. La caja ya no acepta ventas — ve a "Cierre Diario" para cerrarla.`
              : 'En este momento no se pueden registrar ventas.'}
          </Text>
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={onGoToCashRegister}>
          <Text style={styles.saveButtonText}>Ir a Cierre Diario</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.scrollFlex} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.createButton} onPress={addNewSale}>
        <Text style={styles.saveButtonText}>+ Nueva Venta</Text>
      </TouchableOpacity>

      {sales.length > 0 && (
        <View style={styles.scrollGridContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScrollContainer}
          >
            {sales.map((sale) => {
              const total = sale.products.reduce((sum, item) => sum + item.price * item.quantity, 0);
              const isSelected = selectedSale === sale.id;

              return (
                <TouchableOpacity
                  key={sale.id}
                  onPress={() => setSelectedSale(sale.id)}
                  style={[
                    styles.accountButton,
                    isSelected ? styles.accountSelected : sale.saved ? styles.accountSaved : sale.products.length > 0 ? styles.accountOccupied : styles.accountFree,
                  ]}
                >
                  <Text style={styles.accountText}>Venta #{sale.id}</Text>
                    <Text style={styles.accountAmountText}>
                      {sale.products.length > 0 ? `$${total.toFixed(2)}` : 'Vacía'}
                    </Text>
                    <Text style={styles.accountStatus}>
                      {sale.saved ? '✓ Guardada' : sale.products.length > 0 ? 'Abierta' : null }
                    </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Venta #{selectedSale}</Text>
        <Text style={styles.summaryInfo}>Productos: {currentSale.products?.length || 0}</Text>
        <Text style={styles.summaryTotal}>${calculateTotal().toFixed(2)}</Text>
      </View>

      <Text style={styles.productsSectionTitle}>Buscar o agregar producto</Text>

      <Dropdown
        style={[
          styles.dropdown,
          currentSale.saved && { opacity: 0.5 },
        ]}
        placeholderStyle={styles.dropdownPlaceholder}
        selectedTextStyle={styles.dropdownSelectedText}
        data={dropdownProducts ?? [] }
        search={!currentSale.saved}
        disable={currentSale.saved || loadingProducts || products.length === 0}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={
          currentSale.saved
            ? 'Venta guardada'
            : loadingProducts
              ? 'Cargando productos...'
              : productsLoadError
                ? 'No se pudieron cargar los productos'
                : products.length === 0
                  ? 'No existen productos registrados'
                  : 'Buscar producto...'
        }
        searchPlaceholder="Escriba el nombre..."
        onChange={(item) => {
          if (currentSale.saved) return;

          addProduct(item.product);

          Toast.show({
            type: 'success',
            text1: 'Producto agregado',
            text2: item.product.name,
          });
        }}
      />

      <Text style={styles.productsSectionTitle}>Productos agregados</Text>

      <View style={styles.productsContainer}>
        <ScrollView
          nestedScrollEnabled
          showsVerticalScrollIndicator={currentSale.products?.length > 2}
          contentContainerStyle={
            !currentSale.products || currentSale.products.length === 0
              ? styles.emptyProductsContainer
              : styles.productsList
          }
        >
          {!currentSale.products || currentSale.products.length === 0 ? (
            <View style={{ alignItems: 'center' }}>
                <Text style={styles.emptyProductsText}>
                {loadingProducts
                  ? 'Cargando productos...'
                  : productsLoadError
                    ? 'No se pudieron cargar los productos'
                    : products.length === 0
                      ? 'No existen productos registrados'
                      : 'No hay productos agregados'}
              </Text>

              <Text style={styles.emptyProductsSubText}>
                {loadingProducts
                  ? 'Espere un momento...'
                  : productsLoadError
                    ? 'Verifica tu conexión y vuelve a intentar.'
                    : products.length === 0
                    ? 'Primero debe crear productos en Inventario.'
                    : 'Utilice el buscador para agregar productos'}
              </Text>
            </View>
          ) : (
            currentSale.products.map((item) => (
              <View key={item.id} style={styles.productCard}>
                <View style={styles.productInfoContainer}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productDetails}>
                    ${item.price} x {item.quantity}
                  </Text>
                </View>

                <View style={styles.quantityRow}>
                  <TouchableOpacity
                    disabled={currentSale.saved}
                    style={[
                      styles.quantityBtnMinus,
                      currentSale.saved && {
                        opacity: 0.5,
                      },
                    ]}
                    onPress={() => updateQuantity(item.id, -1)}
                  >
                    <Text style={styles.quantityBtnText}>-</Text>
                  </TouchableOpacity>

                  <Text style={styles.quantityValue}>{item.quantity}</Text>

                    <TouchableOpacity
                      disabled={currentSale.saved}
                      style={[
                        styles.quantityBtnPlus,
                        currentSale.saved && {
                          opacity: 0.5,
                        },
                      ]}
                      onPress={() => updateQuantity(item.id, 1)}
                    >
                    <Text style={styles.quantityBtnTextPlus}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      <Text style={styles.productsSectionTitle}>Notas de la venta</Text>

      <TextInput
        value={currentSale.note}
        editable={!currentSale.saved}
        onChangeText={(text) => {
          const updatedSales = sales.map((sale) =>
            sale.id === selectedSale
              ? {
                  ...sale,
                  note: text,
                }
              : sale
          );

          setSales(updatedSales);
        }}
        placeholder="Notas internas..."
        multiline
        style={[
          styles.noteInput,
          currentSale.saved && { opacity: 0.6 },
        ]}
      />

      <TouchableOpacity
        onPress={saveSale}
        disabled={currentSale.saved || savingSale}
        style={[
          styles.saveButton,
          (currentSale.saved || savingSale) && {
            opacity: 0.5,
          },
        ]}
      >
        <Text style={styles.saveButtonText}>
          {currentSale.saved
            ? 'Venta Guardada'
            : savingSale
              ? 'Guardando...'
              : 'Guardar Venta'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SalesPyme;