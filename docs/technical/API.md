# Documentación de la API (Endpoints) - CuentaClara

Todos los endpoints (excepto el registro, login y listado de plantillas/categorías públicas) requieren autenticación mediante un token JWT enviado en el encabezado `Authorization: Bearer <JWT>`.

---

## 🔐 Autenticación (`/auth`)

### 1. Registro de Negocio y Dueño
* **POST** `/auth/register`
* **Descripción:** Registra un nuevo negocio, su configuración inicial, activa módulos por defecto según la industria y crea el perfil del dueño (`owner`).
* **Request Body:**
  ```json
  {
    "email": "ejemplo@correo.com",
    "password": "mi_password_segura",
    "business_name": "Mi Tienda",
    "category_id": 1,
    "name": "Juan Perez",
    "phone": "+507 6000-0000",
    "ui_mode": "simple",
    "industry_template_id": 2,
    "address": "Calle 50, Ciudad de Panamá"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbG...",
    "token_type": "bearer",
    "user_id": "uuid-del-usuario",
    "business_id": "uuid-del-negocio",
    "role": "owner"
  }
  ```

### 2. Iniciar Sesión
* **POST** `/auth/login`
* **Descripción:** Autentica credenciales y emite el token JWT de Supabase.
* **Request Body:**
  ```json
  {
    "email": "ejemplo@correo.com",
    "password": "mi_password_segura"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbG...",
    "token_type": "bearer",
    "user_id": "uuid-del-usuario",
    "business_id": "uuid-del-negocio",
    "role": "owner"
  }
  ```

### 3. Obtener Datos del Usuario Autenticado
* **GET** `/auth/me`
* **Descripción:** Devuelve la información de perfil del usuario logueado.
* **Response (200 OK):**
  ```json
  {
    "id": "uuid-del-usuario",
    "name": "Juan Perez",
    "email": "ejemplo@correo.com",
    "role": "owner",
    "phone": "+507 6000-0000",
    "created_at": "2026-06-03T07:00:00Z"
  }
  ```

### 4. Cargar Contexto del Negocio y UI
* **GET** `/auth/context`
* **Descripción:** Carga datos de configuración, features y determina el tipo de interfaz para la navegación (`userType`: "informal" o "pyme").
* **Response (200 OK):**
  ```json
  {
    "business": {
      "id": "uuid-del-negocio",
      "name": "Mi Tienda",
      "plan": "free",
      "ui_mode": "simple"
    },
    "features": [
      { "id": 1, "module": "sales", "is_active": true },
      { "id": 2, "module": "credit", "is_active": true }
    ],
    "enabled_modules": ["sales", "credit", "dashboard", "profile"],
    "userType": "informal"
  }
  ```

### 5. Configurar y Verificar MFA
* **POST** `/auth/mfa/setup` — Genera la clave secreta y el código QR (base64) para asociar Google Authenticator.
* **POST** `/auth/mfa/verify` — Valida el código TOTP enviado por el cliente para activar el MFA o validar una acción crítica.

---

## 📦 Inventario (`/inventory`)

### 1. Listar Productos y Stock
* **GET** `/inventory/products`
* **Descripción:** Devuelve todos los productos del negocio con su stock actual.
* **Response (200 OK):**
  ```json
  [
    {
      "id": 10,
      "name": "Arroz de Grano",
      "sku": "ARR-001",
      "price": 1.50,
      "unit_type": "kg",
      "stock": 45.0,
      "min_stock": 10.0,
      "low_stock": false
    }
  ]
  ```

### 2. Crear Producto
* **POST** `/inventory/products`
* **Request Body:**
  ```json
  {
    "name": "Arroz de Grano",
    "sku": "ARR-001",
    "price": 1.50,
    "unit_type": "kg",
    "initial_stock": 50.0,
    "min_stock": 10.0,
    "category_name": "Alimentos"
  }
  ```

### 3. Ajustar Inventario Manualmente
* **POST** `/inventory/stock/adjust`
* **Descripción:** Permite registrar entradas por compras (`purchase`), pérdidas (`waste`), devoluciones (`return`) o conteos manuales (`manual`).
* **Request Body:**
  ```json
  {
    "product_id": 10,
    "quantity": 10.0,
    "reason": "purchase",
    "notes": "Compra a distribuidor"
  }
  ```

---

## 💰 Ventas (`/sales`) y Facturas (`/invoices`)

### 1. Venta Rápida (Modo Simple)
* **POST** `/sales/quick`
* **Descripción:** Registra una venta reduciendo stock y creando una factura instantánea.
* **Request Body:**
  ```json
  {
    "items": [
      { "product_id": 10, "quantity": 2.0, "unit_price": 1.50 }
    ],
    "payment_method": "cash",
    "is_credit": false,
    "customer_id": null
  }
  ```

### 2. Listar Facturas
* **GET** `/invoices`
* **Query Parameters:** `status` (opcional: `paid`, `pending`, `void`), `limit` (default: 20).

---

## 💳 Créditos / Fiados (`/credit`)

### 1. Listar Clientes Registrados
* **GET** `/credit/customers`

### 2. Registrar Nueva Deuda (Fiado)
* **POST** `/credit/debts`
* **Request Body:**
  ```json
  {
    "customer_id": 5,
    "amount": 25.00,
    "due_date": "2026-06-15",
    "description": "Fiado de viveres",
    "invoice_id": null
  }
  ```

### 3. Registrar Abono
* **POST** `/credit/debts/{debt_id}/payments`
* **Request Body:**
  ```json
  {
    "amount": 10.00,
    "method": "cash",
    "notes": "Abono parcial en efectivo"
  }
  ```

---

## 🧾 Compras (`/purchases`)

### 1. Proveedores
* **GET** `/purchases/suppliers` — Listar proveedores activos del negocio.
* **POST** `/purchases/suppliers` — Crear proveedor.
* **PATCH** `/purchases/suppliers/{supplier_id}` — Actualizar datos del proveedor.

### 2. Órdenes de Compra
* **GET** `/purchases` — Listar órdenes de compra del negocio.
  * **Query Parameters:** `status` (opcional: `draft`, `received`, `cancelled`).
* **POST** `/purchases` — Crear orden de compra (queda en estado `draft`).
* **GET** `/purchases/{purchase_order_id}` — Detalle de una orden de compra.
* **POST** `/purchases/{purchase_order_id}/receive` — Marcar orden como recibida; actualiza el inventario.
* **POST** `/purchases/{purchase_order_id}/cancel` — Cancelar orden (solo permitido en estado `draft`).

---

## 🔔 Notificaciones (`/notifications`)

> Nota: el módulo de frontend correspondiente existe pero aún no está cableado en la app (`NotificationsListener` no se monta en `App.js`); el backend sí está operativo.

### 1. Listar Notificaciones
* **GET** `/notifications/`
* **Query Parameters:** `unread_only` (default: `false`), `limit` (default: 50, máx. 200), `offset` (default: 0).

### 2. Marcar como Leída
* **PATCH** `/notifications/{notification_id}/read`

### 3. Registrar Token Push
* **POST** `/notifications/push-token`
* **Request Body:**
  ```json
  {
    "token": "ExponentPushToken[xxxx]",
    "device_type": "ios"
  }
  ```

---

## 🏢 Negocio (`/businesses`)

> Nota: todas las rutas usan `/me` en vez de `/{business_id}` — el `business_id` se extrae del JWT, nunca se pasa como parámetro, para evitar accesos cross-tenant.

### 1. Datos del Negocio
* **GET** `/businesses/me` — Obtener datos del negocio actual.
* **PUT** `/businesses/me` — Actualizar datos del negocio (patch parcial vía PUT).

### 2. Configuración del Negocio
* **GET** `/businesses/me/config` — Obtener configuración (moneda, idioma, impuesto, etc.); si no existe fila, retorna valores por defecto.
* **PUT** `/businesses/me/config` — Actualizar configuración (upsert automático si no existe fila previa).
