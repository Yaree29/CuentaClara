from app.database import supabase, supabase_admin
from datetime import datetime
import pyotp
import qrcode
import io
import base64

DEFAULT_MODULES = ['sales', 'credit', 'inventory']

def register_business(data):
    # 1. Verificar email duplicado
    existing = supabase_admin.table("users")\
        .select("id")\
        .eq("email", data.email)\
        .execute()

    if existing.data:
        raise ValueError("El email ya está registrado")

    # 2. Crear usuario en Supabase Auth
    try:
        auth_user = supabase_admin.auth.admin.create_user({
            "email": data.email,
            "password": data.password,
            "email_confirm": True
        })
        auth_user_id = auth_user.user.id
    except Exception as e:
        raise ValueError(f"Error creando usuario en Auth: {str(e)}")

    # 3. Crear el negocio
    try:
        business_data = {
            "name": data.business_name,
            "plan": "free",
            "ui_mode": data.ui_mode or "simple"
        }
        if data.industry_template_id:
            business_data["industry_template_id"] = data.industry_template_id
        if data.category_id:
            business_data["category_id"] = data.category_id
        if data.address:
            business_data["address"] = data.address

        business = supabase_admin.table("businesses")\
            .insert(business_data)\
            .execute()
        business_id = business.data[0]["id"]
    except Exception as e:
        # Rollback: borrar usuario de Auth
        supabase_admin.auth.admin.delete_user(auth_user_id)
        raise ValueError(f"Error creando negocio: {str(e)}")

    # 4. Crear usuario en public.users
    try:
        user = supabase_admin.table("users").insert({
            "id": auth_user_id,
            "business_id": business_id,
            "name": data.name,
            "email": data.email,
            "password_hash": "supabase_auth",
            "role": "owner",
            "phone": data.phone
        }).execute()
        user_id = user.data[0]["id"]
    except Exception as e:
        # Rollback: borrar negocio y usuario de Auth
        supabase_admin.table("businesses").delete().eq("id", business_id).execute()
        supabase_admin.auth.admin.delete_user(auth_user_id)
        raise ValueError(f"Error creando usuario: {str(e)}")

    # 5. Crear configuración del negocio
    supabase_admin.table("business_configs").insert({
        "business_id": business_id,
        "currency": "USD",
        "weight_unit": "kg",
        "tax_rate": 7.00,
        "language": "es"
    }).execute()

    # 6. Activar features
    if data.industry_template_id:
        template = supabase_admin.table("industry_templates")\
            .select("default_modules")\
            .eq("id", data.industry_template_id)\
            .execute()
        modules = template.data[0]["default_modules"] if template.data else DEFAULT_MODULES
    else:
        modules = DEFAULT_MODULES

    for module in modules:
        supabase_admin.table("features").insert({
            "business_id": business_id,
            "module": module,
            "is_active": True,
            "activated_at": datetime.utcnow().isoformat()
        }).execute()

    # 7. Suscripción gratuita
    supabase_admin.table("subscriptions").insert({
        "business_id": business_id,
        "plan": "free",
        "status": "active",
        "starts_at": datetime.utcnow().isoformat()
    }).execute()

    # 8. Login para obtener JWT de Supabase
    sign_in = supabase.auth.sign_in_with_password({
        "email": data.email,
        "password": data.password
    })

    return {
        "access_token": sign_in.session.access_token,
        "token_type": "bearer",
        "user_id": user_id,
        "business_id": business_id,
        "role": "owner"
    }


def login_user(email: str, password: str):
    try:
        sign_in = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
    except Exception as e:
        raise ValueError("Credenciales incorrectas")

    auth_user_id = sign_in.user.id

    # Obtener datos del usuario de public.users
    user = supabase_admin.table("users")\
        .select("id, business_id, role")\
        .eq("id", auth_user_id)\
        .execute()

    if not user.data:
        raise ValueError("Usuario no encontrado")

    user_data = user.data[0]

    # Audit log opcional
    try:
        supabase_admin.table("audit_logs").insert({
            "business_id": user_data["business_id"],
            "user_id": user_data["id"],
            "action": "create",
            "table_name": "sessions",
            "record_id": user_data["id"]
        }).execute()
    except:
        pass

    return {
        "access_token": sign_in.session.access_token,
        "token_type": "bearer",
        "user_id": user_data["id"],
        "business_id": user_data["business_id"],
        "role": user_data["role"]
    }


ALL_VALID_MODULES = ['sales', 'credit', 'inventory', 'purchases', 'cash', 'staff']

def get_user_context(user_id: str, business_id: str):
    # Perfil del usuario
    user = supabase_admin.table("users")\
        .select("id, name, email, role, phone")\
        .eq("id", user_id)\
        .execute()

    # Datos del negocio
    business = supabase_admin.table("businesses")\
        .select("id, name, ui_mode, plan, category_id, industry_template_id")\
        .eq("id", business_id)\
        .execute()

    # Features activos
    features = supabase_admin.table("features")\
        .select("module, is_active")\
        .eq("business_id", business_id)\
        .eq("is_active", True)\
        .execute()

    enabled_modules = [
        f["module"] for f in features.data
        if f["module"] in ALL_VALID_MODULES
    ]

    business_data = business.data[0] if business.data else {}
    ui_mode = business_data.get("ui_mode", "simple")
    user_type = "informal" if ui_mode == "simple" else "pyme"

    return {
        "user": user.data[0] if user.data else {},
        "business": business_data,
        "enabled_modules": enabled_modules,
        "user_type": user_type
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