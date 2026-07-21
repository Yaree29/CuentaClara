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
from typing import Optional

# Módulos fijos para usuarios informales: inicio, ventas, fiado, inventario
DEFAULT_INFORMAL_MODULES = ['sales', 'credit', 'inventory']
# Siempre presentes independientemente del tipo de negocio
BASE_MODULES = ['dashboard', 'profile']
# Lista blanca para evitar que features con nombres inválidos lleguen al frontend.
# 'commissions'/'tips'/'offers' no se activan automáticamente por category_group
# (ningún grupo del onboarding los menciona) — quedan disponibles solo para
# activación manual vía PUT /businesses/me/modules (pantalla "Módulos").
ALL_VALID_MODULES = {
    'inventory', 'sales', 'credit', 'billing', 'cash', 'staff', 'purchases', 'recipes',
    'commissions', 'tips', 'offers',
}

# Flags de configuración interna de inventario que se activan por defecto según
# el category_group de la plantilla de industria elegida en el registro
# (industry_templates.category_group). Grupos no listados aquí (servicios,
# general, o sin plantilla) quedan con todos los flags en False.
INVENTORY_CONFIG_FLAGS = [
    'control_peso', 'caducidad', 'mermas', 'recetas', 'produccion', 'escaner', 'stock_predictivo'
]
INVENTORY_CONFIG_DEFAULTS_BY_GROUP = {
    'alimentos': {'control_peso': True, 'caducidad': True, 'mermas': True},
    'comida_preparada': {'recetas': True, 'mermas': True, 'produccion': True},
    'comercio': {'escaner': True, 'stock_predictivo': True},
}


def _build_inventory_config_flags(category_group: Optional[str]) -> dict:
    flags = {flag: False for flag in INVENTORY_CONFIG_FLAGS}
    flags.update(INVENTORY_CONFIG_DEFAULTS_BY_GROUP.get(category_group, {}))
    return flags


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

    # 4.1 Obtener category_group de la plantilla de industria elegida (si hay)
    #     — reemplaza los rangos de ID hardcodeados que antes decidían el
    #     grupo de categoría directamente en el bloque de activación de
    #     módulos (ver 15_category_group_and_inventory_config.sql).
    category_group = None
    if industry_template_id:
        template_group = supabase_admin.table("industry_templates")\
            .select("category_group")\
            .eq("id", industry_template_id)\
            .execute()
        if template_group.data:
            category_group = template_group.data[0]["category_group"]

    # 4.2 Configuración interna de inventario, inicializada según category_group.
    #     Queda editable libremente después vía PATCH /inventory/config.
    supabase_admin.table("business_inventory_config").insert({
        "business_id": business_id,
        **_build_inventory_config_flags(category_group),
    }).execute()

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
        # Es PYME - determinar módulos basados en el category_group de la
        # plantilla de industria elegida (ver 4.1) y respuestas operativas.
        if category_group == 'alimentos':
            modules_to_activate = ['inventory', 'sales', 'purchases', 'cash', 'staff', 'credit']
        elif category_group == 'servicios':
            modules_to_activate = ['sales', 'cash', 'staff', 'credit']
            # Vende productos físicos -> activar inventario y compras
            if settings_dict.get('sell_physical_products') in [True, 'Sí', 'si', 'SÍ', 'SI']:
                modules_to_activate.append('inventory')
                modules_to_activate.append('purchases')
        elif category_group == 'comercio':
            modules_to_activate = ['inventory', 'sales', 'purchases', 'cash', 'credit']
        elif category_group == 'comida_preparada':
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
        refresh_token = sign_in.session.refresh_token
    except Exception as e:
        raise ValueError(f"Registro exitoso pero no se pudo iniciar sesión: {str(e)}")

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user_id": auth_user_id,
        "business_id": business_id,
        "role": "owner"
    }


def verify_password(email: str, password: str) -> bool:
    # Reutiliza sign_in_with_password para validar la contraseña contra Supabase
    # Auth sin construir un mecanismo de hashing propio. Se descarta la sesión
    # resultante (nunca se devuelve al frontend) — la sesión real del dueño en
    # el dispositivo no se toca. Usado para "confirmar que eres tú" (ej. salir
    # del Modo Asistente) sin forzar un logout/login completo.
    try:
        response = supabase.auth.sign_in_with_password({
            "email": email.lower().strip(),
            "password": password,
        })
    except Exception:
        return False

    return bool(response.session)


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
    auth_user_id = str(response.user.id)

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
        "refresh_token": session.refresh_token,
        "token_type": "bearer",
        "user_id": auth_user_id,
        "business_id": user_data["business_id"],
        "role": user_data["role"]
    }


def refresh_session(refresh_token: str) -> dict:
    # Cambia un refresh_token por un access_token nuevo sin pedir credenciales.
    # Supabase rota el refresh_token en cada uso: el que se devuelve aquí
    # reemplaza al anterior, que queda inválido.
    try:
        response = supabase.auth.refresh_session(refresh_token)
    except Exception:
        raise ValueError("Sesión expirada, inicia sesión nuevamente")

    if not response.session:
        raise ValueError("Sesión expirada, inicia sesión nuevamente")

    return {
        "access_token": response.session.access_token,
        "refresh_token": response.session.refresh_token,
        "token_type": "bearer",
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

# Nota: el 2FA (TOTP) migró al MFA nativo de Supabase en el cliente
# (supabase.auth.mfa.*). Las funciones generate_mfa_qr/verify_mfa basadas en
# pyotp/qrcode se eliminaron por quedar sin uso; los factores viven ahora en el
# esquema auth de Supabase, no en las columnas users.mfa_secret/mfa_enabled.

import base64

def update_profile(user_id: str, business_id: str, data):
    """
    Actualiza el perfil del usuario (nombre, teléfono, avatar) y/o
    el nombre del negocio. Si se incluye avatar_base64, lo sube al
    bucket 'avatars' de Supabase y obtiene la URL pública.
    """
    avatar_url = None

    if data.avatar_base64:
        try:
            b64_str = data.avatar_base64
            if "," in b64_str:
                b64_str = b64_str.split(",")[1]
            
            image_data = base64.b64decode(b64_str)
            
            # Comprimir con Pillow
            from io import BytesIO
            from PIL import Image
            
            img = Image.open(BytesIO(image_data))
            # Convertir a RGB (por si es RGBA/PNG)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            
            # Redimensionar si es muy grande (máximo 512x512 para avatares)
            img.thumbnail((512, 512), Image.Resampling.LANCZOS)
            
            out_io = BytesIO()
            # Guardar con compresión alta (quality=60 suele bajar a <50kb)
            img.save(out_io, format="JPEG", quality=60, optimize=True)
            compressed_image_data = out_io.getvalue()
            
            # Usamos siempre el mismo nombre para sobrescribir y ahorrar espacio
            file_path = f"{user_id}.jpg"
            timestamp = int(datetime.utcnow().timestamp())
            
            supabase_admin.storage.from_("avatars").upload(
                path=file_path,
                file=compressed_image_data,
                file_options={"content-type": "image/jpeg", "upsert": "true"}
            )
            
            # Obtener URL pública (asumiendo que el bucket es público)
            public_url = supabase_admin.storage.from_("avatars").get_public_url(file_path)
            # En la versión actual del SDK de python, get_public_url puede no ser un método directo, 
            # es mejor construirla manualmente o asegurar el método
            if not isinstance(public_url, str):
                # Workaround si get_public_url no retorna string directo
                public_url = f"{settings.supabase_url}/storage/v1/object/public/avatars/{file_path}"
                
            # Agregamos el timestamp como parámetro de consulta para forzar 
            # al frontend a limpiar la caché sin llenar el bucket de Supabase
            avatar_url = f"{public_url}?t={timestamp}"
        except Exception as e:
            raise ValueError(f"Error al subir el avatar: {str(e)}")

    user_payload = {}
    if data.name:
        user_payload["name"] = data.name.strip()
    if data.phone is not None:
        user_payload["phone"] = data.phone
    if avatar_url:
        user_payload["avatar_url"] = avatar_url
        
    if user_payload:
        supabase_admin.table("users").update(user_payload).eq("id", user_id).execute()

    if data.business_name:
        business_payload = {"name": data.business_name.strip()}
        supabase_admin.table("businesses").update(business_payload).eq("id", business_id).execute()

    return {"status": "success", "avatar_url": avatar_url}

