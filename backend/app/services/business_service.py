# =============================================================================
# business_service.py
# -------------------
# Lógica de negocio para el módulo /businesses.
# Consulta y actualiza las tablas `businesses` y `business_configs` en Supabase.
# =============================================================================
from app.database import supabase_admin


def get_business(business_id: str):
    """Obtiene la información del negocio incluyendo su categoría."""
    result = supabase_admin.table("businesses")\
        .select("id, name, category_id, industry_template_id, ui_mode, plan, phone, address, tax_id, created_at, categories(name)")\
        .eq("id", business_id)\
        .execute()

    if not result.data:
        raise ValueError("Negocio no encontrado")

    row = result.data[0]
    return {
        "id": row["id"],
        "name": row["name"],
        "category_id": row.get("category_id"),
        "category_name": row.get("categories", {}).get("name") if row.get("categories") else None,
        "industry_template_id": row.get("industry_template_id"),
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


def delete_business_data(business_id: str) -> dict:
    """
    Borra TODOS los datos transaccionales/registrados del negocio, dejando
    intactos la cuenta del usuario, el negocio, su configuración y las
    categorías. Pensado para reiniciar el historial (ventas, fiados,
    inventario, gastos) sin tener que volver a registrarse.

    El borrado se hace en orden seguro respecto a las llaves foráneas.
    Los ON DELETE CASCADE del esquema se encargan de las tablas hijas:
      - invoices  → CASCADE a invoice_items y payments
      - debts     → CASCADE a debt_payments
    """
    admin = supabase_admin

    # 1. Ventas (invoice_items y payments caen por CASCADE al borrar invoices).
    admin.table("invoices").delete().eq("business_id", business_id).execute()

    # 2. Fiado: debts primero (CASCADE a debt_payments), luego los clientes.
    admin.table("debts").delete().eq("business_id", business_id).execute()
    admin.table("customers").delete().eq("business_id", business_id).execute()

    # 3. Inventario: movimientos → filas de stock → productos (por las FK).
    admin.table("inventory_movements").delete().eq("business_id", business_id).execute()
    admin.table("inventory").delete().eq("business_id", business_id).execute()
    admin.table("products").delete().eq("business_id", business_id).execute()

    # 4. Gastos del negocio.
    admin.table("expenses").delete().eq("business_id", business_id).execute()

    # 5. Notificaciones (best-effort: si la tabla no aplica, no interrumpe).
    try:
        admin.table("notifications").delete().eq("business_id", business_id).execute()
    except Exception:
        pass

    return {"deleted": True}
