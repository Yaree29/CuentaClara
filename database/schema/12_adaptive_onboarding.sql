-- Migración para onboarding adaptativo de PYMEs
-- Añade tax_id a la tabla businesses para identificación tributaria
-- Añade settings (JSONB) a business_configs para configuraciones dinámicas y operativas

ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50);

ALTER TABLE public.business_configs 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;
