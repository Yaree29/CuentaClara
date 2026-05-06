from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal

class InvoiceItemDetail(BaseModel):
    product_id: int
    product_name: str
    quantity: Decimal
    unit_price: Decimal
    subtotal: Decimal

class InvoiceDetail(BaseModel):
    invoice_id: int
    invoice_number: str
    total: Decimal
    tax: Decimal
    status: str
    payment_method: Optional[str]
    items: List[InvoiceItemDetail]
    created_at: str