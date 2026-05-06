-- Script para arreglar los permisos RLS durante el proceso de registro
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Políticas para la tabla 'businesses'
DROP POLICY IF EXISTS "negocio propio" ON businesses;

CREATE POLICY "permitir crear negocio" ON businesses
  FOR INSERT TO authenticated WITH CHECK (true);

-- Permite ver el negocio si eres el dueño, o si es un negocio huérfano (recién creado en el registro)
CREATE POLICY "permitir ver negocio" ON businesses
  FOR SELECT TO authenticated USING (
    id = get_business_id() 
    OR 
    NOT EXISTS (SELECT 1 FROM users WHERE business_id = businesses.id)
  );

CREATE POLICY "permitir actualizar negocio" ON businesses
  FOR UPDATE TO authenticated USING (id = get_business_id());

CREATE POLICY "permitir eliminar negocio" ON businesses
  FOR DELETE TO authenticated USING (id = get_business_id());


-- 2. Políticas para la tabla 'users' (perfil público)
DROP POLICY IF EXISTS "usuarios del negocio" ON users;
DROP POLICY IF EXISTS "usuario propio por auth uid" ON users;

CREATE POLICY "permitir crear perfil" ON users
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

CREATE POLICY "permitir ver usuarios" ON users
  FOR SELECT TO authenticated USING (business_id = get_business_id() OR id = auth.uid());

CREATE POLICY "permitir actualizar usuarios" ON users
  FOR UPDATE TO authenticated USING (business_id = get_business_id() OR id = auth.uid());

CREATE POLICY "permitir eliminar usuarios" ON users
  FOR DELETE TO authenticated USING (business_id = get_business_id());


-- 3. Políticas para 'business_configs'
DROP POLICY IF EXISTS "config del negocio" ON business_configs;

CREATE POLICY "permitir crear config" ON business_configs
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "permitir select config" ON business_configs
  FOR SELECT TO authenticated USING (business_id = get_business_id());

CREATE POLICY "permitir update config" ON business_configs
  FOR UPDATE TO authenticated USING (business_id = get_business_id());

CREATE POLICY "permitir delete config" ON business_configs
  FOR DELETE TO authenticated USING (business_id = get_business_id());


-- 4. Políticas para 'features'
DROP POLICY IF EXISTS "features del negocio" ON features;

CREATE POLICY "permitir crear features" ON features
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "permitir select features" ON features
  FOR SELECT TO authenticated USING (business_id = get_business_id());

CREATE POLICY "permitir update features" ON features
  FOR UPDATE TO authenticated USING (business_id = get_business_id());

CREATE POLICY "permitir delete features" ON features
  FOR DELETE TO authenticated USING (business_id = get_business_id());
