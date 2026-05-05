-- BUSINESSES: solo ves tu negocio
CREATE POLICY "negocio propio" ON businesses
  FOR ALL USING (id = get_business_id());

-- USERS: solo ves usuarios de tu negocio
CREATE POLICY "usuarios del negocio" ON users
  FOR ALL USING (business_id = get_business_id());

-- BUSINESS_CONFIGS
CREATE POLICY "config del negocio" ON business_configs
  FOR ALL USING (business_id = get_business_id());

-- FEATURES
CREATE POLICY "features del negocio" ON features
  FOR ALL USING (business_id = get_business_id());

-- SUBSCRIPTIONS
CREATE POLICY "suscripcion del negocio" ON subscriptions
  FOR ALL USING (business_id = get_business_id());

-- PRODUCT_CATEGORIES
CREATE POLICY "categorias del negocio" ON product_categories
  FOR ALL USING (business_id = get_business_id());

-- PRODUCTS
CREATE POLICY "productos del negocio" ON products
  FOR ALL USING (business_id = get_business_id());

-- INVENTORY
CREATE POLICY "inventario del negocio" ON inventory
  FOR ALL USING (business_id = get_business_id());

-- INVENTORY_MOVEMENTS
CREATE POLICY "movimientos del negocio" ON inventory_movements
  FOR ALL USING (business_id = get_business_id());

-- INVOICES
CREATE POLICY "facturas del negocio" ON invoices
  FOR ALL USING (business_id = get_business_id());

-- INVOICE_ITEMS: acceso via la factura que ya está protegida
CREATE POLICY "items de facturas del negocio" ON invoice_items
  FOR ALL USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE business_id = get_business_id()
    )
  );

-- PAYMENTS
CREATE POLICY "pagos del negocio" ON payments
  FOR ALL USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE business_id = get_business_id()
    )
  );

-- SUPPLIERS
CREATE POLICY "proveedores del negocio" ON suppliers
  FOR ALL USING (business_id = get_business_id());

-- PURCHASE_ORDERS
CREATE POLICY "compras del negocio" ON purchase_orders
  FOR ALL USING (business_id = get_business_id());

-- PURCHASE_ITEMS
CREATE POLICY "items de compras del negocio" ON purchase_items
  FOR ALL USING (
    purchase_order_id IN (
      SELECT id FROM purchase_orders WHERE business_id = get_business_id()
    )
  );

-- CASH_SESSIONS
CREATE POLICY "caja del negocio" ON cash_sessions
  FOR ALL USING (business_id = get_business_id());

-- EXPENSE_CATEGORIES
CREATE POLICY "categorias gastos del negocio" ON expense_categories
  FOR ALL USING (business_id = get_business_id());

-- EXPENSES
CREATE POLICY "gastos del negocio" ON expenses
  FOR ALL USING (business_id = get_business_id());

-- STAFF_ATTENDANCE
CREATE POLICY "asistencia del negocio" ON staff_attendance
  FOR ALL USING (business_id = get_business_id());

-- STAFF_EXPENSES
CREATE POLICY "pagos staff del negocio" ON staff_expenses
  FOR ALL USING (business_id = get_business_id());

-- NOTIFICATIONS: cada usuario solo ve las suyas
CREATE POLICY "notificaciones del usuario" ON notifications
  FOR ALL USING (business_id = get_business_id());

-- AUDIT_LOGS
CREATE POLICY "auditoria del negocio" ON audit_logs
  FOR ALL USING (business_id = get_business_id());
