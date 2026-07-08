from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal

class SaleItem(BaseModel):
    product_id: int
    quantity: Decimal
    unit_price: Decimal

class QuickSaleRequest(BaseModel):
    items: List[SaleItem]
    payment_method: Optional[str] = "cash"  # cash | card | transfer — ignorado si is_credit
    invoice_type_id: int = 1  # por defecto: Venta
    notes: Optional[str] = None
    # Venta a fiado: la factura queda "pending" y no se crea payment. El
    # frontend crea la deuda aparte con POST /credit/debts (invoice_id).
    is_credit: bool = False

class SaleResponse(BaseModel):
    invoice_id: int
    total: Decimal
    tax: Decimal
    status: str
    created_at: str