-- =============================================================================
-- CREADO: 2026-05-26
-- Propósito: Tablas para el módulo de crédito/fiado.
--            Permite a un negocio registrar clientes, deudas pendientes y
--            abonos parciales. Usado por usuarios informales (siempre) y por
--            PYME que activen el módulo 'credit' en sus features.
-- Aplica:    Tras 10_fix_registration_flow.sql. Aplicar manualmente en
--            Supabase SQL Editor antes de habilitar el backend de credit.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- customers: clientes del negocio (los que reciben fiado).
-- Un cliente pertenece a un solo negocio. No se vincula con auth.users porque
-- los clientes del comerciante NO son usuarios del sistema, son contactos.
-- -----------------------------------------------------------------------------
CREATE TABLE customers (
  id           SERIAL PRIMARY KEY,
  business_id  UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name         VARCHAR(120) NOT NULL,
  phone        VARCHAR(30),
  notes        TEXT,
  is_active    BOOLEAN DEFAULT TRUE,  -- soft delete: desactivar sin perder historial
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_business ON customers(business_id);
CREATE INDEX idx_customers_name     ON customers(business_id, name);

-- -----------------------------------------------------------------------------
-- debts: cada fila es una deuda/fiado abierto.
-- - original_amount  → monto inicial cuando se creó el fiado.
-- - remaining_amount → saldo pendiente; se reduce con cada abono.
-- - invoice_id (opcional) → si la deuda viene de una venta a crédito, queda
--   vinculada a la factura para trazabilidad. Para fiado manual (sin factura)
--   se deja NULL.
-- - status:
--     pending   → sin abonos aún
--     partial   → tiene al menos un abono, queda saldo
--     paid      → saldado totalmente
--     overdue   → vencida (due_date < hoy y aún con saldo)
--     cancelled → anulada manualmente
-- -----------------------------------------------------------------------------
CREATE TABLE debts (
  id               SERIAL PRIMARY KEY,
  business_id      UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id      INTEGER NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  invoice_id       INTEGER REFERENCES invoices(id) ON DELETE SET NULL,
  original_amount  DECIMAL(12,2) NOT NULL CHECK (original_amount > 0),
  remaining_amount DECIMAL(12,2) NOT NULL CHECK (remaining_amount >= 0),
  description      TEXT,
  status           VARCHAR(20) DEFAULT 'pending'
                   CHECK (status IN ('pending','partial','paid','overdue','cancelled')),
  due_date         DATE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  paid_at          TIMESTAMPTZ
);

CREATE INDEX idx_debts_business         ON debts(business_id);
CREATE INDEX idx_debts_customer         ON debts(customer_id);
CREATE INDEX idx_debts_business_status  ON debts(business_id, status);

-- -----------------------------------------------------------------------------
-- debt_payments: cada abono que recibe una deuda.
-- - method: efectivo / tarjeta / transferencia / otro (mismos valores que payments)
-- - user_id: usuario que registró el abono (para auditoría)
-- - business_id se denormaliza desde debts.business_id para que las queries
--   y RLS sean más simples y rápidas.
-- -----------------------------------------------------------------------------
CREATE TABLE debt_payments (
  id          SERIAL PRIMARY KEY,
  debt_id     INTEGER NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  amount      DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  method      VARCHAR(20) CHECK (method IN ('cash','card','transfer','other')),
  notes       TEXT,
  paid_at     TIMESTAMPTZ DEFAULT NOW(),
  user_id     UUID REFERENCES users(id)
);

CREATE INDEX idx_debt_payments_debt     ON debt_payments(debt_id);
CREATE INDEX idx_debt_payments_business ON debt_payments(business_id);

-- -----------------------------------------------------------------------------
-- RLS: mismo patrón que el resto de tablas multi-tenant.
-- -----------------------------------------------------------------------------
ALTER TABLE customers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_payments  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clientes del negocio" ON customers
  FOR ALL USING (business_id = get_business_id());

CREATE POLICY "fiados del negocio" ON debts
  FOR ALL USING (business_id = get_business_id());

CREATE POLICY "abonos del negocio" ON debt_payments
  FOR ALL USING (business_id = get_business_id());
