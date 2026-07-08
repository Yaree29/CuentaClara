-- Migración para dejar constancia versionada de las columnas de MFA (TOTP).
-- Estas columnas ya existen en la base de datos real (aplicadas manualmente
-- en algún punto sin migración numerada — confirmado en el schema.sql
-- combinado de la raíz). Este archivo es seguro de re-ejecutar (IF NOT EXISTS)
-- y no debería tener efecto si ya están creadas.

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS mfa_secret VARCHAR(255);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE;
