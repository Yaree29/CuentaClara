-- =============================================================================
-- 17_recipes.sql
-- -----------------------------------------------------------------------------
-- Módulo de Recetas / Producción (ver DASHBOARD_PYMES.md):
--   - products.cost_price: costo unitario del insumo, usado para calcular el
--     costo de una receta en tiempo real (Σ cantidad_ingrediente × cost_price).
--     No existía ninguna columna de costo vigente por producto (solo `price`,
--     que es precio de venta, y purchase_items.unit_cost, que es histórico
--     por orden de compra puntual).
--   - recipes / recipe_ingredients: ficha técnica del producto final.
--   - production_records: costo congelado al momento de producir (no se
--     recalcula después aunque cambie cost_price).
--
-- products.id, product_categories.id son INTEGER (SERIAL) — confirmado en
-- 03_inventory.sql. Los FKs de este archivo usan INTEGER en consecuencia.
-- =============================================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price DECIMAL(12,2) DEFAULT 0;

CREATE TABLE IF NOT EXISTS recipes (
  id             SERIAL PRIMARY KEY,
  business_id    UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  product_id     INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name           VARCHAR(150) NOT NULL,
  portions_yield DECIMAL(12,3) NOT NULL DEFAULT 1,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id                    SERIAL PRIMARY KEY,
  recipe_id             INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_product_id INTEGER NOT NULL REFERENCES products(id),
  quantity              DECIMAL(12,3) NOT NULL,
  unit                  VARCHAR(20)
);

-- produced_at (no created_at): distingue "cuándo se registró la fila" de
-- "cuándo se produjo" — recipes_service.py (produce/list_production_history/
-- profitability) usa produced_at para esta tabla en consecuencia.
CREATE TABLE IF NOT EXISTS production_records (
  id                SERIAL PRIMARY KEY,
  business_id       UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  recipe_id         INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  portions_produced DECIMAL(12,3) NOT NULL,
  total_cost        DECIMAL(12,2) NOT NULL,
  user_id           UUID REFERENCES users(id),
  produced_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Habilita el motivo 'production' en inventory_movements para que el
-- descuento automático de ingredientes reutilice POST /inventory/stock/adjust
-- (inventory_service.adjust_stock) en vez de una función de ajuste paralela.
-- El type correspondiente sigue siendo 'out' (ya permitido, sin cambios ahí).
ALTER TABLE inventory_movements DROP CONSTRAINT IF EXISTS inventory_movements_reason_check;
ALTER TABLE inventory_movements ADD CONSTRAINT inventory_movements_reason_check
  CHECK (reason IN ('sale','purchase','waste','manual','return','production'));
