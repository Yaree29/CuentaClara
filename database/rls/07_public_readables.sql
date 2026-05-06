-- 07_public_readables.sql
-- Otorga permisos de lectura pública a tablas de catálogo no sensibles
-- Ejecutar en Supabase SQL Editor para permitir que `anon` consulte
-- catálogos como `categories` antes del signup (mejora UX del registro).

BEGIN;

-- Asegura que el rol anon tenga acceso al schema public (idempotente)
GRANT USAGE ON SCHEMA public TO anon;

-- Permitir lectura de catálogo (seguro: solo nombres/iconos, no datos sensibles)
GRANT SELECT ON TABLE public.categories TO anon;

-- Si quieres exponer otras tablas estáticas, agrégalas aquí, por ejemplo:
-- GRANT SELECT ON TABLE public.industry_templates TO anon;

COMMIT;

-- Nota: si prefieres no exponer nada a `anon`, usa un RPC seguro en su lugar
-- o cargue las categorías después del signup cuando el usuario esté autenticado.
