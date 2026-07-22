# Estado del Proyecto - CuentaClara

Última actualización: [7/10/2026]

Este documento reemplaza al antiguo estado reportado en `changelog.md`, 
que había quedado desactualizado. Refleja el estado real verificado en 
el código.

## Resumen general

| Modo | Estado |
|---|---|
| Informal | ~85% implementado |
| PYME | En desarrollo activo — ver detalle abajo |

## Detalle por módulo (Modo PYME)

Basado en verificación directa del código (`src/modules/`):

| Módulo | Estado | Notas |
|---|---|---|
| `inventory` | 🟡 Parcial | `InventoryScreen.jsx` es un orquestador: solo renderiza una UI real (`InformalInventory.jsx`, con CRUD + generador de promociones por WhatsApp) para `userType === 'informal'`. Para PYME muestra un placeholder explícito ("La vista de inventario para PYME aún no está implementada") — ver `product/informal-mode.md` |
| `credit` | 🟡 Parcial, restringido a Informal en la UI | `DebtScreen.jsx` solo renderiza la vista funcional (`InformalCredit.jsx`) para `userType === 'informal'`; para PYME muestra placeholder "exclusivo para cuentas de tipo informal" **aunque el backend sí activa el feature `credit` para varias categorías PYME** (ver `auth_service.py`) — ver `product/informal-mode.md` |
| `billing` | ✅ Implementado | Recibo simple (`SimpleReceiptScreen.jsx` + `receiptService.js`) para Modo Informal — distinto de `Invoice` (ver abajo) |
| `Invoice` | ✅ Implementado | Facturación formal PYME (`BillingScreen.jsx` + `billingService.js` + `useBilling.js`) — no confundir con `billing`, que es el recibo simple del Modo Informal |
| `purchases` | ✅ Implementado | Proveedores + órdenes de compra (draft → receive/cancel), con hooks/screens/services en frontend, router y servicio en backend, y `database/schema/05_purchases.sql` |
| `notifications` | ✅ Implementado (sin push real) | Notifica al dueño PYME cuando un asistente registra venta/inventario. `NotificationsListener` montado en `App.js`, alerta vía Realtime de Supabase sobre la tabla `notifications` — funciona con la app abierta o recién en segundo plano. Decisión del proyecto: NO se usa push real (FCM/Firebase), no llega si la app está completamente cerrada |
| `business_services` | 🔴 Placeholder | `ServicesScreen.jsx` solo muestra "Módulo de Servicios (En construcción)", sin lógica |
| `recipes` | 🟡 Parcial | Existen `CreateRecipeScreen.jsx`, `recipeService.js` y `useRecipeForm.js` (formulario de creación con su servicio), pero falta la lógica de descuento de insumos vía BOM (JSONB) |
| `scanner` | 🔴 No iniciado | Sin archivos en el repositorio |
| `commissions` | 🔴 No iniciado | Sin carpeta ni archivos propios en `src/modules/` |
| `waste` | 🔴 No iniciado | Solo existe como campo de configuración (`wasteMargin`), sin módulo ni pantalla |
| `staff` | 🔴 Placeholder | Pantalla con comentario explícito de "funcionalidad completa aún no implementada" |
| `reports` | 🔴 Placeholder | `ReportsScreen.jsx` (26 líneas), sin lógica |

## Pendientes técnicos conocidos (no funcionales, pero relevantes)

- [ ] Resolver colisión de numeración `12_adaptive_onboarding.sql` / 
      `12_invoicing_pymes.sql` en `database/schema/` — orden de aplicación 
      no documentado.
- [ ] Confirmar que `database/schema.sql` es el reemplazo intencional del 
      `schema.sql` de raíz (eliminado) y actualizar `DEPLOYMENT.md`.
- [ ] Confirmar si los IDs `CC-10`, `CC-19`, `CC-23` (faltantes en 
      `acceptance-criteria.md`) fueron retirados intencionalmente o es 
      un error de numeración.
- [ ] `CreateTransactionScreen.jsx` (registrar ingreso/gasto manual) no persiste 
      datos: `handleSave` solo hace `console.log(payload)` y navega hacia atrás, 
      sin llamar a ningún servicio o endpoint.

## Próximos pasos sugeridos (orden de prioridad para completar PYME)

> Nota: este orden es una sugerencia basada en dependencias lógicas 
> (ej. reports depende de tener datos de sales/inventory ya andando). 
> Ajústenlo según lo que el equipo priorice.

1. `recipes` — terminar lógica de BOM/insumos (ya hay base de formulario)
2. `scanner` — bloquea flujos de `COMMERCE` y `FOOD` según `onboarding-engine.md`
3. `staff` / `commissions` — necesarios para categoría `SERVICES`
4. `waste` — necesario para categorías `FOOD` y `PREPARED_FOOD`
5. `reports` — dashboard avanzado, probablemente el último por depender de datos de los demás módulos