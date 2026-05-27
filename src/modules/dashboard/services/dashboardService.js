import { supabase } from '../../../services/supabaseClient';

const dashboardService = {
    getMetrics: async(businessId) => {
        if (!businessId) {
            return {
                salesToday: 0,
                debtTotal: 0,
                debtCustomersCount: 0,
            };
        }

        try {
            // 1. Ventas del Día (Facturas pagadas creadas hoy)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayIso = today.toISOString();

            const { data: salesData, error: salesError } = await supabase
                .from('invoices')
                .select('total')
                .eq('business_id', businessId)
                .eq('status', 'paid')
                .gte('created_at', todayIso);

            if (salesError) throw salesError;

            const salesToday = salesData.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);

            // 2. Por Cobrar (Fiado)
            const { data: debtsData, error: debtsError } = await supabase
                .from('debts')
                .select('remaining_amount, customer_id')
                .eq('business_id', businessId)
                .in('status', ['pending', 'partial', 'overdue'])
                .gt('remaining_amount', 0);

            if (debtsError) throw debtsError;

            const debtTotal = debtsData.reduce((sum, debt) => sum + Number(debt.remaining_amount || 0), 0);
            
            // 3. Clientes Fiados (Distinct customers with debt)
            const uniqueCustomers = new Set(debtsData.map(debt => debt.customer_id));
            const debtCustomersCount = uniqueCustomers.size;

            return {
                salesToday,
                debtTotal,
                debtCustomersCount,
            };

        } catch (error) {
            console.error("Error fetching dashboard metrics:", error);
            return {
                salesToday: 0,
                debtTotal: 0,
                debtCustomersCount: 0,
            };
        }
    }
};

export default dashboardService;