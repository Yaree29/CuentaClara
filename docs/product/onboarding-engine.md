# Motor de Onboarding y Configuración Adaptativa - CuentaClara

> ⚠️ Este documento reemplaza el modelo anterior de "categoría fija define 
> módulos de forma permanente". El modelo vigente es: la categoría define 
> una configuración INICIAL sugerida; el usuario puede activar o desactivar 
> módulos libremente después, desde Configuración → Módulos.

## Principio de arquitectura

Todas las categorías de negocio comparten una única aplicación y una única 
base de código. Las categorías funcionan como **plantillas de configuración 
inicial**, no como versiones distintas del producto. La Biblioteca de 
Módulos permite que cada negocio adapte progresivamente la plataforma a su 
crecimiento sin cambiar de versión ni de aplicación.

## Flujo del motor
- Categoría del negocio (elegida en registro)
- ↓
- Módulos activos por defecto
- ↓
- Motor de Configuración
- ↓
- Dashboard + Navegación + Formularios + Alertas + Permisos
- ↓
- (Usuario puede modificar módulos activos en cualquier momento)

## Modos de negocio (ver GLOSSARY.md para nomenclatura ui_mode/userType)

- **Informal** (`ui_mode: simple`): configuración simplificada, sin biblioteca 
  de módulos expandible — ver documentación del modo Informal por separado 
  (fuera del alcance de este documento, que cubre PYME).
- **PYME** (`ui_mode: advanced`): usa el modelo completo de Biblioteca de 
  Módulos descrito aquí.

## Biblioteca de módulos (PYME)

Todos los negocios PYME tienen acceso a la misma biblioteca. La categoría 
solo determina cuáles vienen activos por defecto al finalizar el registro.

| Módulo | Incluye | Estado de implementación |
|---|---|---|
| **Ventas** | Ventas, gastos, caja, movimientos | ✅ Implementado |
| **Inventario Básico** | Productos, stock, precio, categorías | ✅ Implementado |
| **Inventario Avanzado** | Extiende Inventario Básico: escáner, control por peso, caducidad, mermas, recetas, stock predictivo | 🟡 Parcial — ver detalle abajo |
| **Servicios** | Catálogo de servicios, agenda, asignación de empleados, estado de servicios | 🔴 No iniciado |
| **Comisiones** | Comisión por empleado, historial, reportes | 🔴 No iniciado |
| **Propinas** | Registro, distribución (automática/manual), reportes | 🔴 No iniciado |
| **Gestor de Ofertas** | Promociones, descuentos, ofertas temporales | 🔴 No iniciado |
| **Compras** | Proveedores, órdenes de compra (borrador → recibida/cancelada), actualización de inventario al recibir | ✅ Implementado |

**Detalle de Inventario Avanzado** (sub-funcionalidades independientes entre sí):

| Sub-funcionalidad | Estado |
|---|---|
| Escáner de códigos de barras | 🔴 No iniciado |
| Control por peso (kg/lb, conversión, lectura de balanza) | 🔴 No iniciado |
| Caducidad (fecha de vencimiento, alertas) | 🔴 No iniciado |
| Mermas (registro, motivo, historial, impacto económico) | 🔴 No iniciado |
| Recetas (BOM, descuento automático de insumos) | 🟡 Parcial — solo formulario de creación, sin lógica de descuento |
| Stock predictivo (predicción de agotamiento, recomendación de compra) | 🔴 No iniciado |

## Configuración inicial por categoría

Al finalizar el registro sin personalización adicional, el sistema activa 
automáticamente estos módulos. El usuario puede cambiarlos después.

| Categoría | Módulos activados por defecto | Configuraciones internas habilitadas |
|---|---|---|
| **General** | Ventas, Inventario Básico | — |
| **Alimentos** (`FOOD`) | Ventas, Inventario Avanzado | Control por peso, Caducidad, Mermas |
| **Comida Preparada** (`PREPARED_FOOD`) | Ventas, Inventario Avanzado | Recetas, Mermas, Producción |
| **Comercio** (`COMMERCE`) | Ventas, Inventario Avanzado | Escáner, Gestión de SKU, Stock predictivo |
| **Servicios** (`SERVICES`) | Ventas, Servicios | Opcional después: Inventario Básico/Avanzado, Comisiones |

## Personalización posterior

El usuario accede a **Configuración → Módulos** para activar funcionalidad 
adicional conforme crece su negocio. Ejemplo: una barbería (categoría 
Servicios) inicia con Ventas + Servicios, luego activa Inventario Básico, 
y si necesita más control, migra a Inventario Avanzado. La información 
existente se conserva al cambiar de nivel de módulo.

## Roles de usuario

Ver `docs/product/requirements.md` (RF-025) para la definición vigente 
de roles: **Administrador** y **Asistente**.

## Generado automáticamente por el Motor de Configuración

A partir de los módulos activos, el sistema genera: Dashboard, Navegación, 
Formularios, Alertas, Permisos, Acciones rápidas, Configuración inicial. 
Ver `docs/product/dashboard-pymes.md` para el detalle de cómo el Dashboard 
específicamente consume esta configuración.