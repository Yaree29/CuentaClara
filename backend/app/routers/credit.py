# =============================================================================
# CREADO: 2026-05-26
# Propósito: Endpoints HTTP para el módulo de crédito/fiado.
#            Prefijo /credit. Requiere autenticación JWT en todos los endpoints.
#
# Endpoints:
#   GET  /credit/customers           → listar clientes activos del negocio
#   POST /credit/customers           → crear cliente
#   GET  /credit/debts               → listar deudas (filtrables por status)
#   POST /credit/debts               → crear deuda/fiado
#   POST /credit/debts/{id}/payments → registrar abono
# =============================================================================
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from app.models.credit import CustomerCreate, DebtCreate, PaymentCreate
from app.services import credit_service
from app.routers.auth import get_current_user

router = APIRouter()


@router.get("/customers", summary="Listar clientes activos del negocio")
def get_customers(current_user: dict = Depends(get_current_user)):
    try:
        return credit_service.list_customers(current_user["business_id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/customers", summary="Crear cliente")
def create_customer(
    data: CustomerCreate,
    current_user: dict = Depends(get_current_user)
):
    try:
        return credit_service.create_customer(current_user["business_id"], data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/debts", summary="Listar deudas del negocio")
def get_debts(
    status: Optional[str] = Query(None, description="Filtrar por status: pending, partial, overdue, paid, cancelled"),
    current_user: dict = Depends(get_current_user)
):
    try:
        return credit_service.list_debts(current_user["business_id"], status)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/debts", summary="Crear deuda / registrar fiado")
def create_debt(
    data: DebtCreate,
    current_user: dict = Depends(get_current_user)
):
    try:
        return credit_service.create_debt(
            business_id=current_user["business_id"],
            user_id=current_user["sub"],
            data=data
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/debts/{debt_id}/payments", summary="Registrar abono a una deuda")
def register_payment(
    debt_id: int,
    data: PaymentCreate,
    current_user: dict = Depends(get_current_user)
):
    try:
        return credit_service.register_payment(
            business_id=current_user["business_id"],
            user_id=current_user["sub"],
            debt_id=debt_id,
            data=data
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
