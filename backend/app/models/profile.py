from pydantic import BaseModel, Field, validator
from typing import Optional
import re

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    business_name: Optional[str] = Field(None, min_length=2, max_length=100)
    avatar_base64: Optional[str] = None

    @validator('name')
    def validate_name(cls, v):
        if v is None:
            return v
        if not v or not v.strip():
            raise ValueError('El nombre no puede estar vacío')
        if len(v.strip()) < 2:
            raise ValueError('El nombre debe tener al menos 2 caracteres')
        if len(v.strip()) > 100:
            raise ValueError('El nombre no puede exceder 100 caracteres')
        if not re.match(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$', v):
            raise ValueError('El nombre solo puede contener letras y espacios')
        return v.strip()

    @validator('business_name')
    def validate_business_name(cls, v):
        if v is None:
            return v
        if not v or not v.strip():
            raise ValueError('El nombre del negocio no puede estar vacío')
        if len(v.strip()) < 2:
            raise ValueError('El nombre del negocio debe tener al menos 2 caracteres')
        if len(v.strip()) > 100:
            raise ValueError('El nombre del negocio no puede exceder 100 caracteres')
        return v.strip()

    @validator('phone')
    def validate_phone(cls, v):
        if v is None:
            return v
        if not v.strip():
            return None
        if not re.match(r'^\+?[0-9\s\-\(\)]{7,20}$', v):
            raise ValueError('El número telefónico no es válido')
        return re.sub(r'[\s\-\(\)]', '', v)
