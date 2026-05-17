# Toda la autenticación pasa por este servicio hacia Supabase Auth.
# El frontend nunca se conecta directo a Supabase — solo habla con la API.
from app.database import supabase, supabase_admin
from app.config import settings
from datetime import datetime
import pyotp
import qrcode
import io
import base64

# Módulos que se activan para usuarios informales sin categoría definida
DEFAULT_INFORMAL_MODULES = ['sales', 'cash']
# Siempre presentes independientemente del tipo de negocio
BASE_MODULES = ['dashboard', 'profile']
# Lista blanca para evitar que features con nombres inválidos lleguen al frontend
ALL_VALID_MODULES = {
    'inventory', 'sales', 'credit', 'billing', 'cash', 'staff', 'purchases'
}


def normalize_modules(features: list) -> list:
    # Parte de BASE_MODULES y agrega solo los features activos y reconocidos
    enabled = set(BASE_MODULES)
    for feature in features:
        module = feature.get('module')
        if feature.get('is_active') and module in ALL_VALID_MODULES:
            enabled.add(module)
    return list(enabled)


def register_business(data):
    email = data.email.lower().strip()

    # 1. Verificar que el email no exista ya en public.users
    existing = supabase_admin.table("users").select("id").eq("email", email).execute()
    if existing.data:
        raise ValueError("El email ya está registrado en el sistema")

    # 2. Supabase Auth es el dueño de las credenciales; usamos admin para
    #    saltarnos la confirmación por email y crear el usuario directamente
    try:
        auth_response = supabase_admin.auth.admin.create_user({
            "email": email,
            "password": data.password,
            "email_confirm": True
        })
        auth_user_id = str(auth_response.user.id)
    except Exception as e:
        raise ValueError(f"No se pudo crear el usuario en Auth: {str(e)}")

    # 3. Determinar industry_template_id desde category_id
    #    Permite precargar los módulos correctos según el tipo de negocio
    industry_template_id = None
    if data.category_id:
        try:
            cat = supabase_admin.table("categories").select("name").eq("id", data.category_id).single().execute()
            if cat.data:
                tmpl = supabase_admin.table("industry_templates").select("id").ilike("name", cat.data["name"]).limit(1).execute()
                if tmpl.data:
                    industry_template_id = tmpl.data[0]["id"]
        except Exception:
            pass

    # 4. Crear el negocio — si falla, limpiamos el usuario de Auth para no dejar huérfanos
    try:
        business = supabase_admin.table("businesses").insert({
            "name": data.business_name.strip(),
            "category_id": data.category_id,
            "industry_template_id": industry_template_id,
            "ui_mode": data.ui_mode or "simple",  # "simple" = informal, "advanced" = pyme
            "plan": "free"
        }).execute()
    except Exception as e:
        supabase_admin.auth.admin.delete_user(auth_user_id)
        raise ValueError(f"No se pudo crear el negocio: {str(e)}")

    business_id = business.data[0]["id"]

    # 5. Crear configuración por defecto del negocio
    supabase_admin.table("business_configs").insert({
        "business_id": business_id,
        "currency": "USD",
        "weight_unit": "kg",
        "tax_rate": 7.00,
        "language": "es"
    }).execute()

    # 6. Activar features según el template de industria o módulos por defecto
    #    Los features son la fuente de verdad para qué tabs ve el usuario en la app
    modules_to_activate = DEFAULT_INFORMAL_MODULES
    if industry_template_id:
        template = supabase_admin.table("industry_templates")\
            .select("default_modules")\
            .eq("id", industry_template_id)\
            .execute()
        if template.data:
            modules_to_activate = template.data[0]["default_modules"]

    for module in modules_to_activate:
        supabase_admin.table("features").insert({
            "business_id": business_id,
            "module": module,
            "is_active": True,
            "activated_at": datetime.utcnow().isoformat()
        }).execute()

    # 7. Crear usuario en public.users — si falla, revertimos negocio y Auth
    try:
        supabase_admin.table("users").insert({
            "id": auth_user_id,  # mismo UUID que Supabase Auth para mantener consistencia
            "business_id": business_id,
            "name": data.name.strip(),
            "email": email,
            "role": "owner",
            "phone": data.phone if data.phone else None
        }).execute()
    except Exception as e:
        supabase_admin.table("businesses").delete().eq("id", business_id).execute()
        supabase_admin.auth.admin.delete_user(auth_user_id)
        raise ValueError(f"No se pudo crear el perfil de usuario: {str(e)}")

    # 8. Crear suscripción gratuita
    supabase_admin.table("subscriptions").insert({
        "business_id": business_id,
        "plan": "free",
        "status": "active",
        "starts_at": datetime.utcnow().isoformat()
    }).execute()

    # 9. Hacer sign_in para obtener el JWT de Supabase que el frontend guardará en AsyncStorage
    try:
        sign_in = supabase.auth.sign_in_with_password({"email": email, "password": data.password})
        access_token = sign_in.session.access_token
    except Exception as e:
        raise ValueError(f"Registro exitoso pero no se pudo iniciar sesión: {str(e)}")

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": auth_user_id,
        "business_id": business_id,
        "role": "owner"
    }


def login_user(email: str, password: str):
    email = email.lower().strip()

    # Supabase Auth valida las credenciales y emite el JWT
    try:
        response = supabase.auth.sign_in_with_password({"email": email, "password": password})
    except Exception:
        raise ValueError("Credenciales incorrectas")

    if not response.session:
        raise ValueError("Credenciales incorrectas")

    session = response.session
    auth_user_id = str(session.user.id)

    # business_id no viene en el JWT, hay que leerlo de public.users
    profile = supabase_admin.table("users")\
        .select("id, business_id, role")\
        .eq("id", auth_user_id)\
        .execute()

    if not profile.data:
        raise ValueError("Usuario no encontrado en el sistema")

    user_data = profile.data[0]

    # El audit_log es opcional; si falla no interrumpe el login
    try:
        supabase_admin.table("audit_logs").insert({
            "business_id": user_data["business_id"],
            "user_id": user_data["id"],
            "action": "login",
            "table_name": "sessions",
            "record_id": user_data["id"],
            "created_at": datetime.utcnow().isoformat()
        }).execute()
    except Exception:
        pass

    return {
        "access_token": session.access_token,
        "token_type": "bearer",
        "user_id": auth_user_id,
        "business_id": user_data["business_id"],
        "role": user_data["role"]
    }


def get_user_context(user_id: str) -> dict:
    # Endpoint separado de /me porque carga datos de negocio y features,
    # no solo el perfil del usuario — evita mezclar responsabilidades
    profile = supabase_admin.table("users")\
        .select("id, business_id, name, email, role")\
        .eq("id", user_id)\
        .single()\
        .execute()

    if not profile.data:
        raise ValueError("Usuario no encontrado")

    business_id = profile.data["business_id"]

    business = supabase_admin.table("businesses")\
        .select("id, name, plan, ui_mode, category_id, phone, address, created_at")\
        .eq("id", business_id)\
        .single()\
        .execute()

    # Solo features activos — los desactivados no deben aparecer en la navegación
    features = supabase_admin.table("features")\
        .select("id, module, is_active")\
        .eq("business_id", business_id)\
        .eq("is_active", True)\
        .execute()

    features_data = features.data or []
    business_data = business.data or {}

    return {
        "business": business_data,
        "features": features_data,
        "enabled_modules": normalize_modules(features_data),
        # ui_mode "advanced" = pyme (pantallas completas), "simple" = informal (flujo rápido)
        "userType": "pyme" if business_data.get("ui_mode") == "advanced" else "informal"
    }


def generate_mfa_qr(user_id: str, email: str):
    secret = pyotp.random_base32()

    supabase_admin.table("users")\
        .update({"mfa_secret": secret})\
        .eq("id", user_id)\
        .execute()

    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(email, issuer_name="CuentaClara")

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
