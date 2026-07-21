# =============================================================================
# cash.py (router)
# -----------------
# Endpoints REST para sesiones de caja (arqueo real: abrir/cerrar).
# Prefijo registrado en main.py: /cash
#
# Rutas:
#   GET  /cash/session       — estado de la caja actual (abierta o no) + esperado
#   POST /cash/session/open  — abrir caja con monto inicial
#   POST /cash/session/close — cerrar caja con monto contado (calcula diferencia)
#   GET  /cash/sessions      — historial de sesiones
# =============================================================================
from fastapi import APIRouter, HTTPException, Depends
from app.routers.auth import get_current_user
from app.services import cash_service
from app.models.cash import CashSessionOpenRequest, CashSessionCloseRequest

router = APIRouter()


@router.get("/session", summary="Estado de la caja actual")
def get_current_session(current_user: dict = Depends(get_current_user)):
    try:
        return cash_service.get_session_status(business_id=current_user["business_id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/session/open", status_code=201, summary="Abrir caja con un monto inicial")
def open_session(
    data: CashSessionOpenRequest,
    current_user: dict = Depends(get_current_user),
):
    try:
        return cash_service.open_session(
            business_id=current_user["business_id"],
            user_id=current_user["sub"],
            opening_amount=data.opening_amount,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/session/close", summary="Cerrar caja: registra el monto contado y calcula la diferencia")
def close_session(
    data: CashSessionCloseRequest,
    current_user: dict = Depends(get_current_user),
):
    try:
        return cash_service.close_session(
            business_id=current_user["business_id"],
            counted_amount=data.counted_amount,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/sessions", summary="Historial de sesiones de caja")
def list_sessions(
    limit: int = 20,
    current_user: dict = Depends(get_current_user),
):
    try:
        return cash_service.list_sessions(
            business_id=current_user["business_id"],
            limit=max(1, min(limit, 100)),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
