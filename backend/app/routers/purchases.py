# =============================================================================
# CREADO: 2026-07-07
# Propósito: Endpoints HTTP para el módulo de compras (PYME). Prefijo
#            /purchases. Requiere autenticación JWT en todos los endpoints.
#
# Endpoints:
#   GET    /purchases/suppliers            → listar proveedores activos
#   POST   /purchases/suppliers            → crear proveedor
#   PATCH  /purchases/suppliers/{id}       → actualizar proveedor
#   GET    /purchases                      → listar órdenes de compra
#   POST   /purchases                      → crear orden de compra (draft)
#   GET    /purchases/{id}                 → detalle de una orden de compra
#   POST   /purchases/{id}/receive         → marcar recibida (actualiza inventario)
#   POST   /purchases/{id}/cancel          → cancelar orden (solo en draft)
# =============================================================================
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from app.models.purchases import SupplierCreate, SupplierUpdate, PurchaseOrderCreate
from app.services import purchase_service
from app.routers.auth import get_current_user

router = APIRouter()


# ── Proveedores ──────────────────────────────────────────────────────────────

@router.get("/suppliers", summary="Listar proveedores activos del negocio")
def get_suppliers(current_user: dict = Depends(get_current_user)):
    try:
        return purchase_service.list_suppliers(current_user["business_id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/suppliers", summary="Crear proveedor")
def create_supplier(data: SupplierCreate, current_user: dict = Depends(get_current_user)):
    try:
        return purchase_service.create_supplier(current_user["business_id"], data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/suppliers/{supplier_id}", summary="Actualizar datos del proveedor")
def update_supplier(
    supplier_id: int,
    data: SupplierUpdate,
    current_user: dict = Depends(get_current_user)
):
    try:
        return purchase_service.update_supplier(current_user["business_id"], supplier_id, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── Órdenes de compra ────────────────────────────────────────────────────────

@router.get("/", summary="Listar órdenes de compra del negocio")
def get_purchase_orders(
    status: Optional[str] = Query(None, description="Filtrar por status: draft, received, cancelled"),
    current_user: dict = Depends(get_current_user)
):
    try:
        return purchase_service.list_purchase_orders(current_user["business_id"], status)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", summary="Crear orden de compra (draft)")
def create_purchase_order(data: PurchaseOrderCreate, current_user: dict = Depends(get_current_user)):
    try:
        return purchase_service.create_purchase_order(
            business_id=current_user["business_id"],
            user_id=current_user["sub"],
            data=data
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{purchase_order_id}", summary="Detalle de una orden de compra")
def get_purchase_order(purchase_order_id: int, current_user: dict = Depends(get_current_user)):
    try:
        return purchase_service.get_purchase_order(current_user["business_id"], purchase_order_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{purchase_order_id}/receive", summary="Marcar orden como recibida (actualiza inventario)")
def receive_purchase_order(purchase_order_id: int, current_user: dict = Depends(get_current_user)):
    try:
        return purchase_service.receive_purchase_order(
            business_id=current_user["business_id"],
            user_id=current_user["sub"],
            purchase_order_id=purchase_order_id
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{purchase_order_id}/cancel", summary="Cancelar orden de compra (solo en draft)")
def cancel_purchase_order(purchase_order_id: int, current_user: dict = Depends(get_current_user)):
    try:
        return purchase_service.cancel_purchase_order(current_user["business_id"], purchase_order_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
