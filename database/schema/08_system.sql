-- Notificaciones
CREATE TABLE notifications (
  id          SERIAL PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id),
  type        VARCHAR(30) CHECK (type IN ('alert','reminder','promo')),
  message     TEXT,
  channel     VARCHAR(20) CHECK (channel IN ('push','whatsapp','email')),
  is_read     BOOLEAN DEFAULT FALSE,
  sent_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Auditoría
CREATE TABLE audit_logs (
  id          SERIAL PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id),
  action      VARCHAR(20) CHECK (action IN ('create','edit','delete')),
  table_name  VARCHAR(80),
  record_id   UUID,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
