// =============================================================================
// MODIFICADO: 2026-05-26
// Propósito: Servicio del módulo de crédito/fiado. Se reemplazó la
//            implementación de mocks por llamadas reales a la API FastAPI
//            (endpoints bajo el prefijo /credit).
// =============================================================================
import { API_URL } from '../../../config/env';
import useAuthStore from '../../../store/useAuthStore';

const baseUrl = () => API_URL || 'http://localhost:8000';

// Resuelve el token desde el store, priorizando api_token (registro/login)
const getAuthToken = () => {
  const token = useAuthStore.getState().token;
  const apiToken = useAuthStore.getState().user?.api_token;
  return apiToken || token;
};

const apiRequest = async (path, options = {}) => {
  const authToken = getAuthToken();
  if (!authToken) {
    throw new Error('No hay sesión activa. Por favor inicia sesión nuevamente.');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
    ...(options.headers || {}),
  };

  const response = await fetch(`${baseUrl()}${path}`, { ...options, headers });

  if (!response.ok) {
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      throw new Error(data.detail || 'Error en la solicitud');
    } catch (e) {
      if (e.message !== 'Error en la solicitud' && !e.message.startsWith('Error del servidor:')) {
        throw new Error(`Error del servidor: ${text.substring(0, 150)}`);
      }
      throw e;
    }
  }

  return response.json();
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

  // --- Abonos ---
  registerPayment: async (debtId, { amount, method = 'cash', notes = null }) => {
    return apiRequest(`/credit/debts/${debtId}/payments`, {
      method: 'POST',
      body: JSON.stringify({ amount, method, notes }),
    });
  },
};

export default debtService;
