# =============================================================================
# assistants.py (models)
# ----------------------
# Pydantic request models para el router /assistants (Modo Asistente).
# Los asistentes no tienen cuenta de login propia — se gestionan localmente
# por el dueño, identificados por nombre + PIN dentro de su negocio.
# =============================================================================
from pydantic import BaseModel, Field, validator
from typing import Optional

ACCESS_TYPES = ("sales", "inventory", "both")


class AssistantCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    pin: str = Field(..., min_length=4, max_length=6)
    access_type: str
    role: str = Field(..., max_length=50)

    @validator('pin')
    def validate_pin(cls, v):
        if not v.isdigit():
            raise ValueError('El PIN solo puede contener dígitos')
        return v

    @validator('access_type')
    def validate_access_type(cls, v):
        if v not in ACCESS_TYPES:
            raise ValueError(f"access_type debe ser uno de: {', '.join(ACCESS_TYPES)}")
        return v

    @validator('role')
    def validate_role(cls, v):
        if not v.strip():
            raise ValueError('El rol no puede estar vacío')
        return v


class AssistantUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    access_type: Optional[str] = None
    is_blocked: Optional[bool] = None
    new_pin: Optional[str] = Field(None, min_length=4, max_length=6)
    role: Optional[str] = Field(None, max_length=50)

    @validator('access_type')
    def validate_access_type(cls, v):
        if v is not None and v not in ACCESS_TYPES:
            raise ValueError(f"access_type debe ser uno de: {', '.join(ACCESS_TYPES)}")
        return v

    @validator('role')
    def validate_role(cls, v):
        if v is not None and not v.strip():
            raise ValueError('El rol no puede estar vacío')
        return v

    @validator('new_pin')
    def validate_new_pin(cls, v):
        if v is not None and not v.isdigit():
            raise ValueError('El PIN solo puede contener dígitos')
        return v


class VerifyPinRequest(BaseModel):
    pin: str = Field(..., min_length=4, max_length=6)
