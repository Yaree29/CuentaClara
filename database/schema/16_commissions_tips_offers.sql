-- =============================================================================
-- 16_commissions_tips_offers.sql
-- -----------------------------------------------------------------------------
-- Tablas para los módulos Comisiones, Propinas y Gestor de Ofertas
-- (ver DASHBOARD_PYMES.md). Todas las FK a negocio/asistente/producto/categoría
-- usan los tipos ya confirmados en el schema existente: businesses.id UUID,
-- business_assistants.id / products.id / product_categories.id INTEGER.
-- =============================================================================

-- ─── Comisiones ──────────────────────────────────────────────────────────────

-- Configuración de comisión vigente por asistente (una fila por asistente).
CREATE TABLE assistant_commissions (
  id                SERIAL PRIMARY KEY,
  business_id       UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  assistant_id      INTEGER NOT NULL REFERENCES business_assistants(id) ON DELETE CASCADE,
  commission_type   VARCHAR(20) NOT NULL CHECK (commission_type IN ('percentage', 'fixed')),
  commission_value  DECIMAL(12,2) NOT NULL CHECK (commission_value >= 0),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (business_id, assistant_id)
);

-- Historial de pagos de comisión — acción explícita del dueño, no automática.
CREATE TABLE commission_payments (
  id            SERIAL PRIMARY KEY,
  business_id   UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  assistant_id  INTEGER REFERENCES business_assistants(id) ON DELETE SET NULL,
  assistant_name VARCHAR(100), -- snapshot al momento del pago, igual que invoices.assistant_name
  period_from   DATE NOT NULL,
  period_to     DATE NOT NULL,
  amount        DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  notes         TEXT,
  paid_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Propinas ────────────────────────────────────────────────────────────────

CREATE TABLE tips (
  id                 SERIAL PRIMARY KEY,
  business_id        UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  amount             DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  distribution_type  VARCHAR(20) NOT NULL CHECK (distribution_type IN ('automatic', 'manual')),
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tip_distributions (
  id            SERIAL PRIMARY KEY,
  tip_id        INTEGER NOT NULL REFERENCES tips(id) ON DELETE CASCADE,
  assistant_id  INTEGER REFERENCES business_assistants(id) ON DELETE SET NULL,
  assistant_name VARCHAR(100), -- snapshot, mismo criterio que commission_payments
  amount        DECIMAL(12,2) NOT NULL CHECK (amount >= 0)
);

-- ─── Gestor de Ofertas ────────────────────────────────────────────────────────

CREATE TABLE promotions (
  id              SERIAL PRIMARY KEY,
  business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  scope           VARCHAR(20) NOT NULL CHECK (scope IN ('product', 'category')),
  product_id      INTEGER REFERENCES products(id) ON DELETE CASCADE,
  category_id     INTEGER REFERENCES product_categories(id) ON DELETE CASCADE,
  discount_type   VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value  DECIMAL(12,2) NOT NULL CHECK (discount_value > 0),
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL CHECK (end_date >= start_date),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
