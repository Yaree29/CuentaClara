// =============================================================================
// expensesService.js
// ------------------
// Cliente HTTP para el módulo /expenses (registro real de gastos,
// opcionalmente vinculados a una sesión de caja).
// =============================================================================
import { apiRequest } from '../../../services/apiClient';

const expensesService = {
  /**
   * Registrar un gasto real.
   * @param {Object} data - { amount, description?, cashSessionId? }
   */
  createExpense: async ({ amount, description, cashSessionId } = {}) => {
    return apiRequest('/expenses', {
      method: 'POST',
      body: JSON.stringify({
        amount: Number(amount),
        description: description || null,
        cash_session_id: cashSessionId ?? null,
      }),
    });
  },

  /**
   * Listar gastos, filtrable por fecha y/o por sesión de caja.
   * @param {Object} params - { dateFrom?, dateTo?, cashSessionId?, limit? }
   */
  getExpenses: async ({ dateFrom, dateTo, cashSessionId, limit = 100 } = {}) => {
    const params = new URLSearchParams();
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    if (cashSessionId != null) params.set('cash_session_id', cashSessionId);
    if (limit) params.set('limit', String(limit));

    const query = params.toString();
    return apiRequest(`/expenses${query ? '?' + query : ''}`);
  },
};

export default expensesService;
