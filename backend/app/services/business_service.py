# =============================================================================
# business_service.py
# -------------------
# Lógica de negocio para el módulo /businesses.
# Consulta y actualiza las tablas `businesses`, `business_configs` y `features`
# en Supabase.
# =============================================================================
from datetime import datetime

from app.database import supabase_admin
from app.services.auth_service import ALL_VALID_MODULES, normalize_modules


def get_business(business_id: str):
    """Obtiene la información del negocio incluyendo su categoría."""
    result = supabase_admin.table("businesses")\
        .select(
            "id, name, category_id, industry_template_id, ui_mode, plan, phone, address, tax_id, created_at, "
            "categories(name), industry_templates(category_group)"
        )\
        .eq("id", business_id)\
        .execute()

    if not result.data:
        raise ValueError("Negocio no encontrado")

    row = result.data[0]

    # industry_templates viene embebido por el FK industry_template_id — puede
    # ser None si el negocio no tiene plantilla asignada.
    industry_template = row.get("industry_templates") or {}
    if isinstance(industry_template, list):
        industry_template = industry_template[0] if industry_template else {}

    return {
        "id": row["id"],
        "name": row["name"],
        "category_id": row.get("category_id"),
        "category_name": row.get("categories", {}).get("name") if row.get("categories") else None,
        "industry_template_id": row.get("industry_template_id"),
        # category_group agrupa las plantillas de industria en las 5 categorías
        # del onboarding adaptativo (alimentos, servicios, comercio,
        # comida_preparada, general) — usado por el frontend para decidir qué
        # flags de configuración de inventario mostrar (ver /inventory/config).
        "category_group": industry_template.get("category_group"),
        "ui_mode": row.get("ui_mode", "simple"),
        "plan": row.get("plan", "free"),
        "phone": row.get("phone"),
        "address": row.get("address"),
        "tax_id": row.get("tax_id"),
        "created_at": row.get("created_at"),
    }


def update_business(business_id: str, data):
    """Actualiza los campos proporcionados del negocio."""
    update_fields = {}
    if data.name is not None:
        update_fields["name"] = data.name.strip()
    if data.phone is not None:
        update_fields["phone"] = data.phone.strip() or None
    if data.address is not None:
        update_fields["address"] = data.address.strip() or None
    if getattr(data, 'tax_id', None) is not None:
        update_fields["tax_id"] = data.tax_id.strip() or None

    if getattr(data, 'ui_mode', None) is not None:
        # Solo se permite crecer de Informal a PYME ('simple' -> 'advanced').
        # Nunca degradar, y nunca reescribir un negocio que ya es PYME.
        if data.ui_mode != "advanced":
            raise ValueError("Solo se permite actualizar ui_mode a 'advanced'")

        current = supabase_admin.table("businesses")\
            .select("ui_mode")\
            .eq("id", business_id)\
            .execute()

        if not current.data:
            raise ValueError("Negocio no encontrado")

        if current.data[0].get("ui_mode", "simple") == "advanced":
            raise ValueError("El negocio ya está en modo PYME (advanced)")

        update_fields["ui_mode"] = data.ui_mode

    if not update_fields:
        raise ValueError("No se proporcionaron campos para actualizar")

    result = supabase_admin.table("businesses")\
        .update(update_fields)\
        .eq("id", business_id)\
        .execute()

    if not result.data:
        raise ValueError("Negocio no encontrado")

    return get_business(business_id)


def get_business_config(business_id: str):
    """Obtiene la configuración del negocio."""
    result = supabase_admin.table("business_configs")\
        .select("*")\
        .eq("business_id", business_id)\
        .execute()

    if not result.data:
        # Si no existe configuración, devolver valores por defecto
        return {
            "business_id": business_id,
            "currency": "USD",
            "weight_unit": "kg",
            "tax_rate": 0,
            "logo_url": None,
            "primary_color": None,
            "language": "es",
            "settings": {},
        }

    row = result.data[0]
    return {
        "business_id": row.get("business_id"),
        "currency": row.get("currency", "USD"),
        "weight_unit": row.get("weight_unit", "kg"),
        "tax_rate": float(row.get("tax_rate", 0)),
        "logo_url": row.get("logo_url"),
        "primary_color": row.get("primary_color"),
        "language": row.get("language", "es"),
        "settings": row.get("settings", {}) or {},
    }


def update_business_config(business_id: str, data):
    """Actualiza la configuración del negocio. Crea la fila si no existe."""
    update_fields = {}
    if data.currency is not None:
        update_fields["currency"] = data.currency
    if data.weight_unit is not None:
        update_fields["weight_unit"] = data.weight_unit
    if data.tax_rate is not None:
        update_fields["tax_rate"] = data.tax_rate
    if data.logo_url is not None:
        update_fields["logo_url"] = data.logo_url
    if data.primary_color is not None:
        update_fields["primary_color"] = data.primary_color
    if data.language is not None:
        update_fields["language"] = data.language
    if getattr(data, 'settings', None) is not None:
        update_fields["settings"] = data.settings

    if not update_fields:
        raise ValueError("No se proporcionaron campos para actualizar")

    # Verificar si ya existe una fila de config
    existing = supabase_admin.table("business_configs")\
        .select("id")\
        .eq("business_id", business_id)\
        .execute()

    if existing.data:
        supabase_admin.table("business_configs")\
            .update(update_fields)\
            .eq("business_id", business_id)\
            .execute()
    else:
        update_fields["business_id"] = business_id
        supabase_admin.table("business_configs")\
            .insert(update_fields)\
            .execute()

    return get_business_config(business_id)


def get_enabled_modules(business_id: str) -> list:
    """Lista de módulos habilitados (BASE_MODULES + features activos), misma
    lógica que normalize_modules usa al construir el contexto de login."""
    features = supabase_admin.table("features")\
        .select("module, is_active")\
        .eq("business_id", business_id)\
        .execute()
    return normalize_modules(features.data or [])


def set_module_active(business_id: str, module: str, enabled: bool) -> dict:
    """
    Activa/desactiva un módulo opcional del negocio (tabla `features`).

    No hay UNIQUE(business_id, module) en el esquema, así que se busca la fila
    existente antes de decidir entre update/insert. Rechaza módulos fuera de
    ALL_VALID_MODULES (misma lista blanca que usa el registro) y operaciones
    redundantes (activar lo ya activo, desactivar lo ya inactivo).
    """
    if module not in ALL_VALID_MODULES:
        raise ValueError(f"Módulo inválido. Opciones: {', '.join(sorted(ALL_VALID_MODULES))}")

    existing = supabase_admin.table("features")\
        .select("id, is_active")\
        .eq("business_id", business_id)\
        .eq("module", module)\
        .execute()

    if existing.data:
        row = existing.data[0]
        if bool(row.get("is_active")) == enabled:
            estado = "activo" if enabled else "inactivo"
            raise ValueError(f"El módulo '{module}' ya está {estado}.")

        update_payload = {"is_active": enabled}
        if enabled:
            update_payload["activated_at"] = datetime.utcnow().isoformat()

        supabase_admin.table("features")\
            .update(update_payload)\
            .eq("id", row["id"])\
            .execute()
    else:
        if not enabled:
            raise ValueError(f"El módulo '{module}' ya está inactivo.")

        supabase_admin.table("features").insert({
            "business_id": business_id,
            "module": module,
            "is_active": True,
            "activated_at": datetime.utcnow().isoformat(),
        }).execute()

    return {"enabled_modules": get_enabled_modules(business_id)}
