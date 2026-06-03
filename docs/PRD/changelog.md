# Registro de Cambios (Changelog) - CuentaClara

Este documento registra cronológicamente los hitos de desarrollo, versiones del producto y actualizaciones de CuentaClara.

---

## [1.0.0-draft] - 2026-06-03
### Añadido
* **Documentación Base de Producto:** Redacción del PRD inicial, Historias de Usuario e Inventario de Requisitos Funcionales y No Funcionales.
* **Glosario de Dominio:** Creación de `CONTEXT.md` en la raíz del proyecto para definir términos y mapear conceptos de negocio (Español) a conceptos técnicos (Inglés).
* **Especificación de Criterios de Aceptación:** Definición formal de las condiciones de éxito por épica en `acceptance-criteria.md`.
* **Esquema de Base de Datos Multi-tenant:** Creación de los scripts SQL iniciales (`01_core.sql` a `11_credit_debts.sql`) con soporte para Row Level Security (RLS) y aislamiento de datos a través de la función helper `get_business_id()`.
* **Bifurcación de Perfil:** Desarrollo completado de la interfaz de selección entre "Modo Simple" (Informal) y "Modo Avanzado" (PYME) en la aplicación móvil.

### En Progreso
* **Módulo de Crédito/Fiado:** Configuración del API endpoint `/credit` en FastAPI y pruebas de integración con Supabase.
* **Gestión de Stock Híbrida:** Desarrollo de la lógica condicional para productos y servicios (stock infinito/NULL).
* **Configuración del Entorno local:** Pruebas y depuración del flujo de inicio de sesión con tokens de Supabase Auth.

---

## Pautas de Versionado
Este proyecto sigue el estándar de **SemVer** (Versionamiento Semántico):
* **MAJOR (X.y.z):** Cambios que rompen compatibilidad o cambios de modelo a gran escala (ej. migración de monorepo a otra arquitectura).
* **MINOR (x.Y.z):** Adición de nuevas funcionalidades compatibles hacia atrás (ej. agregar el módulo de insumos y recetas).
* **PATCH (x.y.Z):** Corrección de bugs o actualizaciones menores de seguridad y mantenimiento.
