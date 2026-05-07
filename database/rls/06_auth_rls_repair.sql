-- Reparacion idempotente para login directo con Supabase Auth.
-- Ejecuta este archivo si la app autentica pero no puede leer public.users.

CREATE OR REPLACE FUNCTION public.get_business_id()
RETURNS UUID AS $$
  WITH claims AS (
    SELECT NULLIF(current_setting('request.jwt.claims', true), '')::jsonb AS jwt
  )
  SELECT COALESCE(
    NULLIF((SELECT jwt ->> 'business_id' FROM claims), '')::UUID,
    (
      SELECT business_id
      FROM public.users
      WHERE id = auth.uid()
      LIMIT 1
    )
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.get_business_id() TO authenticated;
-- Explicación: los siguientes GRANTs son necesarios para permitir que
-- el rol `authenticated` pueda *intentar* realizar consultas sobre las
-- tablas. Sin estos GRANTs, PostgreSQL devuelve `permission denied` y
-- RLS no llega a evaluarse. Se incluyen aquí de forma idempotente.

GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT ON TABLE
  public.businesses,
  public.users,
  public.business_configs,
  public.features,
  public.subscriptions,
  public.product_categories,
  public.products,
  public.inventory,
  public.inventory_movements,
  public.invoices,
  public.invoice_items,
  public.payments,
  public.suppliers,
  public.purchase_orders,
  public.purchase_items,
  public.cash_sessions,
  public.expense_categories,
  public.expenses,
  public.staff_attendance,
  public.staff_expenses,
  public.notifications,
  public.audit_logs
TO authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

DROP POLICY IF EXISTS "usuario propio por auth uid" ON public.users;

CREATE POLICY "usuario propio por auth uid" ON public.users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Notas de diagnóstico y qué funcionó:
-- 1) `get_business_id()` re-creada: funciona. Evita que el cálculo del
--    negocio dependa de una lectura previa fallida de `public.users`.
-- 2) GRANTs: aplicar los GRANTs al rol `authenticated` resolvió los
--    errores `permission denied for table users` que impedían que RLS
--    se evaluara. Es imprescindible ejecutarlos una sola vez.
-- 3) Policy "usuario propio por auth uid": permitió que un usuario
--    autenticado lea su propia fila en `public.users` (SELECT).
--
-- Resultado esperado tras ejecutar este script:
-- - El SELECT diagnostico debe mostrar `auth_user_id` y `public_user_id`
--   con el mismo UUID para el usuario de prueba.
-- - En `pg_policies` debe aparecer la policy "usuario propio por auth uid".
--
-- Recomendación: conservar este archivo `06_auth_rls_repair.sql` como
-- script idempotente. Los archivos `04_...` y `05_...` quedan archivados
-- para referencia y no se deben ejecutar por separado en producción.

-- Diagnostico esperado:
-- Debe existir el usuario en auth.users y public.users con el mismo UUID.
SELECT
  au.id AS auth_user_id,
  au.email AS auth_email,
  pu.id AS public_user_id,
  pu.email AS public_email,
  pu.business_id,
  pu.role
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
WHERE au.id = '7e6c467f-2be3-4a33-81d2-8cb81716a73f';

-- Debe listar la policy "usuario propio por auth uid".
SELECT policyname, cmd, roles, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'users'
ORDER BY policyname;
