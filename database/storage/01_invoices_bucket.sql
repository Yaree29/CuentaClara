-- =============================================================================
-- CREADO: 2026-07-07
-- Propósito: Bucket de Supabase Storage para los PDFs de facturas fiscales
--            del módulo PYME (generados por invoice_pdf_service.py). Cada
--            archivo se guarda en la ruta {business_id}/{invoice_id}.pdf, así
--            que la política de acceso reutiliza esa carpeta como límite de
--            tenant, igual que `business_id` en las tablas normales.
-- Aplica:    Manualmente en Supabase SQL Editor. El backend siempre usa
--            supabase_admin (service role), que ignora estas políticas; se
--            agregan como defensa en profundidad por si el bucket se accede
--            alguna vez con la anon/user key.
-- =============================================================================

insert into storage.buckets (id, name, public)
values ('invoices', 'invoices', false)
on conflict (id) do nothing;

create policy "facturas pdf del negocio (select)"
  on storage.objects for select
  using (bucket_id = 'invoices' and (storage.foldername(name))[1] = get_business_id()::text);

create policy "facturas pdf del negocio (insert)"
  on storage.objects for insert
  with check (bucket_id = 'invoices' and (storage.foldername(name))[1] = get_business_id()::text);

create policy "facturas pdf del negocio (update)"
  on storage.objects for update
  using (bucket_id = 'invoices' and (storage.foldername(name))[1] = get_business_id()::text);
