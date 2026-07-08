// =============================================================================
// CREADO: 2026-07-07
// Propósito: Servicio del módulo de compras (PYME). Llama a los endpoints
//            FastAPI bajo el prefijo /purchases, siguiendo la misma
//            convención que billingService.js / debtService.js (apiClient
//            compartido, snake_case en el payload).
// =============================================================================
import { apiRequest } from '../../../services/apiClient';

const purchaseService = {
  // ── Proveedores ────────────────────────────────────────────────────────────
  getSuppliers: async () => {
    return apiRequest('/purchases/suppliers');
  },

  createSupplier: async ({ name, phone, email, tax_id, notes }) => {
    return apiRequest('/purchases/suppliers', {
      method: 'POST',
      body: JSON.stringify({
        name,
        phone: phone || null,
        email: email || null,
        tax_id: tax_id || null,
        notes: notes || null,
      }),
    });
  },

  updateSupplier: async (supplierId, { name, phone, email, tax_id, notes }) => {
    return apiRequest(`/purchases/suppliers/${supplierId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...(name !== undefined ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(tax_id !== undefined ? { tax_id } : {}),
        ...(notes !== undefined ? { notes } : {}),
      }),
    });
  },

  // ── Órdenes de compra ─────────────────────────────────────────────────────
  // Devuelve por defecto todas las órdenes; pasar status para filtrar
  // ('draft' | 'received' | 'cancelled').
  getPurchaseOrders: async (status = null) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return apiRequest(`/purchases/${query}`);
  },

  getPurchaseOrder: async (purchaseOrderId) => {
    return apiRequest(`/purchases/${purchaseOrderId}`);
  },

  createPurchaseOrder: async ({ supplier_id, items }) => {
    return apiRequest('/purchases/', {
      method: 'POST',
      body: JSON.stringify({
        supplier_id: supplier_id || null,
        items,
      }),
    });
  },

  receivePurchaseOrder: async (purchaseOrderId) => {
    return apiRequest(`/purchases/${purchaseOrderId}/receive`, {
      method: 'POST',
    });
  },

  cancelPurchaseOrder: async (purchaseOrderId) => {
    return apiRequest(`/purchases/${purchaseOrderId}/cancel`, {
      method: 'POST',
    });
  },
};

export default purchaseService;
