// =============================================================================
// apiClient.js — Cliente HTTP centralizado para la API de FastAPI
// =============================================================================
// Propósito: Reemplazar las 5+ copias de apiRequest() esparcidas en los
//            servicios de cada módulo por un único helper compartido.
//
// Uso:
//   import { apiRequest, getAuthToken } from '../../services/apiClient';
//   const data = await apiRequest('/inventory/products');
//   const data = await apiRequest('/sales/quick', { method: 'POST', body: ... });
//
// Para endpoints que NO requieren auth (login/register):
//   import { apiRequestPublic } from '../../services/apiClient';
//   const data = await apiRequestPublic('/auth/login', { method: 'POST', body: ... });
//   // o pasando un token explícito:
//   const data = await apiRequestPublic('/auth/me', {}, myToken);
// =============================================================================
import { API_URL } from '../config/env';
import useAuthStore from '../store/useAuthStore';

const baseUrl = () => API_URL || 'http://localhost:8000';

/**
 * Resuelve el token JWT desde el store de Zustand.
 * Prioriza api_token (set during registro/login) sobre el token de sesión.
 */
export const getAuthToken = () => {
  const token = useAuthStore.getState().token;
  const apiToken = useAuthStore.getState().user?.api_token;
  return apiToken || token;
};

/**
 * Parsea la respuesta de error de la API y lanza un Error descriptivo.
 */
const parseErrorResponse = async (response) => {
  const text = await response.text();
  try {
    const data = JSON.parse(text);
    throw new Error(data.detail || 'Error en la solicitud');
  } catch (e) {
    if (
      e.message !== 'Error en la solicitud' &&
      !e.message.startsWith('Error del servidor:')
    ) {
      throw new Error(`Error del servidor: ${text.substring(0, 150)}`);
    }
    throw e;
  }
};

/**
 * Realiza una petición autenticada a la API de FastAPI.
 * Lanza un error si no hay token activo.
 *
 * @param {string} path  — ruta relativa (ej. '/inventory/products')
 * @param {object} options — opciones de fetch (method, body, headers, etc.)
 * @returns {Promise<any>} — JSON parseado de la respuesta
 */
export const apiRequest = async (path, options = {}) => {
  const authToken = getAuthToken();
  if (!authToken) {
    throw new Error('No hay sesión activa. Por favor inicia sesión nuevamente.');
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`,
    ...(options.headers || {}),
  };

  const response = await fetch(`${baseUrl()}${path}`, { ...options, headers });

  if (!response.ok) {
    await parseErrorResponse(response);
  }

  // Manejar respuestas sin cuerpo (204 No Content, etc.)
  const raw = await response.text();
  return raw ? JSON.parse(raw) : null;
};

/**
 * Realiza una petición pública (sin token del store) o con un token explícito.
 * Útil para login, register y llamadas post-login donde el token aún no está
 * en el store.
 *
 * @param {string} path    — ruta relativa
 * @param {object} options — opciones de fetch
 * @param {string|null} token — token JWT explícito (opcional)
 * @returns {Promise<any>} — JSON parseado de la respuesta
 */
export const apiRequestPublic = async (path, options = {}, token = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${baseUrl()}${path}`, { ...options, headers });

  if (!response.ok) {
    await parseErrorResponse(response);
  }

  const raw = await response.text();
  return raw ? JSON.parse(raw) : null;
};

export default apiRequest;
