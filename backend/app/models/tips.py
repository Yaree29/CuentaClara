# =============================================================================
# tips.py (models)
# -----------------
# Pydantic request models para el router /tips.
# =============================================================================
from pydantic import BaseModel, field_validator, model_validator
from decimal import Decimal
from typing import List, Optional

DISTRIBUTION_TYPES = ("automatic", "manual")


class TipDistributionItem(BaseModel):
    assistant_id: int
    amount: Decimal

    @field_validator("amount")
    @classmethod
    def amount_non_negative(cls, v: Decimal) -> Decimal:
        if v < 0:
            raise ValueError("El monto asignado no puede ser negativo")
        return v


class TipCreate(BaseModel):
    amount: Decimal
    distribution_type: str
    # Requerido solo si distribution_type == 'manual'; debe sumar exactamente `amount`.
    distributions: Optional[List[TipDistributionItem]] = None

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("El monto de la propina debe ser mayor a 0")
        return v

    @field_validator("distribution_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in DISTRIBUTION_TYPES:
            raise ValueError(f"distribution_type debe ser uno de: {', '.join(DISTRIBUTION_TYPES)}")
        return v

    @model_validator(mode="after")
    def validate_manual_distribution(self):
        if self.distribution_type == "manual":
            if not self.distributions:
                raise ValueError("La distribución manual requiere al menos un asistente con monto asignado")
            total = sum(d.amount for d in self.distributions)
            if total != self.amount:
                raise ValueError(
                    f"La suma de los montos asignados ({total}) debe ser igual al total de la propina ({self.amount})"
                )
        return self
