# =============================================================================
# commissions_service.py
# -----------------------
# Lógica de negocio del módulo /commissions:
#   - Configuración de comisión (percentage/fixed) por asistente.
#   - Reporte calculado a partir de ventas reales (mismo patrón que
#     sales_service.get_profits_and_expenses, filtrado por assistant_id).
#   - Historial de pagos (commission_payments) — registrar un pago es una
#     acción explícita del dueño, nunca automática.
# =============================================================================
from decimal import Decimal
from datetime import datetime, timezone

from app.database import supabase_admin


def _get_assistant_or_404(business_id: str, assistant_id: int) -> dict:
    result = supabase_admin.table("business_assistants")\
        .select("id, name, role, is_blocked")\
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
    """Config de comisión de cada asistente activo — 'No configurado' si no tiene fila."""
    assistants = supabase_admin.table("business_assistants")\
        .select("id, name, role, is_blocked")\
        .eq("business_id", business_id)\
        .order("name")\
        .execute()

    configs = supabase_admin.table("assistant_commissions")\
        .select("assistant_id, commission_type, commission_value")\
        .eq("business_id", business_id)\
        .execute()
    config_by_assistant = {c["assistant_id"]: c for c in (configs.data or [])}

    result = []
    for a in (assistants.data or []):
        cfg = config_by_assistant.get(a["id"])
        result.append({
            "assistant_id": a["id"],
            "name": a["name"],
            "role": a.get("role"),
            "is_blocked": a["is_blocked"],
            "commission_type": cfg["commission_type"] if cfg else None,
            "commission_value": float(cfg["commission_value"]) if cfg else None,
        })
    return result


def upsert_commission_config(business_id: str, assistant_id: int, data) -> dict:
    _get_assistant_or_404(business_id, assistant_id)

    supabase_admin.table("assistant_commissions")\
        .upsert({
            "business_id": business_id,
            "assistant_id": assistant_id,
            "commission_type": data.commission_type,
            "commission_value": float(data.commission_value),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }, on_conflict="business_id,assistant_id")\
        .execute()

    result = supabase_admin.table("assistant_commissions")\
        .select("assistant_id, commission_type, commission_value")\
        .eq("business_id", business_id)\
        .eq("assistant_id", assistant_id)\
        .execute()
    row = result.data[0]
    return {
        "assistant_id": row["assistant_id"],
        "commission_type": row["commission_type"],
        "commission_value": float(row["commission_value"]),
    }


def get_commission_report(business_id: str, date_from: str, date_to: str) -> list:
    """Comisión calculada por asistente en el período, a partir de ventas reales.
    Sin config -> commission_amount None ("No configurado"), no se inventa un valor."""
    assistants = supabase_admin.table("business_assistants")\
        .select("id, name, role")\
        .eq("business_id", business_id)\
        .order("name")\
        .execute()

    configs = supabase_admin.table("assistant_commissions")\
        .select("assistant_id, commission_type, commission_value")\
        .eq("business_id", business_id)\
        .execute()
    config_by_assistant = {c["assistant_id"]: c for c in (configs.data or [])}

    report = []
    for a in (assistants.data or []):
        income = _income_for_assistant(business_id, a["id"], date_from, date_to)
        cfg = config_by_assistant.get(a["id"])

        commission_amount = None
        if cfg:
            value = Decimal(str(cfg["commission_value"]))
            if cfg["commission_type"] == "percentage":
                commission_amount = float(income * value / Decimal("100"))
            else:
                commission_amount = float(value)

        report.append({
            "assistant_id": a["id"],
            "name": a["name"],
            "role": a.get("role"),
            "income": float(income),
            "commission_type": cfg["commission_type"] if cfg else None,
            "commission_value": float(cfg["commission_value"]) if cfg else None,
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
