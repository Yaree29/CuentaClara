import { useEffect, useState } from 'react';
import billingService from '../services/billingService';
import useAuthStore from '../../../store/useAuthStore';
import useUserStore from '../../../store/useUserStore';
import inventoryService from '../../inventory/services/inventoryService';
import salesService from '../../sales/services/salesService';

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

  // =========================================================================
  // createInvoice — ahora delega al backend vía POST /sales/quick
  // =========================================================================
  // La creación de facturas SIEMPRE pasa por salesService.createSale() que
  // ejecuta en el backend: validar stock → crear factura + items → registrar
  // pago → descontar inventario → crear movimiento.  Esto garantiza atomicidad
  // y evita facturas huérfanas.
  // =========================================================================
  const createInvoice = async (customer, items, taxRate = 0.07) => {
    setLoading(true);
    try {
      const businessId = resolveBusinessId();

      if (!businessId) {
        throw new Error('No se encontró el negocio activo para registrar la factura.');
      }

      // Mapear items al formato que espera POST /sales/quick
      const saleItems = items.map((item) => {
        const unitPrice = Number(item.price);
        const quantity = Number(item.quantity ?? 1);

        if (Number.isNaN(unitPrice)) {
          throw new Error('El precio debe ser numérico.');
        }

        if (Number.isNaN(quantity) || quantity <= 0) {
          throw new Error('La cantidad debe ser numérica y mayor a cero.');
        }

        return {
          product_id: item.productId ?? null,
          quantity,
          unit_price: unitPrice,
        };
      });

      // Crear la venta (y factura) a través de la API
      const result = await salesService.createSale(saleItems, 'cash');

      // Normalizar respuesta para mantener compatibilidad con BillingScreen
      const subtotal = saleItems.reduce(
        (acc, it) => acc + it.quantity * it.unit_price,
        0
      );

      return {
        success: true,
        invoiceId: result.invoice_id,
        invoiceNumber: `FAC-${result.invoice_id}`,
        date: result.created_at,
        subtotal,
        tax: result.tax ?? subtotal * taxRate,
        total: result.total,
      };
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

