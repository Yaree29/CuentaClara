import { supabase } from '../../../services/supabaseClient';

export const salesService = {
  async createQuickSale(saleData) {
    try {
      // 1. Crear la factura principal
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          business_id: saleData.businessId,
          user_id: saleData.userId,
          total: saleData.price,
          tax: 0, // Venta informal, sin impuestos
          status: saleData.paymentMethod === 'cash' ? 'paid' : 'pending',
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // 2. Crear el item de la factura (producto genérico)
      const { data: invoiceItem, error: itemError } = await supabase
        .from('invoice_items')
        .insert({
          invoice_id: invoice.id,
          // No asociamos a un `product_id` real para agilidad
          quantity: saleData.quantity,
          unit_price: saleData.price / saleData.quantity,
          subtotal: saleData.price,
          // Guardamos el nombre del producto directamente en el item si la tabla lo permite
          // Si no, se puede agregar un campo `description` a `invoice_items`
          // Por ahora, lo omitimos para mantenerlo simple. El nombre está en la variable `productName`
        })
        .select()
        .single();
        
      if (itemError) throw itemError;

      // 3. Si fue al contado, registrar el pago
      if (saleData.paymentMethod === 'cash') {
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            invoice_id: invoice.id,
            amount: saleData.price,
            method: 'cash',
          });
        if (paymentError) throw paymentError;
      }

      // Para la factura de WhatsApp, necesitamos devolver la info combinada
      const resultInvoice = {
        ...invoice,
        items: [{
            ...invoiceItem,
            product_name: saleData.productName, // Añadimos el nombre para el recibo
        }],
        // Podríamos obtener el nombre del negocio, pero lo simplificamos
        business_name: 'Tu Emprendimiento' 
      };

      return { invoice: resultInvoice, error: null };
    } catch (error) {
      console.error('Error creating quick sale:', error);
      return { invoice: null, error };
    }
  },
};
