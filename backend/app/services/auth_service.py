# =============================================================================
# MODIFICADO: 2026-05-20
# Propósito: Lógica de negocio de autenticación — registro, login, contexto
#            del usuario y utilidades de MFA.
# Cambios:
#   - register_business: ahora incluye `address` en el insert de businesses
#     solo si el frontend lo envía (campo opcional, capturado en paso 3 PYME).
#     Se usa un dict intermedio `business_payload` para construir el insert
#     condicionalmente en lugar de enviar null al campo.
# =============================================================================
# Toda la autenticación pasa por este servicio hacia Supabase Auth.
# El frontend nunca se conecta directo a Supabase — solo habla con la API.
from app.database import supabase, supabase_admin
from app.config import settings
from datetime import datetime
import pyotp
import qrcode
import io
import base64

# Módulos fijos para usuarios informales: inicio, ventas, fiado, inventario
DEFAULT_INFORMAL_MODULES = ['sales', 'credit', 'inventory']
# Siempre presentes independientemente del tipo de negocio
BASE_MODULES = ['dashboard', 'profile']
# Lista blanca para evitar que features con nombres inválidos lleguen al frontend
ALL_VALID_MODULES = {
    'inventory', 'sales', 'credit', 'billing', 'cash', 'staff', 'purchases', 'recipes'
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

    # 3. Usar industry_template_id directamente si viene del frontend (registro PYME).
    #    category_id se guarda solo para clasificación del negocio, no para módulos.
    industry_template_id = data.industry_template_id or None

    # 4. Crear el negocio — si falla, limpiamos el usuario de Auth para no dejar huérfanos
    try:
        business_payload = {
            "name": data.business_name.strip(),
            "category_id": data.category_id,
            "industry_template_id": industry_template_id,
            "ui_mode": data.ui_mode or "simple",  # "simple" = informal, "advanced" = pyme
            "plan": "free"
        }
        # address solo se incluye si el frontend lo envió (lo captura el paso 3 de PYME)
        if data.address and data.address.strip():
            business_payload["address"] = data.address.strip()
        # tax_id (RUC/NIT)
        if getattr(data, "tax_id", None) and data.tax_id.strip():
            business_payload["tax_id"] = data.tax_id.strip()
            
        business = supabase_admin.table("businesses").insert(business_payload).execute()
    except Exception as e:
        supabase_admin.auth.admin.delete_user(auth_user_id)
        raise ValueError(f"No se pudo crear el negocio: {str(e)}")

    business_id = business.data[0]["id"]

    # 5. Crear configuración por defecto del negocio
    # tax_rate real según el modo: PYME usa la tasa capturada en el registro
    # (settings.taxRate), informal usa el toggle "Impuesto 7%" (desactivado
    # por defecto) — antes quedaba hardcodeado a 7.00 en ambos casos.
    settings_dict = getattr(data, "settings", {}) or {}
    if (data.ui_mode or "simple") == "advanced":
        try:
            tax_rate = float(settings_dict.get("taxRate", 7.00))
        except (TypeError, ValueError):
            tax_rate = 7.00
    else:
        tax_rate = 7.00 if getattr(data, "tax_enabled", False) else 0.00

    config_payload = {
        "business_id": business_id,
        "currency": "USD",
        "weight_unit": "kg",
        "tax_rate": tax_rate,
        "language": "es",
        "settings": settings_dict
    }
    if getattr(data, "logo_url", None) and data.logo_url.strip():
        config_payload["logo_url"] = data.logo_url.strip()
        
    supabase_admin.table("business_configs").insert(config_payload).execute()

    # 6. Activar features según la categoría, plantilla de industria o módulos por defecto (onboarding adaptativo)
    #    Los features son la fuente de verdad para qué tabs ve el usuario en la app
    modules_to_activate = DEFAULT_INFORMAL_MODULES
    if (data.ui_mode or "simple") == "advanced":
        # Es PYME - determinar módulos basados en la categoría seleccionada y respuestas operativas
        category_id = data.category_id

        # Mapear de forma flexible (por ID o por template)
        # 1 o 9 = Alimentos (Carnes, Mariscos, Verduras)
        # 2 o 3 = Servicios (Estilista, Barbería, Técnicos)
        # 4, 5, 6, 7, 11 = Comercio (MiniSuper, Tiendas, Ferreterías)
        # 8 o 10 = Alimentos Preparados (Cafeterías, Fondas, Repostería)
        if category_id in [1, 9] or industry_template_id in [1, 9]:
            modules_to_activate = ['inventory', 'sales', 'purchases', 'cash', 'staff', 'credit']
        elif category_id in [2, 3] or industry_template_id in [2, 3]:
            modules_to_activate = ['sales', 'cash', 'staff', 'credit']
            # Vende productos físicos -> activar inventario y compras
            if settings_dict.get('sell_physical_products') in [True, 'Sí', 'si', 'SÍ', 'SI']:
                modules_to_activate.append('inventory')
                modules_to_activate.append('purchases')
        elif category_id in [4, 5, 6, 7, 11] or industry_template_id in [4, 5, 6, 7, 11]:
            modules_to_activate = ['inventory', 'sales', 'purchases', 'cash', 'credit']
        elif category_id in [8, 10] or industry_template_id in [8, 10]:
            modules_to_activate = ['inventory', 'sales', 'cash', 'staff', 'credit']
            # Transforma materia prima -> activar recetas
            if settings_dict.get('transforms_raw_material') in [True, 'Sí', 'si', 'SÍ', 'SI']:
                modules_to_activate.append('recipes')
        else:
            modules_to_activate = ['inventory', 'sales', 'credit', 'cash']
        
        # Habilitar facturación/billing de forma general para PYME
        if 'billing' not in modules_to_activate:
            modules_to_activate.append('billing')
    else:
        # Modo simple/informal
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


def request_password_reset(email: str):
    # Se usa el cliente anon (no admin) porque es la operación pública estándar
    # de Supabase Auth. Los errores se tragan a propósito en el router para no
    # revelar si un correo está o no registrado (anti-enumeración).
    supabase.auth.reset_password_email(email.lower().strip())


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
        .select("id, name, plan, ui_mode, category_id, phone, address, tax_id, created_at")\
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

    # Obtener configuración del negocio (logo y configuraciones dinámicas de RUC/NIT)
    config = supabase_admin.table("business_configs")\
        .select("logo_url, settings")\
        .eq("business_id", business_id)\
        .execute()
    
    config_data = config.data[0] if config.data else {}
    merged_business = {
        **business_data,
        "logo_url": config_data.get("logo_url"),
        "settings": config_data.get("settings", {}) or {}
    }

    return {
        "business": merged_business,
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
        .select("id, mfa_secret")\
        .eq("email", email)\
        .execute()

    if not result.data or not result.data[0].get("mfa_secret"):
        raise ValueError("MFA no configurado para este usuario")

    user_row = result.data[0]
    secret = user_row["mfa_secret"]
    totp = pyotp.TOTP(secret)
    is_valid = totp.verify(code)

    # Primera verificación exitosa = confirma el setup y activa 2FA de forma
    # persistente (antes solo vivía en memoria en el frontend y se perdía
    # al cerrar la app).
    if is_valid:
        supabase_admin.table("users")\
            .update({"mfa_enabled": True})\
            .eq("id", user_row["id"])\
            .execute()

    return is_valid
