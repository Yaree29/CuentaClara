from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, sales, invoices, credit, inventory, notifications, businesses, purchases, assistants, commissions, tips, offers, recipes, cash, expenses

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
app.include_router(credit.router,   prefix="/credit",   tags=["Crédito / Fiado"])
app.include_router(inventory.router, prefix="/inventory", tags=["Inventario"])
app.include_router(notifications.router, prefix="/notifications", tags=["Notificaciones"])
app.include_router(businesses.router,    prefix="/businesses",    tags=["Negocio"])
app.include_router(purchases.router,     prefix="/purchases",     tags=["Compras"])
app.include_router(assistants.router,    prefix="/assistants",    tags=["Modo Asistente"])
app.include_router(commissions.router,   prefix="/commissions",   tags=["Comisiones"])
app.include_router(tips.router,          prefix="/tips",          tags=["Propinas"])
app.include_router(offers.router,        prefix="/offers",        tags=["Ofertas"])
app.include_router(recipes.router,       prefix="/recipes",       tags=["Recetas / Producción"])
app.include_router(cash.router,          prefix="/cash",          tags=["Caja"])
app.include_router(expenses.router,      prefix="/expenses",      tags=["Gastos"])

@app.get("/")
def root():
    return {"status": "CuentaClara API corriendo ✅"}