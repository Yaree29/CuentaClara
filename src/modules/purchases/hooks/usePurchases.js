// =============================================================================
// CREADO: 2026-07-07
// Propósito: Hook del módulo de compras (PYME). Mismo patrón que useBilling.js:
//            carga inventario (para elegir productos) y proveedores, expone
//            creación de proveedores al vuelo, y las acciones sobre órdenes
//            de compra (crear draft, recibir, cancelar).
// =============================================================================
import { useEffect, useState } from 'react';
import purchaseService from '../services/purchaseService';
import inventoryService from '../../inventory/services/inventoryService';

export const usePurchases = () => {
  const [loading, setLoading] = useState(false);

  const [inventory, setInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState(null);

  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(true);
  const [suppliersError, setSuppliersError] = useState(null);

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  const fetchInventory = async () => {
    setInventoryLoading(true);
    setInventoryError(null);
    try {
      const data = await inventoryService.getProducts();
      setInventory(data || []);
    } catch (err) {
      console.error('Error al cargar inventario:', err);
      setInventoryError(err.message || 'No se pudo cargar el inventario.');
    } finally {
      setInventoryLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    setSuppliersLoading(true);
    setSuppliersError(null);
    try {
      const data = await purchaseService.getSuppliers();
      setSuppliers(data || []);
    } catch (err) {
      console.error('Error al cargar proveedores:', err);
      setSuppliersError(err.message || 'No se pudieron cargar los proveedores.');
    } finally {
      setSuppliersLoading(false);
    }
  };

  const fetchPurchaseOrders = async (status = null) => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const data = await purchaseService.getPurchaseOrders(status);
      setPurchaseOrders(data || []);
    } catch (err) {
      console.error('Error al cargar órdenes de compra:', err);
      setOrdersError(err.message || 'No se pudieron cargar las órdenes de compra.');
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchSuppliers();
    fetchPurchaseOrders();
  }, []);

  const createSupplier = async ({ name, phone, email, tax_id, notes }) => {
    const supplier = await purchaseService.createSupplier({ name, phone, email, tax_id, notes });
    setSuppliers((prev) => [...prev, supplier]);
    return supplier;
  };

  const createPurchaseOrder = async (supplierId, items) => {
    setLoading(true);
    try {
      const payloadItems = items.map((item) => {
        const unitCost = Number(item.unitCost);
        const quantity = Number(item.quantity ?? 1);

        if (!item.productId) {
          throw new Error('Cada línea debe corresponder a un producto del inventario.');
        }
        if (Number.isNaN(unitCost) || unitCost < 0) {
          throw new Error('El costo unitario debe ser numérico y no negativo.');
        }
        if (Number.isNaN(quantity) || quantity <= 0) {
          throw new Error('La cantidad debe ser numérica y mayor a cero.');
        }

        return {
          product_id: item.productId,
          quantity,
          unit_cost: unitCost,
        };
      });

      const order = await purchaseService.createPurchaseOrder({
        supplier_id: supplierId,
        items: payloadItems,
      });

      setPurchaseOrders((prev) => [order, ...prev]);
      return order;
    } finally {
      setLoading(false);
    }
  };

  const receivePurchaseOrder = async (purchaseOrderId) => {
    const updated = await purchaseService.receivePurchaseOrder(purchaseOrderId);
    setPurchaseOrders((prev) => prev.map((po) => (po.id === purchaseOrderId ? updated : po)));
    fetchInventory();
    return updated;
  };

  const cancelPurchaseOrder = async (purchaseOrderId) => {
    const updated = await purchaseService.cancelPurchaseOrder(purchaseOrderId);
    setPurchaseOrders((prev) => prev.map((po) => (po.id === purchaseOrderId ? updated : po)));
    return updated;
  };

  return {
    loading,
    inventory,
    inventoryLoading,
    inventoryError,
    refreshInventory: fetchInventory,
    suppliers,
    suppliersLoading,
    suppliersError,
    createSupplier,
    refreshSuppliers: fetchSuppliers,
    purchaseOrders,
    ordersLoading,
    ordersError,
    refreshPurchaseOrders: fetchPurchaseOrders,
    createPurchaseOrder,
    receivePurchaseOrder,
    cancelPurchaseOrder,
  };
};
