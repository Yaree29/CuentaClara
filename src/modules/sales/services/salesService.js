import { API_URL } from '../../../config/env';
import useAuthStore from '../../../store/useAuthStore';

const salesService = {
    /**
     * Crear una venta rápida
     * @param {Array} items - Array de items: [{product_id, quantity, unit_price}]
     * @param {string} paymentMethod - 'cash' | 'card' | 'transfer'
     * @param {number} invoiceTypeId - ID del tipo de factura (default: 1)
     * @param {string} notes - Notas opcionales de la venta
     */
    createSale: async (items = [], paymentMethod = 'cash', invoiceTypeId = 1, notes = '') => {
        const token = useAuthStore.getState().token;
        const apiToken = useAuthStore.getState().user?.api_token;
        const authToken = apiToken || token;

        if (!authToken) {
            throw new Error('No hay sesión activa. Por favor inicia sesión nuevamente.');
        }

        const apiUrl = API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/sales/quick`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                items: items.length > 0 ? items : [],
                payment_method: paymentMethod,
                invoice_type_id: invoiceTypeId,
                notes: notes || null,
            }),
        });

        if (!response.ok) {
            let errorDetail = 'Error al registrar la venta';
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
     * Obtener reporte de ganancias y gastos
     * @param {string} dateFrom - Fecha inicial (YYYY-MM-DD)
     * @param {string} dateTo - Fecha final (YYYY-MM-DD)
     */
    getProfitsAndExpenses: async (dateFrom, dateTo) => {
        const token = useAuthStore.getState().token;
        const apiToken = useAuthStore.getState().user?.api_token;
        const authToken = apiToken || token;

        if (!authToken) {
            throw new Error('No hay sesión activa. Por favor inicia sesión nuevamente.');
        }

        const apiUrl = API_URL || 'http://localhost:8000';
        const params = new URLSearchParams({
            date_from: dateFrom,
            date_to: dateTo,
        });

        const response = await fetch(`${apiUrl}/sales/profits?${params}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            let errorDetail = 'Error al obtener el reporte de ganancias';
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
     * Obtener ventas recientes (para compatibilidad con hook anterior)
     */
    getRecentSales: async () => {
        // Retorna últimas 24 horas
        const today = new Date();
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        
        const dateFrom = yesterday.toISOString().split('T')[0];
        const dateTo = today.toISOString().split('T')[0];

        try {
            const data = await salesService.getProfitsAndExpenses(dateFrom, dateTo);
            return {
                period: data.period,
                income: data.income,
                expenses: data.expenses,
                profit: data.profit,
                invoices_count: data.invoices_count,
            };
        } catch (error) {
            console.error('Error fetching recent sales:', error);
            // Retornar datos vacíos en caso de error
            return {
                period: { from: dateFrom, to: dateTo },
                income: 0,
                expenses: 0,
                profit: 0,
                invoices_count: 0,
            };
        }
    },
};

export default salesService;