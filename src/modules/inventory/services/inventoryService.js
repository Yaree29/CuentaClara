const inventoryService = {
    getProducts: async() => {
        await new Promise(resolve => setTimeout(resolve, 800));

        return [
            { id: '1', name: 'Producto A', stock: 50, price: 10.00, category: 'General' },
            { id: '2', name: 'Producto B', stock: 15, price: 25.50, category: 'General' },
            { id: '3', name: 'Producto C', stock: 5, price: 100.00, category: 'Premium' },
            { id: '4', name: 'Producto D', stock: 50, price: 10.00, category: 'General' },
            { id: '5', name: 'Producto E', stock: 15, price: 25.50, category: 'General' },
            { id: '6', name: 'Producto F', stock: 5, price: 100.00, category: 'Premium' },
            { id: '7', name: 'Producto G', stock: 50, price: 10.00, category: 'General' },
            { id: '8', name: 'Producto H', stock: 15, price: 25.50, category: 'General' },
            { id: '9', name: 'Producto I', stock: 5, price: 100.00, category: 'Premium' },
            { id: '10', name: 'Producto J', stock: 50, price: 10.00, category: 'General' },
            { id: '11', name: 'Producto K', stock: 15, price: 25.50, category: 'General' },
            { id: '12', name: 'Producto L', stock: 5, price: 100.00, category: 'Premium' },
            { id: '13', name: 'Producto M', stock: 50, price: 10.00, category: 'General' },
            { id: '14', name: 'Producto N', stock: 15, price: 25.50, category: 'General' },
            { id: '15', name: 'Producto O', stock: 5, price: 100.00, category: 'Premium' },
        ];
    },

    saveProduct: async(productData) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true, data: productData };
    }
};

export default inventoryService;