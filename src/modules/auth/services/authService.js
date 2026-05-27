import users from '../../../data/users';

const authService = {

  login: async (email, password) => {

    // SUPABASE DESACTIVADO
    // const { data, error } = await supabase.auth.signInWithPassword()

    const foundUser = users.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password
    );

    if (!foundUser) {
      throw new Error('Correo o contraseña incorrectos');
    }

    return {
      user: foundUser,
      token: 'local-token',
      session: {
        access_token: 'local-token',
      },
    };
  },

  resetPassword: async (email) => {

    const userExists = users.some(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!userExists) {
      throw new Error('El correo no existe');
    }

    return true;
  },

  logout: async () => {
    return true;
  },

  clearLocalSession: async () => {
    return true;
  },

  getCurrentSession: async () => {
    return null;
  },

  getUserContext: async () => {
    return null;
  },

  onAuthStateChange: (callback) => {
    return {
      unsubscribe: () => {},
    };
  },
};

export default authService;
