from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, sales, invoices

app = FastAPI(
    title="CuentaClara API",
    description="Backend para la app de gestión de pymes",
    version="1.0.0"
)

# Permite que el app móvil se comunique con este backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # en producción cambia esto por tu dominio
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar los routers (módulos de endpoints)
app.include_router(auth.router,     prefix="/auth",     tags=["Autenticación"])
app.include_router(sales.router,    prefix="/sales",    tags=["Ventas"])
app.include_router(invoices.router, prefix="/invoices", tags=["Facturación"])

@app.get("/")
def root():
    return {"status": "CuentaClara API corriendo ✅"}