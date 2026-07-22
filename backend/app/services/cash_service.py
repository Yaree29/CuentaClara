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
#
# Reconstrucción "horario de operación + ciclo de vida de caja" (ver plan):
# - El horario de ventas (business_configs.sales_opening_time/closing_time,
#   ver 20_sales_schedule_and_cash_lifecycle.sql) es opcional por negocio.
#   Si no está configurado, no hay restricción horaria — pero abrir caja
#   sigue siendo obligatorio para vender (eso se aplica en sales_service.py).
# - No existe opción de "extender" la hora de cierre: al llegar la hora
#   configurada, las ventas se bloquean sin excepción (decisión explícita del
#   usuario, 2026-07-22) — la caja solo se puede cerrar (nunca antes de esa
#   hora), no hay negociación de tiempo extra.
# =============================================================================
from datetime import datetime, time, timezone
from decimal import Decimal
from typing import Optional
from zoneinfo import ZoneInfo

from app.config import settings
from app.database import supabase_admin
from app.services import business_service

_TZ = ZoneInfo(settings.app_timezone)


def _now_local_time() -> time:
    return datetime.now(timezone.utc).astimezone(_TZ).time()


def _parse_hhmm(value: str) -> time:
    hour, minute = value.split(":")[:2]
    return time(int(hour), int(minute))


def business_uses_cash_sessions(business_id: str) -> bool:
    """
    El ciclo de vida de caja (abrir caja antes de vender, horario de ventas)
    es EXCLUSIVO de negocios PYME (businesses.ui_mode='advanced'). El usuario
    informal no tiene el concepto de caja abierta ni horario de operación: sus
    ventas se registran siempre, sin gate. Ver auth_service.get_user_context,
    donde userType se deriva del mismo ui_mode.
    """
    result = supabase_admin.table("businesses") \
        .select("ui_mode") \
        .eq("id", business_id) \
        .limit(1) \
        .execute()

    if not result.data:
        return False
    return result.data[0].get("ui_mode") == "advanced"


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


def _schedule_state(schedule: Optional[dict]) -> dict:
    """within_hours/past_closing calculados contra la hora local actual. Sin
    horario configurado: siempre "dentro de horario" (sin restricción)."""
    if not schedule:
        return {"within_hours": True, "past_closing": False}

    now_t = _now_local_time()
    opening_t = _parse_hhmm(schedule["opening_time"])
    closing_t = _parse_hhmm(schedule["closing_time"])
    return {
        "within_hours": opening_t <= now_t < closing_t,
        "past_closing": now_t >= closing_t,
    }


def is_within_operating_hours(business_id: str) -> bool:
    """Usado por sales_service para el gate de "fuera de horario de ventas"
    al crear una venta (independiente de si hay o no una sesión abierta)."""
    schedule = business_service.get_sales_schedule(business_id)
    return _schedule_state(schedule)["within_hours"]


def get_session_status(business_id: str) -> dict:
    """Estado de la caja actual: si hay una sesión abierta, incluye el monto
    esperado calculado hasta este momento, más las banderas de horario/cierre
    que gobiernan qué acciones están permitidas ahora mismo."""
    session = get_open_session(business_id)
    schedule = business_service.get_sales_schedule(business_id)
    state = _schedule_state(schedule)

    if not session:
        return {
            "is_open": False,
            "session": None,
            "schedule": schedule,
            "within_operating_hours": state["within_hours"],
            "past_closing_time": state["past_closing"],
            "can_open": state["within_hours"],
            "can_sell": False,
            "can_close": False,
        }

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
        "schedule": schedule,
        "within_operating_hours": state["within_hours"],
        "past_closing_time": state["past_closing"],
        "can_open": False,
        "can_sell": state["within_hours"],
        "can_close": (not schedule) or state["past_closing"],
    }


def open_session(business_id: str, user_id: str, opening_amount: Decimal) -> dict:
    if get_open_session(business_id):
        raise ValueError("Ya existe una caja abierta. Ciérrala antes de abrir una nueva.")

    schedule = business_service.get_sales_schedule(business_id)
    if schedule and not _schedule_state(schedule)["within_hours"]:
        raise ValueError("Fuera de horario de ventas.")

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

    schedule = business_service.get_sales_schedule(business_id)
    if schedule and not _schedule_state(schedule)["past_closing"]:
        raise ValueError(
            f"Aún no puedes cerrar la caja: el negocio cierra a las {schedule['closing_time']}."
        )

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
