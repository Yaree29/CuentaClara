// =============================================================================
// CREADO: 2026-07-07
// Propósito: Pantalla del módulo de compras (PYME). Reemplaza el placeholder
//            "Próximamente" por el flujo real: crear orden de compra (draft)
//            eligiendo proveedor + productos del inventario, y un historial
//            de órdenes con acciones "Marcar recibida" (actualiza inventario
//            vía POST /purchases/{id}/receive) y "Cancelar" (solo en draft).
// =============================================================================
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import MainLayout from '../../../views/layouts/MainLayout';
import { usePurchases } from '../hooks/usePurchases';
import styles from '../styles/purchases.styles';
import colors from '../../../theme/colors';

const STATUS_LABEL = {
  draft: 'Pendiente',
  received: 'Recibida',
  cancelled: 'Cancelada',
};

const STATUS_STYLES = {
  draft: { badge: styles.statusDraft, text: styles.statusDraftText },
  received: { badge: styles.statusReceived, text: styles.statusReceivedText },
  cancelled: { badge: styles.statusCancelled, text: styles.statusCancelledText },
};

const PurchasesScreen = () => {
  const [activeTab, setActiveTab] = useState('new');
  const [items, setItems] = useState([{ id: 1, desc: '', unitCost: '', quantity: '1', productId: null }]);
  const [supplierId, setSupplierId] = useState(null);
  const [supplierPicked, setSupplierPicked] = useState(false);
  const [showSuppliers, setShowSuppliers] = useState(false);
  const [newSupplierMode, setNewSupplierMode] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [creatingSupplier, setCreatingSupplier] = useState(false);

  const {
    loading,
    inventory, inventoryLoading, inventoryError, refreshInventory,
    suppliers, suppliersLoading, suppliersError, createSupplier,
    purchaseOrders, ordersLoading, ordersError,
    createPurchaseOrder, receivePurchaseOrder, cancelPurchaseOrder,
  } = usePurchases();

  const selectedSupplier = suppliers.find((s) => s.id === supplierId) || null;

  const pickSupplier = (id) => {
    setSupplierId(id);
    setSupplierPicked(true);
    setShowSuppliers(false);
    setNewSupplierMode(false);
  };

  const handleCreateSupplier = async () => {
    if (!newSupplierName.trim()) {
      Alert.alert('Nombre requerido', 'Ingresa el nombre del proveedor.');
      return;
    }
    setCreatingSupplier(true);
    try {
      const supplier = await createSupplier({ name: newSupplierName, phone: newSupplierPhone });
      pickSupplier(supplier.id);
      setNewSupplierName('');
      setNewSupplierPhone('');
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo crear el proveedor.');
    } finally {
      setCreatingSupplier(false);
    }
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), desc: '', unitCost: '', quantity: '1', productId: null }]);
  };

  const removeItem = (id) => {
    if (items.length === 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const addProductToItems = (product) => {
    const emptyIndex = items.findIndex((item) => !item.desc && !item.unitCost);
    const newItem = {
      id: Date.now(),
      desc: product.name,
      unitCost: String(product.price ?? ''),
      quantity: '1',
      productId: product.id,
    };

    if (emptyIndex >= 0) {
      const newItems = [...items];
      newItems[emptyIndex] = { ...newItems[emptyIndex], ...newItem };
      setItems(newItems);
      return;
    }

    setItems([...items, newItem]);
  };

  const resetForm = () => {
    setSupplierId(null);
    setSupplierPicked(false);
    setItems([{ id: 1, desc: '', unitCost: '', quantity: '1', productId: null }]);
  };

  const handleSubmit = async () => {
    if (!supplierPicked || items.some((i) => !i.desc || !i.unitCost || !i.quantity)) {
      Alert.alert('Campos incompletos', 'Por favor selecciona un proveedor y al menos un producto.');
      return;
    }

    try {
      await createPurchaseOrder(supplierId, items);
      Alert.alert('Orden creada', 'La orden de compra quedó pendiente de recepción.');
      resetForm();
      setActiveTab('history');
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo crear la orden de compra.');
    }
  };

  const handleReceive = (order) => {
    Alert.alert(
      'Marcar como recibida',
      `Esto sumará al inventario los productos de la orden a ${order.supplier_name || 'este proveedor'}.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await receivePurchaseOrder(order.id);
            } catch (error) {
              Alert.alert('Error', error.message || 'No se pudo marcar la orden como recibida.');
            }
          },
        },
      ]
    );
  };

  const handleCancel = (order) => {
    Alert.alert(
      'Cancelar orden',
      '¿Seguro que deseas cancelar esta orden de compra?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelPurchaseOrder(order.id);
            } catch (error) {
              Alert.alert('Error', error.message || 'No se pudo cancelar la orden.');
            }
          },
        },
      ]
    );
  };

  return (
    <MainLayout>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Compras</Text>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'new' && styles.tabActive]}
            onPress={() => setActiveTab('new')}
          >
            <Text style={[styles.tabText, activeTab === 'new' && styles.tabTextActive]}>Nueva Orden</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.tabActive]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>Historial</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'new' && (
          <>
            <View style={styles.section}>
              <View style={styles.rowHeader}>
                <Text style={styles.label}>Proveedor</Text>
                <TouchableOpacity onPress={() => setShowSuppliers(!showSuppliers)}>
                  <Text style={styles.addText}>{showSuppliers ? 'Cerrar' : 'Cambiar'}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.input} onPress={() => setShowSuppliers(!showSuppliers)}>
                <Text style={{ color: supplierPicked ? colors.textPrimary : colors.textMuted }}>
                  {supplierPicked
                    ? (selectedSupplier ? selectedSupplier.name : 'Sin proveedor')
                    : 'Seleccionar proveedor'}
                </Text>
              </TouchableOpacity>

              {showSuppliers && (
                <View style={[styles.listGroup, { marginTop: 8 }]}>
                  {suppliersLoading && <ActivityIndicator color="#2563eb" style={{ marginVertical: 10 }} />}

                  {!suppliersLoading && suppliersError && (
                    <Text style={styles.errorText}>{suppliersError}</Text>
                  )}

                  {!suppliersLoading && (
                    <>
                      <TouchableOpacity style={styles.listItem} onPress={() => pickSupplier(null)}>
                        <Text style={styles.itemName}>Sin proveedor</Text>
                      </TouchableOpacity>

                      {suppliers.map((s) => (
                        <TouchableOpacity key={s.id} style={styles.listItem} onPress={() => pickSupplier(s.id)}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.itemName}>{s.name}</Text>
                            {!!s.phone && <Text style={styles.itemMeta}>{s.phone}</Text>}
                          </View>
                        </TouchableOpacity>
                      ))}

                      {!newSupplierMode && (
                        <TouchableOpacity style={styles.listItem} onPress={() => setNewSupplierMode(true)}>
                          <Text style={[styles.itemName, { color: '#2563eb' }]}>+ Nuevo proveedor</Text>
                        </TouchableOpacity>
                      )}

                      {newSupplierMode && (
                        <View style={styles.listItem}>
                          <View style={{ flex: 1 }}>
                            <TextInput
                              style={[styles.input, { marginBottom: 8 }]}
                              placeholder="Nombre del proveedor"
                              value={newSupplierName}
                              onChangeText={setNewSupplierName}
                            />
                            <TextInput
                              style={styles.input}
                              placeholder="Teléfono (opcional)"
                              keyboardType="phone-pad"
                              value={newSupplierPhone}
                              onChangeText={setNewSupplierPhone}
                            />
                          </View>
                          <TouchableOpacity onPress={handleCreateSupplier} disabled={creatingSupplier}>
                            {creatingSupplier ? (
                              <ActivityIndicator color="#2563eb" />
                            ) : (
                              <Text style={styles.addText}>Guardar</Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      )}
                    </>
                  )}
                </View>
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.rowHeader}>
                <Text style={styles.label}>Inventario disponible</Text>
                <TouchableOpacity onPress={refreshInventory}>
                  <Text style={styles.addText}>Actualizar</Text>
                </TouchableOpacity>
              </View>

              {inventoryLoading && <ActivityIndicator color="#2563eb" style={{ marginVertical: 10 }} />}

              {!inventoryLoading && inventoryError && <Text style={styles.errorText}>{inventoryError}</Text>}

              {!inventoryLoading && !inventoryError && inventory.length === 0 && (
                <Text style={styles.emptyText}>No hay productos en inventario.</Text>
              )}

              {!inventoryLoading && !inventoryError && inventory.length > 0 && (
                <View style={styles.listGroup}>
                  {inventory.map((product) => (
                    <TouchableOpacity
                      key={product.id}
                      style={styles.listItem}
                      onPress={() => addProductToItems(product)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemName}>{product.name}</Text>
                        <Text style={styles.itemMeta}>
                          Stock actual: {product.stock ?? '—'} {product.unit || ''}
                        </Text>
                      </View>
                      <Text style={styles.addText}>Agregar</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.rowHeader}>
                <Text style={styles.label}>Productos a comprar</Text>
                <TouchableOpacity onPress={addItem}>
                  <Text style={styles.addText}>+ Agregar fila</Text>
                </TouchableOpacity>
              </View>

              {items.map((item, index) => (
                <View key={item.id} style={styles.itemRow}>
                  <TextInput
                    style={[styles.input, { flex: 2 }]}
                    placeholder="Producto"
                    value={item.desc}
                    onChangeText={(val) => {
                      const newItems = [...items];
                      newItems[index].desc = val;
                      newItems[index].productId = null;
                      setItems(newItems);
                    }}
                  />
                  <TextInput
                    style={[styles.input, { flex: 1, marginLeft: 10 }]}
                    placeholder="Costo"
                    keyboardType="numeric"
                    value={String(item.unitCost ?? '')}
                    onChangeText={(val) => {
                      const newItems = [...items];
                      newItems[index].unitCost = val;
                      setItems(newItems);
                    }}
                  />
                  <TextInput
                    style={[styles.input, { flex: 0.7, marginLeft: 10 }]}
                    placeholder="Cant."
                    keyboardType="numeric"
                    value={String(item.quantity ?? '1')}
                    onChangeText={(val) => {
                      const newItems = [...items];
                      newItems[index].quantity = val;
                      setItems(newItems);
                    }}
                  />
                  <TouchableOpacity onPress={() => removeItem(item.id)} disabled={items.length === 1}>
                    <Text style={[styles.addText, items.length === 1 && { opacity: 0.5 }]}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.mainButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.textButton} />
              ) : (
                <Text style={styles.mainButtonText}>Crear Orden de Compra</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {activeTab === 'history' && (
          <View style={styles.section}>
            {ordersLoading && <ActivityIndicator color="#2563eb" style={{ marginVertical: 20 }} />}

            {!ordersLoading && ordersError && <Text style={styles.errorText}>{ordersError}</Text>}

            {!ordersLoading && !ordersError && purchaseOrders.length === 0 && (
              <Text style={styles.emptyText}>Aún no tienes órdenes de compra.</Text>
            )}

            {!ordersLoading && !ordersError && purchaseOrders.map((order) => {
              const statusStyle = STATUS_STYLES[order.status] || STATUS_STYLES.draft;
              return (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderHeaderRow}>
                    <Text style={styles.orderSupplier}>{order.supplier_name || 'Sin proveedor'}</Text>
                    <Text style={styles.orderTotal}>${Number(order.total || 0).toFixed(2)}</Text>
                  </View>
                  <Text style={styles.orderMeta}>
                    {new Date(order.ordered_at).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Text>
                  <View style={[styles.statusBadge, statusStyle.badge]}>
                    <Text style={[styles.statusBadgeText, statusStyle.text]}>
                      {STATUS_LABEL[order.status] || order.status}
                    </Text>
                  </View>

                  {order.status === 'draft' && (
                    <View style={styles.orderActionsRow}>
                      <TouchableOpacity
                        style={[styles.orderActionBtn, styles.receiveBtn]}
                        onPress={() => handleReceive(order)}
                      >
                        <Text style={styles.receiveBtnText}>Marcar recibida</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.orderActionBtn, styles.cancelBtn]}
                        onPress={() => handleCancel(order)}
                      >
                        <Text style={styles.cancelBtnText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </MainLayout>
  );
};

export default PurchasesScreen;
