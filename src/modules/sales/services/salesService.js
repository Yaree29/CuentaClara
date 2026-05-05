const salesService = {
    createSale: async(saleData) => {
        // Simulación de registro de venta
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            success: true,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString()
        };
    },

    getRecentSales: async() => {
        await new Promise(resolve => setTimeout(resolve, 800));
        return [
            { id: '1', customer: 'Consumidor Final', total: 15.50, date: '2026-05-03', items: 2 },
            { id: '2', customer: 'Juan Pérez', total: 45.00, date: '2026-05-03', items: 5 },
        ];
    }
};

export default salesService;