// =============================================================================
// assistantsService.js
// --------------------
// Cliente HTTP para el (Modo Asistente). Mismo patrón que
// businessService.js: apiRequest centralizado, el business_id se extrae del
// JWT del dueño en el backend (nunca se pasa manualmente desde aquí).
// =============================================================================
import { apiRequest } from '../../../services/apiClient';

const assistantsService = {
  /**
   * Crear un asistente nuevo (máx. 3 activos por negocio).
   * @param {Object} data - {name, pin, access_type: 'sales'|'inventory'|'both'}
   */
  createAssistant: async (data) => {
    return apiRequest('/assistants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Listar todos los asistentes (incluye bloqueados) — para la pantalla "Equipo".
   */
  getAssistants: async () => {
    return apiRequest('/assistants');
  },

  /**
   * Listar solo asistentes activos (id, name, access_type) — para el selector
   * de entrada al Modo Asistente. Nunca expone pin_hash/pin_salt.
   */
  getActiveAssistants: async () => {
    return apiRequest('/assistants/active');
  },

  /**
   * Editar un asistente: nombre, tipo de acceso, bloquear/desbloquear o
   * regenerar PIN. Solo se envían los campos que cambian.
   * @param {number} assistantId
   * @param {Object} data - {name?, access_type?, is_blocked?, new_pin?}
   */
  updateAssistant: async (assistantId, data) => {
    return apiRequest(`/assistants/${assistantId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Verificar el PIN al entrar al Modo Asistente.
   * @returns {Promise<{id, name, access_type}>}
   */
  verifyPin: async (assistantId, pin) => {
    return apiRequest(`/assistants/${assistantId}/verify-pin`, {
      method: 'POST',
      body: JSON.stringify({ pin }),
    });
  },

  /**
   * Estado liviano del asistente (para el polling que detecta bloqueo).
   * @returns {Promise<{id, is_blocked}>}
   */
  getStatus: async (assistantId) => {
    return apiRequest(`/assistants/${assistantId}/status`);
  },

  /**
   * Eliminar un asistente. El backend rechaza el borrado (400) si el
   * asistente ya tiene ventas registradas (invoices.assistant_id lo
   * referencia) — en ese caso hay que bloquearlo en vez de eliminarlo.
   */
  deleteAssistant: async (assistantId) => {
    return apiRequest(`/assistants/${assistantId}`, {
      method: 'DELETE',
    });
  },
};

export default assistantsService;
