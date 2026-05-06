import { API_URL } from '../../../config/env';
import useAuthStore from '../../../store/useAuthStore';

const businessService = {
    /**
     * Obtener información del negocio actual
     */
    getBusinessInfo: async () => {
        const token = useAuthStore.getState().token;
        const apiToken = useAuthStore.getState().user?.api_token;
        const authToken = apiToken || token;
        const businessId = useAuthStore.getState().user?.business_id;

        if (!authToken || !businessId) {
            throw new Error('No hay sesión activa o no hay negocio asociado.');
        }

        const apiUrl = API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/businesses/${businessId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            let errorDetail = 'Error al obtener información del negocio';
            const errorText = await response.text();
            try {
                const errorData = JSON.parse(errorText);
                errorDetail = errorData.detail || errorDetail;
            } catch (e) {
                errorDetail = `Error del servidor: ${errorText.substring(0, 100)}`;
            }
            throw new Error(errorDetail);
        }

        return response.json();
    },

    /**
     * Actualizar información del negocio
     * @param {Object} data - Datos a actualizar: {name, phone, address, tax_rate, etc}
     */
    updateBusinessInfo: async (data) => {
        const token = useAuthStore.getState().token;
        const apiToken = useAuthStore.getState().user?.api_token;
        const authToken = apiToken || token;
        const businessId = useAuthStore.getState().user?.business_id;

        if (!authToken || !businessId) {
            throw new Error('No hay sesión activa o no hay negocio asociado.');
        }

        const apiUrl = API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/businesses/${businessId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            let errorDetail = 'Error al actualizar el negocio';
            const errorText = await response.text();
            try {
                const errorData = JSON.parse(errorText);
                errorDetail = errorData.detail || errorDetail;
            } catch (e) {
                errorDetail = `Error del servidor: ${errorText.substring(0, 100)}`;
            }
            throw new Error(errorDetail);
        }

        return response.json();
    },

    /**
     * Obtener configuración del negocio
     */
    getBusinessConfig: async () => {
        const token = useAuthStore.getState().token;
        const apiToken = useAuthStore.getState().user?.api_token;
        const authToken = apiToken || token;
        const businessId = useAuthStore.getState().user?.business_id;

        if (!authToken || !businessId) {
            throw new Error('No hay sesión activa o no hay negocio asociado.');
        }

        const apiUrl = API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/businesses/${businessId}/config`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            let errorDetail = 'Error al obtener configuración del negocio';
            const errorText = await response.text();
            try {
                const errorData = JSON.parse(errorText);
                errorDetail = errorData.detail || errorDetail;
            } catch (e) {
                errorDetail = `Error del servidor: ${errorText.substring(0, 100)}`;
            }
            throw new Error(errorDetail);
        }

        return response.json();
    },

    /**
     * Actualizar configuración del negocio
     * @param {Object} config - Configuración a actualizar
     */
    updateBusinessConfig: async (config) => {
        const token = useAuthStore.getState().token;
        const apiToken = useAuthStore.getState().user?.api_token;
        const authToken = apiToken || token;
        const businessId = useAuthStore.getState().user?.business_id;

        if (!authToken || !businessId) {
            throw new Error('No hay sesión activa o no hay negocio asociado.');
        }

        const apiUrl = API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/businesses/${businessId}/config`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(config),
        });

        if (!response.ok) {
            let errorDetail = 'Error al actualizar configuración';
            const errorText = await response.text();
            try {
                const errorData = JSON.parse(errorText);
                errorDetail = errorData.detail || errorDetail;
            } catch (e) {
                errorDetail = `Error del servidor: ${errorText.substring(0, 100)}`;
            }
            throw new Error(errorDetail);
        }

        return response.json();
    },
};

export default businessService;
