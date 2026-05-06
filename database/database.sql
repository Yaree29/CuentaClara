-- ============================================================
--  CuentaClara — Script completo de base de datos
--  PostgreSQL / Supabase
--  Generado para el equipo de desarrollo
--  Orden: Esquema → Índices → Seeds → RLS
-- ============================================================


-- ============================================================
--  BLOQUE 1 — NÚCLEO DEL SISTEMA
-- ============================================================

CREATE TABLE categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  icon        VARCHAR(100),
  description TEXT
);

CREATE TABLE industry_templates (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  default_modules JSONB,
  default_units   JSONB,
  icon            VARCHAR(100)
);

CREATE TABLE units_of_measure (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  symbol    VARCHAR(20)  NOT NULL,
  type      VARCHAR(20)  CHECK (type IN ('weight','volume','unit','length')),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE businesses (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 VARCHAR(150) NOT NULL,
  category_id          INTEGER REFERENCES categories(id),
  industry_template_id INTEGER REFERENCES industry_templates(id),
  ui_mode              VARCHAR(20) DEFAULT 'simple' CHECK (ui_mode IN ('simple','advanced')),
  plan                 VARCHAR(20) DEFAULT 'free'   CHECK (plan IN ('free','basic','pro')),
  phone                VARCHAR(30),
  address              TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name          VARCHAR(150) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20) DEFAULT 'staff' CHECK (role IN ('owner','staff','admin')),
  phone         VARCHAR(30),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
--  BLOQUE 2 — CONFIGURACIÓN DEL NEGOCIO
-- ============================================================

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

CREATE TABLE features (
  id           SERIAL PRIMARY KEY,
  business_id  UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  module       VARCHAR(50) NOT NULL,
  is_active    BOOLEAN DEFAULT FALSE,
  activated_at TIMESTAMPTZ
);

CREATE TABLE subscriptions (
  id          SERIAL PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  plan        VARCHAR(20) CHECK (plan IN ('free','basic','pro')),
  status      VARCHAR(20) CHECK (status IN ('active','expired','cancelled')),
  starts_at   TIMESTAMPTZ,
  ends_at     TIMESTAMPTZ,
  payment_ref VARCHAR(100)
);


-- ============================================================
--  BLOQUE 3 — INVENTARIO Y PRODUCTOS
-- ============================================================

CREATE TABLE product_categories (
  id          SERIAL PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  color       VARCHAR(20)
);

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

CREATE TABLE inventory (
  id          SERIAL PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id),
  quantity    DECIMAL(12,3) DEFAULT 0,
  unit        VARCHAR(20),
  min_stock   DECIMAL(12,3) DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

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


-- ============================================================
--  BLOQUE 4 — VENTAS Y FACTURACIÓN
-- ============================================================

CREATE TABLE invoice_types (
  id     SERIAL PRIMARY KEY,
  name   VARCHAR(80) NOT NULL,
  prefix VARCHAR(10)
);

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

CREATE TABLE invoice_items (
  id         SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity   DECIMAL(12,3) NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  subtotal   DECIMAL(12,2) NOT NULL
);

CREATE TABLE payments (
  id         SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount     DECIMAL(12,2) NOT NULL,
  method     VARCHAR(20) CHECK (method IN ('cash','card','transfer','other')),
  reference  VARCHAR(100),
  paid_at    TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
--  BLOQUE 5 — COMPRAS Y PROVEEDORES
-- ============================================================

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

CREATE TABLE purchase_items (
  id                SERIAL PRIMARY KEY,
  purchase_order_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id        INTEGER REFERENCES products(id),
  quantity          DECIMAL(12,3) NOT NULL,
  unit_cost         DECIMAL(12,2) NOT NULL,
  subtotal          DECIMAL(12,2) NOT NULL
);


-- ============================================================
--  BLOQUE 6 — CAJA Y GASTOS
-- ============================================================

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

CREATE TABLE expense_categories (
  id          SERIAL PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  icon        VARCHAR(50),
  color       VARCHAR(20)
);

CREATE TABLE expenses (
  id              SERIAL PRIMARY KEY,
  business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category_id     INTEGER REFERENCES expense_categories(id),
  cash_session_id INTEGER REFERENCES cash_sessions(id),
  amount          DECIMAL(12,2) NOT NULL,
  description     TEXT,
  receipt_url     VARCHAR(255),
  user_id         UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
--  BLOQUE 7 — STAFF
-- ============================================================

CREATE TABLE staff_attendance (
  id          SERIAL PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id),
  check_in    TIMESTAMPTZ NOT NULL,
  check_out   TIMESTAMPTZ,
  notes       TEXT
);

CREATE TABLE staff_expenses (
  id          SERIAL PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id),
  type        VARCHAR(20) CHECK (type IN ('salary','advance','bonus','deduction')),
  amount      DECIMAL(12,2) NOT NULL,
  description TEXT,
  paid_at     TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
--  BLOQUE 8 — SISTEMA
-- ============================================================

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

CREATE TABLE audit_logs (
  id          SERIAL PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id),
  action      VARCHAR(20) CHECK (action IN ('create','edit','delete')),
  table_name  VARCHAR(80),
  record_id   UUID,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
--  BLOQUE 9 — ÍNDICES
-- ============================================================

CREATE INDEX idx_users_business         ON users(business_id);
CREATE INDEX idx_products_business      ON products(business_id);
CREATE INDEX idx_inventory_product      ON inventory(product_id);
CREATE INDEX idx_inv_movements_business ON inventory_movements(business_id);
CREATE INDEX idx_inv_movements_product  ON inventory_movements(product_id);
CREATE INDEX idx_invoices_business      ON invoices(business_id);
CREATE INDEX idx_invoices_status        ON invoices(status);
CREATE INDEX idx_invoice_items_invoice  ON invoice_items(invoice_id);
CREATE INDEX idx_payments_invoice       ON payments(invoice_id);
CREATE INDEX idx_purchase_orders_biz    ON purchase_orders(business_id);
CREATE INDEX idx_expenses_business      ON expenses(business_id);
CREATE INDEX idx_cash_sessions_business ON cash_sessions(business_id);
CREATE INDEX idx_audit_logs_business    ON audit_logs(business_id);
CREATE INDEX idx_notifications_user     ON notifications(user_id);


-- ============================================================
--  BLOQUE 10 — SEEDS (datos base)
-- ============================================================

-- Categorías de negocios
INSERT INTO categories (name, icon, description) VALUES
('Carnicería',      '🥩', 'Venta de carnes y derivados'),
('Barbería',        '✂️', 'Servicios de corte y arreglo personal'),
('Estilista',       '💇', 'Salón de belleza y servicios capilares'),
('Tienda de ropa',  '👕', 'Venta de prendas y accesorios'),
('Papelería',       '📎', 'Artículos de oficina y escolares'),
('Farmacia',        '💊', 'Medicamentos y productos de salud'),
('Ferretería',      '🔧', 'Herramientas y materiales de construcción'),
('Panadería',       '🍞', 'Pan, repostería y productos horneados'),
('Frutería',        '🍎', 'Frutas, verduras y productos frescos'),
('Restaurante',     '🍽️', 'Comida y bebidas preparadas'),
('Tienda general',  '🏪', 'Comercio mixto o sin categoría específica');

-- Unidades de medida
INSERT INTO units_of_measure (name, symbol, type) VALUES
('Kilogramo',  'kg',  'weight'),
('Libra',      'lb',  'weight'),
('Gramo',      'g',   'weight'),
('Onza',       'oz',  'weight'),
('Litro',      'L',   'volume'),
('Mililitro',  'ml',  'volume'),
('Galón',      'gal', 'volume'),
('Unidad',     'und', 'unit'),
('Docena',     'doc', 'unit'),
('Caja',       'cja', 'unit'),
('Paquete',    'paq', 'unit'),
('Rollo',      'rol', 'unit'),
('Metro',      'm',   'length'),
('Centímetro', 'cm',  'length');

-- Plantillas de industria
INSERT INTO industry_templates (name, default_modules, default_units, icon) VALUES
('Carnicería',     '["inventory","sales","purchases","cash","staff"]', '["kg","lb","g"]',       '🥩'),
('Barbería',       '["sales","cash","staff"]',                         '["und"]',               '✂️'),
('Estilista',      '["sales","cash","staff"]',                         '["und","ml"]',           '💇'),
('Tienda de ropa', '["inventory","sales","purchases","cash"]',         '["und","doc"]',          '👕'),
('Papelería',      '["inventory","sales","purchases","cash"]',         '["und","cja","paq"]',    '📎'),
('Farmacia',       '["inventory","sales","purchases","cash"]',         '["und","cja","ml"]',     '💊'),
('Ferretería',     '["inventory","sales","purchases","cash"]',         '["und","m","kg"]',       '🔧'),
('Panadería',      '["inventory","sales","purchases","cash","staff"]', '["kg","g","und"]',       '🍞'),
('Frutería',       '["inventory","sales","purchases","cash"]',         '["kg","lb","und"]',      '🍎'),
('Restaurante',    '["inventory","sales","cash","staff"]',             '["kg","L","und"]',       '🍽️'),
('Tienda general', '["inventory","sales","purchases","cash"]',         '["und","cja"]',          '🏪');

-- Tipos de factura
INSERT INTO invoice_types (name, prefix) VALUES
('Venta',           'FAC'),
('Cotización',      'COT'),
('Nota de crédito', 'NC'),
('Proforma',        'PRF');

-- ============================================================
--  NEGOCIO DE PRUEBA (solo para desarrollo)
-- ============================================================

INSERT INTO businesses (id, name, category_id, industry_template_id, ui_mode, plan, phone)
VALUES (
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Carnicería Don Pedro', 1, 1, 'simple', 'pro', '+507 6000-0001'
);

INSERT INTO business_configs (business_id, currency, weight_unit, tax_rate, language)
VALUES ('a1b2c3d4-0000-0000-0000-000000000001', 'USD', 'kg', 7.00, 'es');

INSERT INTO users (id, business_id, name, email, password_hash, role) VALUES
('b1b2c3d4-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001',
 'Pedro Martínez', 'pedro@carnicedonpedro.com', 'hash_aqui', 'owner'),
('b1b2c3d4-0000-0000-0000-000000000002', 'a1b2c3d4-0000-0000-0000-000000000001',
 'Ana Rodríguez',  'ana@carnicedonpedro.com',   'hash_aqui', 'staff');

INSERT INTO features (business_id, module, is_active, activated_at) VALUES
('a1b2c3d4-0000-0000-0000-000000000001', 'inventory', TRUE, NOW()),
('a1b2c3d4-0000-0000-0000-000000000001', 'sales',     TRUE, NOW()),
('a1b2c3d4-0000-0000-0000-000000000001', 'purchases', TRUE, NOW()),
('a1b2c3d4-0000-0000-0000-000000000001', 'cash',      TRUE, NOW()),
('a1b2c3d4-0000-0000-0000-000000000001', 'staff',     TRUE, NOW());

INSERT INTO subscriptions (business_id, plan, status, starts_at, ends_at)
VALUES ('a1b2c3d4-0000-0000-0000-000000000001', 'pro', 'active', NOW(), NOW() + INTERVAL '1 year');

INSERT INTO product_categories (business_id, name, color) VALUES
('a1b2c3d4-0000-0000-0000-000000000001', 'Res',       '#E53E3E'),
('a1b2c3d4-0000-0000-0000-000000000001', 'Cerdo',     '#ED8936'),
('a1b2c3d4-0000-0000-0000-000000000001', 'Pollo',     '#ECC94B'),
('a1b2c3d4-0000-0000-0000-000000000001', 'Embutidos', '#9F7AEA');

INSERT INTO products (business_id, category_id, name, sku, price, unit_type) VALUES
('a1b2c3d4-0000-0000-0000-000000000001', 1, 'Lomo de res',      'RES-001', 7.50, 'kg'),
('a1b2c3d4-0000-0000-0000-000000000001', 1, 'Costilla de res',  'RES-002', 4.50, 'kg'),
('a1b2c3d4-0000-0000-0000-000000000001', 1, 'Carne molida',     'RES-003', 5.00, 'kg'),
('a1b2c3d4-0000-0000-0000-000000000001', 2, 'Chuleta de cerdo', 'CER-001', 3.75, 'kg'),
('a1b2c3d4-0000-0000-0000-000000000001', 3, 'Pechuga de pollo', 'POL-001', 3.25, 'kg'),
('a1b2c3d4-0000-0000-0000-000000000001', 4, 'Salchicha',        'EMB-001', 2.50, 'kg');

INSERT INTO inventory (business_id, product_id, quantity, unit, min_stock) VALUES
('a1b2c3d4-0000-0000-0000-000000000001', 1, 45.5, 'kg', 10),
('a1b2c3d4-0000-0000-0000-000000000001', 2, 30.0, 'kg', 8),
('a1b2c3d4-0000-0000-0000-000000000001', 3, 20.0, 'kg', 5),
('a1b2c3d4-0000-0000-0000-000000000001', 4, 25.5, 'kg', 8),
('a1b2c3d4-0000-0000-0000-000000000001', 5, 18.0, 'kg', 5),
('a1b2c3d4-0000-0000-0000-000000000001', 6, 12.0, 'kg', 3);

INSERT INTO expense_categories (business_id, name, icon, color) VALUES
('a1b2c3d4-0000-0000-0000-000000000001', 'Servicios',  '💡', '#3182CE'),
('a1b2c3d4-0000-0000-0000-000000000001', 'Arriendo',   '🏠', '#805AD5'),
('a1b2c3d4-0000-0000-0000-000000000001', 'Insumos',    '🛍️', '#38A169'),
('a1b2c3d4-0000-0000-0000-000000000001', 'Transporte', '🚗', '#DD6B20'),
('a1b2c3d4-0000-0000-0000-000000000001', 'Otros',      '📦', '#718096');


-- ============================================================
--  BLOQUE 11 — RLS (Row Level Security)
-- ============================================================

-- Activar RLS en todas las tablas
ALTER TABLE businesses          ENABLE ROW LEVEL SECURITY;
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_configs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE features            ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE products            ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory           ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices            ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_sessions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses            ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_attendance    ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_expenses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs          ENABLE ROW LEVEL SECURITY;

-- Función helper: lee el business_id del JWT
CREATE OR REPLACE FUNCTION get_business_id()
RETURNS UUID AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::jsonb ->> 'business_id',
    ''
  )::UUID;
$$ LANGUAGE sql STABLE;

-- Políticas por tabla
CREATE POLICY "negocio propio"              ON businesses          FOR ALL USING (id = get_business_id());
CREATE POLICY "usuarios del negocio"        ON users               FOR ALL USING (business_id = get_business_id());
CREATE POLICY "config del negocio"          ON business_configs    FOR ALL USING (business_id = get_business_id());
CREATE POLICY "features del negocio"        ON features            FOR ALL USING (business_id = get_business_id());
CREATE POLICY "suscripcion del negocio"     ON subscriptions       FOR ALL USING (business_id = get_business_id());
CREATE POLICY "categorias del negocio"      ON product_categories  FOR ALL USING (business_id = get_business_id());
CREATE POLICY "productos del negocio"       ON products            FOR ALL USING (business_id = get_business_id());
CREATE POLICY "inventario del negocio"      ON inventory           FOR ALL USING (business_id = get_business_id());
CREATE POLICY "movimientos del negocio"     ON inventory_movements FOR ALL USING (business_id = get_business_id());
CREATE POLICY "facturas del negocio"        ON invoices            FOR ALL USING (business_id = get_business_id());
CREATE POLICY "proveedores del negocio"     ON suppliers           FOR ALL USING (business_id = get_business_id());
CREATE POLICY "compras del negocio"         ON purchase_orders     FOR ALL USING (business_id = get_business_id());
CREATE POLICY "caja del negocio"            ON cash_sessions       FOR ALL USING (business_id = get_business_id());
CREATE POLICY "categorias gastos negocio"   ON expense_categories  FOR ALL USING (business_id = get_business_id());
CREATE POLICY "gastos del negocio"          ON expenses            FOR ALL USING (business_id = get_business_id());
CREATE POLICY "asistencia del negocio"      ON staff_attendance    FOR ALL USING (business_id = get_business_id());
CREATE POLICY "pagos staff del negocio"     ON staff_expenses      FOR ALL USING (business_id = get_business_id());
CREATE POLICY "notificaciones del negocio"  ON notifications       FOR ALL USING (business_id = get_business_id());
CREATE POLICY "auditoria del negocio"       ON audit_logs          FOR ALL USING (business_id = get_business_id());

CREATE POLICY "items de facturas del negocio" ON invoice_items FOR ALL USING (
  invoice_id IN (SELECT id FROM invoices WHERE business_id = get_business_id())
);

CREATE POLICY "pagos del negocio" ON payments FOR ALL USING (
  invoice_id IN (SELECT id FROM invoices WHERE business_id = get_business_id())
);

CREATE POLICY "items de compras del negocio" ON purchase_items FOR ALL USING (
  purchase_order_id IN (SELECT id FROM purchase_orders WHERE business_id = get_business_id())
);

-- Tablas globales: solo lectura pública
CREATE POLICY "lectura publica" ON categories        FOR SELECT USING (true);
CREATE POLICY "lectura publica" ON industry_templates FOR SELECT USING (true);
CREATE POLICY "lectura publica" ON units_of_measure   FOR SELECT USING (true);
CREATE POLICY "lectura publica" ON invoice_types       FOR SELECT USING (true);

-- ============================================================
--  FIN DEL SCRIPT
-- ============================================================
