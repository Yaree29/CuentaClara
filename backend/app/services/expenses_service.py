# =============================================================================
# expenses_service.py
# -------------------
# Lógica de negocio para /expenses. Antes el único INSERT a esta tabla vivía
# en inventory_service.py (compra de stock inicial con ganancias) — este
# servicio agrega el caso general de "registrar un gasto", opcionalmente
# vinculado a una sesión de caja (cash_session_id, ver cash_service.py).
# =============================================================================
from datetime import datetime
from typing import Optional

from app.database import supabase_admin


def create_expense(business_id: str, user_id: str, data) -> dict:
    payload = {
        "business_id": business_id,
        "amount": float(data.amount),
        "description": data.description or None,
        "cash_session_id": data.cash_session_id,
        "user_id": user_id,
        "created_at": datetime.utcnow().isoformat(),
    }
    result = supabase_admin.table("expenses").insert(payload).execute()

    if not result.data:
        raise ValueError("No se pudo registrar el gasto.")

    return result.data[0]


def list_expenses(
    business_id: str,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    cash_session_id: Optional[int] = None,
    limit: int = 100,
) -> list:
    query = supabase_admin.table("expenses") \
        .select("*") \
        .eq("business_id", business_id) \
        .order("created_at", desc=True) \
        .limit(limit)

    if cash_session_id is not None:
        query = query.eq("cash_session_id", cash_session_id)
    if date_from:
        query = query.gte("created_at", date_from)
    if date_to:
        # "2026-07-22" se compara como 2026-07-22T00:00:00, así que sin esto
        # quedaban fuera TODOS los gastos del día en curso: el total (que sí
        # normaliza, ver sales_service.get_profits_and_expenses) mostraba miles
        # mientras el detalle devolvía cero filas.
        if len(date_to) == 10:
            date_to = f"{date_to}T23:59:59.999Z"
        query = query.lte("created_at", date_to)

    result = query.execute()
    return result.data or []
