-- Usuario de prueba para login real con Supabase Auth.
--
-- 1. Primero crea el usuario en Supabase Dashboard:
--    Authentication > Users > Add user
--
--    Email: inventario.dev@cuentaclara.test
--    Password: CuentaClaraDev123!
--    Auto Confirm User: enabled
--
-- 2. Luego ejecuta este SQL. El id de public.users debe ser el mismo
--    UUID del usuario creado en auth.users para que auth.uid() funcione.

INSERT INTO public.users (
  id,
  business_id,
  name,
  email,
  password_hash,
  role,
  phone
)
VALUES (
  '7e6c467f-2be3-4a33-81d2-8cb81716a73f',
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Inventario Dev',
  'inventario.dev@cuentaclara.test',
  'managed_by_supabase_auth',
  'owner',
  '+507 6000-0900'
)
ON CONFLICT (id) DO UPDATE SET
  business_id = EXCLUDED.business_id,
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone;

-- Verificacion: debe devolver una fila.
SELECT id, business_id, name, email, role
FROM public.users
WHERE id = '7e6c467f-2be3-4a33-81d2-8cb81716a73f';
