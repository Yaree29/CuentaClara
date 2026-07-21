import { apiRequest } from '../../../services/apiClient';

const salesService = {
    /**
     * Crear una venta rápida
     * @param {Array} items - Array de items: [{product_id, quantity, unit_price}]
     * @param {string} paymentMethod - 'cash' | 'card' | 'transfer' (ignorado si isCredit)
     * @param {number} invoiceTypeId - ID del tipo de factura (default: 1)
     * @param {string} notes - Notas opcionales de la venta
     * @param {boolean} isCredit - true = venta a fiado (factura queda "pending", sin payment)
     * @param {number|null} assistantId - id del asistente activo (Modo Asistente), o null si
     *   la registró el dueño directamente
     */
    createSale: async (items = [], paymentMethod = 'cash', invoiceTypeId = 1, notes = '', isCredit = false, assistantId = null) => {
        return apiRequest('/sales/quick', {
            method: 'POST',
            body: JSON.stringify({
                items: items.length > 0 ? items : [],
                payment_method: paymentMethod,
                invoice_type_id: invoiceTypeId,
                notes: notes || null,
                is_credit: isCredit,
                assistant_id: assistantId,
            }),
        });
    },

    /**
     * Obtener reporte de ganancias y gastos
     * @param {string} dateFrom - Fecha inicial (YYYY-MM-DD)
     * @param {string} dateTo - Fecha final (YYYY-MM-DD)
     * @param {number|null} assistantId - si viene, acota el resumen a las ventas de
     *   ese asistente (Modo Asistente) en vez de todo el negocio
     */
    getProfitsAndExpenses: async (dateFrom, dateTo, assistantId = null) => {
        const params = new URLSearchParams({
            date_from: dateFrom,
            date_to: dateTo,
        });
        if (assistantId !== null && assistantId !== undefined) {
            params.append('assistant_id', assistantId);
        }

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