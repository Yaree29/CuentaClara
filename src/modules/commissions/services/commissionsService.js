// =============================================================================
// commissionsService.js
// ----------------------
// Cliente HTTP para el módulo /commissions. Mismo patrón que
// assistantsService.js: apiRequest centralizado.
// =============================================================================
import { apiRequest } from '../../../services/apiClient';

const commissionsService = {
  /**
   * Configuración de comisión de cada asistente activo.
   * @returns {Promise<Array<{assistant_id, name, role, is_blocked, commission_type, commission_value}>>}
   */
  getConfigs: async () => {
    return apiRequest('/commissions/config');
  },

  /**
   * Fijar commission_type/commission_value de un asistente.
   * @param {number} assistantId
   * @param {Object} data - {commission_type: 'percentage'|'fixed', commission_value}
   */
  setConfig: async (assistantId, data) => {
    return apiRequest(`/commissions/config/${assistantId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Comisión calculada por asistente en un período, a partir de ventas reales.
   */
  getReport: async (dateFrom, dateTo) => {
    const params = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });
    return apiRequest(`/commissions/report?${params}`);
  },

  /**
   * Registrar un pago de comisión (acción explícita del dueño).
   * @param {Object} data - {assistant_id, period_from, period_to, amount, notes?}
   */
  registerPayment: async (data) => {
    return apiRequest('/commissions/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Historial de pagos de comisión.
   * @param {number|null} assistantId - si viene, acota al historial de ese asistente
   */
  getPayments: async (assistantId = null) => {
    const query = assistantId !== null ? `?assistant_id=${assistantId}` : '';
    return apiRequest(`/commissions/payments${query}`);
  },

  /**
   * Total pagado en comisiones.
   */
  getTotalPaid: async (assistantId = null) => {
    const query = assistantId !== null ? `?assistant_id=${assistantId}` : '';
    return apiRequest(`/commissions/payments/total${query}`);
  },
};

export default commissionsService;
