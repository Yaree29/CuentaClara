# =============================================================================
# expenses.py (models)
# --------------------
# Pydantic request models para el router /expenses.
# =============================================================================
from pydantic import BaseModel, field_validator
from decimal import Decimal
from typing import Optional


class ExpenseCreateRequest(BaseModel):
    amount: Decimal
    description: Optional[str] = None
    # Opcional: un gasto puede registrarse sin caja abierta si el negocio no
    # usa el flujo de cierre de caja.
    cash_session_id: Optional[int] = None

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("El monto del gasto debe ser mayor a 0.")
        return v
