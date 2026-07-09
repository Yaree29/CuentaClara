from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.auth import RegisterRequest, LoginRequest, TokenResponse, ResetPasswordRequest, RefreshTokenRequest
from app.services import auth_service
from app.database import supabase_admin

router = APIRouter()
security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # Validamos el JWT contra Supabase Auth en lugar de verificarlo localmente;
    # así no necesitamos mantener el SECRET_KEY sincronizado con Supabase.
    #
    # Se separan dos fases a propósito para no volver a confundir un problema de
    # infraestructura con uno de token (como pasó cuando la service_role estaba
    # mal configurada en Render y TODO devolvía "Token inválido o expirado"):
    #   1) validar el token → si falla, es 401 (token realmente inválido/vencido)
    #   2) leer el perfil → si falla la consulta, es 503 (backend/BD no disponible)

    # Fase 1 — validar el token
    try:
        auth_response = supabase_admin.auth.get_user(credentials.credentials)
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

    auth_user = getattr(auth_response, "user", None)
    if not auth_user:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    user_id = str(auth_user.id)

    # Fase 2 — resolver el perfil (business_id + role viven en public.users)
    try:
        profile = supabase_admin.table("users")\
            .select("id, business_id, role, name, email")\
            .eq("id", user_id)\
            .single()\
            .execute()
    except Exception:
        raise HTTPException(status_code=503, detail="Servicio no disponible temporalmente")

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


def require_role(*allowed_roles):
    """Dependency factory: exige que el rol del usuario esté en allowed_roles.
    Ej.: current_user: dict = Depends(require_role("owner", "admin")).
    Un rol no permitido (p.ej. 'staff' pidiendo ganancias) recibe 403."""
    def dependency(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(status_code=403, detail="No tienes permisos para esta acción")
        return current_user
    return dependency


@router.post("/register", summary="Registro de negocio y dueño")
def register(data: RegisterRequest):
    try:
        result = auth_service.register_business(data)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")


@router.post("/reset-password", summary="Enviar correo de recuperación de contraseña")
def reset_password(data: ResetPasswordRequest):
    # Siempre responde el mismo mensaje genérico, exista o no el correo,
    # para no filtrar qué emails están registrados (anti-enumeración).
    try:
        auth_service.request_password_reset(data.email)
    except Exception:
        pass
    return {"message": "Si el correo existe, se envió un enlace de recuperación."}


@router.post("/login", response_model=TokenResponse, summary="Iniciar sesión")
def login(data: LoginRequest):
    try:
        result = auth_service.login_user(data.email, data.password)
        return result
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/refresh", summary="Renovar access token usando el refresh token")
def refresh(data: RefreshTokenRequest):
    try:
        return auth_service.refresh_session(data.refresh_token)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


# Devuelve solo datos de perfil del usuario (nombre, email, rol, teléfono)
@router.get("/me", summary="Datos del usuario autenticado")
def get_me(current_user: dict = Depends(get_current_user)):
    user = supabase_admin.table("users")\
        .select("id, name, email, role, phone, created_at, mfa_enabled")\
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


# Plantillas de industria con sus módulos por defecto — usadas en el paso 3
# del registro PYME para que el usuario elija el tipo de negocio
@router.get("/templates", summary="Plantillas de industria para registro PYME")
def get_templates():
    result = supabase_admin.table("industry_templates")\
        .select("id, name, icon, default_modules")\
        .order("id")\
        .execute()
    return result.data

# Nota: el 2FA (TOTP) se maneja ahora de forma nativa en el cliente con
# supabase.auth.mfa.* (ver src/modules/auth/services/mfaService.js). Los
# endpoints /mfa/setup y /mfa/verify basados en pyotp se eliminaron por quedar
# sin uso tras esa migración.
