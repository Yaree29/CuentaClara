# =============================================================================
# cash.py (models)
# ----------------
# Pydantic request models para el router /cash (sesiones de caja).
# =============================================================================
from pydantic import BaseModel, field_validator
from decimal import Decimal


class CashSessionOpenRequest(BaseModel):
    """Abrir caja con el monto inicial (efectivo físico con el que arranca)."""
    opening_amount: Decimal = Decimal("0")

    @field_validator("opening_amount")
    @classmethod
    def opening_amount_non_negative(cls, v: Decimal) -> Decimal:
        if v < 0:
            raise ValueError("El monto inicial no puede ser negativo.")
        return v


class CashSessionCloseRequest(BaseModel):
    """Cerrar caja con el monto contado físicamente."""
    counted_amount: Decimal

    @field_validator("counted_amount")
    @classmethod
    def counted_amount_non_negative(cls, v: Decimal) -> Decimal:
        if v < 0:
            raise ValueError("El monto contado no puede ser negativo.")
        return v
