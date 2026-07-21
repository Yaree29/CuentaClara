// =============================================================================
// MODIFICADO: 2026-06-03
// Propósito: Reemplazo de la implementación original que llamaba a endpoints
//            /businesses/${businessId} y /businesses/${businessId}/config que
//            NO EXISTÍAN en el backend (404 permanente).
//
// Cambios:
//   - Ahora usa /businesses/me y /businesses/me/config — endpoints creados en
//     backend/app/routers/businesses.py. El business_id se extrae del JWT en
//     el servidor, evitando que el frontend maneje IDs sensibles.
//   - Se reemplazó el apiRequest inline repetido por el apiClient centralizado.
// =============================================================================
import { apiRequest } from './apiClient';

const businessService = {
  /**
   * Obtener información del negocio actual
   */
  getBusinessInfo: async () => {
    return apiRequest('/businesses/me');
  },

  /**
   * Actualizar información del negocio
   * @param {Object} data - Datos a actualizar: {name, phone, address, ui_mode}
   *   ui_mode solo acepta la transición 'simple' -> 'advanced' (el backend
   *   rechaza cualquier otro valor u orden, ver business_service.py).
   */
  updateBusinessInfo: async (data) => {
    return apiRequest('/businesses/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Obtener configuración del negocio
   */
  getBusinessConfig: async () => {
    return apiRequest('/businesses/me/config');
  },

  /**
   * Actualizar configuración del negocio
   * @param {Object} config - Configuración: {currency, weight_unit, tax_rate, ...}
   */
  updateBusinessConfig: async (config) => {
    return apiRequest('/businesses/me/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  },

  /**
   * Activar/desactivar un módulo opcional (ej. 'commissions', 'tips', 'offers').
   * Devuelve { enabled_modules } actualizado para refrescar el blueprint local
   * sin necesitar un nuevo login.
   * @param {string} module
   * @param {boolean} enabled
   */
  setModuleActive: async (module, enabled = true) => {
    return apiRequest('/businesses/me/modules', {
      method: 'PUT',
      body: JSON.stringify({ module, enabled }),
    });
  },
};

export default businessService;
