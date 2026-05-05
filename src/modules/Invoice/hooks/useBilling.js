import { useState } from 'react';
import billingService from '../services/billingService';

export const useBilling = () => {
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);

  const createInvoice = async (customer, items, taxRate = 0.07) => {
    setLoading(true);
    try {
      const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const tax = subtotal * taxRate;
      const total = subtotal + tax;

      const result = await billingService.generateInvoice({
        customer,
        items,
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