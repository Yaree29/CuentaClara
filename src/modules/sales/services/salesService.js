import { apiRequest } from '../../../services/apiClient';

const salesService = {
    /**
     * Crear una venta rápida
     * @param {Array} items - Array de items: [{product_id, quantity, unit_price}]
     * @param {string} paymentMethod - 'cash' | 'card' | 'transfer' (ignorado si isCredit)
     * @param {number} invoiceTypeId - ID del tipo de factura (default: 1)
     * @param {string} notes - Notas opcionales de la venta
     * @param {boolean} isCredit - true = venta a fiado (factura queda "pending", sin payment)
     */
    createSale: async (items = [], paymentMethod = 'cash', invoiceTypeId = 1, notes = '', isCredit = false) => {
        return apiRequest('/sales/quick', {
            method: 'POST',
            body: JSON.stringify({
                items: items.length > 0 ? items : [],
                payment_method: paymentMethod,
                invoice_type_id: invoiceTypeId,
                notes: notes || null,
                is_credit: isCredit,
            }),
        });
    },

    /**
     * Obtener reporte de ganancias y gastos
     * @param {string} dateFrom - Fecha inicial (YYYY-MM-DD)
     * @param {string} dateTo - Fecha final (YYYY-MM-DD)
     */
    getProfitsAndExpenses: async (dateFrom, dateTo) => {
        const params = new URLSearchParams({
            date_from: dateFrom,
            date_to: dateTo,
        });

        return apiRequest(`/sales/profits?${params}`, {
            method: 'GET',
        });
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