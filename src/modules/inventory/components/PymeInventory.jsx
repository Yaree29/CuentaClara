// =============================================================================
// PymeInventory.jsx
// -----------------------------------------------------------------------------
// Fusionado desde pymeEdgar/pyme/inventory/screens/PymeInventoryScreen.jsx.
// Se mantiene este nombre de archivo (no PymeInventoryScreen) porque ya está
// referenciado en MainNavigator.jsx (tab "assistantInventory" del Modo
// Asistente) y en ModulesScreen.jsx (navigation.navigate('PymeInventory')).
//
// MODIFICADO: agrega el CRUD de productos que faltaba por completo en esta
// pantalla (antes solo existía en InformalInventory.jsx, inalcanzable para
// PYME) reutilizando ProductFormModal.jsx tal cual. También conecta "Mermas"
// (POST /inventory/stock/adjust reason=waste) y "Caducidad" (columna real
// products.expiration_date) a accesos funcionales en vez de placeholders.
// =============================================================================
import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { PlusIcon, PencilIcon } from 'react-native-heroicons/solid';
import DashboardHeader from '../../dashboard/components/shared/DashboardHeader';
import colors from '../../../theme/colors';
import InventoryAlertWidget from './InventoryAlertWidget';
import ProductScannerWidget from './ProductScannerWidget';
import ProductFormModal from './ProductFormModal';
import inventoryService from '../services/inventoryService';
import useInventoryConfig, { FLAG_LABELS } from '../hooks/useInventoryConfig';
import styles from '../styles/pymeInventory.styles';

// Flags que hoy solo tienen placeholder visual — sin funcionalidad propia
// todavía en esta pantalla. "caducidad" y "mermas" salieron de esta lista:
// ya tienen acceso funcional real (ver ExpiringProductsCard/WasteModal).
// "escaner" tampoco está acá porque ya tiene un widget real: ProductScannerWidget.
const PLACEHOLDER_FLAGS = ['control_peso', 'recetas', 'produccion', 'stock_predictivo'];

const money = (value) => `$${Number(value || 0).toFixed(2)}`;

const daysUntil = (isoDate) => {
  const target = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
};

const ConfigFlagPlaceholder = ({ flag }) => (
  <View style={styles.flagCard}>
    <Text style={styles.flagCardTitle}>{FLAG_LABELS[flag].label}</Text>
    <Text style={styles.flagCardDescription}>{FLAG_LABELS[flag].description}</Text>
  </View>
);

// ─── Modal "Registrar Merma" — producto + cantidad + motivo → stock/adjust ──

const WasteModal = ({ visible, onClose, products, onRegistered }) => {
  const [productId, setProductId] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [quantityError, setQuantityError] = useState(null);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setProductId(null);
    setQuantity('');
    setNotes('');
    setQuantityError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = async () => {
    if (!productId) {
      Alert.alert('Selecciona un producto', 'Elige a qué producto pertenece la merma.');
      return;
    }
    const qty = parseFloat(quantity);
    if (!quantity || Number.isNaN(qty) || qty <= 0) {
      setQuantityError('La cantidad debe ser mayor a 0.');
      return;
    }
    setQuantityError(null);
    setSaving(true);
    try {
      await inventoryService.adjustStock({
        productId,
        quantity: qty,
        reason: 'waste',
        notes: notes.trim() || null,
      });
      reset();
      onRegistered();
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo registrar la merma.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.modalTitle}>Registrar Merma</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.modalCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Producto *</Text>
              {products.length === 0 ? (
                <Text style={styles.emptyText}>No tienes productos registrados todavía.</Text>
              ) : (
                <View style={styles.productChipRow}>
                  {products.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.productChip, productId === p.id && styles.productChipActive]}
                      onPress={() => setProductId(p.id)}
                    >
                      <Text style={[styles.productChipText, productId === p.id && styles.productChipTextActive]}>
                        {p.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Cantidad perdida *</Text>
              <TextInput
                style={[styles.formInput, quantityError && styles.inputError]}
                value={quantity}
                onChangeText={(val) => {
                  setQuantity(val.replace(/[^0-9.]/g, ''));
                  setQuantityError(null);
                }}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.placeholder}
              />
              {quantityError ? <Text style={styles.errorText}>{quantityError}</Text> : null}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Motivo (opcional)</Text>
              <TextInput
                style={styles.formInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Ej. Producto vencido, dañado en bodega..."
                placeholderTextColor={colors.placeholder}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, (saving || products.length === 0) && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving || products.length === 0}
            >
              {saving ? (
                <ActivityIndicator color={colors.textButton} />
              ) : (
                <Text style={styles.saveBtnText}>Registrar merma</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const PymeInventory = () => {
  const { config, loading: loadingConfig } = useInventoryConfig();
  const activePlaceholderFlags = PLACEHOLDER_FLAGS.filter((flag) => config[flag]);

  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [formModalVisible, setFormModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [wasteModalVisible, setWasteModalVisible] = useState(false);

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await inventoryService.lowStockAlerts();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (error) {
      setAlerts([]);
    } finally {
      setLoadingAlerts(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const data = await inventoryService.getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Categorías reales (mismo servicio que useInformalInventory.js) — no se
  // derivan de `products` porque una categoría recién creada sin productos
  // todavía no aparecería en esa lista.
  const [categories, setCategories] = useState([]);
  const fetchCategories = useCallback(async () => {
    try {
      const data = await inventoryService.getCategories();
      setCategories(Array.isArray(data) ? data.map((c) => c.name) : []);
    } catch (error) {
      setCategories([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAlerts();
      fetchProducts();
      fetchCategories();
    }, [fetchAlerts, fetchProducts, fetchCategories])
  );

  const totalAlerts = alerts.length;
  // Déficit crítico: sin stock disponible (current_stock === 0).
  const itemsAtRisk = alerts.filter((alert) => alert.current_stock === 0).length;

  const openAddProduct = () => {
    setEditingProduct(null);
    setFormModalVisible(true);
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);
    setFormModalVisible(true);
  };

  const closeProductForm = () => {
    setFormModalVisible(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async (data) => {
    try {
      if (editingProduct) {
        await inventoryService.updateProduct(null, editingProduct.id, data);
      } else {
        await inventoryService.createProduct(null, data);
      }
      closeProductForm();
      await Promise.all([fetchProducts(), fetchAlerts()]);
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo guardar el producto.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await inventoryService.deleteProduct(null, productId);
      closeProductForm();
      await Promise.all([fetchProducts(), fetchAlerts()]);
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo eliminar el producto.');
    }
  };

  const handleWasteRegistered = async () => {
    setWasteModalVisible(false);
    await Promise.all([fetchProducts(), fetchAlerts()]);
  };

  // "Productos por vencer": expiration_date real (products.expiration_date)
  // dentro de los próximos 7 días — incluye ya vencidos (días negativos).
  const expiringSoon = useMemo(() => {
    if (!config.caducidad) return [];
    return products
      .filter((p) => !!p.expirationDate)
      .map((p) => ({ ...p, daysLeft: daysUntil(p.expirationDate) }))
      .filter((p) => p.daysLeft !== null && p.daysLeft <= 7)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [products, config.caducidad]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <DashboardHeader title="Inventario Pyme" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroKicker}>Control de stock</Text>
          <Text style={styles.heroTitle}>Monitorea tus productos críticos en tiempo real.</Text>
          <Text style={styles.heroSubtitle}>Alertas y catálogo conectados a tu inventario real del negocio.</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Alertas activas</Text>
            <Text style={styles.summaryValue}>{totalAlerts}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>En riesgo</Text>
            <Text style={styles.summaryValue}>{itemsAtRisk}</Text>
          </View>
        </View>

        {loadingAlerts ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <InventoryAlertWidget alerts={alerts} />
        )}

        {/* ── Tus productos (CRUD real, antes inexistente en esta pantalla) ── */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Tus productos ({products.length})</Text>
          </View>

          {loadingProducts ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : products.length === 0 ? (
            <Text style={styles.emptyText}>Aún no tienes productos. Usa el botón "+" para agregar el primero.</Text>
          ) : (
            products.map((product) => (
              <View key={product.id} style={styles.productListCard}>
                <View style={styles.productListInfo}>
                  <Text style={styles.productListName}>{product.name}</Text>
                  <Text style={styles.productListMeta}>
                    {money(product.price)}
                    {product.stock !== null ? ` · Stock ${product.stock} ${product.unit || ''}` : ' · Servicio'}
                  </Text>
                </View>
                <TouchableOpacity style={styles.editIconBtn} onPress={() => openEditProduct(product)}>
                  <PencilIcon size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {loadingConfig ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <>
            {/* ── Mermas: acceso funcional real (reemplaza el placeholder) ── */}
            {config.mermas && (
              <View style={styles.sectionBlock}>
                <View style={styles.actionCard}>
                  <View style={styles.actionCardText}>
                    <Text style={styles.actionCardTitle}>Mermas</Text>
                    <Text style={styles.actionCardDescription}>Registra pérdidas o desperdicio de inventario.</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.actionCardButton}
                    onPress={() => setWasteModalVisible(true)}
                  >
                    <Text style={styles.actionCardButtonText}>Registrar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ── Caducidad: "Productos por vencer" real (reemplaza el placeholder) ── */}
            {config.caducidad && (
              <View style={styles.sectionBlock}>
                <View style={styles.sectionRow}>
                  <Text style={styles.sectionTitle}>Productos por vencer</Text>
                </View>
                <View style={styles.expiringCard}>
                  {expiringSoon.length === 0 ? (
                    <Text style={styles.emptyText}>Ningún producto vence en los próximos 7 días.</Text>
                  ) : (
                    expiringSoon.map((product, index) => (
                      <View
                        key={product.id}
                        style={[styles.expiringRow, index === expiringSoon.length - 1 && styles.expiringRowLast]}
                      >
                        <Text style={styles.expiringName}>{product.name}</Text>
                        <Text
                          style={[
                            styles.expiringDate,
                            product.daysLeft < 0 ? styles.expiringDateDanger : styles.expiringDateWarning,
                          ]}
                        >
                          {product.daysLeft < 0
                            ? `Venció hace ${Math.abs(product.daysLeft)} d`
                            : product.daysLeft === 0
                              ? 'Vence hoy'
                              : `Vence en ${product.daysLeft} d`}
                        </Text>
                      </View>
                    ))
                  )}
                </View>
              </View>
            )}

            {config.escaner && <ProductScannerWidget />}

            {activePlaceholderFlags.length > 0 && (
              <View style={styles.flagsSection}>
                <Text style={styles.flagsSectionTitle}>Configuraciones activas</Text>
                {activePlaceholderFlags.map((flag) => (
                  <ConfigFlagPlaceholder key={flag} flag={flag} />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fabButton} activeOpacity={0.85} onPress={openAddProduct}>
          <PlusIcon size={26} color={colors.textWhite} />
        </TouchableOpacity>
      </View>

      <ProductFormModal
        visible={formModalVisible}
        onClose={closeProductForm}
        initialData={editingProduct}
        categories={categories}
        showExpiration={!!config.caducidad}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
      />

      <WasteModal
        visible={wasteModalVisible}
        onClose={() => setWasteModalVisible(false)}
        products={products}
        onRegistered={handleWasteRegistered}
      />
    </SafeAreaView>
  );
};

export default PymeInventory;
