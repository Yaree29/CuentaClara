const dashboardService = {
    getMetrics: async(userType) => {
        // Simulación de delay
        await new Promise(resolve => setTimeout(resolve, 800));

        if (userType === 'pyme') {
            return {
                cards: [
                    { id: '1', title: 'Ventas Totales', value: '$12,450.00', trend: '+12%', type: 'money' },
                    { id: '2', title: 'Margen de Utilidad', value: '34.5%', trend: '+2%', type: 'percentage' },
                    { id: '3', title: 'Inventario Crítico', value: '5 ítems', trend: 'Revisar', type: 'alert' }
                ],
                charts: true
            };
        }

        return {
            cards: [
                { id: '1', title: 'Efectivo Hoy', value: '$150.00', type: 'money' },
                { id: '2', title: 'Ventas del Día', value: '12', type: 'count' }
            ],
            charts: false
        };
    }
};

export default dashboardService;