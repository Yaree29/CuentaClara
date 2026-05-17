from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.auth import RegisterRequest, LoginRequest, MFAVerifyRequest, TokenResponse
from app.services import auth_service
from app.database import supabase_admin

router = APIRouter()
security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # Validamos el JWT contra Supabase Auth en lugar de verificarlo localmente;
    # así no necesitamos mantener el SECRET_KEY sincronizado con Supabase
    try:
        auth_response = supabase_admin.auth.get_user(credentials.credentials)
        auth_user = auth_response.user
        user_id = str(auth_user.id)

        # business_id no está en el JWT de Supabase; lo leemos de public.users
        profile = supabase_admin.table("users")\
            .select("id, business_id, role, name, email")\
            .eq("id", user_id)\
            .single()\
            .execute()

        if not profile.data:
            raise HTTPException(status_code=401, detail="Usuario no encontrado en el sistema")

        # "sub" mantiene compatibilidad con los routers de sales e invoices
        return {
            "sub": user_id,
            "business_id": profile.data["business_id"],
            "role": profile.data["role"],
            "email": profile.data["email"],
            "name": profile.data["name"],
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")


@router.post("/register", summary="Registro de negocio y dueño")
def register(data: RegisterRequest):
    try:
        result = auth_service.register_business(data)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")


@router.post("/login", response_model=TokenResponse, summary="Iniciar sesión")
def login(data: LoginRequest):
    try:
        result = auth_service.login_user(data.email, data.password)
        return result
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


# Devuelve solo datos de perfil del usuario (nombre, email, rol, teléfono)
@router.get("/me", summary="Datos del usuario autenticado")
def get_me(current_user: dict = Depends(get_current_user)):
    user = supabase_admin.table("users")\
        .select("id, name, email, role, phone, created_at")\
        .eq("id", current_user["sub"])\
        .execute()
    return user.data[0] if user.data else {}


# Devuelve datos del negocio + features activos + módulos habilitados para la navegación.
# Separado de /me porque el frontend los consume en momentos distintos.
@router.get("/context", summary="Contexto de la aplicación para el usuario autenticado")
def get_context(current_user: dict = Depends(get_current_user)):
    try:
        return auth_service.get_user_context(current_user["sub"])
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# Endpoint público — no requiere token porque se usa en el formulario de registro
@router.get("/categories", summary="Listado de categorías de negocio")
def get_categories():
    result = supabase_admin.table("categories")\
        .select("id, name, icon, description")\
        .order("id")\
        .execute()
    return result.data


@router.post("/mfa/setup", summary="Configurar autenticación MFA")
def setup_mfa(current_user: dict = Depends(get_current_user)):
    try:
        return auth_service.generate_mfa_qr(current_user["sub"], current_user["email"])
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
