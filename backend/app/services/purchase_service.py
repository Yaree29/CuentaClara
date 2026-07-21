# =============================================================================
# CREADO: 2026-07-07
# Propósito: Lógica de negocio para el módulo de compras (PYME). Maneja
#            proveedores y órdenes de compra. El inventario SOLO se actualiza
#            al recibir la orden (status draft -> received), nunca al
#            crearla — para eso se reutiliza inventory_service.adjust_stock
#            (reason="purchase") en vez de duplicar la lógica de incremento
#            de stock que ya existe para el módulo Informal.
#            Todas las operaciones son multi-tenant: siempre filtran por
#            business_id.
# =============================================================================
from app.database import supabase_admin
from app.services import inventory_service
from datetime import datetime
from decimal import Decimal
from types import SimpleNamespace


# ── Proveedores ──────────────────────────────────────────────────────────────

def list_suppliers(business_id: str) -> list:
    result = supabase_admin.table("suppliers")\
        .select("id, business_id, name, phone, email, tax_id, notes, is_active")\
        .eq("business_id", business_id)\
        .eq("is_active", True)\
        .order("name")\
        .execute()
    return result.data or []


def create_supplier(business_id: str, data) -> dict:
    if not data.name or not data.name.strip():
        raise ValueError("El nombre del proveedor es requerido")

    payload = {
        "business_id": business_id,
        "name": data.name.strip(),
        "phone": data.phone.strip() if data.phone else None,
        "email": data.email.strip() if data.email else None,
        "tax_id": data.tax_id.strip() if data.tax_id else None,
        "notes": data.notes.strip() if data.notes else None,
        "is_active": True,
    }
    result = supabase_admin.table("suppliers").insert(payload).execute()
    if not result.data:
        raise ValueError("No se pudo crear el proveedor")
    return result.data[0]


def update_supplier(business_id: str, supplier_id: int, data) -> dict:
    existing = supabase_admin.table("suppliers")\
        .select("id, business_id")\
        .eq("id", supplier_id)\
        .eq("business_id", business_id)\
        .execute()
    if not existing.data:
        raise ValueError("Proveedor no encontrado")

    payload = {}
    if data.name is not None:
        if not data.name.strip():
            raise ValueError("El nombre del proveedor no puede estar vacío")
        payload["name"] = data.name.strip()
    if data.phone is not None:
        payload["phone"] = data.phone.strip() if data.phone.strip() else None
    if data.email is not None:
        payload["email"] = data.email.strip() if data.email.strip() else None
    if data.tax_id is not None:
        payload["tax_id"] = data.tax_id.strip() if data.tax_id.strip() else None
    if data.notes is not None:
        payload["notes"] = data.notes.strip() if data.notes.strip() else None

    if not payload:
        raise ValueError("No se proporcionaron campos para actualizar")

    result = supabase_admin.table("suppliers")\
        .update(payload)\
        .eq("id", supplier_id)\
        .eq("business_id", business_id)\
        .execute()
    if not result.data:
        raise ValueError("No se pudo actualizar el proveedor")
    return result.data[0]


# ── Órdenes de compra ────────────────────────────────────────────────────────

def _attach_supplier_name(row: dict) -> dict:
    supplier = row.pop("suppliers", None)
    row["supplier_name"] = supplier["name"] if supplier else None
    return row


def list_purchase_orders(business_id: str, status: str = None) -> list:
    query = supabase_admin.table("purchase_orders")\
        .select("id, business_id, supplier_id, total, status, ordered_at, received_at, suppliers(name)")\
        .eq("business_id", business_id)

    if status:
        query = query.eq("status", status)

    result = query.order("ordered_at", desc=True).execute()
    return [_attach_supplier_name(row) for row in (result.data or [])]


def get_purchase_order(business_id: str, purchase_order_id: int) -> dict:
    po_result = supabase_admin.table("purchase_orders")\
        .select("id, business_id, supplier_id, total, status, ordered_at, received_at, suppliers(name)")\
        .eq("id", purchase_order_id)\
        .eq("business_id", business_id)\
        .execute()
    if not po_result.data:
        raise ValueError("Orden de compra no encontrada")

    po = _attach_supplier_name(po_result.data[0])

    items_result = supabase_admin.table("purchase_items")\
        .select("id, product_id, quantity, unit_cost, subtotal, products(name)")\
        .eq("purchase_order_id", purchase_order_id)\
        .execute()

    items = []
    for item in (items_result.data or []):
        product = item.pop("products", None)
        item["product_name"] = product["name"] if product else None
        items.append(item)

    po["items"] = items
    return po


def create_purchase_order(business_id: str, user_id: str, data) -> dict:
    if not data.items:
        raise ValueError("La orden de compra debe tener al menos un producto")

    if data.supplier_id is not None:
        supplier = supabase_admin.table("suppliers")\
            .select("id, is_active")\
            .eq("id", data.supplier_id)\
            .eq("business_id", business_id)\
            .execute()
        if not supplier.data:
            raise ValueError("Proveedor no encontrado o no pertenece a este negocio")
        if not supplier.data[0].get("is_active"):
            raise ValueError("No se puede ordenar a un proveedor inactivo")

    total = Decimal("0")
    items_data = []
    for item in data.items:
        subtotal = Decimal(str(item.quantity)) * Decimal(str(item.unit_cost))
        total += subtotal
        items_data.append({
            "product_id": item.product_id,
            "quantity": float(item.quantity),
            "unit_cost": float(item.unit_cost),
            "subtotal": float(subtotal),
        })

    po_result = supabase_admin.table("purchase_orders").insert({
        "business_id": business_id,
        "supplier_id": data.supplier_id,
        "total": float(total),
        "status": "draft",
        "user_id": user_id,
        "ordered_at": datetime.utcnow().isoformat(),
    }).execute()

    if not po_result.data:
        raise ValueError("No se pudo crear la orden de compra")

    purchase_order_id = po_result.data[0]["id"]

    for item in items_data:
        item["purchase_order_id"] = purchase_order_id
        supabase_admin.table("purchase_items").insert(item).execute()

    return get_purchase_order(business_id, purchase_order_id)


def receive_purchase_order(business_id: str, user_id: str, purchase_order_id: int) -> dict:
    po_result = supabase_admin.table("purchase_orders")\
        .select("id, status")\
        .eq("id", purchase_order_id)\
        .eq("business_id", business_id)\
        .execute()
    if not po_result.data:
        raise ValueError("Orden de compra no encontrada")
    if po_result.data[0]["status"] != "draft":
        raise ValueError(f"Solo se pueden recibir órdenes en estado 'draft' (actual: {po_result.data[0]['status']})")

    items_result = supabase_admin.table("purchase_items")\
        .select("product_id, quantity")\
        .eq("purchase_order_id", purchase_order_id)\
        .execute()

    for item in (items_result.data or []):
        inventory_service.adjust_stock(
            business_id=business_id,
            user_id=user_id,
            data=SimpleNamespace(
                product_id=item["product_id"],
                quantity=Decimal(str(item["quantity"])),
                reason="purchase",
            ),
        )

    supabase_admin.table("purchase_orders")\
        .update({
            "status": "received",
            "received_at": datetime.utcnow().isoformat(),
        })\
        .eq("id", purchase_order_id)\
        .eq("business_id", business_id)\
        .execute()

    return get_purchase_order(business_id, purchase_order_id)


def cancel_purchase_order(business_id: str, purchase_order_id: int) -> dict:
    po_result = supabase_admin.table("purchase_orders")\
        .select("id, status")\
        .eq("id", purchase_order_id)\
        .eq("business_id", business_id)\
        .execute()
    if not po_result.data:
        raise ValueError("Orden de compra no encontrada")
    if po_result.data[0]["status"] != "draft":
        raise ValueError(f"Solo se pueden cancelar órdenes en estado 'draft' (actual: {po_result.data[0]['status']})")

    supabase_admin.table("purchase_orders")\
        .update({"status": "cancelled"})\
        .eq("id", purchase_order_id)\
        .eq("business_id", business_id)\
        .execute()

    return get_purchase_order(business_id, purchase_order_id)
