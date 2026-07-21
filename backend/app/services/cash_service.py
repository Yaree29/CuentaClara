# =============================================================================
# cash_service.py
# ---------------
# Lógica de negocio de sesiones de caja (cash_sessions).
#
# Auditoría previa (ver conversación): cash_sessions (opening_amount,
# closing_amount, status, opened_at, closed_at) alcanza sin tabla
# complementaria — expenses ya tiene cash_session_id (06_cash.sql) para
# vincular gastos a la sesión, y los ingresos en efectivo se derivan de
# payments (method='cash') unidos a invoices reales dentro de la ventana de
# la sesión. No existe (ni se crea aquí) una tabla de "otros ingresos"
# manuales — el esperado se calcula solo con datos reales de ventas/gastos.
# =============================================================================
from datetime import datetime
from decimal import Decimal
from typing import Optional

from app.database import supabase_admin


def get_open_session(business_id: str) -> Optional[dict]:
    result = supabase_admin.table("cash_sessions") \
        .select("*") \
        .eq("business_id", business_id) \
        .eq("status", "open") \
        .order("opened_at", desc=True) \
        .limit(1) \
        .execute()
    return result.data[0] if result.data else None


def _session_totals(business_id: str, session: dict) -> dict:
    """
    Ingresos en efectivo (payments.method='cash' de facturas creadas dentro
    de la ventana de la sesión) y gastos vinculados (expenses.cash_session_id).
    """
    opened_at = session["opened_at"]
    closed_at = session.get("closed_at") or datetime.utcnow().isoformat()

    invoices = supabase_admin.table("invoices") \
        .select("id") \
        .eq("business_id", business_id) \
        .gte("created_at", opened_at) \
        .lte("created_at", closed_at) \
        .execute()
    invoice_ids = [i["id"] for i in (invoices.data or [])]

    cash_income = Decimal("0")
    if invoice_ids:
        payments = supabase_admin.table("payments") \
            .select("amount, method, invoice_id") \
            .eq("method", "cash") \
            .in_("invoice_id", invoice_ids) \
            .execute()
        cash_income = sum(Decimal(str(p["amount"])) for p in (payments.data or []))

    expenses = supabase_admin.table("expenses") \
        .select("amount") \
        .eq("cash_session_id", session["id"]) \
        .execute()
    total_expenses = sum(Decimal(str(e["amount"])) for e in (expenses.data or []))

    return {"cash_income": cash_income, "expenses": total_expenses}


def get_session_status(business_id: str) -> dict:
    """Estado de la caja actual: si hay una sesión abierta, incluye el
    monto esperado calculado hasta este momento (efectivo real, no
    proyectado)."""
    session = get_open_session(business_id)
    if not session:
        return {"is_open": False, "session": None}

    totals = _session_totals(business_id, session)
    opening = Decimal(str(session["opening_amount"] or 0))
    expected = opening + totals["cash_income"] - totals["expenses"]

    return {
        "is_open": True,
        "session": session,
        "opening_amount": float(opening),
        "cash_income": float(totals["cash_income"]),
        "expenses": float(totals["expenses"]),
        "expected_amount": float(expected),
    }


def open_session(business_id: str, user_id: str, opening_amount: Decimal) -> dict:
    if get_open_session(business_id):
        raise ValueError("Ya existe una caja abierta. Ciérrala antes de abrir una nueva.")

    result = supabase_admin.table("cash_sessions").insert({
        "business_id": business_id,
        "user_id": user_id,
        "opening_amount": float(opening_amount),
        "status": "open",
        "opened_at": datetime.utcnow().isoformat(),
    }).execute()

    if not result.data:
        raise ValueError("No se pudo abrir la caja.")

    return result.data[0]


def close_session(business_id: str, counted_amount: Decimal) -> dict:
    session = get_open_session(business_id)
    if not session:
        raise ValueError("No hay ninguna caja abierta para cerrar.")

    totals = _session_totals(business_id, session)
    opening = Decimal(str(session["opening_amount"] or 0))
    expected = opening + totals["cash_income"] - totals["expenses"]
    difference = Decimal(str(counted_amount)) - expected
    closed_at = datetime.utcnow().isoformat()

    supabase_admin.table("cash_sessions").update({
        "closing_amount": float(counted_amount),
        "status": "closed",
        "closed_at": closed_at,
    }).eq("id", session["id"]).execute()

    return {
        "session_id": session["id"],
        "opening_amount": float(opening),
        "cash_income": float(totals["cash_income"]),
        "expenses": float(totals["expenses"]),
        "expected_amount": float(expected),
        "counted_amount": float(counted_amount),
        "difference": float(difference),
        "closed_at": closed_at,
    }


def list_sessions(business_id: str, limit: int = 20) -> list:
    result = supabase_admin.table("cash_sessions") \
        .select("*") \
        .eq("business_id", business_id) \
        .order("opened_at", desc=True) \
        .limit(limit) \
        .execute()
    return result.data or []
