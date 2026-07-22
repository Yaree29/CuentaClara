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
    result = (
        supabase_admin.table("businesses")
        .select(
            "id, name, category_id, industry_template_id, ui_mode, plan, phone, address, tax_id, created_at, "
            "categories(name), industry_templates(category_group)"
        )
        .eq("id", business_id)
        .execute()
    )

    if not result.data:
        raise ValueError("Negocio no encontrado")

    row = result.data[0]

    industry_template = row.get("industry_templates") or {}
    if isinstance(industry_template, list):
        industry_template = industry_template[0] if industry_template else {}

    return {
        "id": row["id"],
        "name": row["name"],
        "category_id": row.get("category_id"),
        "category_name": row.get("categories", {}).get("name")
        if row.get("categories")
        else None,
        "industry_template_id": row.get("industry_template_id"),
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
    if getattr(data, "tax_id", None) is not None:
        update_fields["tax_id"] = data.tax_id.strip() or None

    if getattr(data, "ui_mode", None) is not None:
        if data.ui_mode != "advanced":
            raise ValueError("Solo se permite actualizar ui_mode a 'advanced'")

        current = (
            supabase_admin.table("businesses")
            .select("ui_mode")
            .eq("id", business_id)
            .execute()
        )

        if not current.data:
            raise ValueError("Negocio no encontrado")

        if current.data[0].get("ui_mode", "simple") == "advanced":
            raise ValueError("El negocio ya está en modo PYME (advanced)")

        update_fields["ui_mode"] = data.ui_mode

    if not update_fields:
        raise ValueError("No se proporcionaron campos para actualizar")

    result = (
        supabase_admin.table("businesses")
        .update(update_fields)
        .eq("id", business_id)
        .execute()
    )

    if not result.data:
        raise ValueError("Negocio no encontrado")

    return get_business(business_id)


def get_business_config(business_id: str):
    """Obtiene la configuración del negocio."""
    result = (
        supabase_admin.table("business_configs")
        .select("*")
        .eq("business_id", business_id)
        .execute()
    )

    if not result.data:
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
    if getattr(data, "settings", None) is not None:
        update_fields["settings"] = data.settings

    if not update_fields:
        raise ValueError("No se proporcionaron campos para actualizar")

    existing = (
        supabase_admin.table("business_configs")
        .select("id")
        .eq("business_id", business_id)
        .execute()
    )

    if existing.data:
        supabase_admin.table("business_configs").update(update_fields).eq(
            "business_id", business_id
        ).execute()
    else:
        update_fields["business_id"] = business_id
        supabase_admin.table("business_configs").insert(update_fields).execute()

    return get_business_config(business_id)


def get_sales_schedule(business_id: str):
    """Horario fijo diario de ventas (opcional). Devuelve None si no está
    configurado — cualquiera de los dos campos vacío cuenta como "sin
    restricción horaria" (la caja obligatoria sigue aplicando de todos modos,
    ver cash_service.py)."""
    result = (
        supabase_admin.table("business_configs")
        .select("sales_opening_time, sales_closing_time")
        .eq("business_id", business_id)
        .execute()
    )
    if not result.data:
        return None

    opening = result.data[0].get("sales_opening_time")
    closing = result.data[0].get("sales_closing_time")
    if not opening or not closing:
        return None

    return {"opening_time": opening[:5], "closing_time": closing[:5]}


def update_sales_schedule(business_id: str, data):
    """Configura (o borra, si ambos vienen null) el horario de ventas.
    Crea la fila de business_configs si todavía no existe (mismo patrón que
    update_business_config)."""
    if (data.opening_time is None) != (data.closing_time is None):
        raise ValueError("Debes indicar ambas horas (apertura y cierre) o ninguna.")
    if data.opening_time and data.closing_time and data.opening_time >= data.closing_time:
        raise ValueError("La hora de apertura debe ser anterior a la hora de cierre.")

    update_fields = {
        "sales_opening_time": data.opening_time,
        "sales_closing_time": data.closing_time,
    }

    existing = (
        supabase_admin.table("business_configs")
        .select("id")
        .eq("business_id", business_id)
        .execute()
    )

    if existing.data:
        supabase_admin.table("business_configs").update(update_fields).eq(
            "business_id", business_id
        ).execute()
    else:
        update_fields["business_id"] = business_id
        supabase_admin.table("business_configs").insert(update_fields).execute()

    return get_sales_schedule(business_id)


def get_enabled_modules(business_id: str) -> list:
    """Lista de módulos habilitados (BASE_MODULES + features activos), misma
    lógica que normalize_modules usa al construir el contexto de login."""
    features = (
        supabase_admin.table("features")
        .select("module, is_active")
        .eq("business_id", business_id)
        .execute()
    )
    return normalize_modules(features.data or [])


def set_module_active(business_id: str, module: str, enabled: bool) -> dict:
    """
    Activa/desactiva un módulo opcional del negocio (tabla `features`).
    """
    if module not in ALL_VALID_MODULES:
        raise ValueError(
            f"Módulo inválido. Opciones: {', '.join(sorted(ALL_VALID_MODULES))}"
        )

    existing = (
        supabase_admin.table("features")
        .select("id, is_active")
        .eq("business_id", business_id)
        .eq("module", module)
        .execute()
    )

    if existing.data:
        row = existing.data[0]
        if bool(row.get("is_active")) == enabled:
            estado = "activo" if enabled else "inactivo"
            raise ValueError(f"El módulo '{module}' ya está {estado}.")

        update_payload = {"is_active": enabled}
        if enabled:
            update_payload["activated_at"] = datetime.utcnow().isoformat()

        supabase_admin.table("features").update(update_payload).eq(
            "id", row["id"]
        ).execute()
    else:
        if not enabled:
            raise ValueError(f"El módulo '{module}' ya está inactivo.")

        supabase_admin.table("features").insert(
            {
                "business_id": business_id,
                "module": module,
                "is_active": True,
                "activated_at": datetime.utcnow().isoformat(),
            }
        ).execute()

    return {"enabled_modules": get_enabled_modules(business_id)}


def delete_account(user_id: str, business_id: str):
    """
    Elimina la cuenta completa del usuario:
    1. Borra la fila de businesses (ON DELETE CASCADE elimina todas las tablas hijas).
    2. Borra el usuario de Supabase Auth.
    """
    from app.database import supabase_admin as admin

    result = admin.table("businesses").delete().eq("id", business_id).execute()
    if not result.data:
        raise ValueError("Negocio no encontrado")

    try:
        admin.auth.admin.delete_user(user_id)
    except Exception:
        pass

    return {"deleted": True}


def delete_data(business_id: str):
    """
    Reinicia el historial y transacciones del negocio, conservando:
    businesses, users, business_configs, features, products, product_categories,
    inventory, customers, suppliers, purchase_orders, purchase_items,
    staff_attendance, staff_expenses, business_assistants.

    Borra tablas transaccionales (en orden para respetar FK):
    1. debt_payments  (FK → debts)
    2. debts          (FK → customers, businesses)
    3. payments       (FK → invoices)
    4. invoice_items  (FK → invoices)
    5. invoices       (FK → businesses)
    6. expenses       (FK → businesses)
    7. cash_sessions  (FK → businesses)
    8. inventory_movements (FK → businesses)
    9. audit_logs     (FK → businesses)
    10. notifications (FK → businesses)
    """
    from app.database import supabase_admin as admin

    check_tables = ["invoices", "debts", "cash_sessions", "expenses"]
    has_data = False
    for table in check_tables:
        try:
            result = (
                admin.table(table)
                .select("id", count="exact")
                .eq("business_id", business_id)
                .limit(1)
                .execute()
            )
            if result.data:
                has_data = True
                break
        except Exception:
            pass

    if not has_data:
        return {"deleted": False, "has_data": False}

    tables_in_order = [
        "debt_payments",
        "debts",
        "payments",
        "invoice_items",
        "invoices",
        "expenses",
        "cash_sessions",
        "inventory_movements",
        "audit_logs",
        "notifications",
    ]

    for table in tables_in_order:
        try:
            admin.table(table).delete().eq("business_id", business_id).execute()
        except Exception:
            pass

    return {"deleted": True, "has_data": True}
