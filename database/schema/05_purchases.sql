-- Proveedores
CREATE TABLE suppliers (
  id          SERIAL PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name        VARCHAR(150) NOT NULL,
  phone       VARCHAR(30),
  email       VARCHAR(150),
  tax_id      VARCHAR(50),
  notes       TEXT,
  is_active   BOOLEAN DEFAULT TRUE
);

-- Órdenes de compra
CREATE TABLE purchase_orders (
  id          SERIAL PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  supplier_id INTEGER REFERENCES suppliers(id),
  total       DECIMAL(12,2) DEFAULT 0,
  status      VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','received','cancelled')),
  user_id     UUID REFERENCES users(id),
  ordered_at  TIMESTAMPTZ DEFAULT NOW(),
  received_at TIMESTAMPTZ
);

-- Detalle de cada compra
CREATE TABLE purchase_items (
  id                SERIAL PRIMARY KEY,
  purchase_order_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id        INTEGER REFERENCES products(id),
  quantity          DECIMAL(12,3) NOT NULL,
  unit_cost         DECIMAL(12,2) NOT NULL,
  subtotal          DECIMAL(12,2) NOT NULL
);
