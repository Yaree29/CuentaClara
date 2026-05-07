import { insert, remove, select } from '../../../utils/supabaseClient';

const buildInvoiceItemsPayload = (invoiceId, items) =>
  items.map((item) => ({
    invoice_id: invoiceId,
    product_id: item.productId ?? null,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    subtotal: item.subtotal,
  }));

const billingService = {
  generateInvoice: async (invoiceData) => {
    const {
      businessId,
      userId,
      invoiceTypeId = null,
      items,
      subtotal,
      tax,
      total,
    } = invoiceData;

    if (!businessId) {
      throw new Error('No se encontró businessId para registrar la factura.');
    }

    const [invoice] = await insert(
      'invoices',
      {
        business_id: businessId,
        invoice_type_id: invoiceTypeId,
        total,
        tax,
        user_id: userId ?? null,
      },
      { select: 'id, created_at' }
    );

    try {
      const itemsPayload = buildInvoiceItemsPayload(invoice.id, items);
      await insert('invoice_items', itemsPayload, { select: 'id' });
    } catch (error) {
      await remove('invoices', { id: invoice.id }, { select: 'id' });
      throw error;
    }

    return {
      success: true,
      invoiceId: invoice.id,
      invoiceNumber: `FAC-${invoice.id}`,
      date: invoice.created_at,
      subtotal,
      tax,
      total,
    };
  },

  getInvoices: async (businessId) => {
    if (!businessId) {
      throw new Error('No se encontró businessId para consultar facturas.');
    }

    return select('invoices', {
      match: { business_id: businessId },
      order: { column: 'created_at', ascending: false },
    });
  },
};

export default billingService;
