// =============================================================================
// registerService.js — Registro de negocio + usuario.
// =============================================================================
// El registro se crea en FastAPI (rollback atómico + dependencia circular
// negocio↔usuario). La SESIÓN resultante se entrega al SDK de Supabase
// (setSession) para que a partir de ahí la gestione y auto-refresque igual que
// en el login. Las peticiones HTTP reutilizan apiRequestPublic (apiClient).
// =============================================================================
import { supabase } from '../../../services/supabaseClient';
import { apiRequestPublic } from '../../../services/apiClient';

const registerService = {
  getCategories: async () => {
    return apiRequestPublic('/auth/categories');
  },

  // Plantillas de industria para el paso 3 del registro PYME — determinan
  // industry_template_id (y por lo tanto category_group / flags de
  // inventario en el backend). No confundir con getCategories(), que lee
  // la tabla genérica `categories`, sin relación con category_group.
  getTemplates: async () => {
    return apiRequestPublic('/auth/templates');
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
      logoBase64,
      settings,
      businessType,
      avgPrice,
      taxEnabled,
    } = form;

    if (!email || !password || !businessName || !name) {
      throw new Error('Faltan campos requeridos');
    }

    const fullName = `${name}${lastName ? ' ' + lastName : ''}`;
    // "empresa" → ui_mode "advanced" (pyme con pantallas completas)
    // cualquier otro → ui_mode "simple" (flujo rápido para informales)
    const uiMode = profileType === 'empresa' ? 'advanced' : 'simple';
    const isInformal = profileType !== 'empresa';

    // Datos del paso "emprendedor" (qué vendes / precio promedio) se guardan
    // en settings junto a la metadata de onboarding — no tienen columna propia.
    const mergedSettings = {
      ...(settings || {}),
      ...(isInformal
        ? {
            business_type: businessType || null,
            avg_price: avgPrice ? Number(avgPrice) : null,
          }
        : {}),
    };

    const data = await apiRequestPublic('/auth/register', {
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
        tax_id: nit || null,
        logo_base64: logoBase64 || null,
        settings: mergedSettings,
        tax_enabled: !!taxEnabled,
      }),
    });

    // Entregar la sesión al SDK: de aquí en adelante Supabase gestiona y
    // auto-refresca el token (igual que en el login por SDK).
    await supabase.auth.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });

    // Igual que login: cargar perfil completo + contexto para que
    // AuthProvider tenga enabled_modules y userType desde el primer render
    const [profile, context] = await Promise.all([
      apiRequestPublic('/auth/me', {}, data.access_token),
      apiRequestPublic('/auth/context', {}, data.access_token),
    ]);

    return {
      user: { ...profile, ...context, api_token: data.access_token },
      token: data.access_token,
    };
  },
};

export default registerService;
