# Criterios de Aceptación - CuentaClara (v2.0)

Este documento define las condiciones de éxito y los criterios de aceptación (AC) detallados para cada uno de los módulos y épicas del sistema, optimizado con el contexto completo para las IA desarrolladoras. Se estructuran según las épicas principales de desarrollo.

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

### CC-11 / CC-12: Registro y Bifurcación Dinámica
* **AC-02-01:** El formulario de registro debe recolectar los campos obligatorios: Nombre, Apellido, Teléfono, Nombre del Negocio, Email y Contraseña.
* **AC-02-02:** Después del registro, la aplicación debe presentar una pantalla de selección visual clara con dos opciones estratégicas para habilitar la interfaz adaptativa:
  1. **"Gestión rápida y sencilla"** (Bifurcación Informal / Emprendedor)
  2. **"Control avanzado"** (Bifurcación PYME)
* **AC-02-03:** El sistema debe registrar la elección guardando el valor de `ui_mode` (`simple` o `advanced`) en la tabla `businesses`. Para PYME, el sistema activa por defecto los módulos correspondientes a la categoría de industria seleccionada (ver `onboarding-engine.md`), sin restringir permanentemente el acceso a otros módulos de la Biblioteca de Módulos.

### CC-13 / CC-14: Configuración de Perfil y Plantillas de Industria (*Smart Defaults*)
* **AC-02-04:** El usuario PYME debe poder configurar campos fiscales como RUC/NIT, tipo de sociedad e incorporar la carga de un logo corporativo en formato (.png, .jpg) menor a 5MB, el cual se inyectará dinámicamente en la cabecera de las facturas estructuradas.
* **AC-02-05:** Para usuarios informales, el sistema debe autoconfigurar valores por defecto (*Smart Defaults*) de manera completamente automatizada: moneda predeterminada en "USD", tasa ITBMS base en 7% e insumos/recetas deshabilitados por defecto para simplificar la experiencia inicial.
* **AC-02-06:** El sistema debe ofrecer plantillas basadas en la vertical de industria seleccionada (Alimentos, Servicios, Comercio Retail), activando campos de metadatos especializados en la base de datos sin requerir configuraciones técnicas por parte del usuario.

---

## 📦 ÉPICA 3: Gestión Híbrida de Inventario y Alertas Predictivas

### CC-15: Lógica de Inventario por Tipo (Retail, Service, Manufacture)
* **AC-03-01:** **SERVICE (Servicios):** Al realizar una venta, el inventario del producto no debe disminuir. Su stock en la base de datos debe permanecer como `NULL` (equivalente a stock infinito).
* **AC-03-02:** **RETAIL (Minorista):** Cada unidad vendida debe decrementar el stock físico del producto de forma lineal e inmediata (`stock_nuevo = stock_anterior - cantidad_vendida`).
* **AC-03-03:** **MANUFACTURE (Manufactura/Recetas):** Al venderse un producto preparado o manufacturado, el backend debe descontar automáticamente el stock de sus insumos base a partir de un mapa relacional en formato JSONB. Si un insumo rompe el inventario mínimo, la transacción debe completarse y registrarse pero disparando de inmediato un flag de advertencia en el Dashboard.

### CC-16: Escáner y Etiquetas de Peso Variable
* **AC-03-04:** Al activar el módulo de escáner de cámara nativo mediante Expo, el sistema debe procesar códigos de barras (EAN-13) y códigos QR para identificar y añadir productos al carrito en menos de 1 segundo con un manejo preciso de permisos de hardware.
* **AC-03-05:** El backend en FastAPI debe interpretar cadenas de metadatos provenientes de etiquetas de balanzas de peso variable (identificando el prefijo de balanza, extrayendo el ID del producto y calculando proporcionalmente el peso neto y el precio final de venta).

### CC-17 / CC-18: Sistema de Alertas Predictivas de Stock
* **AC-03-06:** El algoritmo de monitoreo de inventario debe realizar una comparativa continua entre el `stock_actual` y el `min_stock` establecido para activar estados de alerta proactivos.
* **AC-03-07:** **Alertas Predictivas (Algoritmo de Agotamiento):** El sistema debe analizar la velocidad de venta histórica (promedio de salida por día) para estimar la fecha en que el producto quedará en desabastecimiento total (*Out of Stock*). Si el modelo predice desabastecimiento en un periodo menor o igual a 5 días, generará una alerta predictiva visual en el dashboard de la PYME.
* **AC-03-08:** Para usuarios informales, las alertas predictivas y de quiebre de stock deben incorporar un botón de acción rápida que abra WhatsApp con el número telefónico del proveedor guardado en la DB, auto-rellenando una plantilla pre-redactada de orden de suministro con el nombre del artículo y la cantidad recomendada para reponer.

---

## 🧩 ÉPICA 3.5: Biblioteca de Módulos y Personalización (PYME)

### CC-18b: Activación/Desactivación de Módulos
* **AC-03-09:** El usuario con rol Administrador debe poder acceder a Configuración → Módulos y ver el listado completo de la Biblioteca de Módulos, indicando cuáles están activos y cuáles disponibles para activar.
* **AC-03-10:** Al desactivar un módulo, el sistema debe ocultar sus pantallas, formularios y alertas de la navegación sin eliminar los datos ya registrados. Al reactivarlo, la información debe volver a mostrarse íntegramente.
* **AC-03-11:** El Dashboard y la navegación deben regenerarse automáticamente (sin requerir reinicio de la app) al activar o desactivar un módulo.

### CC-18c: Módulo de Servicios
* **AC-03-12:** El sistema debe permitir crear, editar y eliminar servicios del catálogo, cada uno con nombre, precio y duración estimada.
* **AC-03-13:** La agenda debe soportar vistas diaria, semanal y mensual, permitiendo reprogramar o cancelar citas pendientes.
* **AC-03-14:** Cada servicio debe poder asignarse a un empleado específico y transicionar entre los estados `pendiente`, `en_proceso`, `finalizado`.

### CC-18d: Comisiones y Propinas
* **AC-03-15:** El sistema debe permitir configurar un porcentaje de comisión (fijo o variable) por empleado, calculado automáticamente sobre las ventas o servicios que dicho empleado registre.
* **AC-03-16:** El registro de propinas debe permitir distribución automática (dividida entre empleados según regla configurada) o manual (asignación específica por transacción).

### CC-18e: Gestor de Ofertas
* **AC-03-17:** El sistema debe permitir crear descuentos por producto individual o por categoría completa, con fecha de inicio y fin definidas.
* **AC-03-18:** Al vencer la fecha de finalización de una oferta, el sistema debe desactivarla automáticamente sin intervención manual, conservando el registro en el historial de promociones.

---

## 💰 ÉPICA 4: Módulo de Ventas, Finanzas y Sistema de Fiados

### CC-20: Registro Rápido (Modo Simple)
* **AC-04-01:** La interfaz de venta en Modo Simple (informal) debe permitir registrar transacciones financieras ágiles en pocos clics (introducción directa de monto total o selección de productos rápidos de alta rotación) y presionar "Completar Venta".
* **AC-04-02:** La interfaz de facturación debe proveer un interruptor binario claro y visible en el flujo del checkout para clasificar la venta de manera inmediata como "Al Contado" o "Fiado".

### CC-21: Agenda y Registro Avanzado de Fiados
* **AC-04-03:** Al marcar una transacción como "Fiado", el sistema debe validar obligatoriamente la asociación de un Cliente mediante su nombre o apodo, abriendo o actualizando una cuenta corriente de deuda en la base de datos.
* **AC-04-04:** El módulo debe permitir registrar amortizaciones y abonos individuales a la deuda pendiente. Cada vez que se procese un Abono, el saldo total acumulado de la deuda debe decrementarse linealmente. Si el saldo llega a `0.00`, el estado del registro de fiado debe actualizarse automáticamente a `paid`.
* **AC-04-05:** **Cobro Proactivo por WhatsApp:** La lista de cuentas por cobrar debe integrar un botón nativo para disparar un recordatorio pre-redactado mediante deep linking de WhatsApp, el cual formateará automáticamente un texto amigable que incluya el nombre del cliente, el saldo pendiente consolidado y la fecha límite de pago.

### CC-22: Facturación e Impuestos Localizados (ITBMS Panamá)
* **AC-04-06:** El motor de facturación simplificado debe calcular automáticamente el ITBMS (7% sobre el subtotal imponible de los artículos, discriminando de forma transparente aquellos productos o servicios parametrizados como exentos según la ley de Panamá).
* **AC-04-07:** El comprobante de venta o factura electrónica generada debe ser procesada asíncronamente en backend mediante `BackgroundTasks` para compilar un documento PDF estructurado de manera interna. El usuario debe poder compartir el comprobante en formato de texto enriquecido o archivo PDF mediante el menú nativo del dispositivo (optimizando la entrega directa hacia chats de WhatsApp de los clientes).

---

## 📊 ÉPICA 5: Inteligencia de Negocio, Growth y Marketing WhatsApp

### CC-24: Marketing por WhatsApp y Catálogos Digitales
* **AC-05-01:** El usuario debe contar con un selector de productos del inventario con capacidades de selección múltiple y filtrado rápido para la creación instantánea de catálogos y anuncios publicitarios estéticos.
* **AC-05-02:** El motor de mercadeo debe generar plantillas dinámicas de texto enriquecido (strings con inyección de variables como precios, promociones y nombres) combinadas con enlaces de imágenes de productos listas para ser distribuidas directamente en los estados de WhatsApp o chats grupales del comerciante informal o PYME.

### CC-25 / CC-26 / CC-27: Reportes, Detección de Cliente Frecuente y Automatización con APScheduler
* **AC-05-03:** El Dashboard Ejecutivo Avanzado (modo PYME) debe renderizar gráficos estadísticos nativos (barras y pastel) que organicen visualmente el ranking de productos más vendidos y el flujo operativo del mes en curso.
* **AC-05-04:** El motor de balance financiero consolidado debe calcular el total de ganancias netas restando dinámicamente los gastos operativos registrados del subtotal de ingresos por ventas diarias.
* **AC-05-05:** **Sistema de Detección de Cliente Frecuente:** El backend debe ejecutar algoritmos de agrupación heurística basados en la recurrencia de nombres, apodos o números telefónicos recolectados en el historial de ventas presenciales e informales. El sistema compilará un módulo del "Top Clientes Más Frecuentes", visualizando su frecuencia de compra mensual, volumen total de gasto e identificando los productos de su preferencia para permitir campañas dirigidas de fidelización.
* **AC-05-06:** El planificador asíncrono implementado en el backend con la librería `APScheduler` debe correr de forma ininterrumpida en segundo plano diariamente a las 11:59 PM para realizar las siguientes tareas automáticas:
  1. Ejecutar y consolidar el cierre de balance financiero diario.
  2. Analizar las fechas de vencimiento de la agenda de fiados y transicionar automáticamente el estado de las deudas impagadas de `active` a `overdue`.
  3. Realizar mantenimiento preventivo limpiando e invalidando las sesiones de caja que hayan quedado inactivas o abiertas por error.