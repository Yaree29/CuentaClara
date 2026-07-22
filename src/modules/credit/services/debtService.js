// =============================================================================
// MODIFICADO: 2026-05-26
// Propósito: Servicio del módulo de crédito/fiado. Se reemplazó la
//            implementación de mocks por llamadas reales a la API FastAPI
//            (endpoints bajo el prefijo /credit).
// =============================================================================
import { apiRequest } from '../../../services/apiClient';

// -----------------------------------------------------------------------------
// Formato de la descripción de un fiado.
//
// La tabla `debts` solo tiene una columna `description`, así que productos y
// nota viajan juntos en un mismo string:
//
//   "1x Buzo Adidas, 2x Gorra | Nota: paga el viernes"
//
// Estos helpers son la ÚNICA fuente de verdad de ese formato. Los usan tanto el
// módulo de fiado como el de ventas, para que una nota escrita al registrar la
// venta se vea igual que una escrita desde la libreta de fiados.
// -----------------------------------------------------------------------------
export const NOTE_SEPARATOR = '| Nota: ';

export const buildDebtDescription = (products, note) => {
  const cleanProducts = (products || '').trim();
  const cleanNote = (note || '').trim();

  // La nota SIEMPRE va detrás del separador, incluso si no hay productos.
  // Si no, al releerla se confundiría con un producto más.
  if (cleanNote) {
    return cleanProducts
      ? `${cleanProducts} ${NOTE_SEPARATOR}${cleanNote}`
      : `${NOTE_SEPARATOR}${cleanNote}`;
  }

  return cleanProducts;
};

export const parseDebtDescription = (description) => {
  const raw = description || '';

  if (raw.includes(NOTE_SEPARATOR)) {
    const [products, ...noteParts] = raw.split(NOTE_SEPARATOR);
    return {
      products: products.trim(),
      debtNote: noteParts.join(NOTE_SEPARATOR).trim(),
    };
  }

  return { products: raw.trim(), debtNote: '' };
};

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

  getPayments: async (debtId) => {
    return apiRequest(`/credit/debts/${debtId}/payments`);
  },
};

export default debtService;
