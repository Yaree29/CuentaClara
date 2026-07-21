# =============================================================================
# offers_service.py
# ------------------
# Lógica de negocio del módulo /offers (Gestor de Ofertas): CRUD de
# promotions + estado derivado (activo/programado/vencido) a partir de la
# fecha actual, sin columna de estado propia en la tabla.
# =============================================================================
from datetime import date

from app.database import supabase_admin


def _status_for(start_date: str, end_date: str) -> str:
    today = date.today().isoformat()
    if today < start_date:
        return "scheduled"
    if today > end_date:
        return "expired"
    return "active"


def _map_promotion(row: dict) -> dict:
    product = row.get("products") or {}
    if isinstance(product, list):
        product = product[0] if product else {}
    category = row.get("product_categories") or {}
    if isinstance(category, list):
        category = category[0] if category else {}

    return {
        "id": row["id"],
        "scope": row["scope"],
        "product_id": row.get("product_id"),
        "product_name": product.get("name"),
        "category_id": row.get("category_id"),
        "category_name": category.get("name"),
        "discount_type": row["discount_type"],
        "discount_value": float(row["discount_value"]),
        "start_date": row["start_date"],
        "end_date": row["end_date"],
        "status": _status_for(row["start_date"], row["end_date"]),
        "created_at": row.get("created_at"),
    }


SELECT_WITH_JOINS = "id, business_id, scope, product_id, category_id, discount_type, discount_value, start_date, end_date, created_at, products(name), product_categories(name)"


def create_promotion(business_id: str, data) -> dict:
    payload = {
        "business_id": business_id,
        "scope": data.scope,
        "product_id": data.product_id if data.scope == "product" else None,
        "category_id": data.category_id if data.scope == "category" else None,
        "discount_type": data.discount_type,
        "discount_value": float(data.discount_value),
        "start_date": data.start_date.isoformat(),
        "end_date": data.end_date.isoformat(),
    }
    result = supabase_admin.table("promotions").insert(payload).execute()
    inserted_id = result.data[0]["id"]

    row = supabase_admin.table("promotions").select(SELECT_WITH_JOINS).eq("id", inserted_id).execute()
    return _map_promotion(row.data[0])


def list_promotions(business_id: str) -> list:
    result = supabase_admin.table("promotions")\
        .select(SELECT_WITH_JOINS)\
        .eq("business_id", business_id)\
        .order("start_date", desc=True)\
        .execute()
    return [_map_promotion(r) for r in (result.data or [])]


def _get_promotion_or_404(business_id: str, promotion_id: int) -> dict:
    result = supabase_admin.table("promotions")\
        .select(SELECT_WITH_JOINS)\
        .eq("id", promotion_id)\
        .eq("business_id", business_id)\
        .execute()
    if not result.data:
        raise ValueError("Promoción no encontrada")
    return result.data[0]


def update_promotion(business_id: str, promotion_id: int, data) -> dict:
    _get_promotion_or_404(business_id, promotion_id)

    update_fields = {}
    if data.discount_type is not None:
        update_fields["discount_type"] = data.discount_type
    if data.discount_value is not None:
        update_fields["discount_value"] = float(data.discount_value)
    if data.start_date is not None:
        update_fields["start_date"] = data.start_date.isoformat()
    if data.end_date is not None:
        update_fields["end_date"] = data.end_date.isoformat()

    if not update_fields:
        raise ValueError("No se proporcionaron campos para actualizar")

    supabase_admin.table("promotions").update(update_fields).eq("id", promotion_id).eq("business_id", business_id).execute()

    row = _get_promotion_or_404(business_id, promotion_id)
    return _map_promotion(row)


def delete_promotion(business_id: str, promotion_id: int) -> dict:
    _get_promotion_or_404(business_id, promotion_id)
    supabase_admin.table("promotions").delete().eq("id", promotion_id).eq("business_id", business_id).execute()
    return {"deleted": True}
