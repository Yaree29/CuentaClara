-- Configuración por negocio
CREATE TABLE business_configs (
  id            SERIAL PRIMARY KEY,
  business_id   UUID NOT NULL UNIQUE REFERENCES businesses(id) ON DELETE CASCADE,
  currency      VARCHAR(10) DEFAULT 'USD',
  weight_unit   VARCHAR(10) DEFAULT 'kg',
  tax_rate      DECIMAL(5,2) DEFAULT 0,
  logo_url      VARCHAR(255),
  primary_color VARCHAR(20),
  language      VARCHAR(5) DEFAULT 'es'
);

-- Feature flags por negocio
CREATE TABLE features (
  id           SERIAL PRIMARY KEY,
  business_id  UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  module       VARCHAR(50) NOT NULL,
  is_active    BOOLEAN DEFAULT FALSE,
  activated_at TIMESTAMPTZ
);

-- Suscripciones
CREATE TABLE subscriptions (
  id          SERIAL PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  plan        VARCHAR(20) CHECK (plan IN ('free','basic','pro')),
  status      VARCHAR(20) CHECK (status IN ('active','expired','cancelled')),
  starts_at   TIMESTAMPTZ,
  ends_at     TIMESTAMPTZ,
  payment_ref VARCHAR(100)
);
