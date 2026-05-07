import { supabase } from '../../../services/supabaseClient';

const mapProduct = (inventoryRow) => {
  const product = inventoryRow.products;

  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    price: Number(product.price || 0),
    unitType: product.unit_type,
    category: product.product_categories?.name || 'Sin categoria',
    categoryColor: product.product_categories?.color,
    stock: Number(inventoryRow.quantity || 0),
    unit: inventoryRow.unit || product.unit_type || '',
    minStock: Number(inventoryRow.min_stock || 0),
    updatedAt: inventoryRow.updated_at,
  };
};

const inventoryService = {
  getProducts: async (businessId) => {
    if (!businessId) {
      return [];
    }

    const { data, error } = await supabase
      .from('inventory')
      .select(
        `
          id,
          business_id,
          quantity,
          unit,
          min_stock,
          updated_at,
          products (
            id,
            business_id,
            category_id,
            name,
            sku,
            price,
            unit_type,
            image_url,
            is_active,
            product_categories (
              name,
              color
            )
          )
        `
      )
      .eq('business_id', businessId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || [])
      .filter((row) => row.products?.is_active !== false)
      .map(mapProduct);
  },

  createProduct: async (businessId, productData) => {
    if (!businessId) {
      throw new Error('No hay negocio activo para guardar el producto.');
    }

    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        business_id: businessId,
        category_id: productData.categoryId ?? null,
        name: productData.name,
        sku: productData.sku ?? null,
        price: productData.price ?? 0,
        unit_type: productData.unitType ?? null,
      })
      .select()
      .single();

    if (productError) {
      throw productError;
    }

    const { data: inventoryRow, error: inventoryError } = await supabase
      .from('inventory')
      .insert({
        business_id: businessId,
        product_id: product.id,
        quantity: productData.quantity ?? 0,
        unit: productData.unit ?? product.unit_type ?? null,
        min_stock: productData.minStock ?? 0,
      })
      .select()
      .single();

    if (inventoryError) {
      await supabase
        .from('products')
        .delete()
        .eq('id', product.id)
        .eq('business_id', businessId);
      throw inventoryError;
    }

    return { success: true, product, inventory: inventoryRow };
  },

  saveProduct: async (businessId, productData) => {
    return inventoryService.createProduct(businessId, productData);
  },
};

export default inventoryService;
