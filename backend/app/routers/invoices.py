from fastapi import APIRouter, HTTPException, Depends
from app.routers.auth import get_current_user
from app.database import supabase_admin

router = APIRouter()

@router.get("/", summary="Listar facturas del negocio")
def list_invoices(
    status: str = None,
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    query = supabase_admin.table("invoices")\
        .select("*, invoice_types(name, prefix), payments(method)")\
        .eq("business_id", current_user["business_id"])\
        .order("created_at", desc=True)\
        .limit(limit)

    if status:
        query = query.eq("status", status)

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