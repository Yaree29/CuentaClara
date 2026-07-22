-- =============================================================================
-- 21_product_ingredient_only.sql
-- -----------------------------------------------------------------------------
-- products.is_ingredient_only: marca insumos que solo se usan como ingrediente
-- de recetas (ProductFormModal.jsx) y que no deben ofrecerse como opción de
-- venta directa. Se filtra únicamente en SalesSection.jsx al consumir la
-- lista compartida de inventoryService.getProducts() — Inventario y el
-- selector de insumos de Recetas siguen viendo todos los productos.
-- =============================================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS is_ingredient_only BOOLEAN DEFAULT FALSE;
