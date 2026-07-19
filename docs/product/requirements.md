# Requisitos Funcionales - CuentaClara

## 🔐 MÓDULO: Autenticación & Seguridad

### RF-001: Login/Logout
- [ ] Usuario puede iniciar sesión con email + contraseña
- [ ] Validación de credenciales contra Supabase Auth
- [ ] Token JWT generado y almacenado en secure storage
- [ ] Usuario puede cerrar sesión desde cualquier pantalla
- [ ] Sesión se invalida en el servidor

### RF-002: Biometría
- [ ] Soporte para Touch ID (iOS) y fingerprint (Android)
- [ ] Soporte para Face ID (iOS) y facial recognition (Android)
- [ ] Registro de biometría vinculado a cuenta
- [ ] Fallback a PIN de 6 dígitos si falla biometría
- [ ] Opción para deshabilitar biometría por dispositivo

### RF-003: Registro de Usuario
- [ ] Formulario con: email, contraseña, nombre negocio, RUC
- [ ] Validación de email único
- [ ] Envío de email de confirmación
- [ ] Crear cuenta automáticamente en multi-tenant

### RF-004: Recuperación de Contraseña
- [ ] Envío de link reset por email
- [ ] Link expira en 30 minutos
- [ ] Validación de nueva contraseña en cliente y servidor
- [ ] Confirmación de reset enviada

### RF-005: Control de Acceso
- [ ] JWT validado en cada request
- [ ] Extracción automática de `business_id` del token
- [ ] RLS en base de datos por `business_id`
- [ ] Rate limiting en endpoints sensibles (5 intentos/minuto)

---

## 📦 MÓDULO: Gestión de Inventario

### RF-006: CRUD de Productos
- [ ] Crear: Nombre, SKU, descripción, precio costo, precio venta, stock inicial, categoría
- [ ] Leer: Listar todos los productos del negocio con paginación
- [ ] Actualizar: Editar cualquier campo del producto
- [ ] Eliminar: Soft delete (marcar como inactivo)
- [ ] Búsqueda: Por nombre, SKU, categoría
- [ ] Ordenamiento: Por nombre, stock, precio, fecha creación

### RF-007: Gestión de Stock
- [ ] Actualización manual de cantidad disponible
- [ ] Auditoría de cambios (quién, cuándo, cantidad anterior)
- [ ] Cálculo automático de stock disponible = stock - reservado
- [ ] Alertas de stock bajo (configurable por producto)
- [ ] Movimiento de stock registrado en historial

### RF-008: Categorías de Productos
- [ ] Crear, editar, eliminar categorías
- [ ] Producto puede asignarse a una categoría
- [ ] Filtro de inventario por categoría
- [ ] Validar que no haya categoría duplicada

### RF-009: Historial de Movimientos
- [ ] Registrar: entrada, salida, ajuste, devolución
- [ ] Mostrar historial con fecha, usuario, movimiento, cantidad
- [ ] Permitir filtro por rango de fechas
- [ ] Exportar historial a CSV

---

## 💰 MÓDULO: Ventas & Facturación

### RF-010: Venta Simple (POS)
- [ ] Búsqueda rápida de producto por nombre/SKU
- [ ] Agregar producto a carrito con cantidad
- [ ] Actualización automática de subtotal + total
- [ ] Descuento global (opcional)
- [ ] Pago en efectivo o tarjeta (tipo seleccionable)
- [ ] Generar recibo en < 2 segundos
- [ ] Decrementar stock automáticamente

### RF-011: Venta Avanzada (Modo Advanced)
- [ ] Crear orden con múltiples items
- [ ] Aplicar descuentos por item o global (%)
- [ ] Agregar cliente existente o crear nuevo
- [ ] Seleccionar vendedor (si hay staff)
- [ ] Guardar como borrador o confirmar
- [ ] Agregar notas/comentarios a la orden

### RF-012: Facturación
- [ ] Generar PDF con formato legal
- [ ] Incluir: RUC, nombre negocio, dirección, teléfono
- [ ] Listado de items: nombre, cantidad, precio unitario, total
- [ ] Número de factura secuencial y único
- [ ] Fecha y hora de emisión
- [ ] Total a pagar, monto recibido, cambio
- [ ] Envío automático por WhatsApp al cliente

### RF-013: Gestión de Órdenes
- [ ] Listar órdenes con estado (borrador, confirmada, entregada, cancelada)
- [ ] Ver detalle completo de orden
- [ ] Editar orden en estado borrador
- [ ] Cancelar orden con justificación
- [ ] Filtro por rango de fechas, cliente, estado

---

## 💳 MÓDULO: Gestión de Créditos

### RF-014: Venta a Crédito
- [ ] Opción al crear venta: efectivo, tarjeta, crédito
- [ ] Si es crédito: especificar plazo (7, 15, 30 días)
- [ ] Crear deuda automáticamente
- [ ] No generar factura física (solo registro)

### RF-015: Gestión de Deudas
- [ ] Listar deudores con: nombre, monto, fecha vencimiento, estado
- [ ] Estados: pendiente, parcial, pagada, vencida
- [ ] Filtro por estado
- [ ] Ordenar por monto o fecha vencimiento
- [ ] Indicador visual de deudas vencidas (> hoy)

### RF-016: Registrar Pago
- [ ] Seleccionar deuda pendiente
- [ ] Especificar monto pagado
- [ ] Autocompletar si es pago total
- [ ] Actualizar estado (pendiente → pagada o parcial)
- [ ] Generar recibo de pago
- [ ] Crear movimiento de efectivo

### RF-017: Recordatorio de Pago
- [ ] Notificación push si deuda vence mañana
- [ ] Opción para enviar recordatorio por WhatsApp manual
- [ ] Reporte de deudas vencidas

---

## 📊 MÓDULO: Dashboard & Reportes

### RF-018: Dashboard Simple
- [ ] Mostrar: total ventas hoy, efectivo, crédito pendiente
- [ ] Gráfico de ventas últimos 7 días
- [ ] Top 3 productos vendidos
- [ ] Deudas vencidas (count)
- [ ] Stock bajo (count)
- [ ] Actualización en tiempo real

### RF-019: Dashboard Avanzado
- [ ] Desglose por categoría de productos
- [ ] Comparativa mes actual vs mes anterior
- [ ] Rentabilidad por producto (margen %)
- [ ] Estado de cobranzas (gráfico de barras)
- [ ] Forecast de ingresos (próximos 30 días)

### RF-020: Reportes Exportables
- [ ] Reporte de ventas: filtro por fecha, cliente, producto
- [ ] Reporte de inventario: stock actual, movimientos
- [ ] Reporte de cobranzas: estado de deudas, fechas vencimiento
- [ ] Reporte de rentabilidad: margen por producto
- [ ] Exportar a PDF, CSV, Excel

---

## 🔔 MÓDULO: Notificaciones

### RF-021: Notificaciones Push
- [ ] Integración con Firebase Cloud Messaging
- [ ] Notificación cuando stock < umbral
- [ ] Notificación cuando deuda vence
- [ ] Notificación cuando pago es registrado
- [ ] Permitir habilitar/deshabilitar por tipo
- [ ] Permiso requerido en instalación

### RF-022: Notificaciones por WhatsApp
- [ ] Envío de recibo/factura por WhatsApp
- [ ] Envío de recordatorio de pago
- [ ] Envío de notificación de stock bajo
- [ ] Integración con WhatsApp Business API
- [ ] Validar número de teléfono antes de enviar

---

## 👤 MÓDULO: Perfil & Configuración

### RF-023: Perfil de Negocio
- [ ] Editar: nombre, RUC/NIT, dirección, teléfono, email
- [ ] Logo personalizado (subir imagen)
- [ ] Política de retorno (texto libre)
- [ ] Horario de atención
- [ ] Cambios se reflejan inmediatamente en facturas

### RF-024: Configuración de Usuario
- [ ] Cambiar contraseña (requiere actual)
- [ ] Habilitar/deshabilitar biometría
- [ ] Seleccionar modo por defecto (simple/avanzado)
- [ ] Preferencia de idioma (ES/EN)
- [ ] Tema (claro/oscuro)

### RF-025: Gestión de Usuarios (Staff)
- [ ] Roles vigentes: **Administrador**, **Asistente** 
      (reemplaza nomenclatura anterior admin/vendedor/gerente-inventario)
- [ ] Administrador: acceso completo — ventas, ganancia/margen del día, 
      caja disponible, transacciones, gestión de módulos y permisos
- [ ] Asistente: acceso restringido — ventas propias realizadas, cantidad 
      de ventas, servicios atendidos (si aplica); sin acceso a información 
      financiera consolidada del negocio
- [ ] Admin puede crear usuarios adicionales con rol Asistente
- [ ] Restricción de edición y eliminación configurable por permiso
- [ ] Control de acciones críticas mediante MFA (ver RF-002)
- [ ] Ver histórico de usuarios (inactivos)
- [ ] Deshabilitar usuario sin eliminar

---

## 🔗 MÓDULO: Integraciones

### RF-026: Integración Supabase
- [ ] Autenticación con Supabase Auth
- [ ] Almacenamiento en PostgreSQL
- [ ] RLS configurado por business_id
- [ ] Backup automático diario

### RF-027: Integración Firebase
- [ ] Envío de notificaciones push
- [ ] Rastreo de events (analytics)
- [ ] Crash reporting

### RF-028: Integración WhatsApp API
- [ ] Envío de mensajes
- [ ] Validación de números de teléfono
- [ ] Almacenamiento de templates de mensajes

---

## 📋 No-Funcionales

### RNF-001: Rendimiento
- [ ] Carga inicial de app < 3 segundos
- [ ] Transición entre pantallas < 500ms
- [ ] Búsqueda de producto < 200ms
- [ ] Generación de recibo < 2 segundos

### RNF-002: Seguridad
- [ ] Todas las contraseñas hasheadas con bcrypt
- [ ] Token JWT con expiración de 7 días
- [ ] HTTPS en todos los endpoints
- [ ] Validación de input en cliente y servidor
- [ ] Rate limiting en login (5 intentos/minuto)

### RNF-003: Escalabilidad
- [ ] Base de datos soporta 10,000+ registros de venta
- [ ] API puede manejar 100+ requests/segundo
- [ ] Caché de productos en cliente (offline)

### RNF-004: Disponibilidad
- [ ] Uptime: 99.5%
- [ ] Modo offline (sincronizar cuando conecte)
- [ ] Datos se persisten localmente durante desconexión

---

## 📚 MÓDULO: Biblioteca de Módulos PYME

### RF-029: Activación/desactivación de módulos
- [ ] Usuario PYME accede a Configuración → Módulos
- [ ] Puede activar módulos no incluidos por defecto en su categoría
- [ ] Puede desactivar módulos activos que no esté usando
- [ ] Al desactivar un módulo, la información existente se conserva 
      (no se elimina, solo se oculta de la interfaz)
- [ ] Al reactivar, la información previamente registrada vuelve a mostrarse
- [ ] Ver `docs/product/onboarding-engine.md` para el detalle de biblioteca completa

### RF-030: Módulo de Servicios (PYME)
- [ ] Catálogo de servicios (crear, editar, eliminar)
- [ ] Agenda (diaria, semanal, mensual)
- [ ] Gestión de citas: pendientes, reprogramación, cancelación
- [ ] Asignación de empleado a servicio
- [ ] Estados: pendiente, en proceso, finalizado
- [ ] Historial por servicio, por cliente, por empleado

### RF-031: Módulo de Comisiones (PYME)
- [ ] Configuración de porcentaje por empleado
- [ ] Comisión fija o variable
- [ ] Reporte de comisión por empleado y por período
- [ ] Historial y total pagado

### RF-032: Módulo de Propinas (PYME)
- [ ] Registro de propina por transacción
- [ ] Distribución automática o manual entre empleados
- [ ] Reporte de total y resumen mensual

### RF-033: Gestor de Ofertas (PYME)
- [ ] Crear descuentos por producto o por categoría
- [ ] Ofertas temporales con fecha de inicio y fin
- [ ] Historial de promociones aplicadas

### RF-034: Inventario Avanzado — sub-funcionalidades
- [ ] Escáner de código de barras (venta, compra, inventario)
- [ ] Control por peso (kg/lb) con conversión automática
- [ ] Lectura de etiquetas de balanza de peso variable
- [ ] Gestión de caducidad con alertas de vencimiento próximo/vencido
- [ ] Registro de mermas con motivo e impacto económico
- [ ] Stock predictivo: predicción de agotamiento y recomendación de compra

---
## 🏢 Reglas de Negocio (RN)
Las siguientes reglas gobiernan de manera estricta todas las operaciones, flujos de datos e interfaces del sistema y deben ser aplicadas de forma determinista por el código:

### RN-01: Perfilamiento Fiscal
- Un negocio configurado con perfil informal (ui_mode = "simple") no requiere registrar RUC/NIT. El sistema debe aplicar lógicas de ocultamiento dinámico de campos tributarios. 

### RN-02: Obligatoriedad Fiscal PYME
- Un negocio configurado con perfil PYME (ui_mode = "advanced") tiene carácter mandatorio de registrar información fiscal (RUC/NIT, Dirección Física Legal y Tipo de Sociedad).

### RN-03: Lógica SERVICE
- Los productos parametrizados con el tipo SERVICE (Servicios) tienen stock infinito. El backend debe almacenar su inventario como un valor NULL y ninguna operación de venta o checkout debe decrementar existencias de este artículo.

### RN-04: Lógica RETAIL
- Los productos parametrizados con el tipo RETAIL (Minorista) decrementan el stock de forma lineal e inmediata ante cada evento de checkout exitoso (stock_nuevo = stock_anterior - cantidad_vendida).

### RN-05: Lógica MANUFACTURE
- Los productos tipo MANUFACTURED (Manufactura/Recetas) no decrementan stock propio de forma directa al venderse; en su lugar, el backend debe analizar de forma recursiva su mapa relacional en formato JSONB (Lista de Materiales / BOM) y decrementar el stock físico de sus insumos y materias primas individuales.

### RN-06: Flexibilidad en Fiados
- Los créditos de confianza o "Fiados" pueden registrarse y asociarse en la base de datos de manera obligatoria únicamente mediante el Nombre o Apodo del cliente deudor, permitiendo operar sin requerir identificaciones formales, cédulas o correos electrónicos en el perfil informal.

### RN-07: Dashboard Adaptativo
- La interfaz gráfica y la renderización de métricas del Dashboard principal del usuario deben conmutar automáticamente basándose en el perfil de negocio guardado (ui_mode). El modo informal presentará totales consolidados globales de alta velocidad y el modo PYME renderizará gráficos de barras/pastel avanzados segregados por categorías.

### RN-08: Cierre de Balance Diario
- El planificador de tareas (APScheduler) del backend debe congelar de forma inmutable los estados de caja de manera diaria a las 11:59 PM, calculando la ganancia neta (ingresos - gastos) y migrando las deudas activas cuya fecha límite sea menor o igual al día en curso a estado overdue.

---

## Matriz de Capacidades
| Funcionalidad | Informal | Comercio | Alimentos | Alimentos Preparados | Servicios |
|---------------|-----------|-----------|------------|----------------------|------------|
| Venta rápida | SI | NO | NO | NO | NO |
| Fiados | SI | NO | NO | NO | NO |
| Inventario | SI | SI | SI | SI | Opcional |
| Escáner | NO | SI | SI | SI | Opcional |
| Recetas | NO | NO | NO | SI | NO |
| Comisiones | NO | NO | NO | NO | SI |
| Merma | NO | NO | SI | SI | NO |


---