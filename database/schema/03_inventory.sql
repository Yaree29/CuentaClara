-- Categorías de productos (por negocio)
CREATE TABLE product_categories (
  id          SERIAL PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  color       VARCHAR(20)
);

-- Productos
CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES product_categories(id),
  name        VARCHAR(150) NOT NULL,
  sku         VARCHAR(80),
  price       DECIMAL(12,2) DEFAULT 0,
  unit_type   VARCHAR(20),
  image_url   VARCHAR(255),
  is_active   BOOLEAN DEFAULT TRUE
);

-- Inventario actual
CREATE TABLE inventory (
  id          SERIAL PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id),
  quantity    DECIMAL(12,3) DEFAULT 0,
  unit        VARCHAR(20),
  min_stock   DECIMAL(12,3) DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Historial de movimientos de inventario
CREATE TABLE inventory_movements (
  id           SERIAL PRIMARY KEY,
  business_id  UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  product_id   INTEGER NOT NULL REFERENCES products(id),
  reference_id INTEGER,
  type         VARCHAR(20) CHECK (type IN ('in','out','adjust','loss')),
  quantity     DECIMAL(12,3) NOT NULL,
  reason       VARCHAR(50)   CHECK (reason IN ('sale','purchase','waste','manual','return')),
  user_id      UUID REFERENCES users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
