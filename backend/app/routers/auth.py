from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.auth import RegisterRequest, LoginRequest, MFAVerifyRequest, TokenResponse
from app.services import auth_service
from jose import jwt, JWTError
from app.config import settings

router = APIRouter()
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.secret_key,
            algorithms=[settings.algorithm]
        )
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

@router.post("/register", summary="Registro de negocio y dueño")
def register(data: RegisterRequest):
    try:
        result = auth_service.register_business(data)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Prevent plain text 500 errors by catching everything and returning JSON
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@router.post("/login", response_model=TokenResponse, summary="Iniciar sesión")
def login(data: LoginRequest):
    try:
        result = auth_service.login_user(data.email, data.password)
        return result
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/mfa/setup", summary="Configurar autenticación MFA")
def setup_mfa(current_user: dict = Depends(get_current_user)):
    try:
        from app.database import supabase_admin
        user = supabase_admin.table("users")\
            .select("email")\
            .eq("id", current_user["sub"])\
            .execute()
        email = user.data[0]["email"]
        return auth_service.generate_mfa_qr(current_user["sub"], email)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/mfa/verify", summary="Verificar código MFA")
def verify_mfa(data: MFAVerifyRequest):
    try:
        valid = auth_service.verify_mfa(data.email, data.mfa_code)
        if not valid:
            raise HTTPException(status_code=401, detail="Código MFA incorrecto")
        return {"verified": True, "message": "MFA verificado correctamente"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me", summary="Obtener usuario actual")
def get_me(current_user: dict = Depends(get_current_user)):
    from app.database import supabase_admin
    user = supabase_admin.table("users")\
        .select("id, name, email, role, phone, created_at")\
        .eq("id", current_user["sub"])\
        .execute()
    return user.data[0] if user.data else {}