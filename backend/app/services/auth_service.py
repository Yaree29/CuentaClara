from app.database import supabase, supabase_admin
from app.config import settings
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import pyotp
import qrcode
import io
import base64

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    if len(password) > 72:
        raise ValueError("La contraseña no puede tener más de 72 caracteres")
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)

def register_business(data):
    """Registrar un nuevo negocio con usuario propietario
    
    Validaciones:
    - Email único en la plataforma
    - Contraseña cumple requisitos de seguridad
    - Nombre del negocio no vacío
    - Datos de usuario válidos
    """
    # Normalizar email
    email = data.email.lower().strip()
    
    # 1. Verificar que el email no exista
    existing = supabase_admin.table("users")\
        .select("id")\
        .eq("email", email)\
        .execute()

    if existing.data:
        raise ValueError("El email ya está registrado en el sistema")

    # 2. Hash de contraseña con validación
    try:
        password_hash = hash_password(data.password)
    except ValueError as e:
        raise ValueError(f"Error en contraseña: {str(e)}")

    # 3. Crear el negocio
    try:
        business = supabase_admin.table("businesses").insert({
            "name": data.business_name.strip(),
            "industry_template_id": data.industry_template_id,
            "plan": "free"
        }).execute()
    except Exception as e:
        raise ValueError(f"No se pudo crear el negocio: {str(e)}")

    business_id = business.data[0]["id"]

    # 4. Crear configuración por defecto del negocio
    supabase_admin.table("business_configs").insert({
        "business_id": business_id,
        "currency": "USD",
        "weight_unit": "kg",
        "tax_rate": 7.00,
        "language": "es"
    }).execute()

    # 5. Activar features según el template
    template = supabase_admin.table("industry_templates")\
        .select("default_modules")\
        .eq("id", data.industry_template_id)\
        .execute()

    if template.data:
        modules = template.data[0]["default_modules"]
        for module in modules:
            supabase_admin.table("features").insert({
                "business_id": business_id,
                "module": module,
                "is_active": True,
                "activated_at": datetime.utcnow().isoformat()
            }).execute()

    # 6. Crear el usuario dueño
    user_data = {
        "business_id": business_id,
        "name": data.name.strip(),
        "email": email,
        "password_hash": password_hash,
        "role": "owner",
        "phone": data.phone if data.phone else None
    }
    
    if data.auth_user_id:
        user_data["id"] = data.auth_user_id

    try:
        user = supabase_admin.table("users").insert(user_data).execute()
    except Exception as e:
        # Rollback del negocio si falla la creación del usuario
        supabase_admin.table("businesses").delete().eq("id", business_id).execute()
        raise ValueError(f"No se pudo crear el usuario: {str(e)}")

    user_id = user.data[0]["id"]

    # 7. Crear suscripción gratuita
    supabase_admin.table("subscriptions").insert({
        "business_id": business_id,
        "plan": "free",
        "status": "active",
        "starts_at": datetime.utcnow().isoformat()
    }).execute()

    # 8. Generar token de acceso
    token = create_access_token({
        "sub": user_id,
        "business_id": business_id,
        "role": "owner"
    })

    return {"access_token": token, "user_id": user_id, "business_id": business_id, "role": "owner"}

def login_user(email: str, password: str):
    """Autenticar usuario con email y contraseña
    
    Validaciones:
    - Email existe en el sistema
    - Contraseña correcta
    - Registro de auditoría
    """
    # Normalizar email
    email = email.lower().strip()
    
    # 1. Buscar usuario
    result = supabase_admin.table("users")\
        .select("id, business_id, role, password_hash, name")\
        .eq("email", email)\
        .execute()

    if not result.data:
        raise ValueError("Credenciales incorrectas")

    user = result.data[0]

    # 2. Verificar contraseña
    if not verify_password(password, user["password_hash"]):
        raise ValueError("Credenciales incorrectas")

    # 3. Registrar en audit_log
    supabase_admin.table("audit_logs").insert({
        "business_id": user["business_id"],
        "user_id": user["id"],
        "action": "login",
        "table_name": "sessions",
        "record_id": user["id"],
        "created_at": datetime.utcnow().isoformat()
    }).execute()

    # 4. Generar token
    token = create_access_token({
        "sub": user["id"],
        "business_id": user["business_id"],
        "role": user["role"]
    })

    return {
        "access_token": token,
        "user_id": user["id"],
        "business_id": user["business_id"],
        "role": user["role"]
    }

def generate_mfa_qr(user_id: str, email: str):
    # Genera un secreto único para el usuario
    secret = pyotp.random_base32()

    # Guarda el secreto en la BD (agrega columna mfa_secret a users si no existe)
    supabase_admin.table("users")\
        .update({"mfa_secret": secret})\
        .eq("id", user_id)\
        .execute()

    # Genera la URL para Google Authenticator
    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(email, issuer_name="CuentaClara")

    # Genera el QR como imagen base64
    qr = qrcode.make(uri)
    buffer = io.BytesIO()
    qr.save(buffer, format="PNG")
    qr_base64 = base64.b64encode(buffer.getvalue()).decode()

    return {"qr_code": f"data:image/png;base64,{qr_base64}", "secret": secret}

def verify_mfa(email: str, code: str) -> bool:
    result = supabase_admin.table("users")\
        .select("mfa_secret")\
        .eq("email", email)\
        .execute()

    if not result.data or not result.data[0].get("mfa_secret"):
        raise ValueError("MFA no configurado para este usuario")

    secret = result.data[0]["mfa_secret"]
    totp = pyotp.TOTP(secret)
    return totp.verify(code)