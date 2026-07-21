# =============================================================================
# offers.py (models)
# -------------------
# Pydantic request models para el router /offers (Gestor de Ofertas).
# =============================================================================
from pydantic import BaseModel, field_validator, model_validator
from decimal import Decimal
from typing import Optional
from datetime import date

SCOPES = ("product", "category")
DISCOUNT_TYPES = ("percentage", "fixed")


class PromotionCreate(BaseModel):
    scope: str
    product_id: Optional[int] = None
    category_id: Optional[int] = None
    discount_type: str
    discount_value: Decimal
    start_date: date
    end_date: date

    @field_validator("scope")
    @classmethod
    def validate_scope(cls, v: str) -> str:
        if v not in SCOPES:
            raise ValueError(f"scope debe ser uno de: {', '.join(SCOPES)}")
        return v

    @field_validator("discount_type")
    @classmethod
    def validate_discount_type(cls, v: str) -> str:
        if v not in DISCOUNT_TYPES:
            raise ValueError(f"discount_type debe ser uno de: {', '.join(DISCOUNT_TYPES)}")
        return v

    @field_validator("discount_value")
    @classmethod
    def validate_discount_value(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("discount_value debe ser mayor a 0")
        return v

    @model_validator(mode="after")
    def validate_scope_target(self):
        if self.scope == "product" and not self.product_id:
            raise ValueError("product_id es requerido cuando scope es 'product'")
        if self.scope == "category" and not self.category_id:
            raise ValueError("category_id es requerido cuando scope es 'category'")
        if self.discount_type == "percentage" and self.discount_value > 100:
            raise ValueError("Un descuento porcentual no puede ser mayor a 100")
        if self.end_date < self.start_date:
            raise ValueError("end_date no puede ser anterior a start_date")
        return self


class PromotionUpdate(BaseModel):
    discount_type: Optional[str] = None
    discount_value: Optional[Decimal] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

    @field_validator("discount_type")
    @classmethod
    def validate_discount_type(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in DISCOUNT_TYPES:
            raise ValueError(f"discount_type debe ser uno de: {', '.join(DISCOUNT_TYPES)}")
        return v

    @field_validator("discount_value")
    @classmethod
    def validate_discount_value(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        if v is not None and v <= 0:
            raise ValueError("discount_value debe ser mayor a 0")
        return v
