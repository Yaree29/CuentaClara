// =============================================================================
// recipeService.js
// -----------------
// Cliente HTTP para el módulo /recipes (Recetas / Producción). Reemplaza la
// implementación anterior (mock con setTimeout) por llamadas reales a la API
// FastAPI, siguiendo el mismo patrón de commissionsService.js.
// =============================================================================
import { apiRequest } from '../../../services/apiClient';

// null real (costo no configurado) se preservaba como 0 con `|| 0` — eso
// hacía que "$0.00" se mostrara como si fuera un costo real. cost_price/
// subtotal/total_cost/cost_per_portion ahora se mantienen en null cuando el
// backend los manda así (ver recipes_service.py, has_missing_cost).
const mapIngredient = (row) => ({
  ingredientProductId: row.ingredient_product_id,
  ingredientName: row.ingredient_name,
  quantity: Number(row.quantity) || 0,
  unit: row.unit || '',
  costPrice: row.cost_price !== null && row.cost_price !== undefined ? Number(row.cost_price) : null,
  subtotal: row.subtotal !== null && row.subtotal !== undefined ? Number(row.subtotal) : null,
});

const mapRecipe = (row) => ({
  id: row.id,
  productId: row.product_id,
  productName: row.product_name,
  productPrice:
    row.product_price !== null && row.product_price !== undefined ? Number(row.product_price) : null,
  name: row.name,
  portionsYield: Number(row.portions_yield) || 0,
  isActive: !!row.is_active,
  ingredients: Array.isArray(row.ingredients) ? row.ingredients.map(mapIngredient) : [],
  totalCost: row.total_cost !== null && row.total_cost !== undefined ? Number(row.total_cost) : null,
  costPerPortion:
    row.cost_per_portion !== null && row.cost_per_portion !== undefined ? Number(row.cost_per_portion) : null,
  hasMissingCost: !!row.has_missing_cost,
  createdAt: row.created_at,
});

const recipeService = {
  // ── Recetas ───────────────────────────────────────────────────────────────
  getRecipes: async () => {
    const data = await apiRequest('/recipes');
    return Array.isArray(data) ? data.map(mapRecipe) : [];
  },

  getRecipe: async (recipeId) => {
    const data = await apiRequest(`/recipes/${recipeId}`);
    return mapRecipe(data);
  },

  createRecipe: async ({ productId, name, portionsYield, ingredients }) => {
    const payload = {
      product_id: productId,
      name,
      portions_yield: Number(portionsYield),
      ingredients: ingredients.map((ing) => ({
        ingredient_product_id: ing.ingredientProductId,
        quantity: Number(ing.quantity),
        unit: ing.unit || null,
      })),
    };
    const data = await apiRequest('/recipes', { method: 'POST', body: JSON.stringify(payload) });
    return mapRecipe(data);
  },

  updateRecipe: async (recipeId, { name, portionsYield, ingredients }) => {
    const payload = {
      ...(name !== undefined ? { name } : {}),
      ...(portionsYield !== undefined ? { portions_yield: Number(portionsYield) } : {}),
      ...(ingredients !== undefined
        ? {
            ingredients: ingredients.map((ing) => ({
              ingredient_product_id: ing.ingredientProductId,
              quantity: Number(ing.quantity),
              unit: ing.unit || null,
            })),
          }
        : {}),
    };
    const data = await apiRequest(`/recipes/${recipeId}`, { method: 'PATCH', body: JSON.stringify(payload) });
    return mapRecipe(data);
  },

  deleteRecipe: async (recipeId) => {
    await apiRequest(`/recipes/${recipeId}`, { method: 'DELETE' });
    return { success: true };
  },

  // ── Producción ────────────────────────────────────────────────────────────
  produce: async (recipeId, portionsToProduce) => {
    return apiRequest(`/recipes/${recipeId}/produce`, {
      method: 'POST',
      body: JSON.stringify({ portions_to_produce: Number(portionsToProduce) }),
    });
  },

  // ── Control ───────────────────────────────────────────────────────────────
  getProductionHistory: async ({ recipeId, dateFrom, dateTo } = {}) => {
    const params = new URLSearchParams();
    if (recipeId != null) params.set('recipe_id', recipeId);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    const query = params.toString();
    return apiRequest(`/recipes/production-history${query ? `?${query}` : ''}`);
  },

  getConsumption: async (recipeId, ingredientProductId = null) => {
    const query = ingredientProductId != null ? `?ingredient_product_id=${ingredientProductId}` : '';
    return apiRequest(`/recipes/${recipeId}/consumption${query}`);
  },

  getProfitability: async (recipeId) => {
    return apiRequest(`/recipes/${recipeId}/profitability`);
  },
};

export default recipeService;
