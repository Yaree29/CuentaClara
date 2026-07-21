"""
inventory_service.py
--------------------
Lógica de negocio para:
  - Gestión de categorías de productos
  - CRUD de productos + fila de inventario inicial
  - Movimientos de stock (compra/ajuste/pérdida/devolución)
  - Alertas de stock mínimo

Usa supabase_admin (service-role key) para operar sin restricciones de RLS,
dado que la autenticación ya fue validada en el router.
"""

from app.database import supabase_admin
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional


# ═══════════════════════════════════════════════════════════════════════════════
#  HELPERS INTERNOS
# ═══════════════════════════════════════════════════════════════════════════════

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _get_or_create_category(business_id: str, category_name: str) -> Optional[int]:
    """
    Busca la categoría por nombre (case-insensitive) dentro del negocio.
    Si no existe, la crea con color por defecto.
    Devuelve el id de la categoría, o None si category_name es vacío.
    """
    if not category_name or not category_name.strip():
        return None

    name = category_name.strip()

    # Buscar existente
    existing = supabase_admin.table("product_categories") \
        .select("id") \
        .eq("business_id", business_id) \
        .ilike("name", name) \
        .execute()

    if existing.data:
        return existing.data[0]["id"]

    # Crear nueva
    created = supabase_admin.table("product_categories") \
        .insert({"business_id": business_id, "name": name, "color": "#6366f1"}) \
        .execute()

    return created.data[0]["id"]


def _map_product(inv_row: dict) -> dict:
    """Convierte una fila de inventory+products+product_categories al formato de respuesta."""
    product = inv_row.get("products") or {}
    if isinstance(product, list):
        product = product[0] if product else {}

    cat = product.get("product_categories") or {}
    if isinstance(cat, list):
        cat = cat[0] if cat else {}

    stock = inv_row.get("quantity")
    min_stock = Decimal(str(inv_row.get("min_stock") or 0))
    is_low = (stock is not None) and (Decimal(str(stock)) <= min_stock) and (min_stock > 0)

    return {
        "id": product.get("id"),
        "name": product.get("name"),
        "sku": product.get("sku"),
        "price": product.get("price"),
        "unit_type": product.get("unit_type"),
        "category": cat.get("name"),
        "category_color": cat.get("color"),
        "stock": stock,
        "unit": inv_row.get("unit") or product.get("unit_type"),
        "min_stock": float(min_stock),
        "is_low_stock": is_low,
        "updated_at": inv_row.get("updated_at"),
    }


# ═══════════════════════════════════════════════════════════════════════════════
#  CATEGORÍAS
# ═══════════════════════════════════════════════════════════════════════════════

def list_categories(business_id: str) -> list:
    """Devuelve todas las categorías del negocio, ordenadas por nombre."""
    result = supabase_admin.table("product_categories") \
        .select("id, name, color, business_id") \
        .eq("business_id", business_id) \
        .order("name") \
        .execute()
    return result.data or []


def create_category(business_id: str, name: str) -> dict:
    """
    Crea una categoría nueva para el negocio.
    Si ya existe con el mismo nombre (case-insensitive), devuelve la existente
    con already_exists=True en vez de lanzar error.
    """
    name = name.strip()

    existing = supabase_admin.table("product_categories") \
        .select("id, name, color, business_id") \
        .eq("business_id", business_id) \
        .ilike("name", name) \
        .execute()

    if existing.data:
        return {**existing.data[0], "already_exists": True}

    created = supabase_admin.table("product_categories") \
        .insert({"business_id": business_id, "name": name, "color": "#6366f1"}) \
        .execute()

    return {**created.data[0], "already_exists": False}


# ═══════════════════════════════════════════════════════════════════════════════
#  PRODUCTOS
# ═══════════════════════════════════════════════════════════════════════════════

def list_products(business_id: str) -> list:
    """Devuelve todos los productos activos del negocio con su stock.

    Estrategia: como el embebido PostgREST `products(...)` desde `inventory`
    a veces devuelve None aunque el FK exista (problema conocido del SDK 1.2.0
    cuando la relación no está cacheada), hacemos dos consultas separadas y
    armamos el join en memoria. Esto garantiza que todo producto activo del
    negocio aparezca aunque su fila de inventario embebida venga vacía.
    """
    products_result = supabase_admin.table("products") \
        .select("id, name, sku, price, unit_type, is_active, category_id") \
        .eq("business_id", business_id) \
        .eq("is_active", True) \
        .execute()

    products_rows = products_result.data or []
    if not products_rows:
        return []

    product_ids = [p["id"] for p in products_rows]
    category_ids = list({p["category_id"] for p in products_rows if p.get("category_id")})

    # Inventario por producto (un negocio puede tener varias filas; tomamos la última)
    inv_result = supabase_admin.table("inventory") \
        .select("id, product_id, quantity, unit, min_stock, updated_at") \
        .eq("business_id", business_id) \
        .in_("product_id", product_ids) \
        .order("updated_at", desc=True) \
        .execute()

    inv_by_pid = {}
    for inv in (inv_result.data or []):
        pid = inv.get("product_id")
        if pid is not None and pid not in inv_by_pid:
            inv_by_pid[pid] = inv

    # Categorías (separadas para evitar embeds frágiles)
    cat_by_id = {}
    if category_ids:
        cat_result = supabase_admin.table("product_categories") \
            .select("id, name, color") \
            .in_("id", category_ids) \
            .execute()
        cat_by_id = {c["id"]: c for c in (cat_result.data or [])}

    items = []
    for prod in products_rows:
        inv = inv_by_pid.get(prod["id"], {}) or {}
        cat = cat_by_id.get(prod.get("category_id")) or {}
        items.append(_map_product({
            "id": inv.get("id"),
            "quantity": inv.get("quantity"),
            "unit": inv.get("unit"),
            "min_stock": inv.get("min_stock"),
            "updated_at": inv.get("updated_at"),
            "products": {
                "id": prod["id"],
                "name": prod.get("name"),
                "sku": prod.get("sku"),
                "price": prod.get("price"),
                "unit_type": prod.get("unit_type"),
                "is_active": prod.get("is_active"),
                "product_categories": cat,
            },
        }))

    # Ordenar por updated_at descendente (productos sin inventario van al final)
    items.sort(key=lambda x: x.get("updated_at") or "", reverse=True)
    return items


def create_product(business_id: str, user_id: str, data) -> dict:
    """
    Crea un producto y su fila de inventario en una sola operación.
    Si la categoría no existe, la crea automáticamente.
    Si falla la inserción del inventario, revierte el producto (rollback manual).
    """
    category_id = _get_or_create_category(business_id, data.category_name)

    # 1. Insertar en products
    product_payload = {
        "business_id": business_id,
        "category_id": category_id,
        "name": data.name,
        "sku": data.sku or None,
        "price": float(data.price),
        "unit_type": data.unit_type or None,
        "is_active": True,
    }
    product_result = supabase_admin.table("products") \
        .insert(product_payload) \
        .execute()

    if not product_result.data:
        raise ValueError("No se pudo crear el producto.")

    product = product_result.data[0]
    product_id = product["id"]

    # 2. Insertar en inventory
    inventory_payload = {
        "business_id": business_id,
        "product_id": product_id,
        "quantity": float(data.initial_stock) if data.initial_stock is not None else None,
        "unit": data.unit or data.unit_type or None,
        "min_stock": float(data.min_stock),
        "updated_at": _now_iso(),
    }
    inv_result = supabase_admin.table("inventory") \
        .insert(inventory_payload) \
        .execute()

    if not inv_result.data:
        # Rollback: eliminar el producto para evitar huérfanos
        supabase_admin.table("products") \
            .delete() \
            .eq("id", product_id) \
            .eq("business_id", business_id) \
            .execute()
        raise ValueError("No se pudo crear la fila de inventario.")

    inv = inv_result.data[0]

    # 3. Registrar movimiento de entrada inicial (solo si hay stock)
    if data.initial_stock is not None and data.initial_stock > 0:
        reason = "purchase" if getattr(data, "purchase_type", None) == "use_gains" else "manual"
        supabase_admin.table("inventory_movements").insert({
            "business_id": business_id,
            "product_id": product_id,
            "type": "in",
            "quantity": float(data.initial_stock),
            "reason": reason,
            "user_id": user_id,
            "created_at": _now_iso(),
        }).execute()

        # Si se compró con dinero de las ganancias, registrar gasto en caja
        if getattr(data, "purchase_type", None) == "use_gains":
            expense_amount = float(data.initial_stock) * float(data.price)
            supabase_admin.table("expenses").insert({
                "business_id": business_id,
                "amount": expense_amount,
                "description": f"Compra inicial stock: {data.name}",
                "user_id": user_id,
                "created_at": _now_iso(),
            }).execute()

    stock = inv.get("quantity")
    min_stock = Decimal(str(inv.get("min_stock") or 0))
    is_low = (stock is not None) and (Decimal(str(stock)) <= min_stock) and (min_stock > 0)

    return {
        "id": product_id,
        "name": product["name"],
        "sku": product.get("sku"),
        "price": product["price"],
        "unit_type": product.get("unit_type"),
        "category": data.category_name,
        "category_color": "#6366f1",
        "stock": stock,
        "unit": inv.get("unit"),
        "min_stock": float(min_stock),
        "is_low_stock": is_low,
        "updated_at": inv.get("updated_at"),
    }


def update_product(business_id: str, product_id: int, data) -> dict:
    """
    Actualiza nombre/precio/categoría del producto y stock/min_stock del inventario.
    Solo actualiza los campos que vengan en el payload (patch semántico).
    """
    # Construir payload de producto solo con campos presentes
    product_payload = {}
    if data.name is not None:
        product_payload["name"] = data.name
    if data.price is not None:
        product_payload["price"] = float(data.price)
    if data.category_name is not None:
        product_payload["category_id"] = _get_or_create_category(business_id, data.category_name)
    if data.sku is not None:
        product_payload["sku"] = data.sku
    if data.unit_type is not None:
        product_payload["unit_type"] = data.unit_type

    if product_payload:
        prod_result = supabase_admin.table("products") \
            .update(product_payload) \
            .eq("id", product_id) \
            .eq("business_id", business_id) \
            .execute()
        if not prod_result.data:
            raise ValueError(f"Producto {product_id} no encontrado o no pertenece al negocio.")

    # Construir payload de inventario
    inv_payload = {"updated_at": _now_iso()}
    if data.stock is not None:
        inv_payload["quantity"] = float(data.stock)
    if data.min_stock is not None:
        inv_payload["min_stock"] = float(data.min_stock)
    if data.unit is not None:
        inv_payload["unit"] = data.unit

    # SELECT inventario existente (sin UNIQUE en product_id, no se puede upsert)
    existing_inv = supabase_admin.table("inventory") \
        .select("id, quantity, min_stock") \
        .eq("product_id", product_id) \
        .eq("business_id", business_id) \
        .execute()

    if existing_inv.data:
        inv_id = existing_inv.data[0]["id"]
        inv_result = supabase_admin.table("inventory") \
            .update(inv_payload) \
            .eq("id", inv_id) \
            .execute()
        inv = inv_result.data[0] if inv_result.data else existing_inv.data[0]
    else:
        inv_payload.update({"business_id": business_id, "product_id": product_id})
        inv_result = supabase_admin.table("inventory").insert(inv_payload).execute()
        inv = inv_result.data[0]

    stock = inv.get("quantity")
    min_stock = Decimal(str(inv.get("min_stock") or 0))
    is_low = (stock is not None) and (Decimal(str(stock)) <= min_stock) and (min_stock > 0)

    # Re-fetch producto para devolver datos actualizados
    prod = supabase_admin.table("products") \
        .select("id, name, sku, price, unit_type") \
        .eq("id", product_id) \
        .execute()
    product = prod.data[0] if prod.data else {}

    return {
        "id": product_id,
        "name": product.get("name"),
        "sku": product.get("sku"),
        "price": product.get("price"),
        "unit_type": product.get("unit_type"),
        "category": data.category_name,
        "stock": stock,
        "min_stock": float(min_stock),
        "is_low_stock": is_low,
        "updated_at": inv.get("updated_at"),
    }


def soft_delete_product(business_id: str, product_id: int) -> dict:
    """Marca el producto como inactivo (soft delete) para preservar historial."""
    result = supabase_admin.table("products") \
        .update({"is_active": False}) \
        .eq("id", product_id) \
        .eq("business_id", business_id) \
        .execute()

    if not result.data:
        raise ValueError(f"Producto {product_id} no encontrado o no pertenece al negocio.")

    return {"product_id": product_id, "deleted": True}


# ═══════════════════════════════════════════════════════════════════════════════
#  MOVIMIENTOS DE INVENTARIO
# ═══════════════════════════════════════════════════════════════════════════════

def adjust_stock(business_id: str, user_id: str, data) -> dict:
    """
    Registra un movimiento de inventario manual:
      - purchase  → type='in',  reason='purchase'   (llegó mercancía)
      - waste     → type='out', reason='waste'       (producto dañado/vencido)
      - manual    → type='adjust'                    (conteo físico)
      - return    → type='in',  reason='return'      (devolución de cliente)

    Actualiza la columna quantity en inventory.
    Valida que el stock resultante no sea negativo.
    """
    REASON_TO_TYPE = {
        "purchase": "in",
        "return":   "in",
        "waste":    "out",
        "manual":   "adjust",
    }

    quantity = Decimal(str(data.quantity))
    mov_type = REASON_TO_TYPE[data.reason]

    # Fetch fila de inventario actual
    inv_result = supabase_admin.table("inventory") \
        .select("id, quantity, min_stock") \
        .eq("product_id", data.product_id) \
        .eq("business_id", business_id) \
        .execute()

    if not inv_result.data:
        raise ValueError(f"No existe fila de inventario para el producto {data.product_id}.")

    inv = inv_result.data[0]
    inv_id = inv["id"]
    current_qty = Decimal(str(inv["quantity"])) if inv["quantity"] is not None else None
    min_stock = Decimal(str(inv.get("min_stock") or 0))

    # Calcular nuevo stock según tipo de movimiento
    if current_qty is None:
        # Producto de stock ilimitado (servicio) — no se modifica
        new_qty = None
    elif mov_type == "in":
        new_qty = current_qty + quantity
    elif mov_type == "out":
        new_qty = current_qty - abs(quantity)
        if new_qty < 0:
            raise ValueError(
                f"Stock insuficiente. Actual: {current_qty}, requerido: {abs(quantity)}."
            )
    else:  # adjust
        # Para ajuste manual la quantity es el nuevo valor absoluto
        new_qty = abs(quantity)

    # Actualizar inventario
    update_payload = {"updated_at": _now_iso()}
    if new_qty is not None:
        update_payload["quantity"] = float(new_qty)

    supabase_admin.table("inventory") \
        .update(update_payload) \
        .eq("id", inv_id) \
        .execute()

    # Registrar movimiento
    mov_result = supabase_admin.table("inventory_movements").insert({
        "business_id": business_id,
        "product_id": data.product_id,
        "type": mov_type,
        "quantity": float(abs(quantity)),
        "reason": data.reason,
        "user_id": user_id,
        "created_at": _now_iso(),
    }).execute()

    movement_id = mov_result.data[0]["id"] if mov_result.data else -1

    is_low = (new_qty is not None) and (new_qty <= min_stock) and (min_stock > 0)

    return {
        "product_id": data.product_id,
        "previous_stock": float(current_qty) if current_qty is not None else None,
        "new_stock": float(new_qty) if new_qty is not None else None,
        "movement_id": movement_id,
        "is_low_stock": is_low,
        "min_stock": float(min_stock),
    }


def list_movements(business_id: str, limit: int = 50) -> list:
    """Devuelve los últimos movimientos de inventario del negocio ordenados por fecha desc."""
    result = supabase_admin.table("inventory_movements") \
        .select("id, product_id, type, quantity, reason, created_at") \
        .eq("business_id", business_id) \
        .order("created_at", desc=True) \
        .limit(limit) \
        .execute()

    rows = result.data or []
    if not rows:
        return []

    product_ids = list({r["product_id"] for r in rows if r.get("product_id")})
    prod_data_by_id = {}
    if product_ids:
        prod_result = supabase_admin.table("products") \
            .select("id, name, price") \
            .in_("id", product_ids) \
            .execute()
        prod_data_by_id = {p["id"]: {"name": p.get("name", ""), "price": p.get("price", 0)} for p in (prod_result.data or [])}

    return [
        {
            "id": r["id"],
            "product_id": r["product_id"],
            "product_name": prod_data_by_id.get(r["product_id"], {}).get("name", "Producto eliminado"),
            "product_price": float(prod_data_by_id.get(r["product_id"], {}).get("price", 0)),
            "type": r["type"],
            "quantity": float(r["quantity"]) if r["quantity"] is not None else 0,
            "reason": r["reason"],
            "created_at": r["created_at"],
        }
        for r in rows
    ]


def list_low_stock(business_id: str) -> list:
    """Devuelve los productos cuyo stock actual <= min_stock (alertas)."""
    result = supabase_admin.table("inventory") \
        .select("""
            id, quantity, min_stock,
            products ( id, name, sku, is_active )
        """) \
        .eq("business_id", business_id) \
        .execute()

    alerts = []
    for row in (result.data or []):
        product = row.get("products") or {}
        if isinstance(product, list):
            product = product[0] if product else {}
        if not product.get("is_active", True):
            continue
        qty = row.get("quantity")
        min_s = Decimal(str(row.get("min_stock") or 0))
        if qty is not None and min_s > 0 and Decimal(str(qty)) <= min_s:
            alerts.append({
                "product_id": product.get("id"),
                "product_name": product.get("name"),
                "sku": product.get("sku"),
                "current_stock": float(qty),
                "min_stock": float(min_s),
                "deficit": float(min_s - Decimal(str(qty))),
            })

    return sorted(alerts, key=lambda x: x["deficit"], reverse=True)
