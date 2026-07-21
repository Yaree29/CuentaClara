# =============================================================================
# CREADO: 2026-07-07
# Propósito: Genera el PDF de una factura fiscal PYME y lo sube al bucket
#            privado 'invoices' de Supabase Storage, devolviendo una URL
#            firmada (temporal) para compartir por WhatsApp. Separado de
#            invoice_service.py para no mezclar la creación de facturas con
#            el renderizado del documento.
# =============================================================================
from app.database import supabase_admin
from fpdf import FPDF

SIGNED_URL_EXPIRES_IN = 3600  # 1 hora


def _build_pdf_bytes(invoice: dict, business: dict) -> bytes:
    pdf = FPDF()
    pdf.add_page()

    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, business.get("name") or "Negocio", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "", 10)
    if business.get("address"):
        pdf.cell(0, 6, business["address"], new_x="LMARGIN", new_y="NEXT")
    if business.get("phone"):
        pdf.cell(0, 6, f"Tel: {business['phone']}", new_x="LMARGIN", new_y="NEXT")

    pdf.ln(4)
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, f"Factura {invoice['invoice_number']}", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 6, f"Fecha: {invoice['created_at'][:10]}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, f"Cliente: {invoice.get('customer_name') or 'Consumidor final'}", new_x="LMARGIN", new_y="NEXT")

    pdf.ln(4)
    pdf.set_font("Helvetica", "B", 10)
    pdf.cell(85, 8, "Producto", border=1)
    pdf.cell(25, 8, "Cant.", border=1, align="R")
    pdf.cell(35, 8, "Precio", border=1, align="R")
    pdf.cell(35, 8, "Subtotal", border=1, align="R", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "", 10)
    for item in invoice["items"]:
        name = item.get("product_name") or f"Producto #{item['product_id']}"
        pdf.cell(85, 8, name[:45], border=1)
        pdf.cell(25, 8, f"{float(item['quantity']):.2f}", border=1, align="R")
        pdf.cell(35, 8, f"${float(item['unit_price']):.2f}", border=1, align="R")
        pdf.cell(35, 8, f"${float(item['subtotal']):.2f}", border=1, align="R", new_x="LMARGIN", new_y="NEXT")

    pdf.ln(4)
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(145, 7, "Impuesto", align="R")
    pdf.cell(35, 7, f"${float(invoice['tax']):.2f}", align="R", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(145, 8, "Total", align="R")
    pdf.cell(35, 8, f"${float(invoice['total']):.2f}", align="R", new_x="LMARGIN", new_y="NEXT")

    return bytes(pdf.output())


def generate_invoice_pdf_url(business_id: str, invoice_id: int) -> str:
    invoice_result = supabase_admin.table("invoices")\
        .select(
            "id, invoice_number, total, tax, created_at, customer_id, "
            "customers(name), "
            "invoice_items(product_id, quantity, unit_price, subtotal, products(name))"
        )\
        .eq("id", invoice_id)\
        .eq("business_id", business_id)\
        .execute()

    if not invoice_result.data:
        raise ValueError("Factura no encontrada")

    row = invoice_result.data[0]
    if not row.get("invoice_number"):
        raise ValueError("Esta factura no tiene numeración fiscal (fue creada como venta rápida)")

    customer = row.pop("customers", None)
    items = row.pop("invoice_items", []) or []
    for item in items:
        product = item.pop("products", None)
        item["product_name"] = product["name"] if product else None

    invoice = {
        **row,
        "customer_name": customer["name"] if customer else None,
        "items": items,
    }

    business_result = supabase_admin.table("businesses")\
        .select("name, address, phone")\
        .eq("id", business_id)\
        .execute()
    business = business_result.data[0] if business_result.data else {}

    pdf_bytes = _build_pdf_bytes(invoice, business)
    path = f"{business_id}/{invoice_id}.pdf"

    supabase_admin.storage.from_("invoices").upload(
        path,
        pdf_bytes,
        {"content-type": "application/pdf", "x-upsert": "true"},
    )

    signed = supabase_admin.storage.from_("invoices").create_signed_url(path, SIGNED_URL_EXPIRES_IN)
    return signed["signedURL"]
