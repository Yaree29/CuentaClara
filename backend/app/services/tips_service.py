# =============================================================================
# tips_service.py
# ----------------
# Lógica de negocio del módulo /tips: registrar propinas (distribución
# automática entre asistentes activos, o manual con montos por asistente que
# deben sumar el total — ya validado en TipCreate) y reportes agregados.
# =============================================================================
from decimal import Decimal, ROUND_HALF_UP
from collections import defaultdict

from app.database import supabase_admin


def _active_assistants(business_id: str) -> list:
    result = supabase_admin.table("business_assistants")\
        .select("id, name")\
        .eq("business_id", business_id)\
        .eq("is_blocked", False)\
        .order("name")\
        .execute()
    return result.data or []


def _split_evenly(amount: Decimal, count: int) -> list:
    """Divide `amount` entre `count` partes de a centavo, sin perder residuo
    por redondeo (el último asistente absorbe el remanente)."""
    base = (amount / count).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    shares = [base] * count
    remainder = amount - (base * count)
    shares[-1] += remainder
    return shares


def create_tip(business_id: str, data) -> dict:
    amount = Decimal(str(data.amount))

    if data.distribution_type == "automatic":
        assistants = _active_assistants(business_id)
        if not assistants:
            raise ValueError("No hay asistentes activos para distribuir la propina automáticamente")
        shares = _split_evenly(amount, len(assistants))
        distribution_rows = [
            {"assistant_id": a["id"], "assistant_name": a["name"], "amount": float(share)}
            for a, share in zip(assistants, shares)
        ]
    else:
        # Manual: ya validado en el modelo que la suma == amount. Se resuelve
        # el nombre de cada asistente para el snapshot (igual que invoices.assistant_name).
        assistant_ids = [d.assistant_id for d in data.distributions]
        assistants = supabase_admin.table("business_assistants")\
            .select("id, name")\
            .eq("business_id", business_id)\
            .in_("id", assistant_ids)\
            .execute()
        name_by_id = {a["id"]: a["name"] for a in (assistants.data or [])}

        missing = [aid for aid in assistant_ids if aid not in name_by_id]
        if missing:
            raise ValueError(f"Asistente(s) no encontrados para este negocio: {missing}")

        distribution_rows = [
            {"assistant_id": d.assistant_id, "assistant_name": name_by_id[d.assistant_id], "amount": float(d.amount)}
            for d in data.distributions
        ]

    tip = supabase_admin.table("tips").insert({
        "business_id": business_id,
        "amount": float(amount),
        "distribution_type": data.distribution_type,
    }).execute()
    tip_id = tip.data[0]["id"]

    for row in distribution_rows:
        row["tip_id"] = tip_id
    supabase_admin.table("tip_distributions").insert(distribution_rows).execute()

    return {
        "id": tip_id,
        "amount": float(amount),
        "distribution_type": data.distribution_type,
        "created_at": tip.data[0]["created_at"],
        "distributions": distribution_rows,
    }


def list_tips(business_id: str, limit: int = 50) -> list:
    tips = supabase_admin.table("tips")\
        .select("id, amount, distribution_type, created_at")\
        .eq("business_id", business_id)\
        .order("created_at", desc=True)\
        .limit(limit)\
        .execute()
    tips_data = tips.data or []
    if not tips_data:
        return []

    tip_ids = [t["id"] for t in tips_data]
    distributions = supabase_admin.table("tip_distributions")\
        .select("tip_id, assistant_id, assistant_name, amount")\
        .in_("tip_id", tip_ids)\
        .execute()

    dist_by_tip = defaultdict(list)
    for d in (distributions.data or []):
        dist_by_tip[d["tip_id"]].append({
            "assistant_id": d["assistant_id"],
            "assistant_name": d["assistant_name"],
            "amount": float(d["amount"]),
        })

    return [
        {
            "id": t["id"],
            "amount": float(t["amount"]),
            "distribution_type": t["distribution_type"],
            "created_at": t["created_at"],
            "distributions": dist_by_tip.get(t["id"], []),
        }
        for t in tips_data
    ]


def get_summary(business_id: str, date_from: str, date_to: str) -> dict:
    tips = supabase_admin.table("tips")\
        .select("amount, created_at")\
        .eq("business_id", business_id)\
        .gte("created_at", date_from)\
        .lte("created_at", date_to)\
        .execute()
    rows = tips.data or []
    total = sum((Decimal(str(t["amount"])) for t in rows), Decimal("0"))
    return {
        "period": {"from": date_from, "to": date_to},
        "total": float(total),
        "count": len(rows),
    }


def get_monthly_summary(business_id: str, year: int) -> list:
    """Resumen mensual (1-12) del año dado, agregado en memoria — no hay
    agregación por mes disponible en el cliente de Supabase usado aquí."""
    tips = supabase_admin.table("tips")\
        .select("amount, created_at")\
        .eq("business_id", business_id)\
        .gte("created_at", f"{year}-01-01")\
        .lte("created_at", f"{year}-12-31T23:59:59")\
        .execute()

    totals = defaultdict(lambda: Decimal("0"))
    counts = defaultdict(int)
    for t in (tips.data or []):
        month = int(t["created_at"][5:7])
        totals[month] += Decimal(str(t["amount"]))
        counts[month] += 1

    return [
        {"month": m, "total": float(totals[m]), "count": counts[m]}
        for m in range(1, 13)
    ]
