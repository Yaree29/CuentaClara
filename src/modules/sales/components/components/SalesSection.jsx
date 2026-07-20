import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Toast from 'react-native-toast-message';

import styles from '../styles/salesPyme.style';
import useAuthStore from '../../../../store/useAuthStore';
import useSalesStore from '../../../../store/useSaleStore';
import inventoryService from '../../../inventory/services/inventoryService';

const SalesPyme = () => {
  const user = useAuthStore((state) => state.user);
  const businessData = user?.business;

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

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

        const data = await inventoryService.getProducts();
        setProducts(data || []);
      } catch (error) {
        console.error('Error cargando productos:', error);
        setProducts([]);
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

  const saveSale = () => {
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

  return (
    <ScrollView contentContainerStyle={styles.content}>
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
                  : products.length === 0
                    ? 'No existen productos registrados'
                    : 'No hay productos agregados'}
              </Text>

              <Text style={styles.emptyProductsSubText}>
                {loadingProducts
                  ? 'Espere un momento...'
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
        disabled={currentSale.saved}
        style={[
          styles.saveButton,
          currentSale.saved && {
            opacity: 0.5,
          },
        ]}
      >
        <Text style={styles.saveButtonText}>
          {currentSale.saved
            ? 'Venta Guardada'
            : 'Guardar Venta'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SalesPyme;