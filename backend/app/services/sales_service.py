from app.database import supabase_admin
from app.services import notifications_service
from datetime import datetime
from decimal import Decimal

def create_quick_sale(business_id: str, user_id: str, data):
    total = Decimal("0")
    tax_rate = Decimal("0")

    # Snapshot del nombre del asistente al momento de la venta. Se guarda como
    # texto (invoices.assistant_name), NO se calcula al leer — así el registro
    # histórico ("vendido por Juan") sobrevive aunque el asistente se elimine
    # después. assistant_id sigue existiendo para joins mientras el asistente
    # exista, pero queda en NULL si se borra (ON DELETE SET NULL); el nombre
    # ya quedó fijado aquí y no depende de esa fila.
    assistant_name = None
    if data.assistant_id is not None:
        assistant = supabase_admin.table("business_assistants")\
            .select("name")\
            .eq("id", data.assistant_id)\
            .eq("business_id", business_id)\
            .execute()
        if assistant.data:
            assistant_name = assistant.data[0]["name"]

    # 1. Obtener el tax_rate del negocio
    config = supabase_admin.table("business_configs")\
        .select("tax_rate")\
        .eq("business_id", business_id)\
        .execute()

    if config.data:
        tax_rate = Decimal(str(config.data[0]["tax_rate"])) / 100

    # 2. Calcular total y verificar stock
    items_data = []
    for item in data.items:
        subtotal = Decimal(str(item.quantity)) * Decimal(str(item.unit_price))
        total += subtotal

        # Verificar stock disponible (quantity=null significa servicio ilimitado)
        stock = supabase_admin.table("inventory")\
            .select("quantity, unit")\
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
            "subtotal": float(subtotal)
        })

    tax_amount = total * tax_rate
    total_with_tax = total + tax_amount

    # 3. Crear la factura
    # Venta a fiado: queda "pending" (no se cobró nada todavía). El frontend
    # crea la deuda por separado (POST /credit/debts) vinculada a este invoice_id.
    invoice = supabase_admin.table("invoices").insert({
        "business_id": business_id,
        "invoice_type_id": data.invoice_type_id,
        "total": float(total_with_tax),
        "tax": float(tax_amount),
        "status": "pending" if data.is_credit else "paid",
        "user_id": user_id,
        "assistant_id": data.assistant_id,
        "assistant_name": assistant_name,
        # La nota que escribe el usuario al registrar la venta. Antes se
        # recibía en el modelo pero nunca se guardaba: se perdía en silencio.
        "notes": (data.notes or "").strip() or None,
        "created_at": datetime.utcnow().isoformat()
    }).execute()

    invoice_id = invoice.data[0]["id"]

    # 4. Crear los items de la factura
    for item in items_data:
        item["invoice_id"] = invoice_id
        supabase_admin.table("invoice_items").insert(item).execute()

    # 5. Registrar el pago — se omite en ventas a fiado, ya que no hubo cobro
    if not data.is_credit:
        supabase_admin.table("payments").insert({
            "invoice_id": invoice_id,
            "amount": float(total_with_tax),
            "method": data.payment_method,
            "paid_at": datetime.utcnow().isoformat()
        }).execute()

    # 6. Descontar inventario y registrar movimiento
    for item in data.items:
        # Actualizar cantidad en inventario
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
                        "updated_at": datetime.utcnow().isoformat()
                    })\
                    .eq("product_id", item.product_id)\
                    .eq("business_id", business_id)\
                    .execute()

        # Registrar movimiento
        supabase_admin.table("inventory_movements").insert({
            "business_id": business_id,
            "product_id": item.product_id,
            "reference_id": invoice_id,
            "type": "out",
            "quantity": float(item.quantity),
            "reason": "sale",
            "user_id": user_id,
            "created_at": datetime.utcnow().isoformat()
        }).execute()

    # Notificar al dueño si la venta la registró un asistente (Modo Asistente).
    if data.assistant_id is not None:
        notifications_service.notify_owner_of_assistant_action(
            business_id,
            "sales",
            f"{assistant_name or 'Un asistente'} registró una venta por ${float(total_with_tax):.2f}."
        )

    return {
        "invoice_id": invoice_id,
        "total": float(total_with_tax),
        "tax": float(tax_amount),
        "status": "pending" if data.is_credit else "paid",
        "created_at": datetime.utcnow().isoformat()
    }

def get_profits_and_expenses(business_id: str, date_from: str, date_to: str, assistant_id: int = None):
    # Asegurar que date_to incluya todo el día si solo viene en formato YYYY-MM-DD
    if len(date_to) == 10:
        date_to = f"{date_to}T23:59:59.999Z"

    # Ganancias: facturas pagadas en el período
    query = supabase_admin.table("invoices")\
        .select("total, tax, created_at")\
        .eq("business_id", business_id)\
        .eq("status", "paid")\
        .gte("created_at", date_from)\
        .lte("created_at", date_to)

    # Filtra al resumen propio de un asistente (Modo Asistente) — no toca los
    # gastos del negocio, que siguen siendo información completa del dueño.
    if assistant_id is not None:
        query = query.eq("assistant_id", assistant_id)

    invoices = query.execute()

    total_income = sum(Decimal(str(i["total"])) for i in invoices.data)

    # Gastos en el período
    expenses = supabase_admin.table("expenses")\
        .select("amount, created_at")\
        .eq("business_id", business_id)\
        .gte("created_at", date_from)\
        .lte("created_at", date_to)\
        .execute()

    total_expenses = sum(Decimal(str(e["amount"])) for e in expenses.data)

    return {
        "period": {"from": date_from, "to": date_to},
        "income": float(total_income),
        "expenses": float(total_expenses),
        "profit": float(total_income - total_expenses),
        "invoices_count": len(invoices.data)
    }