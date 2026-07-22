from fastapi import APIRouter, HTTPException, Depends
from app.models.invoices import InvoiceCreateRequest, InvoicePdfBatchRequest
from app.services import invoice_service, invoice_pdf_service
from app.routers.auth import require_role
from app.database import supabase_admin

router = APIRouter()

# MiRUC (facturación fiscal) es exclusiva del dueño/admin del negocio — igual
# que /sales/profits. Un asistente (incluido Supervisor) ya no ve la tab en
# el frontend, pero sin este require_role podía llamar el endpoint directo y
# crear/leer facturas fiscales igual. Ver auditoría: antes solo usaba
# get_current_user, sin chequeo de rol.
@router.post("/", summary="Crear factura fiscal (PYME)")
def create_invoice(data: InvoiceCreateRequest, current_user: dict = Depends(require_role("owner", "admin"))):
    try:
        return invoice_service.create_invoice(
            business_id=current_user["business_id"],
            user_id=current_user["sub"],
            data=data
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", summary="Listar facturas del negocio")
def list_invoices(
    status: str = None,
    date_from: str = None,
    date_to: str = None,
    cash_session_id: int = None,
    limit: int = 20,
    current_user: dict = Depends(require_role("owner", "admin"))
):
    query = supabase_admin.table("invoices")\
        .select("*, invoice_types(name, prefix), payments(method), invoice_items(quantity, unit_price, products(name))")\
        .eq("business_id", current_user["business_id"])\
        .order("created_at", desc=True)\
        .limit(limit)

    if status:
        query = query.eq("status", status)
    if date_from:
        query = query.gte("created_at", date_from)
    if date_to:
        query = query.lte("created_at", date_to)
    # "Registro de Ventas" (Ventas PYME) filtra por la sesión de caja vigente
    # en vez de un rango de fecha calendario — ver cash_session_id en invoices
    # (20_sales_schedule_and_cash_lifecycle.sql).
    if cash_session_id:
        query = query.eq("cash_session_id", cash_session_id)

    result = query.execute()
    return result.data

@router.get("/{invoice_id}", summary="Detalle de una factura")
def get_invoice(invoice_id: int, current_user: dict = Depends(require_role("owner", "admin"))):
    invoice = supabase_admin.table("invoices")\
        .select("*, invoice_items(*, products(name)), payments(*)")\
        .eq("id", invoice_id)\
        .eq("business_id", current_user["business_id"])\
        .execute()

    if not invoice.data:
        raise HTTPException(status_code=404, detail="Factura no encontrada")

    return invoice.data[0]

@router.get("/{invoice_id}/pdf", summary="Generar PDF de una factura y obtener URL firmada para compartir")
def get_invoice_pdf(invoice_id: int, current_user: dict = Depends(require_role("owner", "admin"))):
    try:
        url = invoice_pdf_service.generate_invoice_pdf_url(
            business_id=current_user["business_id"],
            invoice_id=invoice_id
        )
        return {"url": url}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/pdf-batch", summary="Empaquetar varias facturas en un .zip y obtener URL firmada para compartir")
def get_invoices_pdf_batch(data: InvoicePdfBatchRequest, current_user: dict = Depends(require_role("owner", "admin"))):
    try:
        url = invoice_pdf_service.generate_invoices_zip_url(
            business_id=current_user["business_id"],
            invoice_ids=data.invoice_ids,
        )
        return {"url": url}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/reports/profitability", summary="Ganancias y márgenes por factura/producto (owner/admin)")
def get_profitability(
    date_from: str,
    date_to: str,
    current_user: dict = Depends(require_role("owner", "admin"))
):
    try:
        return invoice_service.get_profitability(
            business_id=current_user["business_id"],
            date_from=date_from,
            date_to=date_to,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))