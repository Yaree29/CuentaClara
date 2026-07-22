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
from app.services import notifications_service, cash_service
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from typing import Optional


# ═══════════════════════════════════════════════════════════════════════════════
#  HELPERS INTERNOS
# ═══════════════════════════════════════════════════════════════════════════════

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _current_cash_session_id(business_id: str) -> Optional[int]:
    """Id de la caja abierta, o None si no hay ninguna.

    Nunca lanza: reponer stock no puede fallar porque la caja esté cerrada.
    Si no hay sesión, el gasto se registra igual pero sin vincular.
    """
    try:
        session = cash_service.get_open_session(business_id)
        return session["id"] if session else None
    except Exception as e:
        print(f"[inventory] No se pudo leer la caja abierta: {e}")
        return None


def _register_stock_expense(
    business_id: str,
    user_id: str,
    quantity,
    cost_price,
    price,
    description: str,
) -> None:
    """Registra el gasto por mercancía que entró al inventario.

    Único lugar donde se decide CUÁNTO vale ese gasto. Antes había dos
    criterios distintos conviviendo: la creación de producto multiplicaba por
    el PRECIO DE VENTA (inflando el gasto — 90 peras a $99 de venta figuraban
    como $8910 gastados) y la reposición por el costo. El gasto es lo que salió
    de caja, así que manda el costo.

    Si el producto no tiene costo cargado se cae al precio como única
    referencia y se deja constancia en el log: es preferible un gasto estimado
    de más a que la compra no quede registrada, que es lo que pedía el usuario.
    """
    qty = Decimal(str(quantity or 0))
    if qty <= 0:
        return

    unit_cost = Decimal(str(cost_price or 0))

    if unit_cost <= 0:
        unit_cost = Decimal(str(price or 0))
        print(
            f"[inventory] '{description}': producto sin costo cargado, "
            f"el gasto se estima con el precio de venta (${float(unit_cost):.2f}/u)."
        )

    amount = float(qty * unit_cost)

    supabase_admin.table("expenses").insert({
        "business_id": business_id,
        "amount": amount,
        "description": description,
        # Sin cash_session_id el gasto no aparece en el Registro de Ventas
        # de la sesión; queda solo en los reportes por fecha.
        "cash_session_id": _current_cash_session_id(business_id),
        "user_id": user_id,
        "created_at": _now_iso(),
    }).execute()


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
        "cost_price": product.get("cost_price"),
        "unit_type": product.get("unit_type"),
        "category": cat.get("name"),
        "category_color": cat.get("color"),
        "stock": stock,
        "unit": inv_row.get("unit") or product.get("unit_type"),
        "min_stock": float(min_stock),
        "is_low_stock": is_low,
        "updated_at": inv_row.get("updated_at"),
        "expiration_date": product.get("expiration_date"),
        "is_ingredient_only": bool(product.get("is_ingredient_only")),
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
        .select("id, name, sku, price, cost_price, unit_type, is_active, category_id, expiration_date, is_ingredient_only") \
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
                "cost_price": prod.get("cost_price"),
                "unit_type": prod.get("unit_type"),
                "is_active": prod.get("is_active"),
                "expiration_date": prod.get("expiration_date"),
                "is_ingredient_only": prod.get("is_ingredient_only"),
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

    # Snapshot del nombre del asistente al momento de la creación (igual que
    # sales_service.create_quick_sale con invoices.assistant_name) — sobrevive
    # aunque el asistente se elimine después (assistant_id queda en NULL por
    # ON DELETE SET NULL, pero el nombre ya quedó fijado aquí).
    assistant_name = None
    if data.assistant_id is not None:
        assistant = supabase_admin.table("business_assistants")\
            .select("name")\
            .eq("id", data.assistant_id)\
            .eq("business_id", business_id)\
            .execute()
        if assistant.data:
            assistant_name = assistant.data[0]["name"]

    # 1. Insertar en products
    product_payload = {
        "business_id": business_id,
        "category_id": category_id,
        "name": data.name,
        "sku": data.sku or None,
        "price": float(data.price),
        "cost_price": float(data.cost_price) if data.cost_price is not None else 0,
        "unit_type": data.unit_type or None,
        "is_active": True,
        "expiration_date": data.expiration_date.isoformat() if data.expiration_date else None,
        "assistant_id": data.assistant_id,
        "assistant_name": assistant_name,
        "is_ingredient_only": bool(getattr(data, "is_ingredient_only", False)),
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
            _register_stock_expense(
                business_id=business_id,
                user_id=user_id,
                quantity=data.initial_stock,
                cost_price=getattr(data, "cost_price", None),
                price=data.price,
                description=f"Compra inicial stock: {data.name}",
            )

    stock = inv.get("quantity")
    min_stock = Decimal(str(inv.get("min_stock") or 0))
    is_low = (stock is not None) and (Decimal(str(stock)) <= min_stock) and (min_stock > 0)

    # Notificar al dueño si el producto lo creó un asistente (Modo Asistente).
    if data.assistant_id is not None:
        notifications_service.notify_owner_of_assistant_action(
            business_id,
            "inventory",
            f'{assistant_name or "Un asistente"} agregó el producto "{data.name}".'
        )

    return {
        "id": product_id,
        "name": product["name"],
        "sku": product.get("sku"),
        "price": product["price"],
        "cost_price": product.get("cost_price"),
        "unit_type": product.get("unit_type"),
        "category": data.category_name,
        "category_color": "#6366f1",
        "stock": stock,
        "unit": inv.get("unit"),
        "min_stock": float(min_stock),
        "is_low_stock": is_low,
        "updated_at": inv.get("updated_at"),
        "expiration_date": product.get("expiration_date"),
        "is_ingredient_only": bool(product.get("is_ingredient_only")),
    }


def update_product(business_id: str, product_id: int, data, user_id: str = None) -> dict:
    """
    Actualiza nombre/precio/categoría del producto y stock/min_stock del inventario.
    Solo actualiza los campos que vengan en el payload (patch semántico).

    Si el stock SUBE, se registra el movimiento de entrada correspondiente y,
    cuando data.purchase_type == "use_gains", también el gasto en caja.
    """
    # Estado previo del producto: hace falta el nombre y el costo para poder
    # describir y valorar el gasto si esta edición suma mercancía.
    current = supabase_admin.table("products") \
        .select("id, name, price, cost_price") \
        .eq("id", product_id) \
        .eq("business_id", business_id) \
        .execute()

    if not current.data:
        raise ValueError(f"Producto {product_id} no encontrado o no pertenece al negocio.")

    current_product = current.data[0]

    # Construir payload de producto solo con campos presentes
    product_payload = {}
    if data.name is not None:
        product_payload["name"] = data.name
    if data.price is not None:
        product_payload["price"] = float(data.price)
    if data.cost_price is not None:
        product_payload["cost_price"] = float(data.cost_price)
    if data.category_name is not None:
        product_payload["category_id"] = _get_or_create_category(business_id, data.category_name)
    if data.sku is not None:
        product_payload["sku"] = data.sku
    if data.unit_type is not None:
        product_payload["unit_type"] = data.unit_type
    if data.expiration_date is not None:
        product_payload["expiration_date"] = data.expiration_date.isoformat()
    if data.is_ingredient_only is not None:
        product_payload["is_ingredient_only"] = data.is_ingredient_only

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

    # Cuánto stock había antes, para saber si esta edición SUMA mercancía.
    previous_qty = None
    if existing_inv.data:
        prev_raw = existing_inv.data[0].get("quantity")
        previous_qty = Decimal(str(prev_raw)) if prev_raw is not None else None

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

    # ── Entró mercancía al editar el producto ────────────────────────────────
    # Antes, subir "Cant. Disponible" pisaba quantity en silencio: no quedaba
    # movimiento (no aparecía en Actividades Recientes) ni gasto, aunque el
    # dueño hubiera pagado esa mercancía de su bolsillo.
    if data.stock is not None and previous_qty is not None:
        added = Decimal(str(data.stock)) - previous_qty

        if added > 0:
            bought_with_gains = data.purchase_type == "use_gains"
            reason = "purchase" if bought_with_gains else "manual"

            supabase_admin.table("inventory_movements").insert({
                "business_id": business_id,
                "product_id": product_id,
                "type": "in" if bought_with_gains else "adjust",
                "quantity": float(added),
                "reason": reason,
                "user_id": user_id,
                "created_at": _now_iso(),
            }).execute()

            if bought_with_gains:
                # El costo puede venir en esta misma edición o estar ya cargado
                # en el producto. Antes se descartaba el gasto cuando daba 0
                # (producto con costo 0.00): la compra desaparecía sin aviso.
                cost = data.cost_price if data.cost_price is not None else current_product.get("cost_price")

                _register_stock_expense(
                    business_id=business_id,
                    user_id=user_id,
                    quantity=added,
                    cost_price=cost,
                    price=data.price if data.price is not None else current_product.get("price"),
                    description=f"Reposición de stock: {current_product.get('name') or 'producto'}",
                )

    stock = inv.get("quantity")
    min_stock = Decimal(str(inv.get("min_stock") or 0))
    is_low = (stock is not None) and (Decimal(str(stock)) <= min_stock) and (min_stock > 0)

    # Re-fetch producto para devolver datos actualizados
    prod = supabase_admin.table("products") \
        .select("id, name, sku, price, cost_price, unit_type, expiration_date, is_ingredient_only") \
        .eq("id", product_id) \
        .execute()
    product = prod.data[0] if prod.data else {}

    return {
        "id": product_id,
        "name": product.get("name"),
        "sku": product.get("sku"),
        "price": product.get("price"),
        "cost_price": product.get("cost_price"),
        "unit_type": product.get("unit_type"),
        "category": data.category_name,
        "stock": stock,
        "min_stock": float(min_stock),
        "is_low_stock": is_low,
        "updated_at": inv.get("updated_at"),
        "expiration_date": product.get("expiration_date"),
        "is_ingredient_only": bool(product.get("is_ingredient_only")),
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
      - purchase   → type='in',  reason='purchase'    (llegó mercancía)
      - waste      → type='out', reason='waste'       (producto dañado/vencido)
      - manual     → type='adjust'                    (conteo físico)
      - return     → type='in',  reason='return'      (devolución de cliente)
      - production → type='out', reason='production'  (consumo de insumo al producir una receta)

    Actualiza la columna quantity en inventory.
    Valida que el stock resultante no sea negativo.

    Si reason='purchase' y viene unit_cost (StockAdjustRequest.unit_cost),
    también actualiza products.cost_price con ese valor — es el costo más
    reciente conocido del producto. Misma columna que ya leen
    recipes_service.py (costo de insumos) e invoice_service.get_profitability
    (margen real por venta); no se duplica el dato en otro campo.
    """
    REASON_TO_TYPE = {
        "purchase":   "in",
        "return":     "in",
        "waste":      "out",
        "manual":     "adjust",
        "production": "out",
    }

    quantity = Decimal(str(data.quantity))
    mov_type = REASON_TO_TYPE[data.reason]

    # Nombre del asistente solo para el mensaje de notificación — no se
    # persiste en inventory_movements (esa tabla no tiene assistant_id; sin
    # llamadores desde el frontend hoy, se deja fuera de la migración).
    assistant_name = None
    if data.assistant_id is not None:
        assistant = supabase_admin.table("business_assistants")\
            .select("name")\
            .eq("id", data.assistant_id)\
            .eq("business_id", business_id)\
            .execute()
        if assistant.data:
            assistant_name = assistant.data[0]["name"]

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

    # Compra con costo real -> actualiza products.cost_price (el más reciente
    # conocido, reemplaza el anterior). Sin esto, un producto podía comprarse
    # una y otra vez con costo real conocido y products.cost_price se quedaba
    # en 0/desactualizado para siempre — recetas y márgenes reales dependen
    # de esta misma columna.
    if data.reason == "purchase" and getattr(data, "unit_cost", None) is not None:
        supabase_admin.table("products") \
            .update({"cost_price": float(data.unit_cost)}) \
            .eq("id", data.product_id) \
            .eq("business_id", business_id) \
            .execute()

    is_low = (new_qty is not None) and (new_qty <= min_stock) and (min_stock > 0)

    # Notificar al dueño si el ajuste lo hizo un asistente (Modo Asistente).
    if data.assistant_id is not None:
        verb = {"in": "agregó", "out": "descontó", "adjust": "ajustó"}[mov_type]
        notifications_service.notify_owner_of_assistant_action(
            business_id,
            "inventory",
            f"{assistant_name or 'Un asistente'} {verb} stock del producto {data.product_id} ({data.reason})."
        )

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


def get_predictive_stock(business_id: str, threshold_days: int = 7) -> list:
    """
    Heurística simple de quiebre de stock: para cada producto con stock
    controlado (quantity != NULL), suma las salidas por venta
    (inventory_movements.reason='sale') de los últimos 30 días, calcula el
    consumo promedio diario (total / 30) y estima en cuántos días se agotará
    el stock actual (current_stock / consumo_promedio_diario).

    Si no hubo ventas en los últimos 30 días (consumo = 0), no se puede
    dividir por cero y no hay urgencia real que estimar — esos productos se
    excluyen del resultado en vez de forzar una división.

    Devuelve solo los productos con estimated_days <= threshold_days,
    ordenados de menor a mayor urgencia (menos días primero).
    """
    products_result = supabase_admin.table("products") \
        .select("id, name") \
        .eq("business_id", business_id) \
        .eq("is_active", True) \
        .execute()
    products_rows = products_result.data or []
    if not products_rows:
        return []

    product_ids = [p["id"] for p in products_rows]
    product_name_by_id = {p["id"]: p["name"] for p in products_rows}

    inv_result = supabase_admin.table("inventory") \
        .select("product_id, quantity, unit") \
        .eq("business_id", business_id) \
        .in_("product_id", product_ids) \
        .execute()
    # Un producto puede tener varias filas de inventario histórico; nos
    # quedamos con la última leída (mismo criterio que list_products).
    stock_by_pid = {}
    unit_by_pid = {}
    for row in (inv_result.data or []):
        pid = row.get("product_id")
        if pid is not None and pid not in stock_by_pid:
            stock_by_pid[pid] = row.get("quantity")
            unit_by_pid[pid] = row.get("unit")

    since = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    movements_result = supabase_admin.table("inventory_movements") \
        .select("product_id, quantity") \
        .eq("business_id", business_id) \
        .eq("reason", "sale") \
        .in_("product_id", product_ids) \
        .gte("created_at", since) \
        .execute()

    sold_qty_by_pid = {}
    for mov in (movements_result.data or []):
        pid = mov.get("product_id")
        if pid is None:
            continue
        sold_qty_by_pid[pid] = sold_qty_by_pid.get(pid, Decimal("0")) + Decimal(str(mov.get("quantity") or 0))

    predictions = []
    for pid in product_ids:
        current_stock = stock_by_pid.get(pid)
        if current_stock is None:
            # Servicio / stock ilimitado — no aplica proyección.
            continue
        current_stock = Decimal(str(current_stock))

        total_sold = sold_qty_by_pid.get(pid, Decimal("0"))
        avg_daily_consumption = total_sold / Decimal("30")

        if avg_daily_consumption <= 0:
            # Sin ventas registradas en 30 días: no hay consumo con qué
            # proyectar un quiebre, se excluye en vez de forzar una división.
            continue

        estimated_days = float(current_stock / avg_daily_consumption)
        if estimated_days <= threshold_days:
            predictions.append({
                "product_id": pid,
                "product_name": product_name_by_id.get(pid, ""),
                "current_stock": float(current_stock),
                "unit": unit_by_pid.get(pid),
                "avg_daily_consumption": float(avg_daily_consumption),
                "estimated_days": round(estimated_days, 1),
            })

    return sorted(predictions, key=lambda x: x["estimated_days"])


def list_low_stock(business_id: str) -> list:
    """Devuelve los productos cuyo stock actual <= min_stock (alertas).

    Igual que list_products, NO se usa el embebido `products(...)` desde
    `inventory`: el SDK 1.2.0 lo devuelve vacío cuando la relación no está
    cacheada, y entonces las alertas salían sin nombre de producto (la tarjeta
    del dashboard mostraba solo "Quedan 2", sin decir de qué). Se hacen dos
    consultas y se arma el join en memoria.
    """
    inv_result = supabase_admin.table("inventory") \
        .select("id, product_id, quantity, min_stock, unit") \
        .eq("business_id", business_id) \
        .execute()

    inv_rows = inv_result.data or []
    if not inv_rows:
        return []

    product_ids = [r["product_id"] for r in inv_rows if r.get("product_id") is not None]
    if not product_ids:
        return []

    products_result = supabase_admin.table("products") \
        .select("id, name, sku, is_active") \
        .eq("business_id", business_id) \
        .in_("id", product_ids) \
        .execute()

    products_by_id = {p["id"]: p for p in (products_result.data or [])}

    alerts = []
    for row in inv_rows:
        product = products_by_id.get(row.get("product_id"))

        # Sin producto (borrado o de otro negocio) no hay nada que reponer.
        # Antes esta fila pasaba igual y generaba una alerta sin nombre.
        if not product:
            continue
        if not product.get("is_active", True):
            continue
        qty = row.get("quantity")
        min_s = Decimal(str(row.get("min_stock") or 0))

        if qty is None:
            # quantity NULL = servicio sin stock que controlar
            continue

        qty_dec = Decimal(str(qty))

        # Dos motivos para alertar:
        #   1. Está por debajo del mínimo configurado (requiere min_stock > 0).
        #   2. Está agotado. Un producto en cero hay que reponerlo SIEMPRE,
        #      haya configurado o no un stock mínimo. Antes se exigía
        #      min_stock > 0 para todo, así que los negocios que nunca llenaron
        #      ese campo (queda en 0 por defecto) no recibían ni una alerta.
        below_min = min_s > 0 and qty_dec <= min_s
        out_of_stock = qty_dec <= 0

        if below_min or out_of_stock:
            alerts.append({
                "product_id": product.get("id"),
                "product_name": product.get("name"),
                "sku": product.get("sku"),
                "current_stock": float(qty),
                "min_stock": float(min_s),
                "unit": row.get("unit"),
                "deficit": float(min_s - Decimal(str(qty))),
            })

    # Agotados primero (son los más urgentes, y su déficit puede ser 0 si el
    # producto no tenía mínimo configurado); dentro de cada grupo, mayor
    # déficit primero.
    return sorted(alerts, key=lambda x: (x["current_stock"] > 0, -x["deficit"]))


# ═══════════════════════════════════════════════════════════════════════════════
#  CONFIGURACIÓN INTERNA DE INVENTARIO (business_inventory_config)
# ═══════════════════════════════════════════════════════════════════════════════

INVENTORY_CONFIG_FLAGS = [
    "control_peso", "caducidad", "mermas", "recetas", "produccion", "escaner", "stock_predictivo"
]


def get_inventory_config(business_id: str) -> dict:
    """Devuelve los flags de configuración de inventario del negocio.

    Negocios registrados antes de esta migración pueden no tener fila propia
    todavía — en ese caso se devuelven todos los flags en False en vez de 404,
    ya que "sin configurar" equivale a "nada activado".
    """
    result = supabase_admin.table("business_inventory_config") \
        .select("business_id, " + ", ".join(INVENTORY_CONFIG_FLAGS)) \
        .eq("business_id", business_id) \
        .execute()

    if result.data:
        return result.data[0]

    return {"business_id": business_id, **{flag: False for flag in INVENTORY_CONFIG_FLAGS}}


def update_inventory_config(business_id: str, data) -> dict:
    """Actualiza parcialmente los flags de configuración de inventario.

    Solo se envían los campos que cambian (patch semántico, mismo patrón que
    update_assistant en assistants_service.py). Usa upsert porque negocios
    registrados antes de esta migración pueden no tener fila todavía.
    """
    update_fields = {
        flag: getattr(data, flag)
        for flag in INVENTORY_CONFIG_FLAGS
        if getattr(data, flag) is not None
    }

    if not update_fields:
        raise ValueError("No se proporcionaron campos para actualizar")

    supabase_admin.table("business_inventory_config") \
        .upsert({"business_id": business_id, **update_fields}, on_conflict="business_id") \
        .execute()

    return get_inventory_config(business_id)
