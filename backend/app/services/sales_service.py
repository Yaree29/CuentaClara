from app.database import supabase_admin
from datetime import datetime
from decimal import Decimal

def create_quick_sale(business_id: str, user_id: str, data):
    total = Decimal("0")
    tax_rate = Decimal("0")

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

        # Verificar stock disponible
        stock = supabase_admin.table("inventory")\
            .select("quantity, unit")\
            .eq("product_id", item.product_id)\
            .eq("business_id", business_id)\
            .execute()

        if stock.data:
            current_qty = Decimal(str(stock.data[0]["quantity"]))
            if current_qty < Decimal(str(item.quantity)):
                raise ValueError(f"Stock insuficiente para producto {item.product_id}")

        items_data.append({
            "product_id": item.product_id,
            "quantity": float(item.quantity),
            "unit_price": float(item.unit_price),
            "subtotal": float(subtotal)
        })

    tax_amount = total * tax_rate
    total_with_tax = total + tax_amount

    # 3. Crear la factura
    invoice = supabase_admin.table("invoices").insert({
        "business_id": business_id,
        "invoice_type_id": data.invoice_type_id,
        "total": float(total_with_tax),
        "tax": float(tax_amount),
        "status": "paid",
        "user_id": user_id,
        "created_at": datetime.utcnow().isoformat()
    }).execute()

    invoice_id = invoice.data[0]["id"]

    # 4. Crear los items de la factura
    for item in items_data:
        item["invoice_id"] = invoice_id
        supabase_admin.table("invoice_items").insert(item).execute()

    # 5. Registrar el pago
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
            new_qty = Decimal(str(current.data[0]["quantity"])) - Decimal(str(item.quantity))
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

    return {
        "invoice_id": invoice_id,
        "total": float(total_with_tax),
        "tax": float(tax_amount),
        "status": "paid",
        "created_at": datetime.utcnow().isoformat()
    }

def get_profits_and_expenses(business_id: str, date_from: str, date_to: str):
    # Ganancias: facturas pagadas en el período
    invoices = supabase_admin.table("invoices")\
        .select("total, tax, created_at")\
        .eq("business_id", business_id)\
        .eq("status", "paid")\
        .gte("created_at", date_from)\
        .lte("created_at", date_to)\
        .execute()

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