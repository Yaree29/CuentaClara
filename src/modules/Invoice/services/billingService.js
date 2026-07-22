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
   * Obtener facturas del negocio (con filtro opcional por status y/o fecha)
   * @param {string} _businessId — ignorado, el backend lo extrae del JWT
   * @param {object} options — { status?: 'paid'|'pending'|'void', dateFrom?, dateTo?, cashSessionId?: number, limit?: number }
   */
  getInvoices: async (_businessId, { status, dateFrom, dateTo, cashSessionId, limit = 20 } = {}) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    if (cashSessionId != null) params.set('cash_session_id', cashSessionId);
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

  /**
   * Crear una factura fiscal (PYME): vinculada a un cliente real de
   * /credit/customers y con numeración secuencial (ej. FAC-0001).
   * @param {object} payload — { items, payment_method, invoice_type_id, customer_id, notes }
   */
  createInvoice: async (payload) => {
    return apiRequest('/invoices/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Genera (o regenera) el PDF de una factura y devuelve una URL firmada
   * (válida por 1 hora) lista para compartir, ej. por WhatsApp.
   * @param {number} invoiceId — ID de la factura
   */
  getInvoicePdfUrl: async (invoiceId) => {
    return apiRequest(`/invoices/${invoiceId}/pdf`);
  },

  /**
   * Empaqueta los PDF de varias facturas en un único .zip en el backend y
   * devuelve una URL firmada para compartir. Usado por la selección múltiple
   * del historial (2 o más facturas).
   * @param {number[]} invoiceIds — IDs de las facturas seleccionadas
   */
  getInvoicesPdfBatchUrl: async (invoiceIds) => {
    return apiRequest('/invoices/pdf-batch', {
      method: 'POST',
      body: JSON.stringify({ invoice_ids: invoiceIds }),
    });
  },

  /**
   * Ganancias y márgenes reales (cruza invoice_items con products.cost_price)
   * en un rango de fechas: totales, desglose por factura y por producto
   * vendido. Solo owner/admin (ver require_role en el backend).
   * @param {string} dateFrom — ISO date
   * @param {string} dateTo — ISO date
   */
  getProfitability: async (dateFrom, dateTo) => {
    const params = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });
    return apiRequest(`/invoices/reports/profitability?${params.toString()}`);
  },
};

export default billingService;
