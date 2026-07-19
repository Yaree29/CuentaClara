# Glosario - CuentaClara

Este documento existe para evitar ambigüedad entre el vocabulario técnico 
(base de datos, backend) y el vocabulario de negocio (producto, API pública).

## Modos de negocio: ui_mode vs userType

Son el MISMO concepto, expresado en dos vocabularios distintos. `userType` 
se deriva de `ui_mode` en tiempo de respuesta — no son campos independientes, 
no existe una columna `user_type` en la base de datos.

| Vocabulario técnico (BD, código) | Vocabulario de negocio (API, UI, docs de producto) |
|---|---|
| `ui_mode = 'simple'`             | `userType = 'informal'`                            |
| `ui_mode = 'advanced'`           | `userType = 'pyme'`                                |

- **Fuente de verdad:** columna `businesses.ui_mode` (`database/schema/01_core.sql`).
- **Traducción:** ocurre en `backend/app/services/auth_service.py`, dentro 
  de la función que construye la respuesta de `/auth/context`.
- **Regla para escribir documentación:** en documentos técnicos (ARCHITECTURE.md, 
  DATABASE.md, API.md) usar `ui_mode` con sus valores reales. En documentos 
  de producto (PRD.md, user-stories.md, onboarding-engine.md) usar `informal`/`pyme`, 
  que es como el negocio y el usuario final entienden el concepto.

## Categorías de industria (PYME)

Los siguientes términos son equivalentes; el código usa inglés, los documentos 
de negocio y la matriz de capacidades usan español:

| Código (`onboarding-engine.md`, backend) | Documentos de negocio (`acceptance-criteria.md`) |
|---|---|
| `COMMERCE`      | Comercio              |
| `FOOD`          | Alimentos             |
| `PREPARED_FOOD` | Alimentos Preparados  |
| `SERVICES`      | Servicios             |

## Sistemas de identificadores (IDs) del proyecto

Existen 4 sistemas de numeración distintos en la documentación. Esta tabla 
existe para no confundirlos entre sí:

| Prefijo | Significa | Vive en | Notas |
|---|---|---|---|
| `RF-XXX` (3 dígitos) | Requisito Funcional | `requirements.md` | Fuente de verdad; `PRD.md` solo referencia estos mismos IDs (`RF-001`...`RF-034`), no define IDs propios |
| `US-XXX` | Historia de Usuario | `user-stories.md` | |
| `AC-XX-XX` | Criterio de Aceptación | `acceptance-criteria.md` | Agrupados en épicas `CC-X` |
| `CC-X` | Épica / Agrupador de criterios | `acceptance-criteria.md` | Numeración con huecos (falta 10, 19, 23) — pendiente confirmar si son épicas retiradas o error de numeración |

**TODO pendiente:** no existe mapeo cruzado formal entre estos 4 sistemas 
(por ejemplo, qué `RF-XXX` corresponde a qué `US-XXX`). Se recomienda añadir 
una tabla de trazabilidad.