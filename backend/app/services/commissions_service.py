# =============================================================================
# commissions_service.py
# -----------------------
# Lógica de negocio del módulo /commissions:
#   - Configuración de comisión (percentage/fixed) por asistente — vive
#     directamente en business_assistants.commission_type/commission_value,
#     no en una tabla aparte (no existe assistant_commissions).
#   - Reporte calculado a partir de ventas reales (mismo patrón que
#     sales_service.get_profits_and_expenses, filtrado por assistant_id).
#   - Historial de pagos (commission_payments) — registrar un pago es una
#     acción explícita del dueño, nunca automática. assistant_name se guarda
#     como snapshot al momento del pago (mismo patrón que
#     invoices.assistant_name en sales_service.create_quick_sale), y
#     assistant_id es ON DELETE SET NULL, para que el historial sobreviva
#     si se borra al asistente.
# =============================================================================
from decimal import Decimal
from datetime import datetime, timezone

from app.database import supabase_admin


def _get_assistant_or_404(business_id: str, assistant_id: int) -> dict:
    result = supabase_admin.table("business_assistants")\
        .select("id, name, role, is_blocked, commission_type, commission_value")\
        .eq("id", assistant_id)\
        .eq("business_id", business_id)\
        .execute()
    if not result.data:
        raise ValueError("Asistente no encontrado")
    return result.data[0]


def _income_for_assistant(business_id: str, assistant_id: int, date_from: str, date_to: str) -> Decimal:
    invoices = supabase_admin.table("invoices")\
        .select("total")\
        .eq("business_id", business_id)\
        .eq("assistant_id", assistant_id)\
        .eq("status", "paid")\
        .gte("created_at", date_from)\
        .lte("created_at", date_to)\
        .execute()
    return sum((Decimal(str(i["total"])) for i in (invoices.data or [])), Decimal("0"))


def list_commission_configs(business_id: str) -> list:
    """Config de comisión de cada asistente activo — 'No configurado' si las
    columnas commission_type/commission_value están en null."""
    assistants = supabase_admin.table("business_assistants")\
        .select("id, name, role, is_blocked, commission_type, commission_value")\
        .eq("business_id", business_id)\
        .order("name")\
        .execute()

    result = []
    for a in (assistants.data or []):
        result.append({
            "assistant_id": a["id"],
            "name": a["name"],
            "role": a.get("role"),
            "is_blocked": a["is_blocked"],
            "commission_type": a.get("commission_type"),
            "commission_value": float(a["commission_value"]) if a.get("commission_value") is not None else None,
        })
    return result


def upsert_commission_config(business_id: str, assistant_id: int, data) -> dict:
    _get_assistant_or_404(business_id, assistant_id)

    supabase_admin.table("business_assistants")\
        .update({
            "commission_type": data.commission_type,
            "commission_value": float(data.commission_value),
        })\
        .eq("id", assistant_id)\
        .eq("business_id", business_id)\
        .execute()

    result = supabase_admin.table("business_assistants")\
        .select("id, commission_type, commission_value")\
        .eq("id", assistant_id)\
        .eq("business_id", business_id)\
        .execute()
    row = result.data[0]
    return {
        "assistant_id": row["id"],
        "commission_type": row["commission_type"],
        "commission_value": float(row["commission_value"]),
    }


def get_commission_report(business_id: str, date_from: str, date_to: str) -> list:
    """Comisión calculada por asistente en el período, a partir de ventas reales.
    Sin config -> commission_amount None ("No configurado"), no se inventa un valor."""
    assistants = supabase_admin.table("business_assistants")\
        .select("id, name, role, commission_type, commission_value")\
        .eq("business_id", business_id)\
        .order("name")\
        .execute()

    report = []
    for a in (assistants.data or []):
        income = _income_for_assistant(business_id, a["id"], date_from, date_to)

        commission_amount = None
        if a.get("commission_type") is not None and a.get("commission_value") is not None:
            value = Decimal(str(a["commission_value"]))
            if a["commission_type"] == "percentage":
                commission_amount = float(income * value / Decimal("100"))
            else:
                commission_amount = float(value)

        report.append({
            "assistant_id": a["id"],
            "name": a["name"],
            "role": a.get("role"),
            "income": float(income),
            "commission_type": a.get("commission_type"),
            "commission_value": float(a["commission_value"]) if a.get("commission_value") is not None else None,
            "commission_amount": commission_amount,
        })
    return report


def register_payment(business_id: str, data) -> dict:
    assistant = _get_assistant_or_404(business_id, data.assistant_id)

    result = supabase_admin.table("commission_payments").insert({
        "business_id": business_id,
        "assistant_id": data.assistant_id,
        "assistant_name": assistant["name"],
        "period_from": data.period_from,
        "period_to": data.period_to,
        "amount": float(data.amount),
        "notes": data.notes,
        "paid_at": datetime.now(timezone.utc).isoformat(),
    }).execute()

    return result.data[0]


def list_payments(business_id: str, assistant_id: int = None) -> list:
    query = supabase_admin.table("commission_payments")\
        .select("id, assistant_id, assistant_name, period_from, period_to, amount, notes, paid_at")\
        .eq("business_id", business_id)\
        .order("paid_at", desc=True)

    if assistant_id is not None:
        query = query.eq("assistant_id", assistant_id)

    result = query.execute()
    return result.data or []


def get_total_paid(business_id: str, assistant_id: int = None) -> float:
    payments = list_payments(business_id, assistant_id)
    return float(sum((Decimal(str(p["amount"])) for p in payments), Decimal("0")))
