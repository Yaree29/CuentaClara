from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.auth import RegisterRequest, LoginRequest, MFAVerifyRequest, TokenResponse
from app.services import auth_service
from app.database import supabase_admin

router = APIRouter()
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        auth_response = supabase_admin.auth.get_user(token)
        auth_user = auth_response.user

        if not auth_user:
            raise HTTPException(status_code=401, detail="Token inválido")

        # Obtener datos adicionales de public.users
        user_data = supabase_admin.table("users")\
            .select("id, business_id, role, name, email")\
            .eq("id", auth_user.id)\
            .execute()

        if not user_data.data:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")

        u = user_data.data[0]
        return {
            "sub": u["id"],
            "business_id": u["business_id"],
            "role": u["role"],
            "name": u["name"],
            "email": u["email"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")


@router.post("/register", summary="Registro de negocio y dueño")
def register(data: RegisterRequest):
    try:
        return auth_service.register_business(data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=TokenResponse, summary="Iniciar sesión")
def login(data: LoginRequest):
    try:
        return auth_service.login_user(data.email, data.password)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/me", summary="Perfil del usuario autenticado")
def get_me(current_user: dict = Depends(get_current_user)):
    user = supabase_admin.table("users")\
        .select("id, name, email, role, phone, created_at")\
        .eq("id", current_user["sub"])\
        .execute()
    return user.data[0] if user.data else {}


@router.get("/context", summary="Contexto del negocio y módulos activos")
def get_context(current_user: dict = Depends(get_current_user)):
    try:
        return auth_service.get_user_context(
            user_id=current_user["sub"],
            business_id=current_user["business_id"]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/categories", summary="Lista de categorías de negocio (público)")
def get_categories():
    result = supabase_admin.table("categories")\
        .select("id, name, icon, description")\
        .execute()
    return result.data


@router.get("/templates", summary="Plantillas de industria disponibles")
def get_templates():
    result = supabase_admin.table("industry_templates")\
        .select("id, name, default_modules, default_units, icon")\
        .execute()
    return result.data


@router.post("/mfa/setup", summary="Configurar autenticación MFA")
def setup_mfa(current_user: dict = Depends(get_current_user)):
    try:
        return auth_service.generate_mfa_qr(
            current_user["sub"],
            current_user["email"]
        )
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