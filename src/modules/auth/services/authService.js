import { supabase } from '../../../services/supabaseClient';

const BASE_MODULES = ['dashboard', 'profile'];

const normalizeModules = (features = []) => {
  const enabledModules = new Set(BASE_MODULES);

  features
    .filter((feature) => feature.is_active)
    .forEach((feature) => {
      const moduleName = feature.module;

      if (moduleName === 'inventory') enabledModules.add('inventory');
      if (moduleName === 'sales') enabledModules.add('sales');
      if (moduleName === 'credit') enabledModules.add('credit');
      if (moduleName === 'billing') enabledModules.add('billing');
    });

  return Array.from(enabledModules);
};

const getUserContext = async (session) => {
  const authUser = session?.user;

  if (!authUser) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, business_id, name, email, role, phone, created_at')
    .eq('id', authUser.id)
    .single();

  if (profileError) {
    throw new Error(
      `No se pudo cargar el perfil del usuario (${authUser.id}, ${authUser.email}). Supabase: ${profileError.code || 'sin_codigo'} - ${profileError.message}`
    );
  }

  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('id, name, plan, ui_mode, phone, address, created_at')
    .eq('id', profile.business_id)
    .single();

  if (businessError) {
    throw new Error('No se pudo cargar el negocio asociado al usuario.');
  }

  const { data: features, error: featuresError } = await supabase
    .from('features')
    .select('id, module, is_active')
    .eq('business_id', profile.business_id)
    .eq('is_active', true);

  if (featuresError) {
    throw new Error('No se pudieron cargar los modulos activos del negocio.');
  }

  return {
    id: profile.id,
    email: profile.email || authUser.email,
    name: profile.name,
    role: profile.role,
    phone: profile.phone,
    business_id: profile.business_id,
    created_at: profile.created_at,
    business,
    features: features || [],
    enabled_modules: normalizeModules(features || []),
    userType: business?.ui_mode === 'advanced' ? 'pyme' : 'informal',
  };
};

const authService = {
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    const user = await getUserContext(data.session);

    return {
      user,
      token: data.session?.access_token,
      session: data.session,
    };
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    return true;
  },

  clearLocalSession: async () => {
    await supabase.auth.signOut({ scope: 'local' });
  },

  getCurrentSession: async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      return null;
    }

    const user = await getUserContext(data.session);

    return {
      user,
      token: data.session.access_token,
      session: data.session,
    };
  },

  getUserContext,

  onAuthStateChange: (callback) => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(callback);

    return subscription;
  },
};

export default authService;
