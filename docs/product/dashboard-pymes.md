# Dashboard Adaptativo — Modo PYME

> Detalle de cómo el Dashboard consume la configuración generada por el Motor de Configuración descrito en `onboarding-engine.md`. Este documento no repite la matriz de módulos ni el estado de implementación (ver `onboarding-engine.md` y `STATUS.md` para eso) — se enfoca en **qué debe mostrar el Dashboard y por qué**, como referencia de producto para guiar el desarrollo.

## Objetivo

El Dashboard de CuentaClara para PYME mantiene una estructura **única** para todas las categorías de negocio. La personalización no se logra con pantallas distintas por categoría, sino con un motor de configuración que habilita únicamente la información y funcionalidades correspondientes a los módulos activos del negocio y al rol del usuario que inició sesión.

---

## Estructura del Dashboard

### Bloque 1 — Resumen del Negocio

Indicadores principales, distintos según el rol del usuario (ver `requirements.md` RF-025 para la definición de roles).

| Rol | Qué visualiza |
|---|---|
| **Administrador** | Ventas del día, ganancia o margen del día, caja disponible, transacciones realizadas |
| **Asistente** | Ventas realizadas, cantidad de ventas, servicios atendidos (cuando el módulo Servicios está activo) |

Este bloque depende únicamente del **rol** del usuario, no de la categoría del negocio.

### Bloque 2 — Alertas Operativas

Bloque completamente dinámico construido por el Motor de Configuración: únicamente aparecen las alertas relacionadas con los módulos que el negocio tiene activos. El Dashboard nunca debe mostrar tarjetas vacías ni información de módulos desactivados.

| Módulo activo | Alertas que genera |
|---|---|
| Inventario Avanzado | Stock crítico, producto agotado, productos próximos a vencer, mermas registradas |
| Recetas | Ingredientes insuficientes, producción limitada por falta de insumos |
| Servicios | Servicios pendientes, servicios atrasados, técnico o empleado asignado |
| Ventas | Caja pendiente de cierre, gastos pendientes de registrar |

### Bloque 3 — Metas

Barra de progreso de la meta mensual del negocio: progreso actual, monto alcanzado, meta mensual y monto restante para cumplir el objetivo.

---

## Cómo el Motor de Configuración alimenta el Dashboard

El flujo completo (categoría → módulos activos → Motor de Configuración → Dashboard/Navegación/Formularios/Alertas/Permisos) está descrito en `onboarding-engine.md`. Para el Dashboard específicamente, el Motor de Configuración determina en tiempo de carga:

1. Qué tarjetas del Bloque 1 mostrar (según rol).
2. Qué alertas del Bloque 2 son aplicables (según módulos activos en `features`).
3. Qué acciones rápidas ofrecer (ver tabla más abajo).

---

## Detalle funcional por módulo

Esta sección amplía, a nivel de producto, qué debería incluir cada módulo de la Biblioteca (ver `onboarding-engine.md` para la tabla de estado de implementación real — aquí se describe el alcance funcional esperado, no lo que ya existe en código).

### Ventas — gestión financiera
- **Facturación:** generación de comprobantes, generación de PDF, envío por WhatsApp, exportación de comprobantes, registro contable de la venta.
- **Reportes:** ventas del día, ventas por período, productos más vendidos, servicios más vendidos, ganancias, márgenes, comparativas mensuales.

### Inventario Básico
- **Gestión de productos:** crear/editar/eliminar productos, categorías, precio de venta, precio de compra, stock disponible, stock mínimo.
- **Inventario:** entradas, salidas, ajustes manuales, historial de movimientos.

### Inventario Avanzado
Amplía todas las funcionalidades del Inventario Básico:
- **Control avanzado:** inventario multinivel, control de existencias, alertas automáticas y predictivas, historial de inventario.
- **Escáner:** escaneo de códigos de barras durante ventas, compras e inventario; lectura de SKU.
- **Productos por peso:** control por kg/lb, conversión automática, lectura de etiquetas de balanza.
- **Caducidad:** fecha de vencimiento, productos próximos a vencer/vencidos, alertas automáticas.
- **Mermas:** registro, motivo, historial, impacto económico.
- **Stock predictivo:** predicción de agotamiento, recomendación de compra, consumo promedio, tendencias.

### Recetas
Disponible para negocios que producen productos preparados.
- **Producción:** creación de recetas, ingredientes por receta, cantidades, costos por receta, porciones.
- **Automatización:** descuento automático de ingredientes, validación de disponibilidad, producción limitada según inventario, cálculo automático del costo.
- **Control:** historial de producción, consumo de ingredientes, rentabilidad por receta.

### Servicios
- **Gestión de servicios:** catálogo, crear/editar/eliminar servicios.
- **Agenda:** vista diaria/semanal/mensual, citas pendientes, reprogramación, cancelaciones.
- **Ejecución:** asignación de empleados, estado del servicio (pendiente/en proceso/finalizado).
- **Historial:** por servicio, por cliente, por empleado.

### Comisiones
- **Gestión:** configuración de porcentaje, comisión fija o variable.
- **Reportes:** comisión por empleado, comisión por período, historial, total pagado.

### Propinas
- **Gestión:** registro de propinas, distribución automática o manual, propinas por empleado.
- **Reportes:** total de propinas, historial, resumen mensual.

### Gestor de Ofertas
- **Promociones:** descuentos por producto o por categoría, ofertas temporales.
- **Gestión:** programación de ofertas (fecha de inicio/fin), historial de promociones.

### Compras y Proveedores
> Nota: a diferencia de los módulos anteriores, este ya cuenta con implementación real — ver `STATUS.md`, `technical/API.md` (`/purchases`) y `technical/DATABASE.md` (`suppliers`, `purchase_orders`, `purchase_items`).
- **Proveedores:** registro, información de contacto, historial de compras, productos suministrados.
- **Compras:** registro de órdenes de compra, actualización automática del inventario al recibir, historial, compras por proveedor.

---

## Acciones rápidas del Dashboard

Generadas dinámicamente según los módulos activos:

- Nueva venta
- Registrar gasto
- Agregar producto
- Escanear producto (si Inventario Avanzado tiene el escáner activo)
- Nueva cita (si Servicios está activo)
- Registrar producción (si Recetas está activo)

---

## Notificaciones

Además de las alertas del Bloque 2 dentro del Dashboard, el sistema debe poder enviar notificaciones (push/en-app) para:

- Stock bajo o agotado.
- Productos próximos a vencer.
- Servicios pendientes.
- Metas alcanzadas.
- Recordatorios operativos.

> Nota de implementación: el backend de notificaciones (`/notifications`) y el módulo de frontend correspondiente ya existen, pero el listener no está cableado en `App.js` — ver `STATUS.md`.

---

## Roles y permisos

Ver `requirements.md` (RF-025) para la definición vigente de roles: **Administrador** y **Asistente**.

- **Acceso por módulos:** un Asistente solo ve los módulos que el Administrador le habilita.
- **Restricción de información financiera:** el Asistente no ve márgenes, ganancias ni reportes financieros a menos que se le otorgue el permiso explícito.
- **Restricción de edición/eliminación:** acciones destructivas o de configuración quedan reservadas al Administrador.
- **Control de acciones críticas mediante MFA:** operaciones sensibles (p. ej. cambios de configuración del negocio) pueden requerir verificación MFA — ver `GLOSSARY.md` y `technical/API.md` (`/auth/mfa/*`).

---

## Por qué esta arquitectura

Todas las categorías de negocio comparten una única aplicación y una única base de código. Las categorías funcionan como plantillas de configuración inicial; la Biblioteca de Módulos permite que cada negocio adapte progresivamente el Dashboard (y el resto de la app) a su crecimiento, sin cambiar de versión ni de aplicación. Esto reduce la complejidad de desarrollo, facilita el mantenimiento y permite incorporar categorías nuevas en el futuro mediante configuración en vez de código nuevo — la misma filosofía descrita en `onboarding-engine.md`: *"el sistema se adapta al negocio y acompaña su crecimiento"*.
