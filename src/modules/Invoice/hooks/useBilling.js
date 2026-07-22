import { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import billingService from '../services/billingService';
import inventoryService from '../../inventory/services/inventoryService';
import debtService from '../../credit/services/debtService';

export const useBilling = () => {
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customersError, setCustomersError] = useState(null);

  // inventoryService.getProducts() ignora el parámetro businessId — el
  // backend siempre lo extrae del JWT (ver comentario en
  // inventoryService.js). Antes esta función esperaba un businessId
  // resuelto de un `businessData = 'informal'` (string suelto, sin .id ni
  // .business_id) y abortaba con inventario vacío si no lo conseguía —
  // por eso "Inventario disponible" salía vacío aunque el negocio sí
  // tuviera productos activos. fetchCustomers ya llamaba a su servicio sin
  // ese filtro; se alinea el mismo patrón aquí.
  const fetchInventory = async () => {
    setInventoryLoading(true);
    setInventoryError(null);

    try {
      const data = await inventoryService.getProducts();
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
  }, []);

  const fetchCustomers = async () => {
    setCustomersLoading(true);
    setCustomersError(null);
    try {
      const data = await debtService.getCustomers();
      setCustomers(data || []);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      setCustomersError(err.message || 'No se pudieron cargar los clientes.');
    } finally {
      setCustomersLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const createCustomer = async ({ name, phone, notes }) => {
    const customer = await debtService.createCustomer({ name, phone, notes });
    setCustomers((prev) => [...prev, customer]);
    return customer;
  };

  // =========================================================================
  // createInvoice — factura fiscal PYME vía POST /invoices
  // =========================================================================
  // A diferencia de la venta rápida informal (POST /sales/quick, sin
  // cliente), esta factura queda vinculada a un customer_id real de
  // /credit/customers y recibe numeración secuencial (ej. FAC-0001) generada
  // en el backend.
  // =========================================================================
  const createInvoice = async (customerId, items, { paymentMethod = 'cash', notes = null } = {}) => {
    setLoading(true);
    try {
      const saleItems = items.map((item) => {
        const unitPrice = Number(item.price);
        const quantity = Number(item.quantity ?? 1);

        if (!item.productId) {
          throw new Error('Cada línea debe corresponder a un producto del inventario.');
        }
        if (Number.isNaN(unitPrice)) {
          throw new Error('El precio debe ser numérico.');
        }
        if (Number.isNaN(quantity) || quantity <= 0) {
          throw new Error('La cantidad debe ser numérica y mayor a cero.');
        }

        return {
          product_id: item.productId,
          quantity,
          unit_price: unitPrice,
        };
      });

      const result = await billingService.createInvoice({
        items: saleItems,
        payment_method: paymentMethod,
        customer_id: customerId ?? null,
        notes,
      });

      return {
        success: true,
        invoiceId: result.invoice_id,
        invoiceNumber: result.invoice_number,
        customerName: result.customer_name,
        date: result.created_at,
        tax: result.tax,
        total: result.total,
      };
    } catch (error) {
      console.error("Error al generar factura:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // sendInvoiceByWhatsApp — reutiliza el mismo patrón whatsapp://send?text=
  // del módulo Informal (useInformalInventory.generateWhatsAppPromo): abre
  // WhatsApp con un mensaje pre-cargado. Como whatsapp://send no soporta
  // adjuntar archivos, se comparte el link firmado del PDF (generado en el
  // backend y subido a Supabase Storage) en vez del PDF en sí.
  // =========================================================================
  const sendInvoiceByWhatsApp = async (invoiceId, invoiceNumber, phone = null) => {
    const { url } = await billingService.getInvoicePdfUrl(invoiceId);
    const text = `Aquí tu factura ${invoiceNumber}:\n${url}`;
    const phoneParam = phone ? `phone=${encodeURIComponent(phone.replace(/\D/g, ''))}&` : '';
    const waUrl = `whatsapp://send?${phoneParam}text=${encodeURIComponent(text)}`;

    try {
      await Linking.openURL(waUrl);
    } catch (err) {
      throw new Error('No se pudo abrir WhatsApp. Asegúrate de tenerlo instalado en este dispositivo.');
    }
  };

  return {
    createInvoice,
    sendInvoiceByWhatsApp,
    loading,
    invoices,
    inventory,
    inventoryLoading,
    inventoryError,
    refreshInventory: fetchInventory,
    customers,
    customersLoading,
    customersError,
    createCustomer,
    refreshCustomers: fetchCustomers,
  };
};

