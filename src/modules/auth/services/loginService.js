import { supabase } from '../../../services/supabaseClient';

const getUserContext = async (session) => {
  const authUser = session?.user;
  if (!authUser) return null;

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, business_id, name, email, role, phone, created_at')
    .eq('id', authUser.id)
    .maybeSingle();

  if (profileError || !profile) {
    throw new Error('El perfil de usuario no existe o no se pudo cargar. Supabase: ' + (profileError?.message || 'No encontrado'));
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, plan, ui_mode, phone, address, created_at')
    .eq('id', profile.business_id)
    .single();

  return {
    id: profile.id,
    email: profile.email || authUser.email,
    name: profile.name,
    role: profile.role,
    phone: profile.phone,
    business_id: profile.business_id,
    created_at: profile.created_at,
    business,
    userType: business?.ui_mode === 'advanced' ? 'pyme' : 'informal',
  };
};

const loginService = {
  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      
      if (error) {
        throw new Error(error.message);
      }

      const user = await getUserContext(data.session);

      return {
        user: user,
        token: data.session.access_token,
        business: user.business,
      };
    } catch (error) {
      console.error('Error en login (direct Supabase):', error.message);
      throw error;
    }
  },

  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error al cerrar sesión:', error.message);
      throw new Error(error.message);
    }
  },

  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error al resetear contraseña:', error.message);
      throw new Error(error.message);
    }
  },

  async getCurrentUser(token) {
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data.user) return null;
      return await getUserContext({ user: data.user });
    } catch (error) {
      console.error('Error al obtener usuario actual:', error.message);
      return null;
    }
  },
};

export default loginService;
