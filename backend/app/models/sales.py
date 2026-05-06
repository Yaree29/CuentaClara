from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal

class SaleItem(BaseModel):
    product_id: int
    quantity: Decimal
    unit_price: Decimal

class QuickSaleRequest(BaseModel):
    items: List[SaleItem]
    payment_method: str  # cash | card | transfer
    invoice_type_id: int = 1  # por defecto: Venta
    notes: Optional[str] = None

class SaleResponse(BaseModel):
    invoice_id: int
    total: Decimal
    tax: Decimal
    status: str
    created_at: str