-- =============================================================================
-- CREADO: 2026-07-21
-- Propósito: Cambiar ON DELETE RESTRICT a CASCADE en debts.customer_id
--            para que el borrado completo de cuenta (DELETE businesses)
--            no falle por restricciones de integridad referencial.
-- Aplica:    Tras 14_assistants_role.sql. Ejecutar en Supabase SQL Editor.
-- =============================================================================

-- Eliminar la restricción RESTRICT existente y reemplazarla por CASCADE.
-- Cuando se borra un business, los debts se borran vía business_id CASCADE
-- ANTES de que se intente borrar customers; así customer_id CASCADE es
-- coherente y no hay carrera entre las dos cadenas de cascade.
ALTER TABLE debts DROP CONSTRAINT IF EXISTS debts_customer_id_fkey;

ALTER TABLE debts
  ADD CONSTRAINT debts_customer_id_fkey
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
