# CuentaClara FastAPI Backend

API FastAPI conectada a la base existente de CuentaClara usando SQLAlchemy y reflection.

## Objetivos cumplidos

- No se modifica la estructura de la base de datos.
- No hay migraciones.
- Los modelos se mapean desde tablas existentes con reflection (`automap`).
- Arquitectura por capas: routers, services, repositories, models.
- Multitenancy por header `X-Tenant-ID` con aislamiento estricto.
- JWT con `business_id` en el token.

## Estructura

```text
backend/
  app/
    core/          # config y seguridad (JWT/password)
    db/            # engine y sesiones
    middleware/    # tenant por header
    dependencies/  # tenant y auth
    models/        # mapping reflection + schemas pydantic
    repositories/  # acceso a datos
    services/      # reglas de negocio
    routers/       # endpoints
    main.py        # app FastAPI
```

## Variables de entorno

Copiar `.env.example` a `.env` dentro de `backend/`.

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/cuentaclara
JWT_SECRET_KEY=change_this_secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60
```

## Instalacion y ejecucion

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Flujo de autenticacion y tenant

1. Enviar `X-Tenant-ID` con UUID del negocio (`businesses.id`) en cada request.
2. `POST /api/auth/login` valida usuario por `email + business_id`.
3. Se retorna JWT con `sub` (user id), `business_id` y `role`.
4. Endpoints protegidos validan token y comparan `business_id` del token contra `X-Tenant-ID`.

Si no coinciden, se bloquea con `403`.

## Endpoints

- `GET /health`
- `POST /api/auth/login`
- `GET /api/products`
- `GET /api/products/{product_id}`
- `POST /api/products`
- `PUT /api/products/{product_id}`
- `DELETE /api/products/{product_id}`
- `GET /api/suppliers`
- `GET /api/suppliers/{supplier_id}`
- `POST /api/suppliers`
- `PUT /api/suppliers/{supplier_id}`
- `DELETE /api/suppliers/{supplier_id}`

## Nota importante sobre usuarios de prueba

En `database/database.sql` los `password_hash` de seed estan como `hash_aqui`.
Para login real deben ser hashes bcrypt validos.
