# =============================================================================
# MODIFICADO: 2026-05-20
# Propósito: Modelos Pydantic para validar las peticiones del módulo de
#            autenticación (registro, login, MFA, biometría).
# Cambios:
#   - Se agregó el campo `address` en RegisterRequest para que el paso 3
#     del registro PYME pueda enviar la dirección del negocio y guardarla
#     en businesses.address.
# =============================================================================
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
import re

class RegisterRequest(BaseModel):
    business_name: str = Field(..., min_length=2, max_length=100)
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    phone: Optional[str] = Field(None, max_length=20)
    # category_id: clasificación del negocio (Alimentos, Servicios, etc.)
    category_id: Optional[int] = None
    # industry_template_id: plantilla elegida en el registro PYME; determina
    # qué módulos se activan en features al crear el negocio
    industry_template_id: Optional[int] = None
    ui_mode: Optional[str] = Field(None, max_length=20)  # "simple" | "advanced"
    # Dirección del negocio — opcional, solo PYME la captura en el paso 3
    address: Optional[str] = Field(None, max_length=255)
    tax_id: Optional[str] = Field(None, max_length=50)
    logo_url: Optional[str] = Field(None, max_length=255)
    # Logo del negocio capturado con cámara/galería en el paso 3 de PYME —
    # se sube a Storage en register_business (mismo patrón que el avatar de
    # perfil). logo_url queda como fallback si algún consumidor futuro
    # todavía envía una URL directa.
    logo_base64: Optional[str] = None
    settings: Optional[dict] = None
    # Toggle "Impuesto 7%" del registro informal (desactivado por defecto).
    # Para PYME se ignora — su tasa viene de settings.taxRate.
    tax_enabled: Optional[bool] = False
    # auth_user_id ya no es necesario — Supabase Auth genera el UUID internamente
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

class ResetPasswordRequest(BaseModel):
    email: EmailStr

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class VerifyPasswordRequest(BaseModel):
    password: str = Field(..., min_length=1, max_length=128)

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: str
    business_id: str
    role: str