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
      if (signUpError.message.includes('already registered') || signUpError.message.includes('already exists')) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signUpError;
        user = signInData?.user;
        session = signInData?.session;
      } else {
        throw signUpError;
      }
    } else {
      user = signUpData?.user ?? null;
      session = signUpData?.session ?? null;

      if (!session) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        user = signInData?.user ?? user;
        session = signInData?.session ?? session;
      }
    }

    if (!user) throw new Error('No se pudo crear o iniciar sesión con el usuario');

    const userId = user.id;

    // 2) Encontrar industry_template_id por category si existe
    let industryTemplateId = 1;
    if (categoryId) {
      const { data: cat } = await supabase.from('categories').select('id, name').eq('id', categoryId).single();
      if (cat) {
        const { data: tmpl } = await supabase.from('industry_templates').select('id').ilike('name', cat.name).limit(1).single();
        industryTemplateId = tmpl?.id ?? 1;
      }
    }

    const fullName = `${name}${lastName ? ' ' + lastName : ''}`;
    const uiMode = mapProfileTypeToUiMode(profileType);

    // 3) Crear Negocio en Supabase
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .insert({
        name: businessName,
        plan: 'free',
        ui_mode: uiMode,
        industry_template_id: industryTemplateId,
        category_id: categoryId || null,
        address: address || null,
      })
      .select('id')
      .single();

    if (businessError) {
        console.error("Error creando negocio:", businessError);
        throw new Error('Error al registrar el negocio');
    }

    const businessId = business.id;

    // 4) Crear Perfil de Usuario en Supabase
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        business_id: businessId,
        name: fullName,
        email: email,
        password_hash: 'supabase_auth',
        role: 'owner',
        phone: phone || null,
      });

    if (userError) {
        console.error("Error creando perfil:", userError);
        throw new Error('Error al crear el perfil de usuario');
    }

    // 5) Configuración del negocio y features
    await supabase.from('business_configs').insert({
      business_id: businessId,
      currency: 'USD',
      weight_unit: 'kg',
      tax_rate: 7.00,
      language: 'es'
    });

    // Activar módulos base (simulación de lo que hacía el backend)
    const baseModules = ['sales', 'credit', 'inventory'];
    for (const module of baseModules) {
        await supabase.from('features').insert({
            business_id: businessId,
            module: module,
            is_active: true,
        });
    }

    // 6) Retornar sesión
    return { 
      user: { id: userId, role: 'owner', business_id: businessId }, 
      business: { id: businessId }, 
      token: session?.access_token 
    };
  },
};

export default registerService;