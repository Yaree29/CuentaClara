# =============================================================================
# CREADO: 2026-05-26
# Propósito: Lógica de negocio para el módulo de crédito/fiado.
#            Maneja clientes del negocio, deudas abiertas y registro de abonos.
#            Todas las operaciones son multi-tenant: siempre filtran por
#            business_id para garantizar aislamiento entre negocios.
# =============================================================================
from app.database import supabase_admin
from datetime import datetime
from decimal import Decimal


# ── Clientes ──────────────────────────────────────────────────────────────────

def list_customers(business_id: str) -> list:
    result = supabase_admin.table("customers")\
        .select("id, business_id, name, phone, notes, is_active, created_at")\
        .eq("business_id", business_id)\
        .eq("is_active", True)\
        .order("name")\
        .execute()
    return result.data or []


def create_customer(business_id: str, data) -> dict:
    if not data.name or not data.name.strip():
        raise ValueError("El nombre del cliente es requerido")

    payload = {
        "business_id": business_id,
        "name": data.name.strip(),
        "phone": data.phone.strip() if data.phone else None,
        "notes": data.notes.strip() if data.notes else None,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    result = supabase_admin.table("customers").insert(payload).execute()
    if not result.data:
        raise ValueError("No se pudo crear el cliente")
    return result.data[0]


def update_customer(business_id: str, customer_id: int, data) -> dict:
    existing = supabase_admin.table("customers")\
        .select("id, business_id")\
        .eq("id", customer_id)\
        .eq("business_id", business_id)\
        .execute()
    if not existing.data:
        raise ValueError("Cliente no encontrado")

    payload = {"updated_at": datetime.utcnow().isoformat()}
    if data.name is not None:
        if not data.name.strip():
            raise ValueError("El nombre del cliente no puede estar vacío")
        payload["name"] = data.name.strip()
    if data.phone is not None:
        payload["phone"] = data.phone.strip() if data.phone.strip() else None
    if data.notes is not None:
        payload["notes"] = data.notes.strip() if data.notes.strip() else None

    result = supabase_admin.table("customers")\
        .update(payload)\
        .eq("id", customer_id)\
        .eq("business_id", business_id)\
        .execute()
    if not result.data:
        raise ValueError("No se pudo actualizar el cliente")
    return result.data[0]


# ── Deudas ────────────────────────────────────────────────────────────────────

def list_debts(business_id: str, status: str = None) -> list:
    query = supabase_admin.table("debts")\
        .select("id, business_id, customer_id, original_amount, remaining_amount, description, status, due_date, created_at, customers(name)")\
        .eq("business_id", business_id)

    if status:
        query = query.eq("status", status)
    else:
        # Por defecto excluir las totalmente pagadas y canceladas
        query = query.in_("status", ["pending", "partial", "overdue"])

    result = query.order("created_at", desc=True).execute()
    data = result.data or []

    # Aplanar customer.name al campo customer_name para simplificar el response
    for row in data:
        customer = row.pop("customers", None)
        row["customer_name"] = customer["name"] if customer else "Sin nombre"

    return data


def create_debt(business_id: str, user_id: str, data) -> dict:
    # Verificar que el cliente pertenece al negocio
    customer = supabase_admin.table("customers")\
        .select("id, name, is_active")\
        .eq("id", data.customer_id)\
        .eq("business_id", business_id)\
        .execute()

    if not customer.data:
        raise ValueError("Cliente no encontrado o no pertenece a este negocio")
    if not customer.data[0].get("is_active"):
        raise ValueError("No se puede crear deuda para un cliente inactivo")

    amount = float(data.amount)
    payload = {
        "business_id": business_id,
        "customer_id": data.customer_id,
        "invoice_id": data.invoice_id or None,
        "original_amount": amount,
        "remaining_amount": amount,
        "description": data.description.strip() if data.description else None,
        "status": "pending",
        "due_date": data.due_date or None,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    result = supabase_admin.table("debts").insert(payload).execute()
    if not result.data:
        raise ValueError("No se pudo registrar el fiado")

    row = result.data[0]
    row["customer_name"] = customer.data[0]["name"]
    return row


def update_debt(business_id: str, debt_id: int, data) -> dict:
    debt_result = supabase_admin.table("debts")\
        .select("id, business_id, customer_id, original_amount, remaining_amount, status")\
        .eq("id", debt_id)\
        .eq("business_id", business_id)\
        .execute()
    if not debt_result.data:
        raise ValueError("Deuda no encontrada")

    debt = debt_result.data[0]
    if debt["status"] in ("paid", "cancelled"):
        raise ValueError(f"No se puede editar una deuda en estado {debt['status']}")

    payload = {"updated_at": datetime.utcnow().isoformat()}

    if data.amount is not None:
        new_amount = float(data.amount)
        paid_so_far = float(debt["original_amount"]) - float(debt["remaining_amount"])
        if new_amount < paid_so_far:
            raise ValueError(
                f"El nuevo monto (${new_amount:.2f}) no puede ser menor a lo ya abonado "
                f"(${paid_so_far:.2f})"
            )
        new_remaining = new_amount - paid_so_far
        payload["original_amount"] = new_amount
        payload["remaining_amount"] = new_remaining
        # Si el nuevo remaining es 0 → status paid; si tenía abonos → partial; si no → pending
        if new_remaining == 0:
            payload["status"] = "paid"
            payload["paid_at"] = datetime.utcnow().isoformat()
        elif paid_so_far > 0:
            payload["status"] = "partial"
        else:
            payload["status"] = "pending"

    if data.description is not None:
        payload["description"] = data.description.strip() if data.description.strip() else None

    if data.due_date is not None:
        payload["due_date"] = data.due_date or None

    result = supabase_admin.table("debts")\
        .update(payload)\
        .eq("id", debt_id)\
        .eq("business_id", business_id)\
        .execute()
    if not result.data:
        raise ValueError("No se pudo actualizar la deuda")

    # Re-fetch con customer name para mantener consistencia con list_debts
    row = result.data[0]
    customer = supabase_admin.table("customers")\
        .select("name")\
        .eq("id", row["customer_id"])\
        .execute()
    row["customer_name"] = customer.data[0]["name"] if customer.data else "Sin nombre"
    return row


def cancel_debt(business_id: str, debt_id: int) -> dict:
    debt_result = supabase_admin.table("debts")\
        .select("id, status")\
        .eq("id", debt_id)\
        .eq("business_id", business_id)\
        .execute()
    if not debt_result.data:
        raise ValueError("Deuda no encontrada")

    if debt_result.data[0]["status"] == "cancelled":
        raise ValueError("La deuda ya está cancelada")

    result = supabase_admin.table("debts")\
        .update({
            "status": "cancelled",
            "updated_at": datetime.utcnow().isoformat(),
        })\
        .eq("id", debt_id)\
        .eq("business_id", business_id)\
        .execute()
    if not result.data:
        raise ValueError("No se pudo cancelar la deuda")
    return result.data[0]


# ── Abonos ────────────────────────────────────────────────────────────────────

def register_payment(business_id: str, user_id: str, debt_id: int, data) -> dict:
    # Cargar la deuda verificando multi-tenancy
    debt_result = supabase_admin.table("debts")\
        .select("id, business_id, remaining_amount, status")\
        .eq("id", debt_id)\
        .eq("business_id", business_id)\
        .execute()

    if not debt_result.data:
        raise ValueError("Deuda no encontrada")

    debt = debt_result.data[0]

    if debt["status"] in ("paid", "cancelled"):
        raise ValueError(f"La deuda ya está {debt['status']} y no acepta abonos")

    remaining = Decimal(str(debt["remaining_amount"]))
    payment_amount = Decimal(str(data.amount))

    if payment_amount > remaining:
        raise ValueError(
            f"El abono (${float(payment_amount):.2f}) supera el saldo pendiente "
            f"(${float(remaining):.2f})"
        )

    # Insertar abono
    payment_payload = {
        "debt_id": debt_id,
        "business_id": business_id,
        "amount": float(payment_amount),
        "method": data.method or "cash",
        "notes": data.notes.strip() if data.notes else None,
        "paid_at": datetime.utcnow().isoformat(),
        "user_id": user_id,
    }
    payment_result = supabase_admin.table("debt_payments").insert(payment_payload).execute()
    if not payment_result.data:
        raise ValueError("No se pudo registrar el abono")

    # Actualizar saldo y status de la deuda
    new_remaining = remaining - payment_amount
    if new_remaining == 0:
        new_status = "paid"
        paid_at = datetime.utcnow().isoformat()
    else:
        new_status = "partial"
        paid_at = None

    update_payload = {
        "remaining_amount": float(new_remaining),
        "status": new_status,
        "updated_at": datetime.utcnow().isoformat(),
    }
    if paid_at:
        update_payload["paid_at"] = paid_at

    supabase_admin.table("debts")\
        .update(update_payload)\
        .eq("id", debt_id)\
        .execute()

    payment_row = payment_result.data[0]
    return {
        "id": payment_row["id"],
        "debt_id": debt_id,
        "amount": float(payment_amount),
        "method": payment_row["method"],
        "notes": payment_row.get("notes"),
        "paid_at": payment_row["paid_at"],
        "remaining_amount": float(new_remaining),
        "debt_status": new_status,
    }
