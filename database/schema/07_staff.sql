-- Asistencia del personal
CREATE TABLE staff_attendance (
  id          SERIAL PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id),
  check_in    TIMESTAMPTZ NOT NULL,
  check_out   TIMESTAMPTZ,
  notes       TEXT
);

-- Pagos al personal
CREATE TABLE staff_expenses (
  id          SERIAL PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id),
  type        VARCHAR(20) CHECK (type IN ('salary','advance','bonus','deduction')),
  amount      DECIMAL(12,2) NOT NULL,
  description TEXT,
  paid_at     TIMESTAMPTZ DEFAULT NOW()
);
