# =============================================================================
# offers.py (router)
# -------------------
# Endpoints REST para el Gestor de Ofertas (promotions).
# Prefijo registrado en main.py: /offers
# =============================================================================
from fastapi import APIRouter, HTTPException, Depends
from app.routers.auth import get_current_user
from app.services import offers_service
from app.models.offers import PromotionCreate, PromotionUpdate

router = APIRouter()


@router.get("", summary="Listar promociones (con estado activo/programado/vencido)")
def list_promotions(current_user: dict = Depends(get_current_user)):
    return offers_service.list_promotions(business_id=current_user["business_id"])


@router.post("", status_code=201, summary="Crear promoción")
def create_promotion(
    data: PromotionCreate,
    current_user: dict = Depends(get_current_user),
):
    try:
        return offers_service.create_promotion(
            business_id=current_user["business_id"],
            data=data,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{promotion_id}", summary="Editar promoción")
def update_promotion(
    promotion_id: int,
    data: PromotionUpdate,
    current_user: dict = Depends(get_current_user),
):
    try:
        return offers_service.update_promotion(
            business_id=current_user["business_id"],
            promotion_id=promotion_id,
            data=data,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{promotion_id}", summary="Eliminar promoción")
def delete_promotion(
    promotion_id: int,
    current_user: dict = Depends(get_current_user),
):
    try:
        return offers_service.delete_promotion(
            business_id=current_user["business_id"],
            promotion_id=promotion_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
