# =============================================================================
# commissions.py (models)
# -----------------------
# Pydantic request models para el router /commissions.
# =============================================================================
from pydantic import BaseModel, field_validator
from decimal import Decimal
from typing import Optional

COMMISSION_TYPES = ("percentage", "fixed")


class CommissionConfigUpdate(BaseModel):
    commission_type: str
    commission_value: Decimal

    @field_validator("commission_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in COMMISSION_TYPES:
            raise ValueError(f"commission_type debe ser uno de: {', '.join(COMMISSION_TYPES)}")
        return v

    @field_validator("commission_value")
    @classmethod
    def validate_value(cls, v: Decimal) -> Decimal:
        if v < 0:
            raise ValueError("commission_value no puede ser negativo")
        return v


class CommissionPaymentCreate(BaseModel):
    assistant_id: int
    period_from: str
    period_to: str
    amount: Decimal
    notes: Optional[str] = None

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("El monto del pago debe ser mayor a 0")
        return v
