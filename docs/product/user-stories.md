# User Stories - CuentaClara

## 📌 Formato Estándar

```
As a [user type]
I want [feature]
So that [benefit]

Acceptance Criteria:
- [ ] AC1
- [ ] AC2
```

---

## 🔐 EPIC: Autenticación & Seguridad

### US-001: Login con email/contraseña
```
As a user
I want to log in with my email and password
So that I can access my business account securely

Acceptance Criteria:
- [ ] Form valida email válido
- [ ] Contraseña requerida (mín 8 caracteres)
- [ ] Mensaje de error si credenciales invalidas
- [ ] Sesión persiste después de cerrar app
- [ ] Token JWT expira en 7 días
```

### US-002: Autenticación con biometría
```
As a user with fingerprint enabled
I want to log in with my fingerprint
So that access is faster and more secure

Acceptance Criteria:
- [ ] Soporte para Face ID y Touch ID
- [ ] Fallback a PIN si falla biometría
- [ ] Opción en la pantalla de configuración para deshabilitar o reestablecer la biometría por dispositivo.
- [ ] Las credenciales y claves de biometría se persisten cifradas localmente en expo-secure-store.
```

### US-003: Recuperación de contraseña
```
As a user who forgot my password
I want to reset it via email
So that I can recover my account

Acceptance Criteria:
- [ ] Email de reset enviado en < 2s
- [ ] Link válido por 30 minutos
- [ ] Nueva contraseña validada (mín 8 caracteres)
- [ ] Confirmación de reset enviada
```

---

## 📦 EPIC: Gestión de Inventario

### US-004: Crear producto
```
As an inventory manager
I want to add a new product
So that I can track and sell it

Acceptance Criteria:
- [ ] Campos requeridos: nombre, SKU, precio, stock inicial
- [ ] Validación de SKU único
- [ ] Soporte para foto del producto
- [ ] Categoría seleccionable
- [ ] Mostrar confirmación después de crear
```

### US-005: Ver inventario
```
As an inventory manager
I want to see all my products with their current stock
So that I know what to restock

Acceptance Criteria:
- [ ] Lista paginada que muestra el nombre, SKU, stock disponible, precio y tipo de producto.
- [ ] Filtro y segmentación rápida en pantalla por categorías del negocio.
- [ ] Barra de búsqueda en caliente indexada por coincidencia de nombre o SKU.
- [ ] Ordenamiento dinámico ascendente y descendente por stock, precio y fecha de creación.
- [ ] Indicador visual de stock bajo (< 10 unidades)
```

### US-006: Actualizar stock
```
As an inventory manager
I want to adjust stock quantities
So that inventory matches reality after recount

Acceptance Criteria:
- [ ] Actualización manual de cantidad
- [ ] Registro de auditoría (quién y cuándo)
- [ ] Razón del ajuste (opcional)
- [ ] Confirmación antes de guardar
```

---

## 💰 EPIC: Ventas & Facturación

### US-007: Venta rápida (Modo Simple)
```
As a cashier in a rush
I want to record a sale in < 10 seconds
So that customers don't wait

Acceptance Criteria:
- [ ] Interfaz con 1 campo: búsqueda de producto
- [ ] Agregar cantidad y total actualiza automáticamente
- [ ] Botón "Vender" completa la transacción
- [ ] Recibo se genera inmediatamente
- [ ] Stock se decrementa automáticamente
```

### US-008: Facturación completa
```
As a business owner
I want to generate a formal invoice
So that I have a legal record of sale

Acceptance Criteria:
- [ ] Factura incluye: items, cantidades, precios, total
- [ ] RUC/NIT del negocio impreso
- [ ] Fecha y número secuencial
- [ ] PDF descargable
- [ ] Envío automático por WhatsApp
```

### US-009: Crear orden de venta
```
As a sales manager (Modo Avanzado)
I want to create a sales order with multiple items
So that I can manage bulk orders

Acceptance Criteria:
- [ ] Agregar múltiples productos a la orden
- [ ] Aplicar descuentos por item o total
- [ ] Seleccionar cliente
- [ ] Guardar como borrador o confirmada
```

---

## 💳 EPIC: Gestión de Créditos

### US-010: Registrar venta con crédito
```
As a storeowner
I want to mark a sale as credit
So that I can track who owes me money

Acceptance Criteria:
- [ ] Opción "Vender a Crédito" en formulario
- [ ] Especificar plazos de pago
- [ ] Cliente agregado automáticamente si existe
- [ ] Deuda registrada en estado "Pendiente"
```

### US-011: Ver deudas pendientes
```
As a storeowner
I want to see who owes me and how much
So that I can follow up collections

Acceptance Criteria:
- [ ] Lista de deudores con nombre y monto
- [ ] Ordenar por monto más alto primero
- [ ] Filtro por estado (pendiente, parcial, vencido)
- [ ] Indicador de días vencido
```

### US-012: Registrar pago de deuda
```
As a storeowner
I want to record a payment toward a debt
So that my records are up to date

Acceptance Criteria:
- [ ] Especificar monto pagado
- [ ] Marcar como "Pagado" si es monto completo
- [ ] Actualizar estado a "Parcial" si pago incompleto
- [ ] Generar recibo de pago
```

---

## 📊 EPIC: Dashboard & Reportes

### US-013: Ver dashboard diario
```
As a business owner
I want to see my sales, expenses, and balance today
So that I know how the business is doing

Acceptance Criteria:
- [ ] Mostrar ventas totales del día
- [ ] Mostrar ingresos en efectivo vs crédito
- [ ] Indicador de deudas pendientes
- [ ] Top 5 productos vendidos
- [ ] Actualización cada 5 minutos
```

### US-014: Ver reportes mensuales
```
As a manager (Modo Avanzado)
I want to see detailed reports by month
So that I can analyze business performance

Acceptance Criteria:
- [ ] Reporte de ventas por categoría
- [ ] Rentabilidad por producto
- [ ] Estado de cobranzas
- [ ] Exportar a PDF o CSV
```

---

## 🔔 EPIC: Notificaciones

### US-015: Notificación de stock bajo
```
As an inventory manager
I want to be notified when stock is low
So that I can reorder before running out

Acceptance Criteria:
- [ ] Push notification cuando stock < 10
- [ ] Notificación incluye producto y cantidad actual
- [ ] Configurable por producto (umbral personalizado)
```

### US-016: Notificación de pago recibido
```
As a storeowner
I want to know when a customer pays a debt
So that I can update my records immediately

Acceptance Criteria:
- [ ] Notificación push cuando pago es registrado
- [ ] Incluir nombre cliente y monto
- [ ] Audible + vibración
```

---

## 👤 EPIC: Perfil & Configuración

### US-017: Gestionar perfil empresarial
```
As a business owner
I want to update my business info
So that invoices and receipts show correct data

Acceptance Criteria:
- [ ] Editar nombre del negocio
- [ ] Editar RUC/NIT
- [ ] Editar dirección y teléfono
- [ ] Logo personalizado para factura
- [ ] Cambios se reflejan en nuevas facturas
```

### US-018: Cambiar contraseña
```
As a user
I want to change my password
So that I can update it if it's compromised

Acceptance Criteria:
- [ ] Requiere contraseña actual
- [ ] Nueva contraseña debe ser diferente
- [ ] Validación de complejidad (mín 8 caracteres)
- [ ] Session cierra en todos los dispositivos después
```

---

## 📱 Priorización

| US-ID | Prioridad | Sprint |
|-------|-----------|--------|
| US-001, US-002 | 🔴 CRÍTICA | 1-2 |
| US-004, US-005, US-006 | 🔴 CRÍTICA | 2-3 |
| US-007, US-008 | 🔴 CRÍTICA | 3-4 |
| US-009, US-010, US-011, US-012 | 🟡 ALTA | 4-5 |
| US-013, US-014 | 🟢 MEDIA | 5-6 |
| US-015, US-016 | 🟢 MEDIA | 6-7 |
| US-017, US-018 | 🟡 ALTA | 7-8 |

---

*Última actualización: 2026-06-03*
