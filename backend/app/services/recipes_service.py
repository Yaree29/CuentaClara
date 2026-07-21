# =============================================================================
# recipes_service.py
# -------------------
# Lógica de negocio del módulo /recipes (Recetas / Producción):
#   - CRUD de recetas + insumos (recipe_ingredients).
#   - Costo por receta calculado en tiempo real: Σ(cantidad × cost_price
#     actual del insumo). No se guarda estático salvo en production_records
#     al momento de producir (costo congelado).
#   - Producción: valida disponibilidad de TODOS los insumos antes de
#     confirmar (todo o nada, sin producción parcial), descuenta cada
#     insumo reutilizando inventory_service.adjust_stock (reason='production')
#     en vez de una función de ajuste de stock paralela.
#   - Historial de producción, consumo de insumos (derivado de
#     inventory_movements) y rentabilidad por receta (margen unitario;
#     sin vínculo a ventas reales todavía, se reporta como limitación).
# =============================================================================
from datetime import datetime, timezone
from decimal import Decimal

from app.database import supabase_admin
from app.services import inventory_service
from app.models.inventory import StockAdjustRequest


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _get_recipe_or_404(business_id: str, recipe_id: int) -> dict:
    result = supabase_admin.table("recipes") \
        .select("id, business_id, product_id, name, portions_yield, is_active, created_at") \
        .eq("id", recipe_id) \
        .eq("business_id", business_id) \
        .execute()
    if not result.data:
        raise ValueError("Receta no encontrada.")
    return result.data[0]


def _get_ingredients(recipe_id: int) -> list:
    result = supabase_admin.table("recipe_ingredients") \
        .select("id, ingredient_product_id, quantity, unit") \
        .eq("recipe_id", recipe_id) \
        .execute()
    return result.data or []


def _products_by_id(product_ids: list) -> dict:
    if not product_ids:
        return {}
    result = supabase_admin.table("products") \
        .select("id, name, price, cost_price, unit_type") \
        .in_("id", product_ids) \
        .execute()
    return {p["id"]: p for p in (result.data or [])}


def _recipe_cost(ingredients: list, products_by_id: dict):
    """Costo en tiempo real: Σ(cantidad_ingrediente × cost_price actual)."""
    total = Decimal("0")
    detail = []
    for ing in ingredients:
        product = products_by_id.get(ing["ingredient_product_id"], {})
        cost_price = Decimal(str(product.get("cost_price") or 0))
        quantity = Decimal(str(ing["quantity"]))
        subtotal = quantity * cost_price
        total += subtotal
        detail.append({
            "ingredient_product_id": ing["ingredient_product_id"],
            "ingredient_name": product.get("name"),
            "quantity": float(quantity),
            "unit": ing.get("unit"),
            "cost_price": float(cost_price),
            "subtotal": float(subtotal),
        })
    return total, detail


def _map_recipe(recipe: dict, ingredients: list, products_by_id: dict) -> dict:
    total_cost, ingredient_detail = _recipe_cost(ingredients, products_by_id)
    portions_yield = Decimal(str(recipe["portions_yield"]))
    cost_per_portion = total_cost / portions_yield if portions_yield > 0 else Decimal("0")
    final_product = products_by_id.get(recipe["product_id"], {})

    return {
        "id": recipe["id"],
        "product_id": recipe["product_id"],
        "product_name": final_product.get("name"),
        "product_price": final_product.get("price"),
        "name": recipe["name"],
        "portions_yield": float(portions_yield),
        "is_active": recipe.get("is_active", True),
        "ingredients": ingredient_detail,
        "total_cost": float(total_cost),
        "cost_per_portion": float(cost_per_portion),
        "created_at": recipe.get("created_at"),
    }


# ═══════════════════════════════════════════════════════════════════════════════
#  CRUD DE RECETAS
# ═══════════════════════════════════════════════════════════════════════════════

def create_recipe(business_id: str, data) -> dict:
    payload = {
        "business_id": business_id,
        "product_id": data.product_id,
        "name": data.name,
        "portions_yield": float(data.portions_yield),
        "is_active": True,
    }
    result = supabase_admin.table("recipes").insert(payload).execute()
    if not result.data:
        raise ValueError("No se pudo crear la receta.")
    recipe_id = result.data[0]["id"]

    ingredient_rows = [{
        "recipe_id": recipe_id,
        "ingredient_product_id": ing.ingredient_product_id,
        "quantity": float(ing.quantity),
        "unit": ing.unit,
    } for ing in data.ingredients]

    ing_result = supabase_admin.table("recipe_ingredients").insert(ingredient_rows).execute()
    if not ing_result.data:
        supabase_admin.table("recipes").delete().eq("id", recipe_id).execute()
        raise ValueError("No se pudieron guardar los insumos de la receta.")

    return get_recipe(business_id, recipe_id)


def list_recipes(business_id: str) -> list:
    result = supabase_admin.table("recipes") \
        .select("id, business_id, product_id, name, portions_yield, is_active, created_at") \
        .eq("business_id", business_id) \
        .eq("is_active", True) \
        .order("created_at", desc=True) \
        .execute()
    recipes = result.data or []
    if not recipes:
        return []

    recipe_ids = [r["id"] for r in recipes]
    ing_result = supabase_admin.table("recipe_ingredients") \
        .select("id, recipe_id, ingredient_product_id, quantity, unit") \
        .in_("recipe_id", recipe_ids) \
        .execute()

    ingredients_by_recipe = {}
    for ing in (ing_result.data or []):
        ingredients_by_recipe.setdefault(ing["recipe_id"], []).append(ing)

    product_ids = {r["product_id"] for r in recipes}
    for ing_list in ingredients_by_recipe.values():
        for ing in ing_list:
            product_ids.add(ing["ingredient_product_id"])
    products_by_id = _products_by_id(list(product_ids))

    return [_map_recipe(r, ingredients_by_recipe.get(r["id"], []), products_by_id) for r in recipes]


def get_recipe(business_id: str, recipe_id: int) -> dict:
    recipe = _get_recipe_or_404(business_id, recipe_id)
    ingredients = _get_ingredients(recipe_id)
    product_ids = {recipe["product_id"]} | {i["ingredient_product_id"] for i in ingredients}
    products_by_id = _products_by_id(list(product_ids))
    return _map_recipe(recipe, ingredients, products_by_id)


def update_recipe(business_id: str, recipe_id: int, data) -> dict:
    _get_recipe_or_404(business_id, recipe_id)

    update_fields = {}
    if data.name is not None:
        update_fields["name"] = data.name
    if data.portions_yield is not None:
        update_fields["portions_yield"] = float(data.portions_yield)
    if update_fields:
        supabase_admin.table("recipes").update(update_fields).eq("id", recipe_id).eq("business_id", business_id).execute()

    if data.ingredients is not None:
        supabase_admin.table("recipe_ingredients").delete().eq("recipe_id", recipe_id).execute()
        ingredient_rows = [{
            "recipe_id": recipe_id,
            "ingredient_product_id": ing.ingredient_product_id,
            "quantity": float(ing.quantity),
            "unit": ing.unit,
        } for ing in data.ingredients]
        if ingredient_rows:
            supabase_admin.table("recipe_ingredients").insert(ingredient_rows).execute()

    return get_recipe(business_id, recipe_id)


def delete_recipe(business_id: str, recipe_id: int) -> dict:
    _get_recipe_or_404(business_id, recipe_id)
    supabase_admin.table("recipes").update({"is_active": False}) \
        .eq("id", recipe_id).eq("business_id", business_id).execute()
    return {"recipe_id": recipe_id, "deleted": True}


# ═══════════════════════════════════════════════════════════════════════════════
#  PRODUCCIÓN
# ═══════════════════════════════════════════════════════════════════════════════

def _check_availability(business_id: str, ingredients: list, scale: Decimal) -> list:
    """
    Verifica que cada insumo tenga stock suficiente para producir `scale`
    veces la receta base (portions_to_produce / portions_yield).
    Devuelve la lista de insumos faltantes; si no está vacía, la producción
    se bloquea por completo (no se permite producción parcial).
    """
    ingredient_ids = [i["ingredient_product_id"] for i in ingredients]
    products_by_id = _products_by_id(ingredient_ids)

    inv_result = supabase_admin.table("inventory") \
        .select("product_id, quantity") \
        .eq("business_id", business_id) \
        .in_("product_id", ingredient_ids) \
        .execute()
    stock_by_product = {}
    for row in (inv_result.data or []):
        pid = row["product_id"]
        if pid not in stock_by_product:
            stock_by_product[pid] = row["quantity"]

    missing = []
    for ing in ingredients:
        pid = ing["ingredient_product_id"]
        needed = Decimal(str(ing["quantity"])) * scale
        if pid not in stock_by_product:
            missing.append({
                "ingredient_product_id": pid,
                "ingredient_name": products_by_id.get(pid, {}).get("name"),
                "needed": float(needed),
                "available": None,
            })
            continue
        current = stock_by_product[pid]
        if current is None:
            # Insumo de stock ilimitado (servicio) — igual que adjust_stock, no se valida.
            continue
        current_qty = Decimal(str(current))
        if current_qty < needed:
            missing.append({
                "ingredient_product_id": pid,
                "ingredient_name": products_by_id.get(pid, {}).get("name"),
                "needed": float(needed),
                "available": float(current_qty),
            })
    return missing


def produce(business_id: str, user_id: str, recipe_id: int, portions_to_produce: Decimal) -> dict:
    """
    1. Valida disponibilidad de TODOS los insumos (todo o nada).
    2. Congela el costo total al momento de producir.
    3. Inserta production_records.
    4. Descuenta cada insumo vía inventory_service.adjust_stock
       (reason='production'), reutilizando el mismo endpoint que
       waste/purchase/return/manual en vez de una función paralela.
    5. Enlaza cada movimiento generado a production_records.reference_id
       para poder derivar el consumo de insumos por receta.
    """
    recipe = _get_recipe_or_404(business_id, recipe_id)
    ingredients = _get_ingredients(recipe_id)
    if not ingredients:
        raise ValueError("La receta no tiene insumos configurados.")

    portions_yield = Decimal(str(recipe["portions_yield"]))
    scale = Decimal(str(portions_to_produce)) / portions_yield

    missing = _check_availability(business_id, ingredients, scale)
    if missing:
        detail = "; ".join(
            f"{m['ingredient_name'] or m['ingredient_product_id']} "
            f"(necesita {m['needed']}, disponible {m['available'] if m['available'] is not None else 'sin inventario'})"
            for m in missing
        )
        raise ValueError(f"Stock insuficiente para producir. Insumos faltantes: {detail}")

    product_ids = [i["ingredient_product_id"] for i in ingredients]
    products_by_id = _products_by_id(product_ids)
    scaled_ingredients = [{**ing, "quantity": Decimal(str(ing["quantity"])) * scale} for ing in ingredients]
    total_cost, _ = _recipe_cost(scaled_ingredients, products_by_id)

    record_payload = {
        "business_id": business_id,
        "recipe_id": recipe_id,
        "portions_produced": float(portions_to_produce),
        "total_cost": float(total_cost),
        "user_id": user_id,
        "created_at": _now_iso(),
    }
    record_result = supabase_admin.table("production_records").insert(record_payload).execute()
    if not record_result.data:
        raise ValueError("No se pudo registrar la producción.")
    production_record = record_result.data[0]
    production_record_id = production_record["id"]

    movement_ids = []
    for ing in scaled_ingredients:
        adjust_data = StockAdjustRequest(
            product_id=ing["ingredient_product_id"],
            quantity=ing["quantity"],
            reason="production",
            notes=f"Producción receta #{recipe_id} — {recipe['name']}",
        )
        result = inventory_service.adjust_stock(business_id=business_id, user_id=user_id, data=adjust_data)
        movement_ids.append(result["movement_id"])

    for movement_id in movement_ids:
        if movement_id and movement_id != -1:
            supabase_admin.table("inventory_movements") \
                .update({"reference_id": production_record_id}) \
                .eq("id", movement_id).execute()

    return {
        "production_record_id": production_record_id,
        "recipe_id": recipe_id,
        "portions_produced": float(portions_to_produce),
        "total_cost": float(total_cost),
        "created_at": production_record.get("created_at"),
    }


# ═══════════════════════════════════════════════════════════════════════════════
#  CONTROL: HISTORIAL, CONSUMO Y RENTABILIDAD
# ═══════════════════════════════════════════════════════════════════════════════

def list_production_history(business_id: str, recipe_id: int = None, date_from: str = None, date_to: str = None) -> list:
    """Historial de production_records, filtrable por receta y/o fecha."""
    query = supabase_admin.table("production_records") \
        .select("id, recipe_id, portions_produced, total_cost, user_id, created_at") \
        .eq("business_id", business_id)
    if recipe_id is not None:
        query = query.eq("recipe_id", recipe_id)
    if date_from:
        query = query.gte("created_at", date_from)
    if date_to:
        query = query.lte("created_at", date_to)

    result = query.order("created_at", desc=True).execute()
    rows = result.data or []
    if not rows:
        return []

    recipe_ids = list({r["recipe_id"] for r in rows})
    rec_result = supabase_admin.table("recipes").select("id, name").in_("id", recipe_ids).execute()
    recipes_by_id = {r["id"]: r["name"] for r in (rec_result.data or [])}

    return [{
        "id": r["id"],
        "recipe_id": r["recipe_id"],
        "recipe_name": recipes_by_id.get(r["recipe_id"], "Receta eliminada"),
        "portions_produced": float(r["portions_produced"]),
        "total_cost": float(r["total_cost"]),
        "created_at": r["created_at"],
    } for r in rows]


def ingredient_consumption(business_id: str, recipe_id: int, ingredient_product_id: int = None) -> list:
    """
    Consumo de insumos derivado de inventory_movements (reason='production'),
    enlazado a las production_records de esta receta vía reference_id.
    """
    rec_result = supabase_admin.table("production_records") \
        .select("id") \
        .eq("business_id", business_id) \
        .eq("recipe_id", recipe_id) \
        .execute()
    production_ids = [r["id"] for r in (rec_result.data or [])]
    if not production_ids:
        return []

    query = supabase_admin.table("inventory_movements") \
        .select("id, product_id, quantity, reference_id, created_at") \
        .eq("business_id", business_id) \
        .eq("reason", "production") \
        .in_("reference_id", production_ids)
    if ingredient_product_id is not None:
        query = query.eq("product_id", ingredient_product_id)

    result = query.order("created_at", desc=True).execute()
    rows = result.data or []

    product_ids = list({r["product_id"] for r in rows})
    products_by_id = _products_by_id(product_ids)

    return [{
        "movement_id": r["id"],
        "ingredient_product_id": r["product_id"],
        "ingredient_name": products_by_id.get(r["product_id"], {}).get("name"),
        "quantity": float(r["quantity"]),
        "production_record_id": r["reference_id"],
        "created_at": r["created_at"],
    } for r in rows]


def profitability(business_id: str, recipe_id: int) -> dict:
    """
    Rentabilidad por receta. Sin un vínculo de "porciones vendidas" a ventas
    reales todavía, se calcula solo el margen unitario (precio de venta por
    porción − costo por porción); el resto se reporta como limitación en vez
    de inventar el dato.
    """
    recipe = _get_recipe_or_404(business_id, recipe_id)
    ingredients = _get_ingredients(recipe_id)
    product_ids = {recipe["product_id"]} | {i["ingredient_product_id"] for i in ingredients}
    products_by_id = _products_by_id(list(product_ids))
    final_product = products_by_id.get(recipe["product_id"], {})
    product_price = Decimal(str(final_product.get("price") or 0))

    last_result = supabase_admin.table("production_records") \
        .select("total_cost, portions_produced") \
        .eq("business_id", business_id) \
        .eq("recipe_id", recipe_id) \
        .order("created_at", desc=True) \
        .limit(1) \
        .execute()

    if last_result.data:
        last = last_result.data[0]
        portions = Decimal(str(last["portions_produced"]))
        cost_per_portion = Decimal(str(last["total_cost"])) / portions if portions > 0 else Decimal("0")
        cost_source = "last_production"
    else:
        total_cost, _ = _recipe_cost(ingredients, products_by_id)
        portions_yield = Decimal(str(recipe["portions_yield"]))
        cost_per_portion = total_cost / portions_yield if portions_yield > 0 else Decimal("0")
        cost_source = "real_time_recipe_cost"

    unit_margin = product_price - cost_per_portion

    return {
        "recipe_id": recipe_id,
        "product_price": float(product_price),
        "cost_per_portion": float(cost_per_portion),
        "cost_source": cost_source,
        "unit_margin": float(unit_margin),
        "total_profit": None,
        "limitation": "No disponible: no hay vínculo con ventas reales para calcular porciones vendidas de esta receta.",
    }
