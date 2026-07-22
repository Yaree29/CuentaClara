# =============================================================================
# CREADO: 2026-07-07
# Propósito: Genera el PDF de una factura fiscal PYME y lo sube al bucket
#            privado 'invoices' de Supabase Storage, devolviendo una URL
#            firmada (temporal) para compartir por WhatsApp. Separado de
#            invoice_service.py para no mezclar la creación de facturas con
#            el renderizado del documento.
# =============================================================================
import io
import uuid
import zipfile

from app.database import supabase_admin
from fpdf import FPDF

SIGNED_URL_EXPIRES_IN = 3600  # 1 hora


def _invoice_label(invoice: dict) -> str:
    # Las ventas de la pestaña "Ventas" (POST /sales/quick) no reciben
    # numeración fiscal (invoice_number queda NULL) — se rotulan por su id
    # para que igual puedan generar/compartir su PDF. Las facturas fiscales
    # (si existieran) conservan su número.
    return invoice.get("invoice_number") or f"Venta #{invoice['id']}"


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
    pdf.cell(0, 8, _invoice_label(invoice), new_x="LMARGIN", new_y="NEXT")

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

    # Aviso legal: fpdf2 no emite un comprobante fiscal oficial (no hay CAI/CAE
    # ni integración con la autoridad tributaria), así que debe quedar explícito
    # en el propio documento para no inducir a que se use como tal.
    pdf.ln(6)
    pdf.set_font("Helvetica", "I", 8)
    pdf.multi_cell(
        0, 5,
        "Este documento es informativo y no constituye un comprobante fiscal oficial.",
        align="C",
    )

    return bytes(pdf.output())


def _build_invoice_pdf_bytes(business_id: str, invoice_id: int) -> tuple[bytes, str]:
    """Genera los bytes del PDF de una factura y su nombre de archivo, sin
    subirlo a Storage. Reutilizado tanto por la generación individual como por
    el empaquetado en zip de varias facturas."""
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
    # Nombre "seguro" para archivo/entrada de zip: "FAC-0001.pdf" o "Venta 12.pdf".
    label = _invoice_label(invoice).replace("#", "").replace("/", "-").strip()
    file_name = f"{label}.pdf"
    return pdf_bytes, file_name


def generate_invoice_pdf_url(business_id: str, invoice_id: int) -> str:
    pdf_bytes, _ = _build_invoice_pdf_bytes(business_id, invoice_id)
    path = f"{business_id}/{invoice_id}.pdf"

    supabase_admin.storage.from_("invoices").upload(
        path,
        pdf_bytes,
        {"content-type": "application/pdf", "x-upsert": "true"},
    )

    signed = supabase_admin.storage.from_("invoices").create_signed_url(path, SIGNED_URL_EXPIRES_IN)
    return signed["signedURL"]


def generate_invoices_zip_url(business_id: str, invoice_ids: list[int]) -> str:
    """Empaqueta los PDF de varias facturas en un único .zip (en memoria),
    lo sube al bucket 'invoices' y devuelve una URL firmada para compartir.
    Usado por la selección múltiple del historial (≥2 facturas)."""
    if not invoice_ids:
        raise ValueError("Debes seleccionar al menos una factura.")

    buffer = io.BytesIO()
    used_names: dict[str, int] = {}
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for invoice_id in invoice_ids:
            pdf_bytes, file_name = _build_invoice_pdf_bytes(business_id, invoice_id)
            # Evitar colisiones de nombre dentro del zip (dos "Venta 5.pdf" no
            # pueden coexistir; muy improbable con ids, pero por robustez).
            if file_name in used_names:
                used_names[file_name] += 1
                stem = file_name[:-4]
                file_name = f"{stem} ({used_names[file_name]}).pdf"
            else:
                used_names[file_name] = 0
            zf.writestr(file_name, pdf_bytes)

    path = f"{business_id}/batch/{uuid.uuid4().hex}.zip"
    supabase_admin.storage.from_("invoices").upload(
        path,
        buffer.getvalue(),
        {"content-type": "application/zip", "x-upsert": "true"},
    )

    signed = supabase_admin.storage.from_("invoices").create_signed_url(path, SIGNED_URL_EXPIRES_IN)
    return signed["signedURL"]
