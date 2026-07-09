// =============================================================================
// MODIFICADO: 2026-05-27
// Propósito: Servicio del módulo de inventario. Reemplaza la implementación
//            original (Supabase directo en main) por llamadas reales a la API
//            FastAPI (endpoints bajo el prefijo /inventory), siguiendo la
//            convención del proyecto (CLAUDE.md): frontend → FastAPI → Supabase.
//
// Mantiene la misma firma de métodos que el hook useInformalInventory espera:
//   - getCategories(businessId)
//   - createCategory(businessId, name) → { success, category, alreadyExists }
//   - getProducts(businessId)
//   - createProduct(businessId, productData) → { success, product }
//   - updateProduct(businessId, productId, productData) → { success, product }
//   - deleteProduct(businessId, productId) → { success }
//
// El parámetro businessId se recibe por compatibilidad con el hook pero se
// ignora porque el backend lo extrae del JWT.
// =============================================================================
import { apiRequest } from '../../../services/apiClient';

// El backend devuelve campos en snake_case; la UI usa camelCase
const mapProduct = (row) => ({
  id: row.id,
  name: row.name || '',
  sku: row.sku,
  price: Number(row.price) || 0,
  unitType: row.unit_type,
  category: row.category || 'Sin categoría',
  categoryColor: row.category_color || '#6366f1',
  stock: row.stock !== null && row.stock !== undefined ? Number(row.stock) : null,
  unit: row.unit || row.unit_type || '',
  minStock: Number(row.min_stock || 0),
  isLowStock: !!row.is_low_stock,
  updatedAt: row.updated_at,
});

const inventoryService = {
  // ── Categorías ────────────────────────────────────────────────────────────
  getCategories: async (_businessId) => {
    return apiRequest('/inventory/categories');
  },

  createCategory: async (_businessId, name) => {
    if (!name?.trim()) throw new Error('El nombre de la categoría es requerido.');

    const data = await apiRequest('/inventory/categories', {
      method: 'POST',
      body: JSON.stringify({ name: name.trim() }),
    });

    // Backend devuelve {id, name, color, business_id, already_exists}
    const { already_exists, ...category } = data;
    return {
      success: !already_exists,
      category,
      alreadyExists: !!already_exists,
    };
  },

  // ── Productos ─────────────────────────────────────────────────────────────
  getProducts: async (_businessId) => {
    const data = await apiRequest('/inventory/products');
    if (!Array.isArray(data)) {
      console.warn('[inventoryService] /inventory/products no devolvió array:', data);
      return [];
    }
    return data.filter((item) => item != null && item.id != null).map(mapProduct);
  },

  createProduct: async (_businessId, productData) => {
    const payload = {
      name: productData.name,
      price: Number(productData.price || 0),
      category_name: productData.category || null,
      sku: productData.sku || null,
      unit_type: productData.unitType || null,
      initial_stock:
        productData.stock !== null && productData.stock !== undefined
          ? Number(productData.stock)
          : null,
      unit: productData.unit || null,
      min_stock: Number(productData.minStock || 0),
      purchase_type: productData.purchaseType || 'register_only',
    };

    const data = await apiRequest('/inventory/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return { success: true, product: mapProduct(data) };
  },

  updateProduct: async (_businessId, productId, productData) => {
    const payload = {
      ...(productData.name !== undefined ? { name: productData.name } : {}),
      ...(productData.price !== undefined ? { price: Number(productData.price) } : {}),
      ...(productData.category !== undefined ? { category_name: productData.category } : {}),
      ...(productData.sku !== undefined ? { sku: productData.sku } : {}),
      ...(productData.unitType !== undefined ? { unit_type: productData.unitType } : {}),
      ...(productData.stock !== undefined
        ? { stock: productData.stock !== null ? Number(productData.stock) : null }
        : {}),
      ...(productData.unit !== undefined ? { unit: productData.unit } : {}),
      ...(productData.minStock !== undefined ? { min_stock: Number(productData.minStock) } : {}),
    };

    const data = await apiRequest(`/inventory/products/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    return { success: true, product: mapProduct(data) };
  },

  deleteProduct: async (_businessId, productId) => {
    await apiRequest(`/inventory/products/${productId}`, {
      method: 'DELETE',
    });
    return { success: true };
  },

  // ── Movimientos de stock ──────────────────────────────────────────────────
  adjustStock: async ({ productId, quantity, reason, notes }) => {
    return apiRequest('/inventory/stock/adjust', {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId,
        quantity: Number(quantity),
        reason,
        notes: notes || null,
      }),
    });
  },

  lowStockAlerts: async () => {
    return apiRequest('/inventory/stock/low');
  },

  getMovements: async (limit = 50) => {
    return apiRequest(`/inventory/movements?limit=${limit}`);
  },
};

export default inventoryService;
