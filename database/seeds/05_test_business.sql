-- Negocio de prueba
INSERT INTO businesses (id, name, category_id, industry_template_id, ui_mode, plan, phone)
VALUES (
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Carnicería Don Pedro',
  1,  -- Carnicería
  1,  -- Template Carnicería
  'simple',
  'pro',
  '+507 6000-0001'
);

-- Configuración del negocio
INSERT INTO business_configs (business_id, currency, weight_unit, tax_rate, language)
VALUES (
  'a1b2c3d4-0000-0000-0000-000000000001',
  'USD', 'kg', 7.00, 'es'
);

-- Usuario dueño
INSERT INTO users (id, business_id, name, email, password_hash, role)
VALUES (
  'b1b2c3d4-0000-0000-0000-000000000001',
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Pedro Martínez',
  'pedro@carnicedonpedro.com',
  'hash_aqui',  -- en producción esto viene encriptado desde tu app
  'owner'
);

-- Usuario empleado
INSERT INTO users (id, business_id, name, email, password_hash, role)
VALUES (
  'b1b2c3d4-0000-0000-0000-000000000002',
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Ana Rodríguez',
  'ana@carnicedonpedro.com',
  'hash_aqui',
  'staff'
);

-- Features activas para el negocio
INSERT INTO features (business_id, module, is_active, activated_at) VALUES
('a1b2c3d4-0000-0000-0000-000000000001', 'inventory',  TRUE, NOW()),
('a1b2c3d4-0000-0000-0000-000000000001', 'sales',      TRUE, NOW()),
('a1b2c3d4-0000-0000-0000-000000000001', 'purchases',  TRUE, NOW()),
('a1b2c3d4-0000-0000-0000-000000000001', 'cash',       TRUE, NOW()),
('a1b2c3d4-0000-0000-0000-000000000001', 'staff',      TRUE, NOW());

-- Suscripción activa
INSERT INTO subscriptions (business_id, plan, status, starts_at, ends_at)
VALUES (
  'a1b2c3d4-0000-0000-0000-000000000001',
  'pro', 'active', NOW(), NOW() + INTERVAL '1 year'
);

-- Categorías de productos
INSERT INTO product_categories (business_id, name, color) VALUES
('a1b2c3d4-0000-0000-0000-000000000001', 'Res',       '#E53E3E'),
('a1b2c3d4-0000-0000-0000-000000000001', 'Cerdo',     '#ED8936'),
('a1b2c3d4-0000-0000-0000-000000000001', 'Pollo',     '#ECC94B'),
('a1b2c3d4-0000-0000-0000-000000000001', 'Embutidos', '#9F7AEA');

-- Productos de prueba
INSERT INTO products (business_id, category_id, name, sku, price, unit_type) VALUES
('a1b2c3d4-0000-0000-0000-000000000001', 1, 'Lomo de res',      'RES-001', 7.50,  'kg'),
('a1b2c3d4-0000-0000-0000-000000000001', 1, 'Costilla de res',  'RES-002', 4.50,  'kg'),
('a1b2c3d4-0000-0000-0000-000000000001', 1, 'Carne molida',     'RES-003', 5.00,  'kg'),
('a1b2c3d4-0000-0000-0000-000000000001', 2, 'Chuleta de cerdo', 'CER-001', 3.75,  'kg'),
('a1b2c3d4-0000-0000-0000-000000000001', 3, 'Pechuga de pollo', 'POL-001', 3.25,  'kg'),
('a1b2c3d4-0000-0000-0000-000000000001', 4, 'Salchicha',        'EMB-001', 2.50,  'kg');

-- Inventario inicial
INSERT INTO inventory (business_id, product_id, quantity, unit, min_stock) VALUES
('a1b2c3d4-0000-0000-0000-000000000001', 1, 45.5,  'kg', 10),
('a1b2c3d4-0000-0000-0000-000000000001', 2, 30.0,  'kg', 8),
('a1b2c3d4-0000-0000-0000-000000000001', 3, 20.0,  'kg', 5),
('a1b2c3d4-0000-0000-0000-000000000001', 4, 25.5,  'kg', 8),
('a1b2c3d4-0000-0000-0000-000000000001', 5, 18.0,  'kg', 5),
('a1b2c3d4-0000-0000-0000-000000000001', 6, 12.0,  'kg', 3);

-- Categorías de gastos
INSERT INTO expense_categories (business_id, name, icon, color) VALUES
('a1b2c3d4-0000-0000-0000-000000000001', 'Servicios',   '💡', '#3182CE'),
('a1b2c3d4-0000-0000-0000-000000000001', 'Arriendo',    '🏠', '#805AD5'),
('a1b2c3d4-0000-0000-0000-000000000001', 'Insumos',     '🛍️', '#38A169'),
('a1b2c3d4-0000-0000-0000-000000000001', 'Transporte',  '🚗', '#DD6B20'),
('a1b2c3d4-0000-0000-0000-000000000001', 'Otros',       '📦', '#718096');
