-- Migración para permitir rastrear quién creó el negocio antes de tener un perfil vinculado.
-- Esto resuelve el ciclo de dependencia en el RLS durante el registro.

ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- Actualizar negocios existentes si los hay (opcional para desarrollo)
-- UPDATE public.businesses SET owner_id = ... WHERE owner_id IS NULL;
