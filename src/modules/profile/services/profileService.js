const formatDate = (value) => {
  if (!value) return 'No disponible';

  return new Intl.DateTimeFormat('es-PA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
};

const profileService = {
  getUserProfile: async (user) => {
    if (!user) {
      return null;
    }

    return {
      name: user.name,
      email: user.email,
      role: user.role,
      businessName: user.business?.name || 'Sin negocio',
      joinedDate: formatDate(user.created_at || user.business?.created_at),
      preferences: {
        currency: 'USD',
      },
    };
  },
};

export default profileService;
