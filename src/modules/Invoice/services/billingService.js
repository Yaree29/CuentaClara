// =============================================================================
// MODIFICADO: 2026-06-03
// Propósito: Reemplazo de la implementación original que usaba helpers de
//            Supabase directamente (insert, remove, select de utils/supabaseClient)
//            por llamadas a la API de FastAPI, respetando la convención:
//            frontend → FastAPI → Supabase.
//
// Cambios:
//   - generateInvoice() ELIMINADO: La creación de facturas SIEMPRE pasa por
//     POST /sales/quick en el backend, que ya crea factura + items + pago +
//     descuenta inventario de forma atómica. Crear facturas desde el frontend
//     producía facturas huérfanas sin movimiento de inventario ni pago.
//   - getInvoices() ahora usa GET /invoices/ (ya existía en el backend).
//   - getInvoiceDetail() NUEVO: usa GET /invoices/{id} del backend.
// =============================================================================
import { apiRequest } from '../../../services/apiClient';

const billingService = {
  /**
   * Obtener facturas del negocio (con filtro opcional por status)
   * @param {string} _businessId — ignorado, el backend lo extrae del JWT
   * @param {object} options — { status?: 'paid'|'pending'|'void', limit?: number }
   */
  getInvoices: async (_businessId, { status, limit = 20 } = {}) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (limit) params.set('limit', String(limit));

    const query = params.toString();
    return apiRequest(`/invoices/${query ? '?' + query : ''}`);
  },

  /**
   * Obtener detalle de una factura específica
   * @param {number} invoiceId — ID de la factura
   */
  getInvoiceDetail: async (invoiceId) => {
    return apiRequest(`/invoices/${invoiceId}`);
  },
};

export default billingService;
