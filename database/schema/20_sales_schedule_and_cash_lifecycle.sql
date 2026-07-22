-- =============================================================================
-- 20_sales_schedule_and_cash_lifecycle.sql
-- -----------------------------------------------------------------------------
-- Reconstrucción de Ventas PYME: horario de operación + ciclo de vida real de
-- caja (ver plan). Antes, la caja (cash_sessions) era opcional y una venta
-- podía registrarse sin ninguna sesión abierta; tampoco existía ningún
-- concepto de horario de atención del negocio.
--
-- 1) business_configs.sales_opening_time/sales_closing_time: horario fijo
--    diario, opcional por negocio (NULL = sin restricción horaria). No se
--    guardan en `settings` (JSONB) porque ese campo se sobrescribe completo
--    en cada PUT /businesses/me/config (mismo motivo que
--    18_assistant_notifications.sql evitó `settings` para preferencias).
-- 2) invoices.cash_session_id: liga cada venta a la sesión de caja vigente
--    al momento de crearla. Reemplaza el filtro por rango de fecha calendario
--    que usaba "Registro de Ventas" — la lista se vacía naturalmente al abrir
--    una sesión nueva.
--
-- Nota: no hay opción de "extender" la hora de cierre — al llegar la hora
-- configurada, la caja deja de vender sin excepción (decisión explícita del
-- usuario, 2026-07-22).
-- =============================================================================

ALTER TABLE business_configs ADD COLUMN IF NOT EXISTS sales_opening_time TIME;
ALTER TABLE business_configs ADD COLUMN IF NOT EXISTS sales_closing_time TIME;

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS cash_session_id INTEGER REFERENCES cash_sessions(id) ON DELETE SET NULL;
