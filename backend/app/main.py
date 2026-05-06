from fastapi import FastAPI

from app.middleware.tenant import TenantHeaderMiddleware
from app.routers.auth_router import router as auth_router
from app.routers.health_router import router as health_router
from app.routers.products_router import router as products_router
from app.routers.suppliers_router import router as suppliers_router

app = FastAPI(title="CuentaClara API", version="1.0.0")

app.add_middleware(
    TenantHeaderMiddleware,
    exempt_paths={"/health", "/docs", "/openapi.json", "/redoc", "/favicon.ico"},
)

app.include_router(health_router)
app.include_router(auth_router, prefix="/api")
app.include_router(products_router, prefix="/api")
app.include_router(suppliers_router, prefix="/api")
