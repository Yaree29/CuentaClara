-- Categorías globales de tipo de negocio
CREATE TABLE categories (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  icon      VARCHAR(100),
  description TEXT
);

-- Plantillas por industria
CREATE TABLE industry_templates (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(100) NOT NULL,
  default_modules  JSONB,
  default_units    JSONB,
  icon             VARCHAR(100)
);

-- Unidades de medida globales
CREATE TABLE units_of_measure (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  symbol    VARCHAR(20)  NOT NULL,
  type      VARCHAR(20)  CHECK (type IN ('weight','volume','unit','length')),
  is_active BOOLEAN DEFAULT TRUE
);

-- Negocios
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

-- Usuarios
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

