-- Tipos de documento
CREATE TABLE invoice_types (
  id     SERIAL PRIMARY KEY,
  name   VARCHAR(80) NOT NULL,
  prefix VARCHAR(10)
);

-- Facturas / ventas
CREATE TABLE invoices (
  id              SERIAL PRIMARY KEY,
  business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  invoice_type_id INTEGER REFERENCES invoice_types(id),
  total           DECIMAL(12,2) DEFAULT 0,
  tax             DECIMAL(12,2) DEFAULT 0,
  status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('paid','pending','void')),
  user_id         UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Detalle de cada factura
CREATE TABLE invoice_items (
  id          SERIAL PRIMARY KEY,
  invoice_id  INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id  INTEGER REFERENCES products(id),
  quantity    DECIMAL(12,3) NOT NULL,
  unit_price  DECIMAL(12,2) NOT NULL,
  subtotal    DECIMAL(12,2) NOT NULL
);

-- Pagos
CREATE TABLE payments (
  id         SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount     DECIMAL(12,2) NOT NULL,
  method     VARCHAR(20) CHECK (method IN ('cash','card','transfer','other')),
  reference  VARCHAR(100),
  paid_at    TIMESTAMPTZ DEFAULT NOW()
);
