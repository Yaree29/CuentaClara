# =============================================================================
# Modelos Pydantic para validar las peticiones del módulo de autenticación
# (registro, login, MFA, biometría).
# =============================================================================
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional

class RegisterRequest(BaseModel):
    business_name: str
    name: str
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
    auth_user_id: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class MFAVerifyRequest(BaseModel):
    email: EmailStr
    mfa_code: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    business_id: str
    role: str