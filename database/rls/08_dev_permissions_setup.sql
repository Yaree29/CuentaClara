-- Configuración temporal de permisos para depuración del flujo de Onboarding.
-- Estos comandos permiten que el servicio de registro inserte datos iniciales.

-- 1. Deshabilitar RLS temporalmente en tablas críticas para asegurar el flujo
ALTER TABLE public.businesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_configs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_features DISABLE ROW LEVEL SECURITY;

-- 2. Conceder permisos amplios a roles de Supabase (anon y authenticated)
-- Nota: En producción, esto se debe endurecer con políticas RLS específicas.

GRANT ALL ON TABLE public.businesses TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.users TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.business_configs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.business_features TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.categories TO anon, authenticated, service_role;

-- 3. Asegurar que las secuencias (si existen) sean accesibles
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
