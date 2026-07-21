# Modo Informal (Modo Simple) — CuentaClara

> Contraparte de `dashboard-pymes.md` para el otro modo de negocio de CuentaClara. Ver `GLOSSARY.md` para la equivalencia `ui_mode: simple` = `userType: informal`. Según `STATUS.md`, este modo está **~85% implementado** — este documento detalla qué compone ese porcentaje: cómo se activa, qué módulos trae, cómo está construida cada pantalla y qué falta.

## Objetivo y filosofía

El Modo Informal está pensado para comerciantes pequeños o vendedores independientes que necesitan registrar ventas y fiados con la mínima fricción posible, sin pasar por selección de categoría de industria ni por la Biblioteca de Módulos que sí tiene PYME (ver `onboarding-engine.md`). A diferencia de PYME, el Modo Informal **no es adaptativo**: siempre activa el mismo conjunto fijo de módulos, sin importar el rubro del negocio.

---

## Cómo se activa

El registro (`src/modules/auth/screens/RegisterScreen.jsx`) es un flujo de 3 pasos. En el paso 2 el usuario elige un perfil:

| Opción en el paso 2 | `profileType` | `ui_mode` resultante | Paso 3 |
|---|---|---|---|
| **Emprendedor (Rápido)** | `emprendedor` | `simple` (informal) | 2 campos: "¿Qué vendes?" y "Precio promedio", más un toggle "Impuesto 7%" (desactivado por defecto) |
| **Empresa PYME** | `empresa` | `advanced` (pyme) | Formulario completo: RUC/NIT, dirección, selección de categoría/plantilla de industria, configuración operativa por categoría |

`registerService.js` traduce `profileType !== 'empresa'` a `ui_mode: 'simple'` y guarda `business_type`/`avg_price` dentro de `settings` (JSONB), ya que no tienen columna propia. No se envía `industry_template_id` — por eso el registro informal nunca pasa por la lógica de plantillas de industria del backend.

En `backend/app/services/auth_service.py::register_business`, cuando `ui_mode` es `simple`:
- `tax_rate` se calcula desde el toggle "Impuesto 7%" (`7.00` si está activo, `0.00` si no) — a diferencia de PYME, que usa la tasa capturada en el registro.
- Si no se envía `industry_template_id` (caso normal del flujo "Emprendedor"), se activan directamente los `DEFAULT_INFORMAL_MODULES`.

---

## Módulos activos por defecto (fijos)

```python
# backend/app/services/auth_service.py
DEFAULT_INFORMAL_MODULES = ['sales', 'credit', 'inventory']
BASE_MODULES = ['dashboard', 'profile']  # siempre presentes, cualquier modo
```

No hay variación por categoría de negocio como en PYME — todo negocio informal recibe exactamente: **Inicio, Ventas, Fiado, Inventario** (más Perfil, que no es una tab visible).

---

## Navegación

El Modo Informal **no tiene un navegador separado**: usa el mismo `MainNavigator` (`src/views/navigation/MainNavigator.jsx`) que PYME. Lo único que cambia es qué módulos trae `enabled_modules` desde `GET /auth/context` — el navegador arma las tabs dinámicamente a partir de esa lista (`TAB_CONFIG` + `CANONICAL_TAB_ORDER`).

Para un negocio informal recién registrado, `enabled_modules` coincide con `FALLBACK_TAB_ORDER` (`['dashboard', 'sales', 'credit', 'inventory']`) — las 4 tabs que ve el usuario.

---

## Pantalla por pantalla

### Inicio — `InformalDashboard.jsx`

`HomeScreen.jsx` decide qué dashboard renderizar según `user.userType`; para `'informal'` monta `InformalDashboard.jsx`, alimentado por el hook `useInformalDashboard.js`. Este hook llama en paralelo (todo vía FastAPI, nunca Supabase directo) a:
- `salesService.getProfitsAndExpenses(hoy, hoy)` → ventas del día.
- `debtService.getDebts()` → suma de `remaining_amount` y conteo de clientes únicos con deuda.
- `inventoryService.getMovements(3)` → últimos 3 movimientos.
- `inventoryService.lowStockAlerts()` → hasta 4 productos con stock crítico.

Cada llamada tiene su propio `.catch(() => valor por defecto)`, así que si un servicio falla el dashboard no se rompe, solo muestra esa sección vacía.

La pantalla se compone de:
1. Bienvenida (`¡Hola, {nombre}!`).
2. Tarjeta de Ventas del Día.
3. Tarjeta unificada de Fiados (monto total por cobrar + cantidad de clientes).
4. Acciones rápidas: "Anotar Fiado" (va a la tab `credit`) y "Nuevo Producto" (va a la tab `inventory`).
5. Actividades recientes (últimos movimientos de inventario, clasificados en venta/compra/ajuste con su monto).
6. Alerta de inventario bajo, si aplica.

### Ventas — `SalesScreen.jsx`

Compartida entre Informal y PYME sin bifurcación de UI por `userType` (750 líneas, un solo componente para ambos modos). Usa `salesService.js` contra `/sales/quick` para registrar ventas rápidas.

### Fiado / Crédito — exclusivo de Informal en la interfaz

`DebtScreen.jsx` es un **orquestador visual**: si `userType === 'informal'` renderiza `InformalCredit.jsx`; para cualquier otro caso muestra un placeholder ("El módulo de créditos/fiados es exclusivo para cuentas de tipo informal").

> ⚠️ Nota de diseño: esto es una restricción de la **UI**, no del backend. `auth_service.py` sí activa el feature `credit` para varios negocios PYME (categorías Servicios, Comercio, Alimentos Preparados). Si un negocio PYME tiene `credit` activo, la tab aparece en la navegación pero muestra el placeholder de "no disponible" en vez de una vista funcional — no hay una versión PYME de esta pantalla todavía.

Funcionalidad real (`useInformalCredit.js` + `debtService.js`, contra `/credit/*`):
- Crear o editar un fiado (crea el cliente si no existe, reutiliza el existente por nombre).
- Registrar abonos (`POST /credit/debts/{id}/payments`).
- Cancelar un fiado (soft delete vía `POST /credit/debts/{id}/cancel`).
- Enviar recordatorio de cobro por WhatsApp (arma el mensaje y abre `whatsapp://send`).

### Inventario — también "informal-first"

`InventoryScreen.jsx` sigue el mismo patrón orquestador que `DebtScreen.jsx`: `userType === 'informal'` → `InformalInventory.jsx`; para PYME, el propio comentario del código dice *"para PYME aún no hay UI implementada (placeholder)"* y muestra "La vista de inventario para PYME aún no está implementada".

> ⚠️ Esto contradice la fila `inventory: ✅ Implementado` de `STATUS.md`, que no distingue Informal de PYME. Lo implementado y funcional es la vista **Informal**; PYME todavía no tiene una UI de inventario propia. Pendiente de corregir en `STATUS.md`.

`InformalInventory.jsx` incluye, además del CRUD estándar de productos (crear/editar/eliminar, precio, stock, categorías):
- **Generador de promociones** (`PromoGeneratorModal.jsx`): selecciona productos del catálogo, arma un mensaje de texto con precios y lo envía por WhatsApp como catálogo/publicidad — una funcionalidad pensada específicamente para el vendedor informal, sin equivalente documentado en el modo PYME.

### Perfil y seguridad

`src/modules/profile/` y `src/modules/verification/` (2FA/TOTP, biometría vía `biometricService.js`) son compartidos entre ambos modos — no hay diferencias de Modo Informal aquí.

---

## Qué NO tiene el Modo Informal (por diseño)

No forma parte de la Biblioteca de Módulos de Informal (exclusivos de PYME, ver `onboarding-engine.md`):
- Compras y Proveedores (`purchases`).
- Facturación formal (`Invoice` — Informal usa el recibo simple de `billing`, si llegara a activarse).
- Personal (`staff`), Recetas, Servicios, Comisiones, Propinas, Gestor de Ofertas.
- Selección de categoría/industria y configuración operativa asociada — el registro informal no pasa por plantillas.

---

## Estado real (detalle del ~85%)

| Pieza | Estado |
|---|---|
| Registro rápido (2-3 pasos, sin plantilla de industria) | ✅ Completo |
| Dashboard (`InformalDashboard.jsx` + hook) | ✅ Completo |
| Ventas rápidas | ✅ Completo (compartido con PYME) |
| Inventario informal (CRUD + generador de promociones WhatsApp) | ✅ Completo |
| Fiado (crear, abonar, cancelar, recordatorio WhatsApp) | ✅ Completo |
| Registrar ingreso/gasto manual (`CreateTransactionScreen.jsx`) | 🔴 No persiste — `handleSave` solo hace `console.log(payload)` y cierra la pantalla; no llama a ningún servicio/endpoint |
| Caja (`cash`) | 🔴 Placeholder ("Próximamente") — no forma parte de `DEFAULT_INFORMAL_MODULES`, pero comparte el mismo código de placeholder que ve PYME si se activara |

---

## Referencias

- `onboarding-engine.md` / `dashboard-pymes.md` — contraparte del Modo PYME.
- `STATUS.md` — estado de implementación general por módulo.
- `GLOSSARY.md` — equivalencia `ui_mode`/`userType`.
- `backend/app/services/auth_service.py` — `DEFAULT_INFORMAL_MODULES`, `BASE_MODULES`, lógica de `register_business`.
