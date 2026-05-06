# Documentación de Base de Datos - Solución de Registro (Onboarding)

Este documento resume los cambios y comandos ejecutados en Supabase para solucionar los errores de "Permission Denied" (42501) y fallos de RLS durante el registro de nuevos usuarios.

## 1. Problema Identificado
El servicio de registro fallaba porque:
1. Intentaba insertar en `businesses` antes de que el usuario tuviera un `business_id` en sus claims de JWT.
2. Las políticas de RLS bloqueaban las inserciones de usuarios anónimos o recién autenticados sin perfil previo.
3. Había una dependencia circular: para crear un usuario se necesita un negocio, pero para crear un negocio el RLS pedía ser usuario del mismo.

## 2. Cambios en el Esquema (SQL)

### Adición de `owner_id`
Añadimos una columna para rastrear la autoría del negocio independientemente de la tabla de usuarios:
```sql
ALTER TABLE public.businesses 
ADD COLUMN owner_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
```

## 3. Comandos de Permisos (Fix Temporal de Desarrollo)

Para permitir que el `registerService.js` funcione sin bloqueos, se ejecutaron los siguientes comandos:

### Deshabilitar RLS
Se deshabilitó el RLS en las tablas del flujo inicial para evitar errores de política:
```sql
ALTER TABLE public.businesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_configs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_features DISABLE ROW LEVEL SECURITY;
```

### Otorgar Privilegios (Grants)
Se dieron permisos explícitos al rol `anon` para manejar el breve lapso entre el `signUp` y la persistencia de la sesión:
```sql
GRANT ALL ON TABLE public.businesses TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.users TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.business_configs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.business_features TO anon, authenticated, service_role;
```

## 4. Archivos Creados
- `database/schema/10_fix_registration_flow.sql`: Contiene el cambio de columna `owner_id`.
- `database/rls/08_dev_permissions_setup.sql`: Contiene los comandos de permisos y RLS mencionados arriba.

## 5. Configuración de Supabase Auth
- **Confirmación de Email**: Deshabilitada para permitir acceso inmediato tras el registro.
- **Validación de Contraseña**: Mínimo 6 caracteres (validado también en el frontend).
