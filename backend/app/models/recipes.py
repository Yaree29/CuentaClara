# =============================================================================
# recipes.py (models)
# --------------------
# Pydantic request models para el router /recipes (Recetas / Producción).
# =============================================================================
from pydantic import BaseModel, field_validator, model_validator
from decimal import Decimal
from typing import Optional, List


class RecipeIngredientInput(BaseModel):
    ingredient_product_id: int
    quantity: Decimal
    unit: Optional[str] = None

    @field_validator("quantity")
    @classmethod
    def quantity_positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("La cantidad del insumo debe ser mayor a 0.")
        return v


class RecipeCreateRequest(BaseModel):
    product_id: int
    name: str
    portions_yield: Decimal
    ingredients: List[RecipeIngredientInput]

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("El nombre de la receta no puede estar vacío.")
        return v

    @field_validator("portions_yield")
    @classmethod
    def portions_positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("Las porciones que rinde la receta deben ser mayor a 0.")
        return v

    @model_validator(mode="after")
    def at_least_one_ingredient(self):
        if not self.ingredients:
            raise ValueError("La receta debe tener al menos un insumo.")
        return self


class RecipeUpdateRequest(BaseModel):
    name: Optional[str] = None
    portions_yield: Optional[Decimal] = None
    ingredients: Optional[List[RecipeIngredientInput]] = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if not v:
            raise ValueError("El nombre de la receta no puede estar vacío.")
        return v

    @field_validator("portions_yield")
    @classmethod
    def portions_positive(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        if v is not None and v <= 0:
            raise ValueError("Las porciones que rinde la receta deben ser mayor a 0.")
        return v


class ProduceRequest(BaseModel):
    portions_to_produce: Decimal

    @field_validator("portions_to_produce")
    @classmethod
    def portions_positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("Las porciones a producir deben ser mayor a 0.")
        return v
