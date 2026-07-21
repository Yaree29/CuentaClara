from fastapi import APIRouter, HTTPException, Depends
from app.models.invoices import InvoiceCreateRequest
from app.services import invoice_service, invoice_pdf_service
from app.routers.auth import get_current_user
from app.database import supabase_admin

router = APIRouter()

@router.post("/", summary="Crear factura fiscal (PYME)")
def create_invoice(data: InvoiceCreateRequest, current_user: dict = Depends(get_current_user)):
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
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
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

    result = query.execute()
    return result.data

@router.get("/{invoice_id}", summary="Detalle de una factura")
def get_invoice(invoice_id: int, current_user: dict = Depends(get_current_user)):
    invoice = supabase_admin.table("invoices")\
        .select("*, invoice_items(*, products(name)), payments(*)")\
        .eq("id", invoice_id)\
        .eq("business_id", current_user["business_id"])\
        .execute()

    if not invoice.data:
        raise HTTPException(status_code=404, detail="Factura no encontrada")

    return invoice.data[0]

@router.get("/{invoice_id}/pdf", summary="Generar PDF de una factura y obtener URL firmada para compartir")
def get_invoice_pdf(invoice_id: int, current_user: dict = Depends(get_current_user)):
    try:
        url = invoice_pdf_service.generate_invoice_pdf_url(
            business_id=current_user["business_id"],
            invoice_id=invoice_id
        )
        return {"url": url}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))