import { useEffect, useState } from 'react';
import billingService from '../services/billingService';
import useAuthStore from '../../../store/useAuthStore';
import useUserStore from '../../../store/useUserStore';
import inventoryService from '../../inventory/services/inventoryService';

export const useBilling = () => {
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState(null);
  const user = useAuthStore((state) => state.user);
  const businessData = useUserStore((state) => state.businessData);

  const resolveBusinessId = () =>
    businessData?.id ||
    businessData?.business_id ||
    user?.business_id ||
    user?.businessId ||
    null;

  const fetchInventory = async () => {
    const businessId = resolveBusinessId();
    if (!businessId) {
      setInventory([]);
      setInventoryLoading(false);
      return;
    }

    setInventoryLoading(true);
    setInventoryError(null);

    try {
      const data = await inventoryService.getProducts(businessId);
      setInventory(data);
    } catch (err) {
      console.error('Error al cargar inventario:', err);
      setInventoryError(err.message || 'No se pudo cargar el inventario.');
    } finally {
      setInventoryLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [businessData, user]);

  const createInvoice = async (customer, items, taxRate = 0.07) => {
    setLoading(true);
    try {
      const businessId = resolveBusinessId();
      const userId = user?.id ?? null;

      if (!businessId) {
        throw new Error('No se encontró el negocio activo para registrar la factura.');
      }

      const normalizedItems = items.map((item) => {
        const unitPrice = Number(item.price);
        const quantity = Number(item.quantity ?? 1);

        if (Number.isNaN(unitPrice)) {
          throw new Error('El precio debe ser numérico.');
        }

        if (Number.isNaN(quantity) || quantity <= 0) {
          throw new Error('La cantidad debe ser numérica y mayor a cero.');
        }

        return {
          description: item.desc?.trim() ?? '',
          unitPrice,
          quantity,
          subtotal: unitPrice * quantity,
          productId: item.productId ?? null,
        };
      });

      const subtotal = normalizedItems.reduce((acc, item) => acc + item.subtotal, 0);
      const tax = subtotal * taxRate;
      const total = subtotal + tax;

      const result = await billingService.generateInvoice({
        customer,
        items: normalizedItems,
        businessId,
        userId,
        subtotal,
        tax,
        total
      });
      return result;
    } catch (error) {
      console.error("Error al generar factura:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createInvoice,
    loading,
    invoices,
    inventory,
    inventoryLoading,
    inventoryError,
    refreshInventory: fetchInventory,
  };
};
