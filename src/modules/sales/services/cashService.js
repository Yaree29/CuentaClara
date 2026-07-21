// =============================================================================
// cashService.js
// --------------
// Cliente HTTP para el módulo /cash (sesiones de caja / arqueo real).
// =============================================================================
import { apiRequest } from '../../../services/apiClient';

const cashService = {
  /**
   * Estado de la caja actual: si hay sesión abierta, incluye opening_amount,
   * cash_income, expenses y expected_amount calculados hasta este momento.
   */
  getSessionStatus: async () => {
    return apiRequest('/cash/session');
  },

  /**
   * Abrir caja con el monto inicial (efectivo físico con el que arranca).
   * @param {number} openingAmount
   */
  openSession: async (openingAmount = 0) => {
    return apiRequest('/cash/session/open', {
      method: 'POST',
      body: JSON.stringify({ opening_amount: openingAmount }),
    });
  },

  /**
   * Cerrar caja con el monto contado físicamente. Devuelve
   * { expected_amount, counted_amount, difference, ... }.
   * @param {number} countedAmount
   */
  closeSession: async (countedAmount) => {
    return apiRequest('/cash/session/close', {
      method: 'POST',
      body: JSON.stringify({ counted_amount: countedAmount }),
    });
  },

  /**
   * Historial de sesiones de caja del negocio.
   */
  getSessions: async (limit = 20) => {
    return apiRequest(`/cash/sessions?limit=${limit}`);
  },
};

export default cashService;
