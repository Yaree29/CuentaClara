// =============================================================================
// MODIFICADO: 2026-05-20
// Propósito: Servicio de registro de nuevos usuarios y negocios. Todas las
//            peticiones van a la API FastAPI — sin contacto directo con Supabase.
// Cambios:
//   - Se añadió getTemplates() para cargar las plantillas de industria desde
//     GET /auth/templates (usadas en el combobox del paso 3 PYME).
//   - register(): ahora destructura y envía el campo `address` al backend
//     para que se guarde en businesses.address.
//   - register(): después de crear el usuario en el backend, guarda el token
//     en AsyncStorage y hace fetch paralelo de /auth/me y /auth/context para
//     retornar el perfil completo con enabled_modules y userType, igual que
//     el flujo de login. Esto evita que el usuario llegue a la app con perfil vacío.
// =============================================================================
// Sin imports de Supabase — el registro pasa completamente por la API.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../../config/env';

const TOKEN_KEY = 'cc_access_token';

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

  // Plantillas de industria para el paso 3 del registro PYME
  getTemplates: async () => {
    return apiRequest('/auth/templates');
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
      industryTemplateId,
      address,
      nit,
      logoUrl,
      settings,
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
        category_id: categoryId || null,
        industry_template_id: industryTemplateId || null, // null = informal, usa módulos por defecto
        ui_mode: uiMode,
        address: address && address.trim() ? address.trim() : null,
        tax_id: nit || form.taxId || null,
        logo_url: logoUrl || null,
        settings: settings || {},
      }),
    });

    // Guardar token antes de las siguientes llamadas autenticadas
    await AsyncStorage.setItem(TOKEN_KEY, data.access_token);

    // Igual que login: cargar perfil completo + contexto para que
    // AuthProvider tenga enabled_modules y userType desde el primer render
    const [profile, context] = await Promise.all([
      apiRequest('/auth/me', {}, data.access_token),
      apiRequest('/auth/context', {}, data.access_token),
    ]);

    return {
      user: { ...profile, ...context, api_token: data.access_token },
      token: data.access_token,
      session: null,
    };
  },
};

export default registerService;
