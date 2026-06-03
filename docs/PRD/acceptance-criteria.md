# Criterios de Aceptación - CuentaClara

Este documento define las condiciones de éxito y los criterios de aceptación (AC) detallados para cada uno de los módulos y épicas del sistema. Se estructuran según las épicas principales de desarrollo.

---

## 🔐 ÉPICA 1: Arquitectura Base, Seguridad y Multi-tenancy

### CC-7: Aislamiento Tenant (RLS)
* **AC-01-01:** Cualquier consulta SQL ejecutada por un rol `authenticated` de Supabase debe filtrar automáticamente por `business_id` mediante la función `get_business_id()`.
* **AC-01-02:** No se debe permitir bajo ninguna circunstancia que un usuario de un `business_id` acceda, modifique o borre registros de otro negocio.
* **AC-01-03:** En la fase de registro, el usuario y el negocio deben ser creados en una sola transacción atómica o mediante reversión manual inmediata si el proceso de creación en `public.users` falla.

### CC-8: Autenticación Biométrica (Expo SDK)
* **AC-01-04:** La app debe ofrecer la opción de activar el ingreso con Huella Dactilar o Reconocimiento Facial (FaceID) en la pantalla de Configuración.
* **AC-01-05:** Si la biometría está activa, la app debe solicitarla al iniciar. Si falla tras 3 intentos, debe mostrar automáticamente el fallback al PIN numérico de 6 dígitos.
* **AC-01-06:** Los tokens de sesión o PIN de fallback deben ser guardados de forma cifrada mediante `expo-secure-store`.

### CC-9: Configuración de MFA vía Supabase
* **AC-01-07:** Ciertas acciones críticas (borrar historial de transacciones, modificar RUC o cambiar la configuración fiscal) deben requerir una segunda capa de verificación MFA (código TOTP).
* **AC-01-08:** El login ordinario diario debe ser no invasivo (no debe pedir MFA a menos que la sesión expire o el usuario cambie de dispositivo).

---

## 👥 ÉPICA 2: Onboarding Adaptativo y Registro Personalizado

### CC-11 / CC-12: Registro y Bifurcación
* **AC-02-01:** El formulario de registro debe recolectar los campos obligatorios: Nombre, Apellido, Teléfono, Nombre del Negocio, Email y Contraseña.
* **AC-02-02:** Después del registro, la aplicación debe presentar una pantalla de selección visual clara con dos opciones:
  1. **"Gestión rápida y sencilla"** (Bifurcación Informal)
  2. **"Control avanzado"** (Bifurcación PYME)
* **AC-02-03:** El sistema debe registrar la elección guardando el valor de `ui_mode` (`simple` o `advanced`) en la tabla `businesses`.

### CC-13 / CC-14: Configuración de Perfil y Plantillas de Industria
* **AC-02-04:** El usuario PYME debe poder configurar campos fiscales como RUC/NIT y subir un logo en formato de imagen (.png, .jpg) menor a 5MB.
* **AC-02-05:** Para usuarios informales, el sistema debe autoconfigurar valores por defecto (*Smart Defaults*): moneda "USD", tasa ITBMS en 7% e insumos deshabilitados.

---

## 📦 ÉPICA 3: Gestión Híbrida de Inventario

### CC-15: Lógica de Inventario por Tipo (Retail, Service, Manufacture)
* **AC-03-01:** **SERVICE (Servicios):** Al realizar una venta, el inventario del producto no debe disminuir. Su stock en base de datos debe ser `NULL` (infinito).
* **AC-03-02:** **RETAIL (Minorista):** Cada unidad vendida debe decrementar el stock del producto de forma lineal (`stock_nuevo = stock_anterior - cantidad_vendida`).
* **AC-03-03:** **MANUFACTURE (Manufactura/Recetas):** Al venderse el producto terminado, el backend debe descontar automáticamente el stock de sus insumos individuales basándose en la receta en formato JSONB. Si un insumo no tiene suficiente stock, la transacción debe completarse pero arrojar una alerta en el dashboard.

### CC-16: Escáner y Etiquetas de Peso
* **AC-03-04:** Al activar el escáner de la cámara, este debe leer códigos de barras (EAN-13, QR) e identificar el producto de forma automática en menos de 1 segundo.
* **AC-03-05:** El backend debe interpretar etiquetas de balanzas de peso variable (comúnmente codificadas con prefijos específicos que incluyen el ID del producto y el peso/precio).

### CC-17 / CC-18: Alertas Inteligentes e Insumos
* **AC-03-06:** El algoritmo de monitoreo debe disparar una alerta cuando el stock de un producto o insumo caiga por debajo de su `min_stock` establecido.
* **AC-03-07:** Para perfiles informales, la alerta de stock bajo debe incluir un botón directo que abra un chat de WhatsApp con el proveedor, pre-redactando el mensaje con la cantidad sugerida de pedido.

---

## 💰 ÉPICA 4: Módulo de Ventas y Finanzas

### CC-20: Registro Rápido (Modo Simple)
* **AC-04-01:** La interfaz de venta rápida debe permitir registrar transacciones con solo seleccionar un monto o un producto rápido y presionar "Completar Venta".
* **AC-04-02:** El cajero debe tener un botón binario para clasificar la venta como "Al Contado" o "Fiado".

### CC-21: Agenda de Registro de Fiado
* **AC-04-03:** Al marcar una venta como "Fiado", el sistema debe exigir asociar un Cliente (nombre/apodo) y registrar el saldo de la deuda.
* **AC-04-04:** Al registrar un Abono, el saldo de la deuda debe decrementarse. Si llega a `0.00`, el estado de la deuda debe actualizarse automáticamente a `paid`.
* **AC-04-05:** Debe haber un botón para enviar un recordatorio pre-redactado por WhatsApp con el saldo pendiente y la fecha de vencimiento.

### CC-22: Facturación e Impuestos (ITBMS)
* **AC-04-06:** Los comprobantes/facturas generadas en Panamá deben calcular automáticamente el ITBMS (7% sobre el subtotal imponible, excepto productos exentos).
* **AC-04-07:** El comprobante debe poder compartirse en formato de texto estructurado o PDF mediante el menú de compartir nativo de la app (especialmente a WhatsApp).

---

## 📊 ÉPICA 5: Inteligencia de Negocio y Growth

### CC-24: Generación de Catálogos para WhatsApp
* **AC-05-01:** El usuario debe poder seleccionar múltiples artículos, generar una plantilla de texto e imagen con precios y compartirla directamente en sus estados o chats.

### CC-25 / CC-26 / CC-27: Reportes, Insights y APScheduler
* **AC-05-02:** El Dashboard en Modo Avanzado (PYME) debe mostrar gráficos de barra/pastel del ranking de productos más vendidos.
* **AC-05-03:** El motor de balance financiero debe calcular el total de ganancias netas restando los gastos registrados de forma diaria.
* **AC-05-04:** El planificador asíncrono (APScheduler) debe correr diariamente a las 11:59 PM para realizar el cierre financiero diario, actualizar estados vencidos de fiados a `overdue`, y limpiar sesiones de caja inactivas.
