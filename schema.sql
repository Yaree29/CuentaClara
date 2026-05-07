-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.audit_logs (
  id integer NOT NULL DEFAULT nextval('audit_logs_id_seq'::regclass),
  business_id uuid NOT NULL,
  user_id uuid,
  action character varying CHECK (action::text = ANY (ARRAY['create'::character varying, 'edit'::character varying, 'delete'::character varying]::text[])),
  table_name character varying,
  record_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.business_configs (
  id integer NOT NULL DEFAULT nextval('business_configs_id_seq'::regclass),
  business_id uuid NOT NULL UNIQUE,
  currency character varying DEFAULT 'USD'::character varying,
  weight_unit character varying DEFAULT 'kg'::character varying,
  tax_rate numeric DEFAULT 0,
  logo_url character varying,
  primary_color character varying,
  language character varying DEFAULT 'es'::character varying,
  CONSTRAINT business_configs_pkey PRIMARY KEY (id),
  CONSTRAINT business_configs_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id)
);
CREATE TABLE public.businesses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  category_id integer,
  industry_template_id integer,
  ui_mode character varying DEFAULT 'simple'::character varying CHECK (ui_mode::text = ANY (ARRAY['simple'::character varying, 'advanced'::character varying]::text[])),
  plan character varying DEFAULT 'free'::character varying CHECK (plan::text = ANY (ARRAY['free'::character varying, 'basic'::character varying, 'pro'::character varying]::text[])),
  phone character varying,
  address text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT businesses_pkey PRIMARY KEY (id),
  CONSTRAINT businesses_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT businesses_industry_template_id_fkey FOREIGN KEY (industry_template_id) REFERENCES public.industry_templates(id)
);
CREATE TABLE public.cash_sessions (
  id integer NOT NULL DEFAULT nextval('cash_sessions_id_seq'::regclass),
  business_id uuid NOT NULL,
  user_id uuid,
  opening_amount numeric DEFAULT 0,
  closing_amount numeric,
  status character varying DEFAULT 'open'::character varying CHECK (status::text = ANY (ARRAY['open'::character varying, 'closed'::character varying]::text[])),
  opened_at timestamp with time zone DEFAULT now(),
  closed_at timestamp with time zone,
  CONSTRAINT cash_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT cash_sessions_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id),
  CONSTRAINT cash_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.categories (
  id integer NOT NULL DEFAULT nextval('categories_id_seq'::regclass),
  name character varying NOT NULL,
  icon character varying,
  description text,
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.expense_categories (
  id integer NOT NULL DEFAULT nextval('expense_categories_id_seq'::regclass),
  business_id uuid NOT NULL,
  name character varying NOT NULL,
  icon character varying,
  color character varying,
  CONSTRAINT expense_categories_pkey PRIMARY KEY (id),
  CONSTRAINT expense_categories_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id)
);
CREATE TABLE public.expenses (
  id integer NOT NULL DEFAULT nextval('expenses_id_seq'::regclass),
  business_id uuid NOT NULL,
  category_id integer,
  cash_session_id integer,
  amount numeric NOT NULL,
  description text,
  receipt_url character varying,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT expenses_pkey PRIMARY KEY (id),
  CONSTRAINT expenses_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id),
  CONSTRAINT expenses_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.expense_categories(id),
  CONSTRAINT expenses_cash_session_id_fkey FOREIGN KEY (cash_session_id) REFERENCES public.cash_sessions(id),
  CONSTRAINT expenses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.features (
  id integer NOT NULL DEFAULT nextval('features_id_seq'::regclass),
  business_id uuid NOT NULL,
  module character varying NOT NULL,
  is_active boolean DEFAULT false,
  activated_at timestamp with time zone,
  CONSTRAINT features_pkey PRIMARY KEY (id),
  CONSTRAINT features_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id)
);
CREATE TABLE public.industry_templates (
  id integer NOT NULL DEFAULT nextval('industry_templates_id_seq'::regclass),
  name character varying NOT NULL,
  default_modules jsonb,
  default_units jsonb,
  icon character varying,
  CONSTRAINT industry_templates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.inventory (
  id integer NOT NULL DEFAULT nextval('inventory_id_seq'::regclass),
  business_id uuid NOT NULL,
  product_id integer NOT NULL,
  quantity numeric DEFAULT 0,
  unit character varying,
  min_stock numeric DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT inventory_pkey PRIMARY KEY (id),
  CONSTRAINT inventory_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id),
  CONSTRAINT inventory_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.inventory_movements (
  id integer NOT NULL DEFAULT nextval('inventory_movements_id_seq'::regclass),
  business_id uuid NOT NULL,
  product_id integer NOT NULL,
  reference_id integer,
  type character varying CHECK (type::text = ANY (ARRAY['in'::character varying, 'out'::character varying, 'adjust'::character varying, 'loss'::character varying]::text[])),
  quantity numeric NOT NULL,
  reason character varying CHECK (reason::text = ANY (ARRAY['sale'::character varying, 'purchase'::character varying, 'waste'::character varying, 'manual'::character varying, 'return'::character varying]::text[])),
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT inventory_movements_pkey PRIMARY KEY (id),
  CONSTRAINT inventory_movements_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id),
  CONSTRAINT inventory_movements_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT inventory_movements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.invoice_items (
  id integer NOT NULL DEFAULT nextval('invoice_items_id_seq'::regclass),
  invoice_id integer NOT NULL,
  product_id integer,
  quantity numeric NOT NULL,
  unit_price numeric NOT NULL,
  subtotal numeric NOT NULL,
  CONSTRAINT invoice_items_pkey PRIMARY KEY (id),
  CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id),
  CONSTRAINT invoice_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.invoice_types (
  id integer NOT NULL DEFAULT nextval('invoice_types_id_seq'::regclass),
  name character varying NOT NULL,
  prefix character varying,
  CONSTRAINT invoice_types_pkey PRIMARY KEY (id)
);
CREATE TABLE public.invoices (
  id integer NOT NULL DEFAULT nextval('invoices_id_seq'::regclass),
  business_id uuid NOT NULL,
  invoice_type_id integer,
  total numeric DEFAULT 0,
  tax numeric DEFAULT 0,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['paid'::character varying, 'pending'::character varying, 'void'::character varying]::text[])),
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT invoices_pkey PRIMARY KEY (id),
  CONSTRAINT invoices_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id),
  CONSTRAINT invoices_invoice_type_id_fkey FOREIGN KEY (invoice_type_id) REFERENCES public.invoice_types(id),
  CONSTRAINT invoices_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.notifications (
  id integer NOT NULL DEFAULT nextval('notifications_id_seq'::regclass),
  business_id uuid NOT NULL,
  user_id uuid,
  type character varying CHECK (type::text = ANY (ARRAY['alert'::character varying, 'reminder'::character varying, 'promo'::character varying]::text[])),
  message text,
  channel character varying CHECK (channel::text = ANY (ARRAY['push'::character varying, 'whatsapp'::character varying, 'email'::character varying]::text[])),
  is_read boolean DEFAULT false,
  sent_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.payments (
  id integer NOT NULL DEFAULT nextval('payments_id_seq'::regclass),
  invoice_id integer NOT NULL,
  amount numeric NOT NULL,
  method character varying CHECK (method::text = ANY (ARRAY['cash'::character varying, 'card'::character varying, 'transfer'::character varying, 'other'::character varying]::text[])),
  reference character varying,
  paid_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id)
);
CREATE TABLE public.product_categories (
  id integer NOT NULL DEFAULT nextval('product_categories_id_seq'::regclass),
  business_id uuid NOT NULL,
  name character varying NOT NULL,
  color character varying,
  CONSTRAINT product_categories_pkey PRIMARY KEY (id),
  CONSTRAINT product_categories_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id)
);
CREATE TABLE public.products (
  id integer NOT NULL DEFAULT nextval('products_id_seq'::regclass),
  business_id uuid NOT NULL,
  category_id integer,
  name character varying NOT NULL,
  sku character varying,
  price numeric DEFAULT 0,
  unit_type character varying,
  image_url character varying,
  is_active boolean DEFAULT true,
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.product_categories(id)
);
CREATE TABLE public.purchase_items (
  id integer NOT NULL DEFAULT nextval('purchase_items_id_seq'::regclass),
  purchase_order_id integer NOT NULL,
  product_id integer,
  quantity numeric NOT NULL,
  unit_cost numeric NOT NULL,
  subtotal numeric NOT NULL,
  CONSTRAINT purchase_items_pkey PRIMARY KEY (id),
  CONSTRAINT purchase_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id),
  CONSTRAINT purchase_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.purchase_orders (
  id integer NOT NULL DEFAULT nextval('purchase_orders_id_seq'::regclass),
  business_id uuid NOT NULL,
  supplier_id integer,
  total numeric DEFAULT 0,
  status character varying DEFAULT 'draft'::character varying CHECK (status::text = ANY (ARRAY['draft'::character varying, 'received'::character varying, 'cancelled'::character varying]::text[])),
  user_id uuid,
  ordered_at timestamp with time zone DEFAULT now(),
  received_at timestamp with time zone,
  CONSTRAINT purchase_orders_pkey PRIMARY KEY (id),
  CONSTRAINT purchase_orders_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id),
  CONSTRAINT purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id),
  CONSTRAINT purchase_orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.staff_attendance (
  id integer NOT NULL DEFAULT nextval('staff_attendance_id_seq'::regclass),
  business_id uuid NOT NULL,
  user_id uuid NOT NULL,
  check_in timestamp with time zone NOT NULL,
  check_out timestamp with time zone,
  notes text,
  CONSTRAINT staff_attendance_pkey PRIMARY KEY (id),
  CONSTRAINT staff_attendance_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id),
  CONSTRAINT staff_attendance_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.staff_expenses (
  id integer NOT NULL DEFAULT nextval('staff_expenses_id_seq'::regclass),
  business_id uuid NOT NULL,
  user_id uuid NOT NULL,
  type character varying CHECK (type::text = ANY (ARRAY['salary'::character varying, 'advance'::character varying, 'bonus'::character varying, 'deduction'::character varying]::text[])),
  amount numeric NOT NULL,
  description text,
  paid_at timestamp with time zone DEFAULT now(),
  CONSTRAINT staff_expenses_pkey PRIMARY KEY (id),
  CONSTRAINT staff_expenses_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id),
  CONSTRAINT staff_expenses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.subscriptions (
  id integer NOT NULL DEFAULT nextval('subscriptions_id_seq'::regclass),
  business_id uuid NOT NULL,
  plan character varying CHECK (plan::text = ANY (ARRAY['free'::character varying, 'basic'::character varying, 'pro'::character varying]::text[])),
  status character varying CHECK (status::text = ANY (ARRAY['active'::character varying, 'expired'::character varying, 'cancelled'::character varying]::text[])),
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  payment_ref character varying,
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id)
);
CREATE TABLE public.suppliers (
  id integer NOT NULL DEFAULT nextval('suppliers_id_seq'::regclass),
  business_id uuid NOT NULL,
  name character varying NOT NULL,
  phone character varying,
  email character varying,
  tax_id character varying,
  notes text,
  is_active boolean DEFAULT true,
  CONSTRAINT suppliers_pkey PRIMARY KEY (id),
  CONSTRAINT suppliers_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id)
);
CREATE TABLE public.units_of_measure (
  id integer NOT NULL DEFAULT nextval('units_of_measure_id_seq'::regclass),
  name character varying NOT NULL,
  symbol character varying NOT NULL,
  type character varying CHECK (type::text = ANY (ARRAY['weight'::character varying, 'volume'::character varying, 'unit'::character varying, 'length'::character varying]::text[])),
  is_active boolean DEFAULT true,
  CONSTRAINT units_of_measure_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  password_hash character varying NOT NULL,
  role character varying DEFAULT 'staff'::character varying CHECK (role::text = ANY (ARRAY['owner'::character varying, 'staff'::character varying, 'admin'::character varying]::text[])),
  phone character varying,
  created_at timestamp with time zone DEFAULT now(),
  mfa_secret character varying,
  mfa_enabled boolean DEFAULT false,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id)
);