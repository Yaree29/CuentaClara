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
   * Obtener el horario de ventas configurado.
   * @returns {Promise<{opening_time: string, closing_time: string}|null>} null = sin restricción horaria.
   */
  getSalesSchedule: async () => {
    return apiRequest('/businesses/me/sales-schedule');
  },

  /**
   * Configurar el horario fijo diario de ventas. Enviar ambos campos en
   * null desactiva la restricción horaria (la caja sigue siendo obligatoria).
   * Solo el dueño puede modificarlo (el backend lo exige con require_role).
   * @param {Object} schedule - { opening_time: string|null, closing_time: string|null }
   */
  updateSalesSchedule: async ({ opening_time, closing_time }) => {
    return apiRequest('/businesses/me/sales-schedule', {
      method: 'PUT',
      body: JSON.stringify({ opening_time, closing_time }),
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

  /**
   * Eliminar la cuenta completa del usuario (negocio + datos + auth).
   * Acción irreversible — solo el propietario puede ejecutarla.
   */
  deleteAccount: async () => {
    return apiRequest('/businesses/me/account', { method: 'DELETE' });
  },

  /**
   * Reiniciar historial y transacciones del negocio.
   * Conserva productos, clientes, configuración y usuarios.
   * Acción irreversible — solo el propietario puede ejecutarla.
   */
  deleteData: async () => {
    return apiRequest('/businesses/me/data', { method: 'DELETE' });
  },
};

export default businessService;
