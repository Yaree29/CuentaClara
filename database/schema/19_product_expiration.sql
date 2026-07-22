-- =============================================================================
-- 19_product_expiration.sql
-- -----------------------------------------------------------------------------
-- Campo de caducidad por producto (flag `caducidad` en business_inventory_config,
-- ver 15_category_group_and_inventory_config.sql). Nullable: solo se usa cuando
-- el negocio tiene el flag activo; el resto de negocios lo dejan siempre NULL.
-- =============================================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS expiration_date DATE;
