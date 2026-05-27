import { API_URL } from '../../../config/env';

const loginService = {
  async login(email, password) {
    try {
      // Llamar directamente a FastAPI
      const apiUrl = API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      if (!response.ok) {
        let errorDetail = 'Error al iniciar sesión';
        let errorCode = 'generic_error';
        const errorText = await response.text();
        
        try {
          const errorData = JSON.parse(errorText);
          errorDetail = errorData.detail || errorData.message || errorDetail;
          errorCode = errorData.code || errorCode;
        } catch (e) {
          errorDetail = `Error del servidor: ${errorText.substring(0, 100)}`;
        }

        // Crear error con información adicional
        const error = new Error(errorDetail);
        error.statusCode = response.status;
        error.errorCode = errorCode;
        throw error;
      }

      const userData = await response.json();

      // Retornar datos del usuario y token
      return {
        user: {
          id: userData.user_id || userData.id,
          email: userData.email,
          role: userData.role || 'user',
          business_id: userData.business_id,
          api_token: userData.access_token || userData.token,
        },
        token: userData.access_token || userData.token,
        business: userData.business || null,
      };
    } catch (error) {
      // Asegurar que siempre tengamos un mensaje de error legible
      const errorMsg = error?.message || String(error) || 'Error desconocido en login';
      console.error('Error en login:', errorMsg, 'Status:', error?.statusCode, 'Code:', error?.errorCode);
      throw error;
    }
  },

  async logout() {
    try {
      const apiUrl = API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al cerrar sesión');
      }

      return { success: true };
    } catch (error) {
      const errorMsg = error?.message || String(error) || 'Error al cerrar sesión';
      console.error('Error al cerrar sesión:', errorMsg);
      throw new Error(errorMsg);
    }
  },

  async resetPassword(email) {
    try {
      const apiUrl = API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      if (!response.ok) {
        let errorDetail = 'Error al enviar correo de recuperación';
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          errorDetail = errorData.detail || errorData.message || errorDetail;
        } catch (e) {
          errorDetail = `Error del servidor: ${errorText.substring(0, 100)}`;
        }
        throw new Error(errorDetail);
      }

      return { success: true };
    } catch (error) {
      const errorMsg = error?.message || String(error) || 'Error al resetear contraseña';
      console.error('Error al resetear contraseña:', errorMsg);
      throw new Error(errorMsg);
    }
  },

  async getCurrentUser(token) {
    try {
      const apiUrl = API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      return null;
    }
  },
};

export default loginService;
