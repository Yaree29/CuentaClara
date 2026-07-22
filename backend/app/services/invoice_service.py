# =============================================================================
# CREADO: 2026-07-07
# Propósito: Lógica de negocio para la facturación fiscal del módulo PYME.
#            A diferencia de sales_service.create_quick_sale (venta rápida
#            informal, sin cliente ni numeración), esta función vincula la
#            factura a un customer_id real de la tabla `customers` y genera
#            un número de documento secuencial por negocio + tipo de factura.
#            Se mantiene separada de sales_service a propósito: el módulo
#            Informal no debe modificarse.
# =============================================================================
from app.database import supabase_admin
from datetime import datetime
from decimal import Decimal


def _generate_invoice_number(business_id: str, invoice_type_id: int) -> str:
    type_result = supabase_admin.table("invoice_types")\
        .select("prefix")\
        .eq("id", invoice_type_id)\
        .execute()

    prefix = "FAC"
    if type_result.data and type_result.data[0].get("prefix"):
        prefix = type_result.data[0]["prefix"]

    count_result = supabase_admin.table("invoices")\
        .select("id", count="exact")\
        .eq("business_id", business_id)\
        .eq("invoice_type_id", invoice_type_id)\
        .execute()

    sequence = (count_result.count or 0) + 1
    return f"{prefix}-{sequence:04d}"


def create_invoice(business_id: str, user_id: str, data) -> dict:
    if not data.items:
        raise ValueError("La factura debe tener al menos un producto")

    customer_name = None
    if data.customer_id is not None:
        customer = supabase_admin.table("customers")\
            .select("id, name, is_active")\
            .eq("id", data.customer_id)\
            .eq("business_id", business_id)\
            .execute()
        if not customer.data:
            raise ValueError("Cliente no encontrado o no pertenece a este negocio")
        if not customer.data[0].get("is_active"):
            raise ValueError("No se puede facturar a un cliente inactivo")
        customer_name = customer.data[0]["name"]

    tax_rate = Decimal("0")
    config = supabase_admin.table("business_configs")\
        .select("tax_rate")\
        .eq("business_id", business_id)\
        .execute()
    if config.data:
        tax_rate = Decimal(str(config.data[0]["tax_rate"])) / 100

    total = Decimal("0")
    items_data = []
    for item in data.items:
        subtotal = Decimal(str(item.quantity)) * Decimal(str(item.unit_price))
        total += subtotal

        stock = supabase_admin.table("inventory")\
            .select("quantity")\
            .eq("product_id", item.product_id)\
            .eq("business_id", business_id)\
            .execute()

        if stock.data:
            qty_val = stock.data[0]["quantity"]
            if qty_val is not None:
                current_qty = Decimal(str(qty_val))
                if current_qty < Decimal(str(item.quantity)):
                    raise ValueError(
                        f"Stock insuficiente para el producto {item.product_id}. "
                        f"Disponible: {float(current_qty)}, solicitado: {float(item.quantity)}"
                    )

        items_data.append({
            "product_id": item.product_id,
            "quantity": float(item.quantity),
            "unit_price": float(item.unit_price),
            "subtotal": float(subtotal),
        })

    tax_amount = total * tax_rate
    total_with_tax = total + tax_amount
    invoice_number = _generate_invoice_number(business_id, data.invoice_type_id)

    invoice = supabase_admin.table("invoices").insert({
        "business_id": business_id,
        "invoice_type_id": data.invoice_type_id,
        "customer_id": data.customer_id,
        "invoice_number": invoice_number,
        "notes": data.notes.strip() if data.notes else None,
        "total": float(total_with_tax),
        "tax": float(tax_amount),
        "status": "paid",
        "user_id": user_id,
        "created_at": datetime.utcnow().isoformat(),
    }).execute()

    if not invoice.data:
        raise ValueError("No se pudo crear la factura")

    invoice_id = invoice.data[0]["id"]

    for item in items_data:
        item["invoice_id"] = invoice_id
        supabase_admin.table("invoice_items").insert(item).execute()

    supabase_admin.table("payments").insert({
        "invoice_id": invoice_id,
        "amount": float(total_with_tax),
        "method": data.payment_method,
        "paid_at": datetime.utcnow().isoformat(),
    }).execute()

    for item in data.items:
        current = supabase_admin.table("inventory")\
            .select("quantity")\
            .eq("product_id", item.product_id)\
            .eq("business_id", business_id)\
            .execute()

        if current.data:
            qty_val = current.data[0]["quantity"]
            if qty_val is not None:  # null = servicio ilimitado, no se descuenta
                new_qty = Decimal(str(qty_val)) - Decimal(str(item.quantity))
                supabase_admin.table("inventory")\
                    .update({
                        "quantity": float(new_qty),
                        "updated_at": datetime.utcnow().isoformat(),
                    })\
                    .eq("product_id", item.product_id)\
                    .eq("business_id", business_id)\
                    .execute()

        supabase_admin.table("inventory_movements").insert({
            "business_id": business_id,
            "product_id": item.product_id,
            "reference_id": invoice_id,
            "type": "out",
            "quantity": float(item.quantity),
            "reason": "sale",
            "user_id": user_id,
            "created_at": datetime.utcnow().isoformat(),
        }).execute()

    return {
        "invoice_id": invoice_id,
        "invoice_number": invoice_number,
        "customer_id": data.customer_id,
        "customer_name": customer_name,
        "total": float(total_with_tax),
        "tax": float(tax_amount),
        "status": "paid",
        "created_at": datetime.utcnow().isoformat(),
    }


# =============================================================================
# get_profitability — margen real por línea/factura/producto, cruzando
# invoice_items con products.cost_price (agregado en la fase de Recetas,
# database/schema/17_recipes.sql). No se inventa el margen: si cost_price es
# 0/NULL para un producto, sus líneas quedan con margin=None y el agregado
# (por factura, por producto o total) que dependa de esas líneas queda
# marcado con has_missing_cost=True en vez de reportar un número parcial
# como si fuera el margen completo.
# =============================================================================
def get_profitability(business_id: str, date_from: str, date_to: str) -> dict:
    if len(date_to) == 10:
        date_to = f"{date_to}T23:59:59.999Z"

    result = supabase_admin.table("invoices")\
        .select(
            "id, invoice_number, total, created_at, "
            "invoice_items(product_id, quantity, unit_price, subtotal, products(name, cost_price))"
        )\
        .eq("business_id", business_id)\
        .eq("status", "paid")\
        .gte("created_at", date_from)\
        .lte("created_at", date_to)\
        .execute()

    invoices_out = []
    products_map = {}
    total_margin = Decimal("0")
    total_revenue = Decimal("0")
    any_missing_cost = False

    for inv in result.data:
        items = inv.get("invoice_items") or []
        invoice_margin = Decimal("0")
        invoice_has_gap = False
        item_details = []

        for item in items:
            product = item.get("products") or {}
            quantity = Decimal(str(item["quantity"]))
            unit_price = Decimal(str(item["unit_price"]))
            subtotal = Decimal(str(item["subtotal"]))
            cost_price = product.get("cost_price")

            margin = None
            if cost_price is not None and Decimal(str(cost_price)) > 0:
                margin = (unit_price - Decimal(str(cost_price))) * quantity
                invoice_margin += margin
            else:
                invoice_has_gap = True

            product_id = item["product_id"]
            product_name = product.get("name") or f"Producto #{product_id}"

            entry = products_map.setdefault(product_id, {
                "product_id": product_id,
                "product_name": product_name,
                "quantity_sold": Decimal("0"),
                "revenue": Decimal("0"),
                "margin": Decimal("0"),
                "has_gap": False,
            })
            entry["quantity_sold"] += quantity
            entry["revenue"] += subtotal
            if margin is not None:
                entry["margin"] += margin
            else:
                entry["has_gap"] = True

            item_details.append({
                "product_id": product_id,
                "product_name": product_name,
                "quantity": float(quantity),
                "unit_price": float(unit_price),
                "subtotal": float(subtotal),
                "margin": float(margin) if margin is not None else None,
            })

        total_revenue += Decimal(str(inv["total"]))
        if not invoice_has_gap:
            total_margin += invoice_margin
        any_missing_cost = any_missing_cost or invoice_has_gap

        invoices_out.append({
            "invoice_id": inv["id"],
            "invoice_number": inv.get("invoice_number"),
            "created_at": inv["created_at"],
            "total": float(inv["total"]),
            "margin": float(invoice_margin) if not invoice_has_gap else None,
            "has_missing_cost": invoice_has_gap,
            "items": item_details,
        })

    products_out = [
        {
            "product_id": p["product_id"],
            "product_name": p["product_name"],
            "quantity_sold": float(p["quantity_sold"]),
            "revenue": float(p["revenue"]),
            "margin": float(p["margin"]) if not p["has_gap"] else None,
            "has_missing_cost": p["has_gap"],
        }
        for p in products_map.values()
    ]
    # Más vendidos primero — es la lista que consulta MiRUC para "productos vendidos".
    products_out.sort(key=lambda p: p["quantity_sold"], reverse=True)

    return {
        "period": {"from": date_from, "to": date_to},
        "total_revenue": float(total_revenue),
        # total_margin solo suma facturas con margen completo; any_missing_cost
        # avisa que el total es parcial (no todos los productos tienen cost_price).
        "total_margin": float(total_margin),
        "has_missing_cost": any_missing_cost,
        "invoices": invoices_out,
        "products": products_out,
    }
