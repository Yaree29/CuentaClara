-- =============================================================================
-- 18_assistant_notifications.sql
-- -----------------------------------------------------------------------------
-- Notificaciones al dueño PYME cuando un asistente (Modo Asistente) registra
-- una venta o modifica inventario.
--
-- Decisión del proyecto (2026-07-21): NO se usa push real (FCM/Firebase) —
-- la notificación solo llega mientras la app está abierta o recién en
-- segundo plano, vía Realtime de Supabase sobre la tabla `notifications` ya
-- existente. Por eso NO hay tabla de push_tokens aquí.
--
-- 1) products.assistant_id/assistant_name: mismo patrón que
--    invoices.assistant_id/assistant_name (09_assistants_delete_policy.sql),
--    snapshot del nombre al momento de la acción + FK con ON DELETE SET NULL
--    para que borrar un asistente no rompa el historial de productos creados.
-- 2) business_notification_preferences: tabla dedicada (no
--    business_configs.settings, que se sobrescribe completo en cada PUT) para
--    que el dueño active/desactive cada tipo de notificación.
-- =============================================================================

-- 1) Atribución de asistente en productos
ALTER TABLE products ADD COLUMN IF NOT EXISTS assistant_id INTEGER REFERENCES business_assistants(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS assistant_name VARCHAR(100);

-- 2) Preferencias de notificación por negocio (una fila por negocio, upsert)
CREATE TABLE IF NOT EXISTS business_notification_preferences (
  id                SERIAL PRIMARY KEY,
  business_id       UUID NOT NULL UNIQUE REFERENCES businesses(id) ON DELETE CASCADE,
  notify_sales      BOOLEAN DEFAULT TRUE,
  notify_inventory  BOOLEAN DEFAULT TRUE,
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
