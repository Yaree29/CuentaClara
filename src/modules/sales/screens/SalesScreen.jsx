// =============================================================================
// MODIFICADO: 2026-05-26
// Propósito: Pantalla de Ventas (integrada desde la rama Fronted) — versión
//            rica con:
//              - Tabs internos: Ventas e Historial.
//              - Display de total acumulado con badge de artículos.
//              - Carrito de productos seleccionados (cards con +/-).
//              - Botón "Limpiar monto", dropdown "Seleccionar producto",
//                lista de productos con "Ver más / Ver menos".
//              - Métodos de pago (cash / card / transfer).
//              - Acciones secundarias: agregar/editar nota (modal) y
//                "Vincular Fiado" (placeholder, próximamente).
//              - Botón principal de checkout que llama processSale().
//
// Adaptaciones vs. la versión original de Fronted:
//   - Se usa MainLayout en lugar de SafeAreaView + DashboardHeader, porque
//     en loginDr aún no está instalado @expo/vector-icons.
//   - Se eliminó la dependencia hardcoded `data/products` — la lista llega
//     vacía por ahora; cuando exista el módulo de inventario conectado a la
//     API se reemplazará este arreglo por la consulta real.
// =============================================================================
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import MainLayout from '../../../views/layouts/MainLayout';
import { useSales } from '../hooks/useSales';
import styles from '../styles/sales.styles';

// Lista de productos vacía por defecto — se reemplazará por fetch a la API
// cuando el módulo de inventario esté conectado. Se mantiene como variable
// para que la UI de "Seleccionar producto" funcione sin romper.
const products = [];

const SalesScreen = () => {
  const [cartCount, setCartCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [activeTab, setActiveTab] = useState('sales');

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProducts, setShowProducts] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [saleNote, setSaleNote] = useState('');

  const { processSale, loading, error } = useSales();

  const handleCheckout = async () => {
    if (cartCount === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos antes de registrar una venta.');
      return;
    }

    try {
      await processSale([], total, saleNote, paymentMethod);

      Alert.alert('Éxito', `Venta registrada correctamente por $${total.toFixed(2)}`);

      setCartCount(0);
      setTotal(0);
      setSaleNote('');
      setSelectedProducts([]);
      setSelectedProduct(null);
    } catch (err) {
      Alert.alert('Error', error || 'No se pudo registrar la venta');
    }
  };

  return (
    <MainLayout>
      {/* TABS INTERNOS */}
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

      {/* DISPLAY: total acumulado (solo en tab Ventas) */}
      {activeTab === 'sales' && (
        <View style={styles.displayCard}>
          <Text style={styles.displayLabel}>TOTAL ACUMULADO</Text>

          <View style={styles.totalRow}>
            <Text style={styles.currency}>$</Text>
            <Text style={styles.displayValue}>{total.toFixed(2)}</Text>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cartCount} artículos seleccionados</Text>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* PANTALLA VENTAS */}
        {activeTab === 'sales' && (
          <View>
            {/* CARRITO DE PRODUCTOS SELECCIONADOS */}
            <View style={styles.quickGrid}>
              <ScrollView
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 4 }}
              >
                {selectedProducts.length === 0 ? (
                  <View style={styles.emptyProducts}>
                    <Text style={styles.emptyProductsText}>
                      No hay productos seleccionados
                    </Text>
                  </View>
                ) : (
                  selectedProducts.map((product) => (
                    <View key={product.id} style={styles.selectedProductCard}>
                      <View>
                        <Text style={styles.selectedProductName}>{product.name}</Text>
                        <Text style={styles.selectedProductPrice}>${product.price}</Text>
                      </View>

                      <View style={styles.selectedProductRight}>
                        <Text style={styles.selectedProductQty}>x{product.quantity}</Text>

                        <TouchableOpacity
                          style={styles.removeBtn}
                          onPress={() => {
                            setSelectedProducts((prev) =>
                              prev
                                .map((item) =>
                                  item.id === product.id
                                    ? { ...item, quantity: item.quantity - 1 }
                                    : item
                                )
                                .filter((item) => item.quantity > 0)
                            );
                            setCartCount((prev) => Math.max(prev - 1, 0));
                            setTotal((prev) => Math.max(prev - product.price, 0));
                          }}
                        >
                          <Text style={styles.removeBtnText}>−</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.addBtn}
                          onPress={() => {
                            setSelectedProducts((prev) =>
                              prev.map((item) =>
                                item.id === product.id
                                  ? { ...item, quantity: item.quantity + 1 }
                                  : item
                              )
                            );
                            setCartCount((prev) => prev + 1);
                            setTotal((prev) => prev + product.price);
                          }}
                        >
                          <Text style={styles.addBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>

            {/* ACCIONES TOP: limpiar monto + dropdown de productos */}
            <View style={styles.actionsTopRow}>
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
                <Text style={styles.clearAmountText}>Limpiar monto</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.productDropdown}
                onPress={() => setShowProducts(!showProducts)}
              >
                <Text style={styles.productDropdownText}>
                  {selectedProduct ? selectedProduct.name : 'Seleccionar producto'}
                </Text>
                <Text style={styles.dropdownArrow}>{showProducts ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {showProducts && (
                <View style={styles.productsContainer}>
                  {products.length === 0 ? (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                      <Text style={styles.emptyProductsText}>
                        Aún no tienes productos. Próximamente podrás agregarlos desde inventario.
                      </Text>
                    </View>
                  ) : (
                    <>
                      {(showAllProducts ? products : products.slice(0, 5)).map((product) => (
                        <TouchableOpacity
                          key={product.id}
                          style={styles.productItem}
                          onPress={() => {
                            setSelectedProducts((prev) => {
                              const existing = prev.find((item) => item.id === product.id);
                              if (existing) {
                                return prev.map((item) =>
                                  item.id === product.id
                                    ? { ...item, quantity: item.quantity + 1 }
                                    : item
                                );
                              }
                              return [...prev, { ...product, quantity: 1 }];
                            });
                            setShowProducts(false);
                            setCartCount((prev) => prev + 1);
                            setTotal((prev) => prev + product.price);
                          }}
                        >
                          <View>
                            <Text style={styles.productName}>{product.name}</Text>
                            <Text style={styles.productPrice}>${product.price}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}

                      {products.length > 5 && !showAllProducts && (
                        <TouchableOpacity
                          style={styles.showMoreBtn}
                          onPress={() => setShowAllProducts(true)}
                        >
                          <Text style={styles.showMoreText}>Ver más productos</Text>
                        </TouchableOpacity>
                      )}

                      {showAllProducts && (
                        <TouchableOpacity
                          style={styles.showMoreBtn}
                          onPress={() => setShowAllProducts(false)}
                        >
                          <Text style={styles.showMoreText}>Ver menos</Text>
                        </TouchableOpacity>
                      )}
                    </>
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
                  style={[
                    styles.methodBtn,
                    paymentMethod === method && styles.methodBtnActive,
                  ]}
                  onPress={() => setPaymentMethod(method)}
                >
                  <Text
                    style={[
                      styles.methodBtnText,
                      paymentMethod === method && styles.methodBtnTextActive,
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

            {/* BOTONES EXTRA: nota + vincular fiado */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.secondaryBtnGray}
                onPress={() => setNoteModalVisible(true)}
              >
                <Text style={styles.secondaryBtnTextGray}>
                  {saleNote ? 'Editar Nota' : 'Agregar Nota'}
                </Text>
              </TouchableOpacity>

              <Modal visible={noteModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                  <View style={styles.noteModal}>
                    <View style={styles.noteHeader}>
                      <Text style={styles.noteModalTitle}>Nota de la venta</Text>
                      <TouchableOpacity
                        style={styles.closeIconBtn}
                        onPress={() => setNoteModalVisible(false)}
                      >
                        <Text style={styles.closeIconText}>✕</Text>
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
                      <TouchableOpacity
                        style={styles.deleteNoteBtn}
                        onPress={() => setSaleNote('')}
                      >
                        <Text style={styles.deleteNoteText}>Eliminar nota</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.closeNoteBtn}
                        onPress={() => setNoteModalVisible(false)}
                      >
                        <Text style={styles.closeNoteText}>Listo</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>

              {/* Vincular Fiado — visualmente presente pero aún no conectado al módulo credit */}
              <TouchableOpacity
                style={styles.secondaryBtnBlue}
                onPress={() =>
                  Alert.alert(
                    'Próximamente',
                    'La vinculación de venta a fiado se integrará en una próxima iteración.'
                  )
                }
              >
                <Text style={styles.secondaryBtnTextBlue}>Vincular Fiado</Text>
              </TouchableOpacity>
            </View>

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
          </View>
        )}

        {/* PANTALLA HISTORIAL (placeholder) */}
        {activeTab === 'history' && (
          <>
            <Text style={styles.historyTitle}>Historial de ventas</Text>
            <Text style={styles.historyEmpty}>
              Esta sección mostrará el historial de ventas próximamente.
            </Text>
          </>
        )}
      </ScrollView>
    </MainLayout>
  );
};

export default SalesScreen;
