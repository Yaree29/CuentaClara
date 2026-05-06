from pydantic import BaseModel, EmailStr
from typing import Optional

class RegisterRequest(BaseModel):
    business_name: str
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    industry_template_id: Optional[int] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

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