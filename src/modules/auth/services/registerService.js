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
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      throw signUpError;
    }

    // Ensure we have a session/user; if not, try sign in to obtain session
    let user = signUpData?.user ?? null;
    let session = signUpData?.session ?? null;

    // If signUp did not provide a session, attempt signIn to get credentials
    if (!session) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        // If sign in fails because email confirmation is required, return a helpful error
        throw signInError;
      }
      user = signInData?.user ?? user;
      session = signInData?.session ?? session;
    }

    if (!user) throw new Error('No se pudo crear o iniciar sesión con el usuario');

    const userId = user.id;

    // 2) Crear business
    // Encontrar industry_template_id por category si existe (buscar template por nombre igual a categoría)
    let industryTemplate = null;
    if (categoryId) {
      const { data: cat } = await supabase.from('categories').select('id, name').eq('id', categoryId).single();
      if (cat) {
        const { data: tmpl } = await supabase.from('industry_templates').select('id').ilike('name', cat.name).limit(1).single();
        industryTemplate = tmpl ?? null;
      }
    }

    const ui_mode = mapProfileTypeToUiMode(profileType);

    let { data: business, error: businessError } = await supabase
      .from('businesses')
      .insert({
        name: businessName,
        category_id: categoryId || null,
        industry_template_id: industryTemplate?.id || null,
        ui_mode,
        phone,
        address: address || null,
      })
      .select()
      .single();

    if (businessError) {
      // Detect permission denied and provide clearer actionable hint
      if (businessError?.code === '42501') {
        businessError.message = `${businessError.message} - Verifica GRANTs para 'businesses' o que el usuario tenga sesión activa.`;
      }
      throw businessError;
    }

    // 3) Crear business_configs
    const { error: cfgError } = await supabase.from('business_configs').insert({
      business_id: business.id,
      currency: 'USD',
      weight_unit: 'kg',
      tax_rate: 0,
    });
    if (cfgError) throw cfgError;

    // 4) Crear user en public.users (perfil)
    const fullName = `${name}${lastName ? ' ' + lastName : ''}`;

    const { data: profileRow, error: profileError } = await supabase
      .from('users')
      .insert({
        id: userId,
        business_id: business.id,
        name: fullName,
        email,
        role: 'owner',
        phone: phone || null,
      })
      .select()
      .single();

    if (profileError) throw profileError;

    // 5) Activar features desde template
    if (industryTemplate) {
      const { data: templateData, error: tmplErr } = await supabase
        .from('industry_templates')
        .select('default_modules')
        .eq('id', industryTemplate.id)
        .single();

      if (tmplErr) throw tmplErr;

      const modules = templateData?.default_modules ?? [];
      if (Array.isArray(modules) && modules.length) {
        const inserts = modules.map((m) => ({ business_id: business.id, module: m, is_active: true }));
        const { error: featuresErr } = await supabase.from('features').insert(inserts);
        if (featuresErr) throw featuresErr;
      }
    }

    // 6) If we have a session, return full user context using authService
    try {
      const currentSession = await authService.getCurrentSession();
      if (currentSession) return currentSession;
    } catch (e) {
      // ignore
    }

    // Fallback: return created profile and business
    return { user: profileRow, business, token: session?.access_token || null };
  },
};

export default registerService;
