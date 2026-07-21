# =============================================================================
# tips.py (router)
# -----------------
# Endpoints REST para el módulo de Propinas.
# Prefijo registrado en main.py: /tips
# =============================================================================
from fastapi import APIRouter, HTTPException, Depends
from app.routers.auth import get_current_user
from app.services import tips_service
from app.models.tips import TipCreate

router = APIRouter()


@router.post("", status_code=201, summary="Registrar una propina (automática o manual)")
def create_tip(
    data: TipCreate,
    current_user: dict = Depends(get_current_user),
):
    try:
        return tips_service.create_tip(
            business_id=current_user["business_id"],
            data=data,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", summary="Historial de propinas")
def list_tips(
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
):
    return tips_service.list_tips(
        business_id=current_user["business_id"],
        limit=max(1, min(limit, 200)),
    )


@router.get("/summary", summary="Total de propinas en un período")
def get_summary(
    date_from: str,
    date_to: str,
    current_user: dict = Depends(get_current_user),
):
    return tips_service.get_summary(
        business_id=current_user["business_id"],
        date_from=date_from,
        date_to=date_to,
    )


@router.get("/summary/monthly", summary="Resumen mensual de propinas")
def get_monthly_summary(
    year: int,
    current_user: dict = Depends(get_current_user),
):
    return tips_service.get_monthly_summary(
        business_id=current_user["business_id"],
        year=year,
    )
