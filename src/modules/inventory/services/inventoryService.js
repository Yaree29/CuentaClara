import { supabase } from '../../../services/supabaseClient';

const mapProduct = (inventoryRow) => {
  // Supabase may return products as an object or as an array depending on the FK alias
  let product = inventoryRow.products;
  if (Array.isArray(product)) product = product[0] ?? null;
  if (!product) return null;

  // product_categories may also come as array
  let productCategory = product.product_categories;
  if (Array.isArray(productCategory)) productCategory = productCategory[0] ?? null;

  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    price: Number(product.price || 0),
    unitType: product.unit_type,
    category: productCategory?.name || 'Sin categoría',
    categoryColor: productCategory?.color || '#6366f1',
    stock: inventoryRow.quantity !== null && inventoryRow.quantity !== undefined ? Number(inventoryRow.quantity) : null,
    unit: inventoryRow.unit || product.unit_type || '',
    minStock: Number(inventoryRow.min_stock || 0),
    updatedAt: inventoryRow.updated_at,
  };
};


const inventoryService = {
  // Obtiene todas las categorías del negocio activo
  getCategories: async (businessId) => {
    if (!businessId) return [];

    const { data, error } = await supabase
      .from('product_categories')
      .select('id, name, color')
      .eq('business_id', businessId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    return data || [];
  },

  // Crea una nueva categoría para el negocio
  createCategory: async (businessId, name) => {
    if (!businessId) throw new Error('No hay negocio activo.');
    if (!name?.trim()) throw new Error('El nombre de la categoría es requerido.');

    const trimmedName = name.trim();

    // Verificar si ya existe (case-insensitive)
    const { data: existing } = await supabase
      .from('product_categories')
      .select('id, name, color')
      .eq('business_id', businessId)
      .ilike('name', trimmedName)
      .maybeSingle();

    if (existing) return { success: false, category: existing, alreadyExists: true };

    const { data: created, error: createError } = await supabase
      .from('product_categories')
      .insert({ business_id: businessId, name: trimmedName, color: '#6366f1' })
      .select('id, name, color')
      .single();

    if (createError) {
      console.error('Error creating category:', createError);
      throw createError;
    }

    return { success: true, category: created };
  },


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
      console.error('Error fetching products from supabase:', error);
      throw error;
    }

    return (data || [])
      .map(mapProduct)
      .filter((prod) => prod !== null);
  },

  getOrCreateCategory: async (businessId, categoryName) => {
    if (!categoryName) return null;

    // Check if category exists
    const { data: existing, error: selectError } = await supabase
      .from('product_categories')
      .select('id')
      .eq('business_id', businessId)
      .eq('name', categoryName)
      .maybeSingle();

    if (existing) {
      return existing.id;
    }

    // Otherwise, create it
    const { data: created, error: createError } = await supabase
      .from('product_categories')
      .insert({
        business_id: businessId,
        name: categoryName,
        color: '#6366f1' // Default color
      })
      .select('id')
      .single();

    if (createError) {
      console.error('Error creating category:', createError);
      return null;
    }

    return created.id;
  },

  createProduct: async (businessId, productData) => {
    if (!businessId) {
      throw new Error('No hay negocio activo para guardar el producto.');
    }

    // 1. Get or create category
    const categoryId = await inventoryService.getOrCreateCategory(businessId, productData.category);

    // 2. Insert into products
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        business_id: businessId,
        category_id: categoryId,
        name: productData.name,
        sku: productData.sku || null,
        price: Number(productData.price || 0),
        unit_type: productData.unitType || null,
        is_active: true
      })
      .select()
      .single();

    if (productError) {
      console.error('Error creating product in supabase:', productError);
      throw productError;
    }

    // 3. Insert into inventory
    const { data: inventoryRow, error: inventoryError } = await supabase
      .from('inventory')
      .insert({
        business_id: businessId,
        product_id: product.id,
        quantity: productData.stock !== null && productData.stock !== undefined ? Number(productData.stock) : null,
        unit: productData.unit || productData.unitType || null,
        min_stock: Number(productData.minStock || 0),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (inventoryError) {
      console.error('Error creating inventory row in supabase:', inventoryError);
      // Clean up the created product to prevent orphan products
      await supabase
        .from('products')
        .delete()
        .eq('id', product.id)
        .eq('business_id', businessId);
      throw inventoryError;
    }

    // Return mapped product so it matches local UI structure
    const mapped = {
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: Number(product.price || 0),
      unitType: product.unit_type,
      category: productData.category || 'Otros',
      categoryColor: '#6366f1',
      stock: inventoryRow.quantity !== null && inventoryRow.quantity !== undefined ? Number(inventoryRow.quantity) : null,
      unit: inventoryRow.unit || '',
      minStock: Number(inventoryRow.min_stock || 0),
      updatedAt: inventoryRow.updated_at,
    };

    return { success: true, product: mapped };
  },

  updateProduct: async (businessId, productId, productData) => {
    if (!businessId) {
      throw new Error('No hay negocio activo para actualizar el producto.');
    }

    // 1. Get or create category
    const categoryId = await inventoryService.getOrCreateCategory(businessId, productData.category);

    // 2. Update products table
    const { data: product, error: productError } = await supabase
      .from('products')
      .update({
        category_id: categoryId,
        name: productData.name,
        sku: productData.sku || null,
        price: Number(productData.price || 0),
        unit_type: productData.unitType || null
      })
      .eq('id', productId)
      .eq('business_id', businessId)
      .select()
      .single();

    if (productError) {
      console.error('Error updating product in supabase:', productError);
      throw productError;
    }

    // Guard: .single() returns null data if the row wasn't found
    if (!product) {
      throw new Error(`No se encontró el producto ${productId} para el negocio ${businessId}.`);
    }

    // 3. Update inventory row — the table has no UNIQUE constraint on product_id,
    //    so we cannot use upsert. Instead: find the row by product_id, then UPDATE
    //    its PK, or INSERT if it doesn't exist yet.
    const { data: existingInv } = await supabase
      .from('inventory')
      .select('id')
      .eq('product_id', productId)
      .eq('business_id', businessId)
      .maybeSingle();

    let inventoryRow;
    let inventoryError;

    const inventoryPayload = {
      quantity: productData.stock !== null && productData.stock !== undefined ? Number(productData.stock) : null,
      unit: productData.unit || productData.unitType || null,
      min_stock: Number(productData.minStock || 0),
      updated_at: new Date().toISOString(),
    };

    if (existingInv?.id) {
      // Row exists → UPDATE by PK
      const { data, error } = await supabase
        .from('inventory')
        .update(inventoryPayload)
        .eq('id', existingInv.id)
        .select()
        .single();
      inventoryRow = data;
      inventoryError = error;
    } else {
      // Row missing → INSERT
      const { data, error } = await supabase
        .from('inventory')
        .insert({ business_id: businessId, product_id: productId, ...inventoryPayload })
        .select()
        .single();
      inventoryRow = data;
      inventoryError = error;
    }



    if (inventoryError) {
      console.error('Error updating inventory in supabase:', inventoryError);
      throw inventoryError;
    }

    // Return mapped product so it matches local UI structure
    const mapped = {
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: Number(product.price || 0),
      unitType: product.unit_type,
      category: productData.category || 'Otros',
      categoryColor: '#6366f1',
      stock: inventoryRow.quantity !== null && inventoryRow.quantity !== undefined ? Number(inventoryRow.quantity) : null,
      unit: inventoryRow.unit || '',
      minStock: Number(inventoryRow.min_stock || 0),
      updatedAt: inventoryRow.updated_at,
    };

    return { success: true, product: mapped };
  },

  deleteProduct: async (businessId, productId) => {
    if (!businessId) {
      throw new Error('No hay negocio activo para eliminar el producto.');
    }

    // Soft delete the product by setting is_active = false
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', productId)
      .eq('business_id', businessId);

    if (error) {
      console.error('Error deleting product from supabase:', error);
      throw error;
    }

    return { success: true };
  },
};

export default inventoryService;