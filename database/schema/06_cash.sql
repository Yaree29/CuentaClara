-- Sesiones de caja
CREATE TABLE cash_sessions (
  id             SERIAL PRIMARY KEY,
  business_id    UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id        UUID REFERENCES users(id),
  opening_amount DECIMAL(12,2) DEFAULT 0,
  closing_amount DECIMAL(12,2),
  status         VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open','closed')),
  opened_at      TIMESTAMPTZ DEFAULT NOW(),
  closed_at      TIMESTAMPTZ
);

-- Categorías de gastos
CREATE TABLE expense_categories (
  id          SERIAL PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  icon        VARCHAR(50),
  color       VARCHAR(20)
);

-- Gastos
CREATE TABLE expenses (
  id               SERIAL PRIMARY KEY,
  business_id      UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category_id      INTEGER REFERENCES expense_categories(id),
  cash_session_id  INTEGER REFERENCES cash_sessions(id),
  amount           DECIMAL(12,2) NOT NULL,
  description      TEXT,
  receipt_url      VARCHAR(255),
  user_id          UUID REFERENCES users(id),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
