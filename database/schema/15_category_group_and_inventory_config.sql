-- =============================================================================
-- 15_category_group_and_inventory_config.sql
-- -----------------------------------------------------------------------------
-- 1) industry_templates.category_group — agrupa las 11 plantillas de industria
--    sembradas en 03_templates.sql en las 5 categorías de negocio del
--    onboarding adaptativo (ver DASHBOARD_PYMES.md): alimentos, servicios,
--    comercio, comida_preparada, general. Reemplaza los rangos de ID
--    hardcodeados que antes vivían como comentario en auth_service.py.
--
-- 2) business_inventory_config — flags de configuración interna de inventario
--    por negocio (control por peso, caducidad, mermas, recetas, producción,
--    escáner, stock predictivo). Se inicializa al registrar el negocio según
--    su category_group y queda editable libremente después vía
--    PATCH /inventory/config.
-- =============================================================================

ALTER TABLE industry_templates ADD COLUMN IF NOT EXISTS category_group VARCHAR(30);

-- Backfill por nombre (no por id) para no depender del orden de inserción del seed.
UPDATE industry_templates SET category_group = 'alimentos'        WHERE name IN ('Carnicería', 'Frutería');
UPDATE industry_templates SET category_group = 'servicios'        WHERE name IN ('Barbería', 'Estilista');
UPDATE industry_templates SET category_group = 'comercio'         WHERE name IN ('Tienda de ropa', 'Papelería', 'Farmacia', 'Ferretería', 'Tienda general');
UPDATE industry_templates SET category_group = 'comida_preparada' WHERE name IN ('Panadería', 'Restaurante');
UPDATE industry_templates SET category_group = 'general'          WHERE category_group IS NULL;

CREATE TABLE IF NOT EXISTS business_inventory_config (
  id                SERIAL PRIMARY KEY,
  business_id       UUID NOT NULL UNIQUE REFERENCES businesses(id) ON DELETE CASCADE,
  control_peso      BOOLEAN DEFAULT FALSE,
  caducidad         BOOLEAN DEFAULT FALSE,
  mermas            BOOLEAN DEFAULT FALSE,
  recetas           BOOLEAN DEFAULT FALSE,
  produccion        BOOLEAN DEFAULT FALSE,
  escaner           BOOLEAN DEFAULT FALSE,
  stock_predictivo  BOOLEAN DEFAULT FALSE,
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
