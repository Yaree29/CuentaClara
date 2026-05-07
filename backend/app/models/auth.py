from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
import re

class RegisterRequest(BaseModel):
    business_name: str = Field(..., min_length=2, max_length=100)
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    phone: Optional[str] = Field(None, max_length=20)
    industry_template_id: Optional[int] = None
    auth_user_id: Optional[str] = None

    @validator('password')
    def validate_password(cls, v):
        """Validar fortaleza de contraseña:
        - Al menos 8 caracteres
        - Contener mayúscula, minúscula, número y carácter especial
        """
        if not any(c.isupper() for c in v):
            raise ValueError('La contraseña debe contener al menos una mayúscula')
        if not any(c.islower() for c in v):
            raise ValueError('La contraseña debe contener al menos una minúscula')
        if not any(c.isdigit() for c in v):
            raise ValueError('La contraseña debe contener al menos un número')
        if not any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in v):
            raise ValueError('La contraseña debe contener al menos un carácter especial (!@#$%^&*...)')
        return v

    @validator('business_name')
    def validate_business_name(cls, v):
        """Validar nombre del negocio"""
        if not v or not v.strip():
            raise ValueError('El nombre del negocio no puede estar vacío')
        if len(v.strip()) < 2:
            raise ValueError('El nombre del negocio debe tener al menos 2 caracteres')
        if len(v.strip()) > 100:
            raise ValueError('El nombre del negocio no puede exceder 100 caracteres')
        return v.strip()

    @validator('name')
    def validate_name(cls, v):
        """Validar nombre del usuario"""
        if not v or not v.strip():
            raise ValueError('El nombre no puede estar vacío')
        if len(v.strip()) < 2:
            raise ValueError('El nombre debe tener al menos 2 caracteres')
        if len(v.strip()) > 100:
            raise ValueError('El nombre no puede exceder 100 caracteres')
        # Permitir letras, espacios y acentos
        if not re.match(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$', v):
            raise ValueError('El nombre solo puede contener letras y espacios')
        return v.strip()

    @validator('phone')
    def validate_phone(cls, v):
        """Validar número telefónico (opcional)"""
        if v is None:
            return v
        if not v.strip():
            return None
        # Permite números, espacios, guiones, paréntesis y símbolo +
        if not re.match(r'^\+?[0-9\s\-\(\)]{7,20}$', v):
            raise ValueError('El número telefónico no es válido')
        # Remover espacios y guiones para almacenar limpio
        return re.sub(r'[\s\-\(\)]', '', v)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)

    @validator('email')
    def validate_email_format(cls, v):
        """Validación adicional de email"""
        if not v or not v.strip():
            raise ValueError('El correo electrónico no puede estar vacío')
        return v.lower().strip()

class MFAVerifyRequest(BaseModel):
    email: EmailStr
    mfa_code: str

class BiometricLoginRequest(BaseModel):
    user_id: str
    biometric_token: str  # token firmado desde el dispositivo móvil

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    business_id: str
    role: str