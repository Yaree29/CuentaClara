import products from '../../../data/products';

const inventoryService = {

  getProducts: async (businessId) => {

    // SUPABASE DESACTIVADO
    // const { data, error } = await supabase...

    if (!businessId) {
      return [];
    }

    return products.filter(
      (product) => product.business_id === businessId
    );
  },

  createProduct: async (businessId, productData) => {

    // SUPABASE DESACTIVADO
    // inserts products + inventory

    if (!businessId) {
      throw new Error('No hay negocio activo.');
    }

    const newProduct = {
      id: `prod-${Date.now()}`,
      business_id: businessId,

      name: productData.name,
      sku: productData.sku || null,

      price: Number(productData.price || 0),

      unitType: productData.unitType || '',

      category: 'General',
      categoryColor: '#6366f1',

      stock: Number(productData.quantity || 0),

      unit: productData.unit || '',

      minStock: Number(productData.minStock || 0),

      updatedAt: new Date().toISOString(),
    };

    products.unshift(newProduct);

    return {
      success: true,
      product: newProduct,
    };
  },

  saveProduct: async (businessId, productData) => {
    return inventoryService.createProduct(
      businessId,
      productData
    );
  },
};

export default inventoryService;