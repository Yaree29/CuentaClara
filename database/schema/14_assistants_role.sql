-- =============================================================================
-- 14_assistants_role.sql
-- -----------------------------------------------------------------------------
-- Agrega el campo de texto libre `role` a business_assistants para que el
-- dueño anote qué tipo de empleado es cada asistente (ej: "Barbero",
-- "Mesero"), sin restringirlo a un catálogo predefinido.
--
-- Nullable y sin default: los asistentes existentes quedan en NULL hasta que
-- se editen (el backend exige el campo solo en altas/ediciones nuevas, no
-- retroactivamente).
-- =============================================================================

ALTER TABLE business_assistants ADD COLUMN role VARCHAR(50);
