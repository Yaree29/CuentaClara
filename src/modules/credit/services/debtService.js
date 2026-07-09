// =============================================================================
// MODIFICADO: 2026-05-26
// Propósito: Servicio del módulo de crédito/fiado. Se reemplazó la
//            implementación de mocks por llamadas reales a la API FastAPI
//            (endpoints bajo el prefijo /credit).
// =============================================================================
import { apiRequest } from '../../../services/apiClient';

const debtService = {
  // --- Clientes ---
  getCustomers: async () => {
    return apiRequest('/credit/customers');
  },

  createCustomer: async ({ name, phone, notes }) => {
    return apiRequest('/credit/customers', {
      method: 'POST',
      body: JSON.stringify({
        name,
        phone: phone || null,
        notes: notes || null,
      }),
    });
  },

  updateCustomer: async (customerId, { name, phone, notes }) => {
    return apiRequest(`/credit/customers/${customerId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...(name !== undefined ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(notes !== undefined ? { notes } : {}),
      }),
    });
  },

  // --- Deudas / Fiado ---
  // Devuelve por defecto las deudas abiertas (pending, partial, overdue)
  getDebts: async (status = null) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return apiRequest(`/credit/debts${query}`);
  },

  createDebt: async ({ customer_id, amount, description, due_date, invoice_id }) => {
    return apiRequest('/credit/debts', {
      method: 'POST',
      body: JSON.stringify({
        customer_id,
        amount,
        description: description || null,
        due_date: due_date || null,
        invoice_id: invoice_id || null,
      }),
    });
  },

  updateDebt: async (debtId, { amount, description, due_date }) => {
    return apiRequest(`/credit/debts/${debtId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...(amount !== undefined ? { amount } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(due_date !== undefined ? { due_date } : {}),
      }),
    });
  },

  cancelDebt: async (debtId) => {
    return apiRequest(`/credit/debts/${debtId}/cancel`, {
      method: 'POST',
    });
  },

  // --- Abonos ---
  registerPayment: async (debtId, { amount, method = 'cash', notes = null }) => {
    return apiRequest(`/credit/debts/${debtId}/payments`, {
      method: 'POST',
      body: JSON.stringify({ amount, method, notes }),
    });
  },
};

export default debtService;
