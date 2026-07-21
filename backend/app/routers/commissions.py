# =============================================================================
# commissions.py (router)
# ------------------------
# Endpoints REST para el módulo de Comisiones.
# Prefijo registrado en main.py: /commissions
# =============================================================================
from fastapi import APIRouter, HTTPException, Depends
from app.routers.auth import get_current_user
from app.services import commissions_service
from app.models.commissions import CommissionConfigUpdate, CommissionPaymentCreate

router = APIRouter()


@router.get("/config", summary="Configuración de comisión de cada asistente")
def list_commission_configs(current_user: dict = Depends(get_current_user)):
    return commissions_service.list_commission_configs(business_id=current_user["business_id"])


@router.put("/config/{assistant_id}", summary="Fijar commission_type/commission_value de un asistente")
def upsert_commission_config(
    assistant_id: int,
    data: CommissionConfigUpdate,
    current_user: dict = Depends(get_current_user),
):
    try:
        return commissions_service.upsert_commission_config(
            business_id=current_user["business_id"],
            assistant_id=assistant_id,
            data=data,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/report", summary="Comisión calculada por asistente en un período")
def get_commission_report(
    date_from: str,
    date_to: str,
    current_user: dict = Depends(get_current_user),
):
    try:
        return commissions_service.get_commission_report(
            business_id=current_user["business_id"],
            date_from=date_from,
            date_to=date_to,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/payments", status_code=201, summary="Registrar un pago de comisión")
def register_payment(
    data: CommissionPaymentCreate,
    current_user: dict = Depends(get_current_user),
):
    try:
        return commissions_service.register_payment(
            business_id=current_user["business_id"],
            data=data,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/payments", summary="Historial de pagos de comisión")
def list_payments(
    assistant_id: int = None,
    current_user: dict = Depends(get_current_user),
):
    return commissions_service.list_payments(
        business_id=current_user["business_id"],
        assistant_id=assistant_id,
    )


@router.get("/payments/total", summary="Total pagado en comisiones")
def get_total_paid(
    assistant_id: int = None,
    current_user: dict = Depends(get_current_user),
):
    return {"total_paid": commissions_service.get_total_paid(
        business_id=current_user["business_id"],
        assistant_id=assistant_id,
    )}
