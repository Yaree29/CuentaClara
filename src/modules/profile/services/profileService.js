import { apiRequest } from '../../../services/apiClient';

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
      userType: user.userType,
      businessName: user.business?.name || 'Sin negocio',
      joinedDate: formatDate(user.created_at || user.business?.created_at),
      preferences: {
        currency: 'USD',
      },
    };
  },

  // Borra todos los datos transaccionales del negocio (ventas, fiados,
  // inventario, gastos). La cuenta y su configuración quedan intactas.
  deleteAllData: async () => {
    return apiRequest('/businesses/me/data', { method: 'DELETE' });
  },
};

export default profileService;
