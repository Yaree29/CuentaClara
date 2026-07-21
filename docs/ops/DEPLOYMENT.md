# Guía de Despliegue (Deployment) - CuentaClara

Esta guía detalla los pasos para desplegar el backend (FastAPI), configurar la base de datos (Supabase) y compilar/distribuir la aplicación móvil (Expo).

---

## 🏗️ 1. Base de Datos y Seguridad (Supabase)

Supabase aloja la base de datos PostgreSQL, la autenticación y el almacenamiento.

### Pasos de Configuración:
1. **Crear Proyecto:** Iniciar un nuevo proyecto en el dashboard de Supabase.
2. **Esquema de Base de Datos:**
   * Ejecutar los scripts del directorio `/database/schema` secuencialmente en el editor SQL de Supabase (o mediante un cliente PostgreSQL externo utilizando el string de conexión directa).
   * **Importante:** El script `11_credit_debts.sql` contiene la estructura del módulo de fiados y debe aplicarse después de los esquemas base.
   * ⚠️ Existe una colisión de numeración entre `12_adaptive_onboarding.sql` y `12_invoicing_pymes.sql` — ambos comparten prefijo `12_`. El orden de aplicación entre ellos no está formalmente documentado (ver pendiente en `STATUS.md`); aplicar ambos igualmente, ya que no son mutuamente excluyentes.
   * `13_mfa.sql` agrega las columnas `mfa_secret`/`mfa_enabled` a `users` — es seguro de re-ejecutar (`IF NOT EXISTS`).
3. **Políticas de RLS y Permisos:**
   * Ejecutar los scripts del directorio `/database/rls` secuencialmente (`01_enable_rls.sql`, `02_helper_function.sql`, `03_policies.sql`, `04_auth_uid_user_policy.sql`, `05_grants.sql`, `06_auth_rls_repair.sql`, `07_public_readables.sql`, `07_registration_rls_fix.sql`, `08_dev_permissions_setup.sql`) para activar RLS en las tablas y reconfigurar la función helper `get_business_id()`.
   * Ejecutar `06_auth_rls_repair.sql` para otorgar los permisos de selección (`GRANT SELECT`) al rol `authenticated` de la API de Supabase.
4. **Datos iniciales (seeds) y almacenamiento:**
   * Ejecutar los scripts de `/database/seeds` (categorías, unidades, plantillas de industria, tipos de factura; `05_test_business.sql` y `06_auth_profile_test_user.sql` son solo para entornos de desarrollo/pruebas).
   * Ejecutar `database/storage/01_invoices_bucket.sql` para crear el bucket de almacenamiento de facturas.

---

## 🐍 2. Backend (FastAPI en Render)

El backend de FastAPI está configurado para desplegarse como un servicio web en Render.

### Configuración del Repositorio:
* **Entorno de Ejecución (Runtime):** Python 3.9+ (indicado en `/backend/runtime.txt`).
* **Comando de Construcción (Build Command):**
  ```bash
  pip install -r requirements.txt
  ```
* **Comando de Inicio (Start Command):**
  ```bash
  uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```

### Variables de Entorno Requeridas en Render:
| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `SUPABASE_URL` | Endpoint de la API REST de Supabase | `https://xxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Clave anónima pública de Supabase (respeta RLS) | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave secreta con bypass RLS (usada para crear perfiles) | `eyJhbGci...` |
| `SECRET_KEY` | Clave usada para firmar/verificar tokens JWT propios del backend | `una-clave-secreta-larga` |

> Nota: estos son los nombres reales leídos por `backend/app/config.py` (vía `pydantic_settings`). El `.env.example` de la app móvil usa las mismas claves `SUPABASE_URL`/`SUPABASE_ANON_KEY` para el cliente Supabase del frontend (solo sesión/auth/MFA/realtime).

---

## 📱 3. Aplicación Móvil (Expo EAS)

La distribución móvil se gestiona mediante Expo Application Services (EAS).

### Preparación del Entorno Local:
1. Instalar la CLI de EAS de forma global:
   ```bash
   npm install -g eas-cli
   ```
2. Iniciar sesión en Expo:
   ```bash
   eas login
   ```
3. Configurar el proyecto de compilación móvil:
   ```bash
   eas build:configure
   ```

### Construcción para Dispositivos Físicos:

#### Android (APK/AAB):
```bash
# Generar una compilación APK local para pruebas rápidas
eas build --platform android --profile preview

# Generar compilación AAB lista para subir a Google Play Console
eas build --platform android --profile production
```

#### iOS (IPA):
```bash
# Compilación para simulador o testeo en dispositivos ad-hoc (requiere cuenta de Apple Developer)
eas build --platform ios --profile preview
```

---

## 🔄 4. Actualizaciones Over-The-Air (OTA)

Para correcciones de errores en la interfaz o estilos del cliente móvil sin pasar de nuevo por la revisión de las tiendas, CuentaClara utiliza Expo Updates:

```bash
# Publicar actualización OTA en el canal por defecto
eas update --branch main --message "Corrección de estilos en panel de fiados"
```
Los dispositivos clientes descargarán la actualización en segundo plano la próxima vez que inicien la aplicación.
