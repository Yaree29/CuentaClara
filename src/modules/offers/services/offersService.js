import { apiRequest } from '../../../services/apiClient';

const offersService = {
  /**
   * Listar promociones, con status derivado: 'active' | 'scheduled' | 'expired'.
   */
  getPromotions: async () => {
    return apiRequest('/offers');
  },

  /**
   * Crear promoción.
   * @param {Object} data - {scope: 'product'|'category', product_id?, category_id?,
   *   discount_type: 'percentage'|'fixed', discount_value, start_date, end_date}
   */
  createPromotion: async (data) => {
    return apiRequest('/offers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Editar promoción (patch parcial).
   */
  updatePromotion: async (promotionId, data) => {
    return apiRequest(`/offers/${promotionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Eliminar promoción.
   */
  deletePromotion: async (promotionId) => {
    return apiRequest(`/offers/${promotionId}`, {
      method: 'DELETE',
    });
  },
};

export default offersService;
