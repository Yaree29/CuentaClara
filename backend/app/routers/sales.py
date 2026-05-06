from fastapi import APIRouter, HTTPException, Depends
from app.models.sales import QuickSaleRequest
from app.services import sales_service
from app.routers.auth import get_current_user

router = APIRouter()

@router.post("/quick", summary="Registro rápido de venta")
def quick_sale(data: QuickSaleRequest, current_user: dict = Depends(get_current_user)):
    try:
        result = sales_service.create_quick_sale(
            business_id=current_user["business_id"],
            user_id=current_user["sub"],
            data=data
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/profits", summary="Reporte de ganancias y gastos")
def get_profits(
    date_from: str,
    date_to: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        return sales_service.get_profits_and_expenses(
            business_id=current_user["business_id"],
            date_from=date_from,
            date_to=date_to
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))