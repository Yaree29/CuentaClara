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
  costPrice: row.cost_price !== null && row.cost_price !== undefined ? Number(row.cost_price) : null,
  unitType: row.unit_type,
  category: row.category || 'Sin categoría',
  categoryColor: row.category_color || '#6366f1',
  stock: row.stock !== null && row.stock !== undefined ? Number(row.stock) : null,
  unit: row.unit || row.unit_type || '',
  minStock: Number(row.min_stock || 0),
  isLowStock: !!row.is_low_stock,
  updatedAt: row.updated_at,
  expirationDate: row.expiration_date || null,
  // Solo insumo de recetas, no se vende directamente — SalesSection.jsx lo
  // filtra al consumir esta misma lista; Inventario y Recetas lo muestran
  // normal (no se filtra aquí, en el servicio compartido).
  isIngredientOnly: !!row.is_ingredient_only,
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
      cost_price:
        productData.costPrice !== null && productData.costPrice !== undefined
          ? Number(productData.costPrice)
          : null,
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
      expiration_date: productData.expirationDate || null,
      is_ingredient_only: !!productData.isIngredientOnly,
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
      ...(productData.costPrice !== undefined
        ? { cost_price: productData.costPrice !== null ? Number(productData.costPrice) : null }
        : {}),
      ...(productData.category !== undefined ? { category_name: productData.category } : {}),
      ...(productData.sku !== undefined ? { sku: productData.sku } : {}),
      ...(productData.unitType !== undefined ? { unit_type: productData.unitType } : {}),
      ...(productData.stock !== undefined
        ? { stock: productData.stock !== null ? Number(productData.stock) : null }
        : {}),
      ...(productData.unit !== undefined ? { unit: productData.unit } : {}),
      ...(productData.minStock !== undefined ? { min_stock: Number(productData.minStock) } : {}),
      ...(productData.expirationDate !== undefined ? { expiration_date: productData.expirationDate } : {}),
      // Solo lo usa el backend cuando el stock sube: decide si además del
      // movimiento de entrada se registra el gasto en caja.
      ...(productData.purchaseType !== undefined ? { purchase_type: productData.purchaseType } : {}),
      ...(productData.isIngredientOnly !== undefined ? { is_ingredient_only: !!productData.isIngredientOnly } : {}),
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
  // unitCost: obligatorio en el backend cuando reason='purchase' (actualiza
  // products.cost_price con el valor más reciente conocido).
  adjustStock: async ({ productId, quantity, reason, notes, unitCost }) => {
    return apiRequest('/inventory/stock/adjust', {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId,
        quantity: Number(quantity),
        reason,
        notes: notes || null,
        ...(unitCost !== undefined && unitCost !== null ? { unit_cost: Number(unitCost) } : {}),
      }),
    });
  },

  lowStockAlerts: async () => {
    return apiRequest('/inventory/stock/low');
  },

  /**
   * Proyección de quiebre de stock: productos con menos de `thresholdDays`
   * días estimados de stock restante según su consumo promedio diario de
   * los últimos 30 días (ventas reales, inventory_movements reason='sale').
   */
  getPredictiveStock: async (thresholdDays = 7) => {
    return apiRequest(`/inventory/stock/predictive?threshold_days=${thresholdDays}`);
  },

  getMovements: async (limit = 50) => {
    return apiRequest(`/inventory/movements?limit=${limit}`);
  },

  // ── Configuración interna de inventario ───────────────────────────────────
  /**
   * Estado actual de los flags de configuración (control_peso, caducidad,
   * mermas, recetas, produccion, escaner, stock_predictivo).
   */
  getConfig: async () => {
    return apiRequest('/inventory/config');
  },

  /**
   * Actualiza parcialmente los flags de configuración. Solo se envía el/los
   * campo(s) que cambian.
   * @param {Object} patch - ej. {control_peso: true}
   */
  updateConfig: async (patch) => {
    return apiRequest('/inventory/config', {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
  },
};

export default inventoryService;
