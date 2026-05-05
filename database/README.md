# Base de datos — CuentaClara

PostgreSQL administrado en Supabase. No necesitas instalar nada local.

## Conexión

1. Pide las credenciales al encargado de BD
2. Crea un archivo `.env` en la raíz del proyecto (nunca lo subas al repo)
3. Copia el contenido de `.env.example` y rellena los valores reales

## Estructura

| Módulo | Tablas |
|---|---|
| Núcleo | businesses, users, categories, industry_templates |
| Configuración | business_configs, features, subscriptions, units_of_measure |
| Inventario | products, product_categories, inventory, inventory_movements |
| Ventas | invoices, invoice_items, invoice_types, payments |
| Compras | suppliers, purchase_orders, purchase_items |
| Caja | cash_sessions, expenses, expense_categories |
| Staff | staff_attendance, staff_expenses |
| Sistema | notifications, audit_logs |

## Reglas importantes

- Toda query debe poder filtrarse por `business_id`
- El RLS está activo — la BD rechaza queries sin contexto de negocio
- No borres datos de prueba del negocio `Carnicería Don Pedro`
- Si necesitas agregar una tabla nueva, habla primero con el encargado de BD

## Negocio de prueba

Para desarrollo ya existe un negocio cargado:

- **Nombre:** Carnicería Don Pedro  
- **business_id:** `a1b2c3d4-0000-0000-0000-000000000001`  
- **Usuario dueño:** pedro@carnicedonpedro.com  
- **Usuario staff:** ana@carnicedonpedro.com
