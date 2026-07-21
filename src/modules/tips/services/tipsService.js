import { apiRequest } from '../../../services/apiClient';

const tipsService = {
  /**
   * Registrar una propina.
   * @param {Object} data - {amount, distribution_type: 'automatic'|'manual', distributions?: [{assistant_id, amount}]}
   */
  createTip: async (data) => {
    return apiRequest('/tips', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Historial de propinas (más recientes primero).
   */
  getTips: async (limit = 50) => {
    return apiRequest(`/tips?limit=${limit}`);
  },

  /**
   * Total de propinas en un período.
   */
  getSummary: async (dateFrom, dateTo) => {
    const params = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });
    return apiRequest(`/tips/summary?${params}`);
  },

  /**
   * Resumen mensual (12 meses) de un año dado.
   */
  getMonthlySummary: async (year) => {
    return apiRequest(`/tips/summary/monthly?year=${year}`);
  },
};

export default tipsService;
