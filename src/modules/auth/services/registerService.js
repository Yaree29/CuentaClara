// Sin imports de Supabase — el registro pasa completamente por la API.
import { API_URL } from '../../../config/env';

const baseUrl = () => API_URL || 'https://cuentaclara-api.onrender.com';

const apiRequest = async (path, options = {}, token = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${baseUrl()}${path}`, { ...options, headers });

  if (!response.ok) {
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      throw new Error(data.detail || 'Error al registrar');
    } catch (e) {
      if (e.message !== 'Error al registrar' && !e.message.startsWith('Error del servidor:')) {
        throw new Error(`Error del servidor: ${text.substring(0, 150)}`);
      }
      throw e;
    }
  }

  return response.json();
};

const registerService = {
  getCategories: async () => {
    return apiRequest('/auth/categories');
  },

  register: async (form) => {
    const {
      name,
      lastName,
      email,
      password,
      phone,
      businessName,
      profileType,
      categoryId,
    } = form;

    if (!email || !password || !businessName || !name) {
      throw new Error('Faltan campos requeridos');
    }

    const fullName = `${name}${lastName ? ' ' + lastName : ''}`;
    // "empresa" → ui_mode "advanced" (pyme con pantallas completas)
    // cualquier otro → ui_mode "simple" (flujo rápido para informales)
    const uiMode = profileType === 'empresa' ? 'advanced' : 'simple';

    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        business_name: businessName,
        name: fullName,
        email,
        password,
        phone: phone || null,
        category_id: categoryId || null, // null = sin categoría, se usan módulos por defecto
        ui_mode: uiMode,
      }),
    });

    return {
      user: {
        id: data.user_id,
        role: data.role,
        business_id: data.business_id,
        api_token: data.access_token,
      },
      token: data.access_token,
      session: null,
    };
  },
};

export default registerService;
