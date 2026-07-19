# Documentación - CuentaClara

Índice de la documentación del proyecto.

## Cómo navegar esta carpeta

| Carpeta / Archivo | Contenido |
|---|---|
| `GLOSSARY.md` | Vocabulario técnico vs de negocio, sistemas de IDs |
| `STATUS.md` | Qué está implementado hoy, qué falta (por módulo) |
| `changelog.md` | Historial de cambios por versión |
| `product/PRD.md` | Visión, objetivo, justificación del producto |
| `product/requirements.md` | Requisitos funcionales y no funcionales detallados |
| `product/user-stories.md` | Historias de usuario con criterios de aceptación |
| `product/acceptance-criteria.md` | Criterios de aceptación técnicos por épica |
| `product/onboarding-engine.md` | Matriz de módulos habilitados por tipo de negocio |
| `product/dashboard-pymes.md` | Estructura del Dashboard PYME y alcance funcional por módulo |
| `product/informal-mode.md` | Cómo está construido el Modo Informal/Simple: activación, módulos fijos, pantallas |
| `technical/ARCHITECTURE.md` | Arquitectura general, patrón multi-tenant, RLS |
| `technical/API.md` | Documentación de endpoints REST |
| `technical/DATABASE.md` | Esquema de tablas, relaciones, RLS, índices |
| `ops/DEPLOYMENT.md` | Guía de despliegue (Supabase, Render, Expo EAS) |

## Convenciones importantes

- Arquitectura de datos: `Frontend → FastAPI → Supabase`. El SDK de Supabase 
  en el frontend se usa exclusivamente para sesión/auth/MFA/realtime, nunca 
  para tablas de negocio directamente (ver `technical/ARCHITECTURE.md`).
- Terminología de modos: ver `GLOSSARY.md` antes de asumir que `ui_mode` y 
  `userType` son campos distintos — no lo son.