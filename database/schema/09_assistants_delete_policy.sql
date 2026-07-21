-- =============================================================================
-- 09_assistants_delete_policy.sql
-- -----------------------------------------------------------------------------
-- Permite eliminar un business_assistants aunque ya tenga ventas registradas,
-- sin perder el registro de "quién vendió qué":
--
--   1) invoices.assistant_id pasa de FK sin ON DELETE a ON DELETE SET NULL —
--      borrar un asistente ya no falla por la restricción de integridad.
--   2) invoices.assistant_name (nueva) guarda el nombre del asistente como
--      texto plano AL MOMENTO DE LA VENTA (snapshot), independiente de si la
--      fila de business_assistants sigue existiendo. Es lo que se debe
--      mostrar en reportes históricos — no volver a hacer join por
--      assistant_id para mostrar el nombre.
-- =============================================================================

-- 1) Nueva columna de snapshot
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS assistant_name VARCHAR(100);

-- 2) Cambiar la FK de assistant_id a ON DELETE SET NULL.
--    El nombre de la constraint es autogenerado por Postgres; se busca antes
--    de eliminarla para no asumir un nombre fijo.
DO $$
DECLARE
  fk_name text;
BEGIN
  SELECT conname INTO fk_name
  FROM pg_constraint
  WHERE conrelid = 'invoices'::regclass
    AND confrelid = 'business_assistants'::regclass;

  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE invoices DROP CONSTRAINT %I', fk_name);
  END IF;

  ALTER TABLE invoices
    ADD CONSTRAINT invoices_assistant_id_fkey
    FOREIGN KEY (assistant_id) REFERENCES business_assistants(id) ON DELETE SET NULL;
END $$;
