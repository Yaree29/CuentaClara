import { useState } from 'react';
import billingService from '../services/billingService';
import useAuthStore from '../../../store/useAuthStore';
import useUserStore from '../../../store/useUserStore';

export const useBilling = () => {
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const user = useAuthStore((state) => state.user);
  const businessData = useUserStore((state) => state.businessData);

  const resolveBusinessId = () =>
    businessData?.id ||
    businessData?.business_id ||
    user?.business_id ||
    user?.businessId ||
    null;

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
        if (Number.isNaN(unitPrice)) {
          throw new Error('El precio debe ser numérico.');
        }

        return {
          description: item.desc?.trim() ?? '',
          unitPrice,
          quantity: 1,
          subtotal: unitPrice,
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
    invoices
  };
};
