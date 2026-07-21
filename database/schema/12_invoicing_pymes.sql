-- =============================================================================
-- CREADO: 2026-07-07
-- Propósito: Soporte de facturación fiscal para el módulo PYME (factura con
--            cliente vinculado y número de documento secuencial). El flujo
--            informal (sales_service.create_quick_sale) sigue sin cliente ni
--            numeración; esta migración solo agrega las columnas nuevas que
--            usa invoice_service.create_invoice, sin tocar el módulo Informal.
-- Aplica:    Tras 11_credit_debts.sql. Aplicar manualmente en Supabase SQL
--            Editor antes de habilitar POST /invoices.
-- =============================================================================

ALTER TABLE invoices
  ADD COLUMN customer_id    INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  ADD COLUMN invoice_number VARCHAR(30),
  ADD COLUMN notes          TEXT;

-- Único por negocio + tipo de documento; NULL (ventas rápidas informales)
-- queda fuera de la restricción.
CREATE UNIQUE INDEX idx_invoices_business_number
  ON invoices(business_id, invoice_number)
  WHERE invoice_number IS NOT NULL;

CREATE INDEX idx_invoices_customer ON invoices(customer_id);
