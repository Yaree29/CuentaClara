import { supabase } from '../../../../src/services/supabaseClient';
import authService from './authService';

const mapProfileTypeToUiMode = (profileType) => {
  return profileType === 'empresa' ? 'advanced' : 'simple';
};

const registerService = {
  async getCategories() {
    const { data, error } = await supabase.from('categories').select('id, name').order('id');
    if (error) throw error;
    return data;
  },

  async register(form) {
    // form: { name, lastName, email, password, phone, businessName, profileType, categoryId, nit, address, ... }
    const {
      name,
      lastName,
      email,
      password,
      phone,
      businessName,
      profileType,
      categoryId,
      nit,
      address,
    } = form;

    if (!email || !password || !businessName || !name) {
      throw new Error('Faltan campos requeridos');
    }

    // 1) Crear usuario en Supabase Auth
    let user = null;
    let session = null;

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      // Si el usuario ya existe por un intento fallido anterior, intentamos iniciar sesión para continuar el flujo
      if (signUpError.message.includes('already registered') || signUpError.message.includes('already exists')) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          // Si la contraseña es incorrecta o hay otro error, lanzamos el error original
          throw signUpError;
        }
        user = signInData?.user;
        session = signInData?.session;
      } else {
        throw signUpError;
      }
    } else {
      user = signUpData?.user ?? null;
      session = signUpData?.session ?? null;

      // Si signUp no devuelve sesión (ej. requiere confirmación), intentamos signIn
      if (!session) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          throw signInError;
        }
        user = signInData?.user ?? user;
        session = signInData?.session ?? session;
      }
    }

    if (!user) throw new Error('No se pudo crear o iniciar sesión con el usuario');

    const userId = user.id;

    // 2) Encontrar industry_template_id por category si existe
    let industryTemplateId = 1; // Default to 1 to prevent Render backend crash on null
    if (categoryId) {
      const { data: cat } = await supabase.from('categories').select('id, name').eq('id', categoryId).single();
      if (cat) {
        const { data: tmpl } = await supabase.from('industry_templates').select('id').ilike('name', cat.name).limit(1).single();
        industryTemplateId = tmpl?.id ?? 1;
      }
    }

    const fullName = `${name}${lastName ? ' ' + lastName : ''}`;

    // 3) Llamar a la API del backend para registrar el negocio y perfil
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
    
    const response = await fetch(`${apiUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        business_name: businessName,
        name: fullName,
        email: email,
        password: password, // El backend lo necesita, aunque ya estés en auth
        phone: phone || null,
        industry_template_id: industryTemplateId,
        auth_user_id: userId,
      }),
    });

    if (!response.ok) {
      let errorDetail = 'Error al registrar el negocio en el backend';
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        errorDetail = errorData.detail || errorDetail;
      } catch (e) {
        // If the server didn't return JSON (e.g. a plain text 500 error)
        errorDetail = `Error del servidor: ${errorText.substring(0, 100)}`;
      }
      throw new Error(errorDetail);
    }

    const apiData = await response.json();

    // 4) Refrescar la sesión o usar authService para obtener el contexto completo
    try {
      const currentSession = await authService.getCurrentSession();
      if (currentSession) return currentSession;
    } catch (e) {
      // ignore
    }

    // Si falló getCurrentSession, retornar los datos básicos que devuelve el API
    return { 
      user: { id: apiData.user_id, role: apiData.role, business_id: apiData.business_id }, 
      business: { id: apiData.business_id }, 
      token: session?.access_token || apiData.access_token 
    };
  },
};

export default registerService;
