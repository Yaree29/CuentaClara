# =============================================================================
# expenses.py (router)
# ---------------------
# Endpoints REST para gastos (expenses). Prefijo registrado en main.py: /expenses
#
# Rutas:
#   POST /expenses  — registrar un gasto (opcionalmente vinculado a una
#                      sesión de caja vía cash_session_id)
#   GET  /expenses  — listar gastos, filtrable por fecha o por cash_session_id
# =============================================================================
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends
from app.routers.auth import get_current_user
from app.services import expenses_service
from app.models.expenses import ExpenseCreateRequest

router = APIRouter()


@router.post("", status_code=201, summary="Registrar un gasto")
def create_expense(
    data: ExpenseCreateRequest,
    current_user: dict = Depends(get_current_user),
):
    try:
        return expenses_service.create_expense(
            business_id=current_user["business_id"],
            user_id=current_user["sub"],
            data=data,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", summary="Listar gastos (filtrable por fecha o sesión de caja)")
def list_expenses(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    cash_session_id: Optional[int] = None,
    limit: int = 100,
    current_user: dict = Depends(get_current_user),
):
    try:
        return expenses_service.list_expenses(
            business_id=current_user["business_id"],
            date_from=date_from,
            date_to=date_to,
            cash_session_id=cash_session_id,
            limit=max(1, min(limit, 200)),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
